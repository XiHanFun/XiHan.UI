#!/usr/bin/env node
// 门禁：给已有滚动层配自绘条的宿主，三个适配器都得接，壳与皮肤也得配齐。
//
// 这条接线不新增任何 part，check-part-wiring 那套「从解剖派生 getter 名」的判据整个看不见它。
// 而它有五个失效面：只接了一端（一路绿到发布）、壳没有定位上下文（条子飘到某个远房祖先，
// 页面上位置不对而控制台零输出）、壳没关掉轨道底色（列表右缘糊一条灰带）、
// 滚动层皮肤里还留着没加守卫的 scrollbar-width / scrollbar-gutter（原生条与自绘条并存）、
// 浮层没把壳记进层分支（条子是 content 的兄弟，按住它那一下被判成层外交互，浮层当场收起）。
// 前四条都不报错、只“看着不对”，所以在这里逐条钉死。
//
// 第三家（React）只核规则①的那一半：它有没有在同一个组件上接这条线。
// 后面几条（壳点名一个角色节点、皮肤的定位上下文与轨道底色、层分支）的解析入口
// 是 WC 那个选项对象与 Vue 的 branches 行，React 侧的写法要等它铺到第一个滚动宿主
// 才定得下来；那之前把解析硬猜出来，只会核出一批假绿。
// React 只核 react-coverage.json 里已铺到的组件，没铺到的跳过。
//
// 规则⑦-⑩管的是「滚动面归档」：真源 component-design.md §6.6 把组件内滚动面分成两档
// （自绘条 / 原生细条），scroll-surface-registry.json 逐面登记。皮肤里每一处 overflow: auto|scroll
// 都得在表里（新滚动面必须归档），表里每一条都得扫得到（名单过期）；drawn 面核三端接线、轴、
// 浮层 4px 档；每一面核 overscroll-behavior 与 scrollbar-gutter 该写的写了、不该写的没写；
// 原生面不得自己写 scrollbar-width / scrollbar-color；声明 --xh-scrollbar-track-bg 的部件
// 必须是某个宿主的壳，否则是死声明。尚未达标的面记在 family-backlog.json 的 scroll 段
// （键「组件:部件:问题码」），逐条理由，命中即从表里移除——登记了却没命中判红，表只减不增。
import { readdir, readFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

import ts from 'typescript'

import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'
import { openBacklog } from './lib/family-backlog.mjs'

const VUE = ADAPTERS.vue.components
const WC = ADAPTERS.wc.components
const REACT = ADAPTERS.react.components
const STYLES = 'packages/design/styles/css'
/** 家族配方里也有滚动面（字段配方的 textarea 布局），一并扫。 */
const FAMILY_SCROLL_FILES = ['packages/design/styles/family/field-chrome.css']
/** 滚动面登记表：真源 §6.6 两档表的机器可读版。 */
const REGISTRY = 'tooling/scripts/scroll-surface-registry.json'
/** 组件总数的分母：一个组件一份套件。 */
const SUITES_DIR = 'tooling/testing/src/suites'

/** Vue 侧的调用点。 */
const VUE_CALL = 'useScrollbars('
/** WC 侧的调用点。 */
const WC_CALL = 'new ScrollbarsController('
/** React 侧的调用点：与 Vue 同为 hook，同名。 */
const REACT_CALL = 'useScrollbars('

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

/** 注释整段换成等长空白：后面按花括号配平切规则块，注释里的括号会把它切歪。 */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
}

/** 源码里的两种注释都换成等长空白：注释里写的角色节点名不算接线。 */
function stripSourceComments(text) {
  return stripComments(text).replace(/(^|[^:\\])\/\/[^\n]*/g, (m, lead) => lead + ' '.repeat(m.length - lead.length))
}

/** 按花括号配平读出每条规则的（选择器, 声明块）；@layer 这类外层不算规则。 */
function readRules(text) {
  const src = stripComments(text)
  const rules = []
  const stack = []
  let start = 0
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '{') {
      stack.push({ selector: src.slice(start, i).trim(), body: i + 1 })
      start = i + 1
    }
    else if (ch === '}') {
      const frame = stack.pop()
      if (frame && !frame.selector.startsWith('@'))
        rules.push({ selector: frame.selector, body: src.slice(frame.body, i) })
      start = i + 1
    }
  }
  return rules
}

/**
 * 这一段选择器打的是不是该 part 的基础态。
 * 认两种写法：`[data-scope=X][data-part=Y]` 与 `[data-scope=X]:is([data-part=Y], …)`；
 * 带别的属性或伪类限定（状态档、尺寸档）的一律不算——那些是分支，不是基础规则。
 */
function targetsPart(selector, scope, part) {
  const s = selector.replace(/\s+/g, '').replace(/['"]/g, '')
  if (!s.includes(`[data-scope=${scope}]`) || !s.includes(`[data-part=${part}]`))
    return false
  const leftover = s
    .replaceAll(`[data-scope=${scope}]`, '')
    .replaceAll(`[data-part=${part}]`, '')
    .replace(/:is\(|\)/g, '')
    .replace(/,/g, '')
    .replace(/\[data-part=[\w-]+\]/g, '')
  return leftover === ''
}

/** 该 part 的基础规则里声明过的全部内容拼在一起。 */
function baseBody(rules, scope, part) {
  return rules.filter(r => r.selector.split(',').some(one => targetsPart(one, scope, part)))
    .map(r => r.body)
    .join('\n')
}

/** 真声明了这条属性（`--xh-scrollbar-gutter:` 这种自定义属性不算）。 */
function declares(body, property) {
  return new RegExp(`(?:^|[;\\s{])${property}\\s*:`).test(body)
}

/** 取出调用点之后配平括号内的那段实参；缺省取 WC 的 `new ScrollbarsController(`。 */
function callBlock(src, call = WC_CALL) {
  const at = src.indexOf(call)
  if (at < 0)
    return null
  let depth = 0
  for (let i = at + call.length - 1; i < src.length; i++) {
    if (src[i] === '(')
      depth++
    else if (src[i] === ')' && --depth === 0)
      return src.slice(at, i + 1)
  }
  return null
}

/** 取出某个选项冒号后面那段表达式，到同层的下一个逗号或对象末尾为止。 */
function optionExpr(block, key) {
  const at = new RegExp(`(?:^|[{,\\s])${key}\\s*:`).exec(block)
  if (!at)
    return null
  const start = at.index + at[0].length
  let depth = 0
  for (let i = start; i < block.length; i++) {
    const ch = block[i]
    if (ch === '(' || ch === '[' || ch === '{') {
      depth++
    }
    else if (ch === ')' || ch === ']' || ch === '}') {
      if (depth === 0)
        return block.slice(start, i)
      depth--
    }
    else if (ch === ',' && depth === 0) {
      return block.slice(start, i)
    }
  }
  return block.slice(start)
}

/** 一段文本里的函数调用，连同整段调用文本的起止；带泛型实参的调用不算（读不出就别猜）。 */
function callsIn(text) {
  const out = []
  for (const hit of text.matchAll(/([A-Z_$][\w$]*)\s*\(/gi)) {
    const open = hit.index + hit[0].length - 1
    let depth = 0
    for (let i = open; i < text.length; i++) {
      if (text[i] === '(') {
        depth++
      }
      else if (text[i] === ')' && --depth === 0) {
        out.push({ name: hit[1], start: hit.index, end: i + 1 })
        break
      }
    }
  }
  return out
}

/** 从 from 之后那个花括号开始，配平读出块内文本。 */
function blockAt(src, from) {
  const open = src.indexOf('{', from)
  if (open < 0)
    return null
  let depth = 0
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{')
      depth++
    else if (src[i] === '}' && --depth === 0)
      return src.slice(open + 1, i)
  }
  return null
}

/** 本文件里那个函数的函数体：`function 名(…) {…}`、`const 名 = (…) => {…}`、类里的方法都认。 */
function functionBody(src, name) {
  const anchor = new RegExp(
    `(?:function\\s+${name}\\s*\\(`
    + `|(?:const|let)\\s+${name}\\s*=`
    + `|(?:^|[\\s;}])${name}\\s*\\([^()]*\\)\\s*(?::[^{;=]+)?\\{)`,
    'm',
  ).exec(src)
  return anchor ? blockAt(src, anchor.index) : null
}

/** 进不去、进去也找不到角色节点的调用：语言关键字、DOM 查询、以及 getPart 自己。 */
const OPAQUE_CALLS = new Set([
  'if',
  'for',
  'while',
  'switch',
  'catch',
  'return',
  'typeof',
  'await',
  'getPart',
  'getParts',
  'querySelector',
  'querySelectorAll',
  'closest',
  'matches',
  'Array',
  'Boolean',
  'Number',
  'String',
])

/**
 * 一段表达式点名的角色节点。
 * 直接写 `getPart('x')` 的取 x；套了本文件里的函数（`scrollLayerOf(this.getPart('root'))` 这种）
 * 就进那个函数体里接着找，函数体里的 `getPart('x')` 与选择器串 `[data-part="x"]` 都算数——
 * 传进去的那个 getPart 只是告诉函数从哪儿找起，本身不是要点的节点，所以不算。
 * 认不出的调用记进 unresolved 交给调用处报错：认不出就别猜，猜错了后面几条规则就查了个空。
 */
function resolveParts(src, text, seen = new Set()) {
  const spans = []
  const parts = []
  const unresolved = []
  for (const call of callsIn(text)) {
    if (OPAQUE_CALLS.has(call.name) || spans.some(s => call.start >= s.start && call.end <= s.end))
      continue
    const body = seen.has(call.name) ? '' : functionBody(src, call.name)
    if (body === null) {
      unresolved.push(call.name)
      continue
    }
    spans.push(call)
    const inner = resolveParts(src, body, new Set([...seen, call.name]))
    parts.push(...inner.parts)
    unresolved.push(...inner.unresolved)
  }
  // 展开过的那几段调用文本已经按函数体算过，这里只收剩下的
  const outside = index => !spans.some(s => index >= s.start && index < s.end)
  for (const pattern of [/getPart\('([\w-]+)'\)/g, /\[data-part=["']([\w-]+)["']\]/g]) {
    for (const hit of text.matchAll(pattern)) {
      if (outside(hit.index))
        parts.push(hit[1])
    }
  }
  return { parts: [...new Set(parts)], unresolved: [...new Set(unresolved)] }
}

/** 只读取真正的层注册配置；同名变量、形参和后代悬停所有权不属于 LayerRegistry。 */
function registeredLayers(src) {
  const source = ts.createSourceFile('scrollbar-host.ts', src, ts.ScriptTarget.Latest, true)
  const layers = []
  function visit(node) {
    if (ts.isCallExpression(node)
      && ts.isPropertyAccessExpression(node.expression)
      && node.expression.name.text === 'register'
      && ts.isPropertyAccessExpression(node.expression.expression)
      && node.expression.expression.name.text === 'layerRegistry') {
      const options = node.arguments[0]
      const property = (name) => {
        if (!options || !ts.isObjectLiteralExpression(options))
          return null
        const found = options.properties.find(member => ts.isPropertyAssignment(member)
          && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
          && member.name.text === name)
        return found?.initializer.getText(source) ?? null
      }
      layers.push({ node: property('node'), branches: property('branches') })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return layers
}

/** 登记表提前读一次：层注册的 node 可能是包着滚动层的浮层外壳（select 的 list 住在 content 里），登记在面的 layerNode 上。 */
const registry = JSON.parse(await readFile(REGISTRY, 'utf8'))

/** 某组件各滚动面登记的浮层节点：层注册的 node 指向它时，这一层就是该滚动面所在的浮层。 */
function layerNodesOf(comp) {
  return Object.entries(registry.surfaces ?? {})
    .filter(([key, entry]) => key.startsWith(`${comp}:`) && typeof entry.layerNode === 'string')
    .map(([, entry]) => entry.layerNode)
}

/** 一个组件可注册多个独立浮层；仅核 node 指向本次自绘滚动层、其壳或登记的浮层节点的注册。 */
function checkLayerBranches(comp, src, label, shell, scrollables, reference) {
  const layers = registeredLayers(src)
  if (!layers.length)
    return []
  const hosts = [...new Set([shell, ...scrollables, ...layerNodesOf(comp)])]
  const ownLayers = layers.filter(layer => hosts.some(part => reference(part).test(layer.node ?? '')))
  if (!ownLayers.length)
    return [`${label}：已有 LayerRegistry 注册，但读不出哪个 node 对应自绘滚动宿主 ${hosts.join(' / ')}；须显式核对该层的壳接线`]
  return ownLayers.filter(layer => !reference(shell).test(layer.branches ?? ''))
    .map(() => `${label}：层注册的 branches 要把 ${shell} 记进去，否则按住条子会把浮层消解掉`)
}

/** `branch-content` → `branchContent`：Vue 那侧的 ref 名按这个规则从 part 名派生。 */
function camel(part) {
  return part.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(full)
    else if (/\.(?:ts|tsx)$/.test(entry.name))
      yield full
  }
}

const problems = []

// Vue 侧：组件名取 components/ 下那一层目录名，直接摆在 components/ 里的取文件名。
// 值是这个组件全部源文件——层分支写在 use-<comp>.ts 里，与调用点不在同一个文件
const vueHosts = new Map()
const vueSources = new Map()
for await (const file of walk(VUE)) {
  const src = stripSourceComments(await readFile(file, 'utf8'))
  const dir = basename(dirname(file))
  const comp = dir === basename(VUE) ? basename(file, '.ts') : dir
  const bucket = vueSources.get(comp) ?? []
  bucket.push({ file, src })
  vueSources.set(comp, bucket)
  if (src.includes(VUE_CALL))
    vueHosts.set(comp, file)
}

const wcHosts = new Map()
for (const name of await readdir(WC)) {
  if (!name.endsWith('.ts'))
    continue
  const src = stripSourceComments(await readFile(join(WC, name), 'utf8'))
  if (!src.includes(WC_CALL))
    continue
  wcHosts.set(basename(name, '.ts'), { block: callBlock(src) ?? '', src })
}

// React 侧：组件名取 components/ 下那一层目录名，与 Vue 同一套铺法
const reactHosts = new Map()
for await (const file of walk(REACT)) {
  const src = stripSourceComments(await readFile(file, 'utf8'))
  const dir = basename(dirname(file))
  const comp = dir === basename(REACT) ? basename(file).replace(/\.tsx?$/, '') : dir
  if (src.includes(REACT_CALL))
    reactHosts.set(comp, { file, src })
}

const covered = await reactCovered()
const suiteCount = (await readdir(SUITES_DIR)).filter(f => f.endsWith('.suite.ts')).length

// 规则①：一家接了另一家忘了，页面上只会在那一家看出来。
// React 只算已铺到的组件：没铺到就既不要求它接，也不拿它接了当依据
const allHosts = [...new Set([...vueHosts.keys(), ...wcHosts.keys(), ...reactHosts.keys()])].sort()
for (const comp of allHosts) {
  const sides = [
    { label: ADAPTERS.vue.label, has: vueHosts.has(comp), inScope: true },
    { label: ADAPTERS.wc.label, has: wcHosts.has(comp), inScope: true },
    { label: ADAPTERS.react.label, has: reactHosts.has(comp), inScope: covered.has(comp) },
  ].filter(side => side.inScope)
  const wired = sides.filter(side => side.has).map(side => side.label)
  const bare = sides.filter(side => !side.has).map(side => side.label)
  if (wired.length > 0 && bare.length > 0)
    problems.push(`${comp}：${wired.join(' / ')} 侧配了自绘条，${bare.join(' / ')} 侧没配`)
}

/** 每个 WC 宿主读出来的壳与滚动层，规则⑧按它核登记表。 */
const hostInfo = new Map()
let checkedShells = 0
for (const [comp, { block, src }] of wcHosts) {
  // 规则④：本层一条轴只认一个壳与一个滚动层，多实例的宿主要另一套接法
  if (block.includes('getParts('))
    problems.push(`${comp}：shell / scrollable 写成了 getParts(…)，这一层只支持单实例`)

  const shell = resolveParts(src, optionExpr(block, 'shell') ?? '')
  const scrollable = resolveParts(src, optionExpr(block, 'scrollable') ?? '')
  const opaque = [...new Set([...shell.unresolved, ...scrollable.unresolved])]
  if (opaque.length) {
    problems.push(
      `${comp}：shell / scrollable 套了 ${opaque.map(name => `${name}(…)`).join('、')}，`
      + '门禁读不出点的是哪个角色节点；把节点写成 getPart(\'…\')，或把那个函数摆进本文件',
    )
    continue
  }

  const shells = shell.parts
  const scrollables = scrollable.parts
  if (shells.length !== 1) {
    problems.push(`${comp}：shell 要正好点名一个角色节点，实际 ${shells.length} 个`)
    continue
  }
  if (scrollables.length === 0) {
    problems.push(`${comp}：scrollable 没点名任何角色节点`)
    continue
  }

  // 规则⑥：条子是 content 的兄弟，浮层不把壳记进层分支，按住条子那一下就被判成层外交互
  const shellPart = shells[0]
  hostInfo.set(comp, { shellPart, scrollables, block })
  problems.push(...checkLayerBranches(comp, src, `${comp}：WC 侧`, shellPart, scrollables, part => new RegExp(`\\bgetPart\\(\\s*['"]${part}['"]\\s*\\)`)))
  for (const { file, src: vueSrc } of vueSources.get(comp) ?? []) {
    problems.push(...checkLayerBranches(comp, vueSrc, file, shellPart, scrollables, part => new RegExp(`\\b${camel(part)}Ref\\b`)))
  }

  const css = await read(join(STYLES, `${comp}.css`))
  if (css === null) {
    problems.push(`${comp}：找不到皮肤 ${STYLES}/${comp}.css`)
    continue
  }
  const rules = readRules(css)

  const body = baseBody(rules, comp, shellPart)
  checkedShells += 1
  // 规则②：壳没有定位上下文，条子会飘到某个远房祖先身上，页面上位置不对而控制台零输出
  if (!declares(body, 'position'))
    problems.push(`${comp} 的 ${shellPart}：条子挂在它身上，它的基础规则里必须有 position`)
  // 规则③：轨道底色缺省是实色，不关掉会在滚动层边缘糊出一条灰带
  if (!declares(body, '--xh-scrollbar-track-bg'))
    problems.push(`${comp} 的 ${shellPart}：要声明 --xh-scrollbar-track-bg，缺省的实色轨道会糊出一条灰带`)

  // 规则⑤：滚动层已经挂了自绘条，皮肤里没加守卫的原生条声明会与它并存
  for (const layer of scrollables) {
    for (const rule of rules) {
      if (!rule.selector.includes(`[data-part='${layer}']`))
        continue
      if (rule.selector.includes(':not([data-xh-scrollbar])'))
        continue
      for (const property of ['scrollbar-width', 'scrollbar-gutter']) {
        if (declares(rule.body, property))
          problems.push(`${comp} 的 ${layer}：${property} 要加 :not([data-xh-scrollbar]) 守卫，否则原生条与自绘条并存`)
      }
    }
  }
}

// ───────────────────────── 规则⑦-⑩：滚动面归档 ─────────────────────────

/** 一条声明块里 overflow 家族给出的可滚轴：简写算两轴，-x / -inline 横、-y / -block 竖。 */
function scrollAxesOf(body) {
  const axes = new Set()
  for (const m of body.matchAll(/(?:^|[;\s{])overflow(-x|-y|-block|-inline)?\s*:\s*(?:auto|scroll)\b/g)) {
    const suffix = m[1]
    if (!suffix) {
      axes.add('vertical').add('horizontal')
    }
    else if (suffix === '-x' || suffix === '-inline') {
      axes.add('horizontal')
    }
    else {
      axes.add('vertical')
    }
  }
  return axes
}

/**
 * 一段（不含逗号的）选择器打的是哪个滚动面，键与登记表同形：
 * `[data-scope=S][data-part=P]…` → `S:P`，再带后代的（prose 里的 pre）→ `S:P(pre)`；
 * 家族配方没有 data-scope，按属性名去掉 data-xh-<家族>- 前缀拼：`field-chrome:input[layout=textarea]`。
 * 状态与尺寸限定一律不进键：同一个部件的各档是同一个滚动面。读不出身份的返回 null，由调用处判红。
 */
function surfaceKeyOf(selector, family) {
  const s = selector.trim().replace(/['"]/g, '')
  const scopeAt = /\[data-scope=([\w-]+)\]/.exec(s)
  if (scopeAt) {
    // 从 data-scope 起逐字吃完同一个复合选择器：属性块 `[…]` 与伪类 `:name(…)`（括号配平），
    // 碰到组合符（空白 / > / + / ~）就停，剩下的是后代那一截
    let i = scopeAt.index + scopeAt[0].length
    while (i < s.length) {
      const ch = s[i]
      if (ch === '[') {
        i = s.indexOf(']', i) + 1
        if (i === 0)
          return null
      }
      else if (ch === ':') {
        i += 1
        while (i < s.length && /[\w-]/.test(s[i])) i += 1
        if (s[i] === '(') {
          let depth = 0
          for (; i < s.length; i++) {
            if (s[i] === '(')
              depth++
            else if (s[i] === ')' && --depth === 0)
              break
          }
          i += 1
        }
      }
      else {
        break
      }
    }
    const compound = s.slice(scopeAt.index, i)
    const part = /\[data-part=([\w-]+)\]/.exec(compound)
    if (!part)
      return null
    const tail = s.slice(i).trim()
    if (!tail)
      return `${scopeAt[1]}:${part[1]}`
    const tag = /^(?::where\()?([a-z][\w-]*)\)?$/.exec(tail)
    return tag ? `${scopeAt[1]}:${part[1]}(${tag[1]})` : null
  }
  if (!family)
    return null
  const prefix = `data-xh-${family.replace(/-chrome$/, '')}-`
  const attrs = [...s.matchAll(/\[([\w-]+)(?:=([\w-]+))?\]/g)]
  if (!attrs.length || !attrs[0][1].startsWith(prefix))
    return null
  const [head, ...rest] = attrs
  return `${family}:${head[1].slice(prefix.length)}${rest.map(a => `[${a[1].startsWith(prefix) ? a[1].slice(prefix.length) : a[1]}${a[2] ? `=${a[2]}` : ''}]`).join('')}`
}

const surfaces = registry.surfaces ?? {}
if (registry.backlog != null)
  problems.push(`${REGISTRY}：backlog 段已迁到 family-backlog.json 的 scroll 段，这里不再登记`)
/** 尚未达标的面：family-backlog.json 的 scroll 段，键「组件:部件:问题码」。 */
const backlog = await openBacklog('scroll')
problems.push(...backlog.problems)
const ISSUES = new Set(['unwired', 'axes', 'size', 'overscroll', 'gutter'])

for (const [key, entry] of Object.entries(surfaces)) {
  if (!/^[\w-]+:[\w-]+(?:\([\w-]+\)|(?:\[[\w-]+(?:=[\w-]+)?\])+)?$/.test(key))
    problems.push(`${REGISTRY}：键 ${key} 不是「组件:部件」形态`)
  if (entry.mode !== 'drawn' && entry.mode !== 'native')
    problems.push(`${REGISTRY}：${key} 的 mode 只能是 drawn / native，实际 ${JSON.stringify(entry.mode)}`)
  if (entry.wiring !== undefined && (entry.mode !== 'drawn' || !['scrollbars', 'anatomy'].includes(entry.wiring)))
    problems.push(`${REGISTRY}：${key} 的 wiring 只在 drawn 上出现，且只能是 scrollbars / anatomy`)
  if (entry.layerNode !== undefined && (entry.mode !== 'drawn' || typeof entry.layerNode !== 'string' || !/^[\w-]+$/.test(entry.layerNode)))
    problems.push(`${REGISTRY}：${key} 的 layerNode 只在 drawn 上出现，且要写成一个部件名（层注册的 node 指向的、包着这一面的浮层节点）`)
  for (const flag of ['overscroll', 'gutter']) {
    if (typeof entry[flag] !== 'boolean')
      problems.push(`${REGISTRY}：${key} 的 ${flag} 要写成布尔`)
  }
  if (typeof entry.why !== 'string' || !entry.why.trim())
    problems.push(`${REGISTRY}：${key} 缺 why`)
}
for (const entry of Object.keys(backlog.entries)) {
  const at = entry.lastIndexOf(':')
  const key = entry.slice(0, at)
  const issue = entry.slice(at + 1)
  if (!(key in surfaces))
    problems.push(`family-backlog.json scroll 段的 ${entry}：${key} 不在 ${REGISTRY} 的 surfaces 里——先登记再豁免`)
  if (!ISSUES.has(issue))
    problems.push(`family-backlog.json scroll 段的 ${entry}：问题码 ${issue} 不认识，只有 ${[...ISSUES].join(' / ')}`)
}

/** 皮肤里扫到的滚动面：键 → { axes, rules（打到这一面的全部规则）, files }。 */
const scanned = new Map()
/** 声明了 --xh-scrollbar-track-bg 的面（规则⑩）。 */
const trackBgDeclared = new Map()
const skinFiles = (await readdir(STYLES)).filter(f => f.endsWith('.css')).map(f => ({ file: join(STYLES, f), family: null }))
for (const file of FAMILY_SCROLL_FILES)
  skinFiles.push({ file, family: basename(file, '.css') })
for (const { file, family } of skinFiles) {
  const rules = readRules(await readFile(file, 'utf8'))
  for (const rule of rules) {
    const axes = scrollAxesOf(rule.body)
    const declaresTrackBg = declares(rule.body, '--xh-scrollbar-track-bg')
    if (!axes.size && !declaresTrackBg)
      continue
    for (const one of rule.selector.split(',')) {
      const key = surfaceKeyOf(one, family)
      if (!key) {
        if (axes.size)
          problems.push(`${file}：\`${one.trim()}\` 上有 overflow: auto|scroll，但读不出它是哪个组件的哪个部件——滚动面必须打在 [data-scope][data-part] 上`)
        continue
      }
      if (axes.size) {
        const hit = scanned.get(key) ?? { axes: new Set(), rules: [], files: new Set() }
        for (const axis of axes) hit.axes.add(axis)
        hit.files.add(file)
        scanned.set(key, hit)
      }
      if (declaresTrackBg)
        trackBgDeclared.set(key, file)
    }
  }
  // 打到这一面的全部规则（含状态档）：overscroll / gutter / scrollbar-* 按整面看，不只看基础规则
  for (const rule of rules) {
    for (const one of rule.selector.split(',')) {
      const key = surfaceKeyOf(one, family)
      const hit = key && scanned.get(key)
      if (hit && !hit.rules.includes(rule))
        hit.rules.push(rule)
    }
  }
}

// 规则⑦：覆盖面。皮肤里的每一处滚动面都在表里，表里的每一条都扫得到。
for (const key of [...scanned.keys()].sort()) {
  if (!(key in surfaces))
    problems.push(`${key}（${[...scanned.get(key).files].join('、')}）有 overflow: auto|scroll 但没登记——新滚动面必须归档进 ${REGISTRY}，按真源 §6.6 定它走自绘条还是原生细条`)
}
for (const key of Object.keys(surfaces)) {
  if (!scanned.has(key))
    problems.push(`${key} 登记在 ${REGISTRY} 里，皮肤里却扫不到它的 overflow: auto|scroll——名单过期，删掉这条`)
}

/** 命中的问题：键 → 问题码 → 文案。与 backlog 对账后才决定红不红。 */
const found = new Map()
function issue(key, code, message) {
  const bucket = found.get(key) ?? new Map()
  if (!bucket.has(code))
    bucket.set(code, message)
  found.set(key, bucket)
}

/** `['vertical', 'horizontal']` 这类字面量里的轴；没写就是缺省的只竖。 */
function axesIn(expr) {
  if (!expr)
    return new Set(['vertical'])
  return new Set([...expr.matchAll(/['"](vertical|horizontal)['"]/g)].map(m => m[1]))
}

/** props 表达式里的 size 档；没写返回 null。 */
function sizeIn(expr) {
  const m = expr && /\bsize\s*:\s*['"]([\w-]+)['"]/.exec(expr)
  return m ? m[1] : null
}

/** 三端各自那段 useScrollbars / ScrollbarsController 调用的实参。 */
function sidesOf(comp) {
  const sides = []
  const wc = hostInfo.get(comp)
  if (wc)
    sides.push({ label: ADAPTERS.wc.label, block: wc.block })
  for (const { src } of vueSources.get(comp) ?? []) {
    const block = callBlock(src, VUE_CALL)
    if (block)
      sides.push({ label: ADAPTERS.vue.label, block })
  }
  const react = reactHosts.get(comp)
  if (react) {
    const block = callBlock(react.src, REACT_CALL)
    if (block)
      sides.push({ label: ADAPTERS.react.label, block })
  }
  return sides
}

for (const [key, entry] of Object.entries(surfaces)) {
  const hit = scanned.get(key)
  if (!hit)
    continue
  const [comp, part] = key.split(':')
  const rules = hit.rules
  const bodies = rules.map(r => r.body).join('\n')

  if (entry.mode === 'drawn' && entry.wiring === 'anatomy') {
    // 条子是组件自己的解剖部件：视口得把原生条藏掉，且不该再走 useScrollbars 那条线
    if (!rules.some(r => /(?:^|[;\s{])scrollbar-width\s*:\s*none\b/.test(r.body)))
      problems.push(`${key}：登记为自绘条（解剖部件），皮肤里却没有 scrollbar-width: none 藏原生条`)
    if (wcHosts.has(comp) || vueHosts.has(comp) || reactHosts.has(comp))
      problems.push(`${key}：登记为解剖部件自绘，却又接了 useScrollbars / ScrollbarsController，两套条子会叠在一起`)
  }
  else if (entry.mode === 'drawn') {
    // 规则⑧：drawn 面必须三端都接了这一面；轴要盖住皮肤声明的轴；浮层壳走 4px 档、页内壳不传 size
    const wc = hostInfo.get(comp)
    if (!wc || !allHosts.includes(comp)) {
      issue(key, 'unwired', `${key}：登记为自绘条，三端都没接 useScrollbars / ScrollbarsController`)
    }
    else if (!wc.scrollables.includes(part)) {
      issue(key, 'unwired', `${key}：登记为自绘条，宿主 ${comp} 的 scrollable 只点名了 ${wc.scrollables.join(' / ')}，这一面没接`)
    }
    else {
      const sides = sidesOf(comp)
      const missingAxes = sides
        .map(side => ({ side: side.label, missing: [...hit.axes].filter(axis => !axesIn(optionExpr(side.block, 'axes')).has(axis)) }))
        .filter(x => x.missing.length)
      if (missingAxes.length)
        issue(key, 'axes', `${key}：皮肤声明可滚 ${[...hit.axes].join(' + ')}，${missingAxes.map(x => `${x.side} 缺 ${x.missing.join(' / ')}`).join('；')}——axes 要盖住皮肤声明的轴`)
      const sizes = sides.map(side => ({ side: side.label, size: sizeIn(optionExpr(side.block, 'props')) }))
      if (wc.shellPart === 'positioner') {
        const bad = sizes.filter(x => x.size !== 'sm')
        if (bad.length)
          issue(key, 'size', `${key}：壳是 positioner，条子走浮层 4px 档，${bad.map(x => `${x.side} 的 props 里 size 是 ${x.size ?? '缺省 md'}`).join('；')}——要写 size: 'sm'`)
      }
      else {
        const bad = sizes.filter(x => x.size !== null)
        if (bad.length)
          issue(key, 'size', `${key}：壳是 ${wc.shellPart}（页内宿主），条子走 6px 缺省档，${bad.map(x => `${x.side} 却传了 size: '${x.size}'`).join('；')}`)
      }
    }
  }
  else {
    // 规则⑨：原生面不自己画条——stylelint 已拦 thin 以外的值，这里兜 none：藏了原生条又没接自绘条
    for (const property of ['scrollbar-width', 'scrollbar-color']) {
      if (rules.some(r => declares(r.body, property)))
        problems.push(`${key}：登记为原生细条，皮肤里却写了 ${property}——细条由 reset 层统一给，皮肤不写；要自绘条就改登记为 drawn 并接线`)
    }
  }

  // 规则⑨（两档都核）：overscroll-behavior: contain 只给浮层面、模态 body 与粘底视口；
  // scrollbar-gutter: stable 只给内容高度动态变化的容器，且带 :not([data-xh-scrollbar]) 守卫
  const hasOverscroll = /(?:^|[;\s{])overscroll-behavior(?:-\w+)?\s*:\s*contain\b/.test(bodies)
  if (entry.overscroll && !hasOverscroll)
    issue(key, 'overscroll', `${key}：登记 overscroll=true，皮肤里缺 overscroll-behavior: contain`)
  if (!entry.overscroll && hasOverscroll)
    issue(key, 'overscroll', `${key}：登记 overscroll=false（页内结构容器保持 auto），皮肤里却写了 overscroll-behavior: contain`)
  const gutterRules = rules.filter(r => declares(r.body, 'scrollbar-gutter'))
  const guardedStable = gutterRules.some(r => r.selector.includes(':not([data-xh-scrollbar])') && /scrollbar-gutter\s*:\s*stable\b/.test(r.body))
  if (entry.gutter && !guardedStable)
    issue(key, 'gutter', `${key}：登记 gutter=true，皮肤里缺带 :not([data-xh-scrollbar]) 守卫的 scrollbar-gutter: stable`)
  if (!entry.gutter && gutterRules.length)
    issue(key, 'gutter', `${key}：登记 gutter=false，皮肤里却写了 scrollbar-gutter——stable 只给内容高度动态变化的容器`)
}

// 规则⑩：--xh-scrollbar-track-bg 只有挂了条子的壳才有资格声明；别处的一律是死声明
const shellKeys = new Set([...hostInfo].map(([comp, info]) => `${comp}:${info.shellPart}`))
for (const [key, file] of [...trackBgDeclared].sort()) {
  if (!shellKeys.has(key))
    problems.push(`${file}：${key} 声明了 --xh-scrollbar-track-bg，但它不是任何自绘条宿主的壳——死声明，删掉；接线时随壳一起加回`)
}

// 与 backlog 对账：命中且登记了的放过，命中却没登记的判红，登记了却没命中的是过期
for (const [key, bucket] of [...found].sort()) {
  for (const [code, message] of bucket) {
    if (!backlog.excuse(`${key}:${code}`))
      problems.push(message)
  }
}
problems.push(...backlog.stale())
const pending = backlog.pending

if (problems.length) {
  console.error('[check-scrollbar-hosts] ✗ 自绘条接线不齐：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

const reactExpected = allHosts.filter(comp => covered.has(comp)).length
const modes = Object.values(surfaces).reduce((acc, entry) => ({ ...acc, [entry.mode]: (acc[entry.mode] ?? 0) + 1 }), {})
console.log(
  `[check-scrollbar-hosts] 通过：${allHosts.length} 个宿主的接线齐（Vue ${vueHosts.size} · Web Components ${wcHosts.size} · React ${reactHosts.size}/${reactExpected}），`
  + `${checkedShells} 个壳有定位上下文与轨道底色、也都记进了层分支，滚动层皮肤没有漏守卫的原生条声明`,
)
console.log(
  `[check-scrollbar-hosts] 滚动面 ${scanned.size} 个全部归档（自绘 ${modes.drawn ?? 0} · 原生 ${modes.native ?? 0}），`
  + `overscroll / gutter / track-bg 按登记核过；backlog 待办 ${pending} 条，无过期豁免`,
)
console.log(
  `[check-scrollbar-hosts] ${reactProgress(covered, suiteCount)}，没铺到的宿主不核；`
  + 'React 侧只核有没有接这条线，壳与层分支那几条等它铺到第一个滚动宿主再定解析',
)
