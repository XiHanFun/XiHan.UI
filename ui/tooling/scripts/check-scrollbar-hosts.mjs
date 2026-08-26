#!/usr/bin/env node
// 门禁：给已有滚动层配自绘条的宿主，两个适配器都得接，壳与皮肤也得配齐。
//
// 这条接线不新增任何 part，check-part-wiring 那套「从解剖派生 getter 名」的判据整个看不见它。
// 而它有五个失效面：只接了一端（一路绿到发布）、壳没有定位上下文（条子飘到某个远房祖先，
// 页面上位置不对而控制台零输出）、壳没关掉轨道底色（列表右缘糊一条灰带）、
// 滚动层皮肤里还留着没加守卫的 scrollbar-width / scrollbar-gutter（原生条与自绘条并存）、
// 浮层没把壳记进层分支（条子是 content 的兄弟，按住它那一下被判成层外交互，浮层当场收起）。
// 前四条都不报错、只“看着不对”，所以在这里逐条钉死。
import { readdir, readFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

const VUE = 'packages/adapters/vue/src/components'
const WC = 'packages/adapters/web-components/src/elements'
const STYLES = 'packages/design/styles/css'

/** Vue 侧的调用点。 */
const VUE_CALL = 'useScrollbars('
/** WC 侧的调用点。 */
const WC_CALL = 'new ScrollbarsController('

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

/** 取出 `new ScrollbarsController(` 之后配平括号内的那段实参。 */
function callBlock(src) {
  const at = src.indexOf(WC_CALL)
  if (at < 0)
    return null
  let depth = 0
  for (let i = at + WC_CALL.length - 1; i < src.length; i++) {
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

/** 层分支那一行，没注册层时没有。 */
function branchesLine(src) {
  return /branches\s*:(.*)/.exec(src)?.[1] ?? null
}

/** `branch-content` → `branchContent`：Vue 那侧的 ref 名按这个规则从 part 名派生。 */
function camel(part) {
  return part.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(full)
    else if (entry.name.endsWith('.ts'))
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

// 规则①：一端接了另一端忘了，页面上只会在那一端看出来
for (const comp of vueHosts.keys()) {
  if (!wcHosts.has(comp))
    problems.push(`${comp}：Vue 侧配了自绘条，WC 侧没配`)
}
for (const comp of wcHosts.keys()) {
  if (!vueHosts.has(comp))
    problems.push(`${comp}：WC 侧配了自绘条，Vue 侧没配`)
}

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
  const wcBranches = branchesLine(src)
  if (wcBranches !== null && !wcBranches.includes(`getPart('${shellPart}')`))
    problems.push(`${comp}：WC 侧的 branches 要把 ${shellPart} 记进去，否则按住条子会把浮层消解掉`)
  for (const { file, src: vueSrc } of vueSources.get(comp) ?? []) {
    const line = branchesLine(vueSrc)
    if (line !== null && !line.includes(`${camel(shellPart)}Ref`))
      problems.push(`${file}：branches 要把 ${camel(shellPart)}Ref 记进去，否则按住条子会把浮层消解掉`)
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

if (problems.length) {
  console.error('[check-scrollbar-hosts] ✗ 自绘条接线不齐：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(
  `[check-scrollbar-hosts] 通过：${wcHosts.size} 个宿主两端都配了自绘条，`
  + `${checkedShells} 个壳有定位上下文与轨道底色、也都记进了层分支，滚动层皮肤没有漏守卫的原生条声明`,
)
