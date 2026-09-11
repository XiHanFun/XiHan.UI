#!/usr/bin/env node
// 门禁：渲染原生表单控件的 input 部件，必须把自动填充态的底与字接回令牌。
//
// 浏览器给填过的输入框强加一套系统色（多数引擎是黄底黑字）。那套色的优先级高到普通
// background / color 改不动，也不跟主题走——深色档下留一个黄框，切主题它纹丝不动，
// 「皮肤里不写硬编码颜色」建立起来的一致性在这一处当场破掉。
//
// 能改动它的手段只有两个，两个都得写：
//   ① box-shadow 的 inset 扩散铺一层底，扩散量够大即填满内容盒（background 改不动）；
//   ② -webkit-text-fill-color 接回前景（color 在这个态下同样被系统接管）。
// 拉长 transition 把系统底推迟显现不算解决：那只是把它藏到很久以后，而且减弱动效通道
// 一关过渡就当场露出，所以 autofill 规则里出现 transition 一律判红。
//
// 两个引擎的选择器名不同（:autofill 与 :-webkit-autofill），且互不认识对方那个。
// 选择器列表里只要有一个名字不被认识，整条规则就被丢弃——两个名字必须拆成两条各写一遍，
// 写进同一条列表等于两边都不生效，所以这里也查「有没有把两个名字并进同一条选择器」。
//
// 名单不手写：候选来自解剖里带 input 部件的组件，元素类型从 Vue 适配器里那个渲染
// input 部件的组件读出来（h('input') / h('textarea') / h(props.as) 的 as 默认值）。
// 浏览器只填原生表单控件，所以只有解析出 input / textarea 的才受这条约束。
// 解析出别的标签的登记进 NOT_NATIVE，登记项在候选里扫不到、或者它其实渲染的是原生控件，
// 都判名单过期。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

import { VUE_COMPONENTS_DIR } from './lib/adapters.mjs'
import { declarations, stripComments } from './lib/css-declarations.mjs'

/**
 * 这张门禁的断言全部落在共享皮肤上，React 不在其列。
 * 要求的是 packages/design/styles/css/<组件>.css 里有那两条 autofill 规则，而皮肤三家共用：
 * 规则写齐了，Vue、Web Components、React 渲染出来的那个 input 一起受益，
 * 逐家再核一遍核的是同一份文件。Vue 适配器在这里只当取样点——它是唯一被解析的地方，
 * 用来判断某个组件的 input 部件到底渲染成 <input>/<textarea> 还是别的标签。
 *
 * React 该纳入的时机：它铺到某个带 input 部件的组件、且那里渲染出来的标签与 Vue 不同的时候。
 * 那时判据要多一条「三家的 input 部件解析出同一个标签」——标签不同则皮肤按 Vue 推出的
 * 那份 autofill 规则在 React 上落不着，是这张门禁现在看不见的一个面。
 */
const SCOPE = 'React 不在其列：判据落在三家共用的皮肤上，Vue 只是解析 input 部件渲染成什么标签的取样点'

const ANATOMY_DIR = 'packages/engine/headless/src'
const VUE_DIR = VUE_COMPONENTS_DIR
const SKIN_DIR = 'packages/design/styles/css'

/**
 * 解剖里有 input 部件、但渲染的不是原生表单控件的组件。
 * 值写清它实际渲染成什么，以及为什么不受这条约束。
 */
const NOT_NATIVE = {
  'tool-call': { tag: 'div', reason: '展示工具调用的入参，是只读的代码块容器，不接受键入' },
}

const problems = []

// —— 一、候选：解剖里带 input 部件的组件 ——
const componentDirs = (await readdir(ANATOMY_DIR, { withFileTypes: true }))
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort()

const candidates = []
for (const name of componentDirs) {
  let src
  try {
    src = await readFile(join(ANATOMY_DIR, name, `${name}.anatomy.ts`), 'utf8')
  }
  catch {
    continue
  }
  if (/(?:^|[\s[,])'input'(?=\s*[,\]])/.test(src))
    candidates.push(name)
}

if (candidates.length === 0)
  problems.push('一个带 input 部件的解剖都没扫到——解剖的写法变了，这条门禁已经形同虚设')

// —— 二、元素类型：从 Vue 适配器里读那个渲染 input 部件的组件 ——
/** 找出 idx 之前最近的一个 h(…) 调用，返回它渲染的标签名（props.as 时回填 as 的默认值）。 */
function hostTagBefore(src, idx) {
  let found = null
  for (const m of src.matchAll(/\bh\(\s*(?:'([a-z]+)'|(props\.as))/g)) {
    if (m.index >= idx)
      break
    found = m
  }
  if (!found || idx - found.index > 800)
    return null
  if (found[1])
    return found[1]
  // h(props.as)：标签由 as 这个 prop 决定，取它声明的默认值
  let fallback = null
  for (const m of src.matchAll(/\bas:\s*\{[^{}]*default:\s*'([a-z]+)'/g)) {
    if (m.index >= found.index)
      break
    fallback = m[1]
  }
  return fallback
}

const hostTag = new Map()
for (const name of candidates) {
  let src
  try {
    src = await readFile(join(VUE_DIR, name, `${name}.ts`), 'utf8')
  }
  catch {
    problems.push(`${name}：解剖里有 input 部件，Vue 适配器里却找不到 ${name}.ts——组件改名了就把两边一起改`)
    continue
  }
  // getHiddenInputProps / getItemInputProps / getInputRowProps 都不是这个部件，前缀断言把它们挡掉
  const call = [...src.matchAll(/(?<![A-Za-z])getInputProps\b/g)][0]
  if (!call) {
    problems.push(`${name}.ts 里没有 getInputProps 的消费点——input 部件没被渲染出来`)
    continue
  }
  const tag = hostTagBefore(src, call.index)
  if (!tag) {
    problems.push(`${name}.ts 里读不出 input 部件渲染成什么标签——渲染写法变了，改这条门禁的解析`)
    continue
  }
  hostTag.set(name, tag)
}

const native = [...hostTag.entries()].filter(([, tag]) => tag === 'input' || tag === 'textarea').map(([n]) => n)
const foreign = [...hostTag.entries()].filter(([, tag]) => tag !== 'input' && tag !== 'textarea')

// 非原生的必须登记，登记的必须仍是非原生
for (const [name, tag] of foreign) {
  const entry = NOT_NATIVE[name]
  if (!entry) {
    problems.push(`${name} 的 input 部件渲染成 <${tag}>，不是原生表单控件——登记进 NOT_NATIVE 并写清它是什么`)
    continue
  }
  if (entry.tag !== tag)
    problems.push(`NOT_NATIVE 里 ${name} 记的是 <${entry.tag}>，实际渲染的是 <${tag}>——名单过期`)
}
for (const name of Object.keys(NOT_NATIVE)) {
  if (!hostTag.has(name)) {
    problems.push(`NOT_NATIVE 里登着 ${name}，候选里却扫不到它——名单过期`)
    continue
  }
  const tag = hostTag.get(name)
  if (tag === 'input' || tag === 'textarea')
    problems.push(`NOT_NATIVE 里登着 ${name}，它现在渲染的是原生 <${tag}>——名单过期，这份皮肤得补 autofill 规则`)
}

// —— 三、特异性：只比 a/b/c 三元组 ——
/** 把一条复合选择器数成 [id 数, 类与属性与伪类数, 元素与伪元素数]。 */
function specificity(sel) {
  let a = 0
  let b = 0
  let c = 0
  let i = 0
  const s = sel.trim()
  while (i < s.length) {
    const ch = s[i]
    if (ch === '[') {
      let depth = 0
      for (; i < s.length; i++) {
        if (s[i] === '[')
          depth++
        else if (s[i] === ']' && --depth === 0)
          break
      }
      i++
      b++
      continue
    }
    if (ch === '#') {
      a++
      i++
      while (i < s.length && /[\w-]/.test(s[i])) i++
      continue
    }
    if (ch === '.') {
      b++
      i++
      while (i < s.length && /[\w-]/.test(s[i])) i++
      continue
    }
    if (ch === ':') {
      const isElement = s[i + 1] === ':'
      i += isElement ? 2 : 1
      const nameStart = i
      while (i < s.length && /[\w-]/.test(s[i])) i++
      const name = s.slice(nameStart, i)
      let args = ''
      if (s[i] === '(') {
        let depth = 0
        const open = i
        for (; i < s.length; i++) {
          if (s[i] === '(')
            depth++
          else if (s[i] === ')' && --depth === 0)
            break
        }
        args = s.slice(open + 1, i)
        i++
      }
      // :where() 不计特异性；:not() / :is() / :has() 取参数里最高的那一份
      if (name === 'where')
        continue
      if (args && (name === 'not' || name === 'is' || name === 'has' || name === 'matches')) {
        let best = [0, 0, 0]
        for (const part of args.split(',')) {
          const got = specificity(part)
          if (got[0] * 10000 + got[1] * 100 + got[2] > best[0] * 10000 + best[1] * 100 + best[2])
            best = got
        }
        a += best[0]
        b += best[1]
        c += best[2]
        continue
      }
      if (isElement)
        c++
      else
        b++
      continue
    }
    if (/[\w-]/.test(ch)) {
      const start = i
      while (i < s.length && /[\w-]/.test(s[i])) i++
      // 元素名（后代/组合符之后的那一段标签名）
      if (start === 0 || /[\s>+~,]/.test(s[start - 1]))
        c++
      continue
    }
    i++
  }
  return [a, b, c]
}

const rank = ([a, b, c]) => a * 10000 + b * 100 + c
/** 一条完整选择器（可能是逗号列表）里最高的那一份特异性。 */
function maxSpecificity(selector) {
  let best = [0, 0, 0]
  for (const part of selector.split(',')) {
    const got = specificity(part)
    if (rank(got) > rank(best))
      best = got
  }
  return best
}

// —— 四、autofill 色链：公开覆盖槽可直接落语义色，也可落到组件自己的状态派生槽 ——

/** 在括号与方括号之外拆逗号；:is() / :not() 里的逗号不拆。 */
function splitTopLevel(text) {
  const out = []
  let start = 0
  let round = 0
  let square = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') {
      round++
    }
    else if (text[i] === ')') {
      round--
    }
    else if (text[i] === '[') {
      square++
    }
    else if (text[i] === ']') {
      square--
    }
    else if (text[i] === ',' && round === 0 && square === 0) {
      out.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  out.push(text.slice(start).trim())
  return out.filter(Boolean)
}

function styleRules(css) {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({
    selector: m[1].replace(/\s+/g, ' ').trim(),
    body: m[2],
    at: m.index,
    line: css.slice(0, m.index).split('\n').length,
  }))
}

/** 一条 root 选择器在状态矩阵里的正/负属性条件；后代选择器不算给 root 赋值。 */
function rootCondition(selector, comp) {
  const marker = new RegExp(`\\[data-scope=['"]${comp}['"]\\]\\[data-part=['"]root['"]\\]`)
  const hit = marker.exec(selector)
  if (!hit)
    return null
  if (selector.slice(0, hit.index).trim())
    return null
  const tail = selector.slice(hit.index + hit[0].length)
  const residue = tail
    .replace(/:not\(\[[^\]]+\]\)/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .trim()
  if (residue)
    return null

  const negative = []
  for (const match of selector.matchAll(/:not\(\[([\w-]+)(?:=['"]([^'"]+)['"])?\]\)/g))
    negative.push({ name: match[1], value: match[2] ?? null })
  const withoutNegative = selector.replace(/:not\(\[[^\]]+\]\)/g, '')
  const positive = []
  for (const match of withoutNegative.matchAll(/\[([\w-]+)(?:=['"]([^'"]+)['"])?\]/g)) {
    if (match[1] !== 'data-scope' && match[1] !== 'data-part')
      positive.push({ name: match[1], value: match[2] ?? null })
  }
  return { positive, negative }
}

function conditionMatches(condition, state) {
  const matches = ({ name, value }) => state.has(name) && (value === null || state.get(name) === value)
  return condition.positive.every(matches) && condition.negative.every(entry => !matches(entry))
}

/** 公开 autofill 槽的第二参必须仍是一支 var；返回它指向的语义/私有槽。 */
function fallbackTarget(body, role) {
  const match = new RegExp(
    `var\\(\\s*(--xh-[a-z0-9-]*autofill-${role})\\s*,\\s*var\\(\\s*(--xh-[\\w-]+)\\s*\\)\\s*\\)`,
  ).exec(body)
  return match ? { slot: match[1], target: match[2] } : null
}

function roleToken(name, role) {
  if (role === 'bg')
    return name.startsWith('--xh-bg-') || /^--xh-material-[\w-]+-bg$/.test(name)
  return name.startsWith('--xh-fg-') || name === '--xh-tone-on'
}

/** 透明关键字、显式 alpha 与带 alpha 的十六进制都不是可盖住平台底的实体色。 */
function transparencyOf(value) {
  if (/\btransparent\b/i.test(value) || /^\s*none\s*$/i.test(value))
    return 'transparent/none'
  for (const match of value.matchAll(/\/\s*(\d+(?:\.\d+)?|\.\d+)(%?)\s*(?=[)\s,])/g)) {
    const alpha = Number(match[1]) / (match[2] ? 100 : 1)
    if (alpha < 1)
      return `alpha=${alpha}`
  }
  for (const match of value.matchAll(/rgba?\([^)]*,\s*(\d+(?:\.\d+)?|\.\d+)\s*\)/gi)) {
    if (Number(match[1]) < 1)
      return `alpha=${match[1]}`
  }
  for (const match of value.matchAll(/#(?:[\da-f]{4}|[\da-f]{8})\b/gi)) {
    const hex = match[0].slice(1)
    const alpha = Number.parseInt(hex.length === 4 ? `${hex[3]}${hex[3]}` : hex.slice(6), 16)
    if (alpha < 255)
      return `alpha=${alpha}/255`
  }
  return null
}

/** 解析一条表达式里的所有 var 依赖；未定义、成环或任一可能取值透明都会失败。 */
function inspectExpression(value, role, resolve, trail) {
  const errors = []
  const transparent = transparencyOf(value)
  if (transparent)
    errors.push(`${trail.join(' → ')} 的终值不是实体色（${transparent}）：${value.replace(/\s+/g, ' ')}`)
  let roleSeen = false
  const references = [...value.matchAll(/var\(\s*(--xh-[\w-]+)/g)].map(m => m[1])
  for (const name of references) {
    const result = resolve(name, [...trail, name])
    errors.push(...result.errors)
    roleSeen ||= result.roleSeen
  }
  return { errors, roleSeen }
}

function inspectGlobal(name, role, globals, trail) {
  if (trail.slice(0, -1).includes(name))
    return { errors: [`autofill 色链成环：${trail.join(' → ')}`], roleSeen: false }
  const values = globals.get(name)
  if (!values?.length)
    return { errors: [`autofill 色链引用了未声明的 ${name}（${trail.join(' → ')}）`], roleSeen: false }
  let roleSeen = roleToken(name, role)
  const errors = []
  for (const value of values) {
    const result = inspectExpression(value, role, (next, nextTrail) => inspectGlobal(next, role, globals, nextTrail), trail)
    errors.push(...result.errors)
    roleSeen ||= result.roleSeen
  }
  return { errors, roleSeen }
}

function localDeclarationsOf(comp, css) {
  const out = new Map()
  for (const declaration of declarations(css)) {
    if (!declaration.prop.startsWith('--xh-_'))
      continue
    const selector = declaration.selectors.at(-1)
    if (!selector || selector.startsWith('@'))
      continue
    // @layer 只决定级联层，不改变规则会不会命中；其余祖先可能让声明只在某个媒体、
    // 特性或容器条件下存在，不能拿来证明普通环境中的 autofill 底一定为实体。
    const ancestors = declaration.selectors.slice(0, -1)
    if (ancestors.some(ancestor => !/^@layer(?:\s|$)/.test(ancestor)))
      continue
    for (const branch of splitTopLevel(selector)) {
      const condition = rootCondition(branch, comp)
      if (!condition)
        continue
      const entries = out.get(declaration.prop) ?? []
      entries.push({
        name: declaration.prop,
        value: declaration.value,
        at: declaration.index,
        condition,
        rank: rank(specificity(branch)),
        order: declaration.index,
      })
      out.set(declaration.prop, entries)
    }
  }
  return out
}

/** 从目标私有槽收依赖闭包；只有当前组件 root 上的声明参与本地状态层叠。 */
function localClosure(target, locals) {
  const found = new Set()
  const queue = [target]
  while (queue.length) {
    const name = queue.pop()
    if (found.has(name) || !locals.has(name))
      continue
    found.add(name)
    for (const declaration of locals.get(name)) {
      for (const match of declaration.value.matchAll(/var\(\s*(--xh-_[\w-]+)/g)) {
        if (locals.has(match[1]))
          queue.push(match[1])
      }
    }
  }
  return found
}

function statesFor(names, locals) {
  const domains = new Map()
  for (const name of names) {
    for (const declaration of locals.get(name) ?? []) {
      for (const entry of [...declaration.condition.positive, ...declaration.condition.negative]) {
        const domain = domains.get(entry.name) ?? new Set([null])
        domain.add(entry.value ?? '*')
        domains.set(entry.name, domain)
      }
    }
  }
  const axes = [...domains].map(([name, values]) => [name, [...values]])
  const out = []
  const visit = (index, state) => {
    if (index === axes.length) {
      out.push(new Map(state))
      return
    }
    const [name, values] = axes[index]
    for (const value of values) {
      if (value === null)
        state.delete(name)
      else
        state.set(name, value)
      visit(index + 1, state)
    }
    state.delete(name)
  }
  visit(0, new Map())
  return out.length ? out : [new Map()]
}

function stateName(state) {
  return [...state].map(([name, value]) => `${name}=${value}`).join(', ') || '默认态'
}

function inspectFallback(comp, target, role, css, globals) {
  if (!target.startsWith('--xh-_')) {
    const result = inspectGlobal(target, role, globals, [target])
    if (!result.roleSeen)
      result.errors.push(`${target} 没有落到 --xh-${role}-* 语义色`)
    return result.errors
  }

  const locals = localDeclarationsOf(comp, css)
  if (!locals.has(target))
    return [`${comp} 的 autofill 私有兜底 ${target} 未在本组件 root 的无条件规则中声明`]
  const closure = localClosure(target, locals)
  const errors = []
  for (const state of statesFor(closure, locals)) {
    const resolveLocal = (name, trail) => {
      if (trail.slice(0, -1).includes(name))
        return { errors: [`autofill 色链成环：${trail.join(' → ')}`], roleSeen: false }
      const declarations = locals.get(name)
      if (!declarations)
        return inspectGlobal(name, role, globals, trail)
      const matches = declarations.filter(entry => conditionMatches(entry.condition, state))
      matches.sort((a, b) => a.rank - b.rank || a.order - b.order)
      const selected = matches.at(-1)
      if (!selected)
        return { errors: [`${stateName(state)} 下 ${name} 没有生效声明`], roleSeen: false }
      return inspectExpression(
        selected.value,
        role,
        (next, nextTrail) => locals.has(next)
          ? resolveLocal(next, nextTrail)
          : inspectGlobal(next, role, globals, nextTrail),
        trail,
      )
    }
    const result = resolveLocal(target, [target])
    for (const error of result.errors)
      errors.push(`${stateName(state)}：${error}`)
    if (!result.roleSeen)
      errors.push(`${stateName(state)}：${target} 没有落到 --xh-${role}-* 语义色`)
  }
  return [...new Set(errors)]
}

/** 正反夹具随门禁常跑：保证状态覆盖能挡住透明普通底，同时拒绝坏链和条件声明伪证明。 */
function verifyPrivateResolver() {
  const globals = new Map([
    ['--xh-bg-canvas', ['oklch(1 0 0)']],
    ['--xh-fg-default', ['oklch(0.1 0 0)']],
  ])
  const root = '[data-scope=\'probe\'][data-part=\'root\']'
  const positive = `
    @layer xihan.components {
      ${root} {
        --xh-_probe-surface: var(--xh-bg-canvas);
        --xh-_probe-autofill-bg: var(--xh-_probe-surface);
      }
      ${root}[data-variant='ghost'] {
        --xh-_probe-surface: transparent;
        --xh-_probe-autofill-bg: var(--xh-bg-canvas);
      }
    }
  `
  if (inspectFallback('probe', '--xh-_probe-autofill-bg', 'bg', positive, globals).length)
    throw new Error('[check-autofill] 私有链自检失败：状态覆盖后的实体底被误判')

  const bad = [
    ['--xh-_probe-missing', `${root} { --xh-_probe-missing: var(--xh-_not-declared); }`, '未声明'],
    ['--xh-_probe-cycle', `${root} { --xh-_probe-cycle: var(--xh-_probe-next); --xh-_probe-next: var(--xh-_probe-cycle); }`, '成环'],
    ['--xh-_probe-clear', `${root} { --xh-_probe-clear: transparent; }`, '不是实体色'],
    ['--xh-_probe-alpha', `${root} { --xh-_probe-alpha: oklch(1 0 0 / 0.5); }`, 'alpha=0.5'],
  ]
  for (const [target, css, expected] of bad) {
    const errors = inspectFallback('probe', target, 'bg', css, globals)
    if (!errors.some(error => error.includes(expected)))
      throw new Error(`[check-autofill] 私有链自检失败：${expected} 夹具没有被拒绝`)
  }

  const conditional = `
    ${root} {
      --xh-_probe-surface: transparent;
      --xh-_probe-autofill-bg: var(--xh-_probe-surface);
    }
    @media (forced-colors: active) {
      ${root} { --xh-_probe-surface: var(--xh-bg-canvas); }
    }
  `
  const conditionalErrors = inspectFallback('probe', '--xh-_probe-autofill-bg', 'bg', conditional, globals)
  if (!conditionalErrors.some(error => error.includes('不是实体色')))
    throw new Error('[check-autofill] 私有链自检失败：条件媒体里的实体覆盖误证了普通透明底')
}

verifyPrivateResolver()

// 收集令牌与共享语气层的所有可能声明；私有链末端每一档都必须保持不透明。
const globalDeclarations = new Map()
for (const file of (await readdir(SKIN_DIR)).filter(name => name.endsWith('.css'))) {
  const source = stripComments(await readFile(join(SKIN_DIR, file), 'utf8'))
  for (const declaration of declarations(source)) {
    if (!declaration.prop.startsWith('--xh-'))
      continue
    const values = globalDeclarations.get(declaration.prop) ?? []
    values.push(declaration.value)
    globalDeclarations.set(declaration.prop, values)
  }
}
for (const declaration of declarations(stripComments(await readFile('packages/design/tokens/tokens.css', 'utf8')))) {
  if (!declaration.prop.startsWith('--xh-'))
    continue
  const values = globalDeclarations.get(declaration.prop) ?? []
  values.push(declaration.value)
  globalDeclarations.set(declaration.prop, values)
}

// —— 五、逐份皮肤查规则 ——

let ruleCount = 0

for (const comp of native.sort()) {
  let css
  try {
    css = stripComments(await readFile(join(SKIN_DIR, `${comp}.css`), 'utf8'))
  }
  catch {
    problems.push(`${comp}.css 读不到——有 input 部件就得有这份皮肤`)
    continue
  }

  const rules = styleRules(css)

  const autofillRules = rules.filter(r => /:(?:-webkit-)?autofill\b/.test(r.selector))
  if (autofillRules.length === 0) {
    problems.push(`${comp}.css 没有 autofill 规则——自动填充会把这个框刷成系统的黄底黑字，且不跟主题走`)
    continue
  }

  for (const r of autofillRules) {
    // 两个名字并进同一条选择器列表：不认识其中一个的引擎会把整条规则丢掉，等于两边都没有
    if (/:autofill\b/.test(r.selector) && /:-webkit-autofill\b/.test(r.selector)) {
      problems.push(
        `${comp}.css:${r.line} 把 :autofill 与 :-webkit-autofill 写进了同一条选择器——`
        + '不认识其中一个的引擎会丢弃整条规则，拆成两条各写一遍',
      )
    }
    if (/\btransition\b/.test(r.body)) {
      problems.push(
        `${comp}.css:${r.line} autofill 规则里写了 transition——`
        + '拖长过渡只是把系统底推迟显现，减弱动效通道一关过渡就当场露出',
      )
    }
    if (!/data-part='input'/.test(r.selector))
      problems.push(`${comp}.css:${r.line} autofill 规则没落在 input 部件上`)
    ruleCount++
  }

  // 两个引擎的名字各要有一条同时写了两个手段的规则
  for (const [pseudo, label] of [[/:autofill\b/, ':autofill'], [/:-webkit-autofill\b/, ':-webkit-autofill']]) {
    const hit = autofillRules.filter(r => pseudo.test(r.selector) && !(label === ':autofill' && /:-webkit-autofill\b/.test(r.selector)))
    if (hit.length === 0) {
      problems.push(`${comp}.css 缺 ${label} 那一条——两个引擎的选择器名不同，覆盖面也不同，两条都要有`)
      continue
    }
    const full = hit.filter(r =>
      /box-shadow:[^;]*\binset\b/.test(r.body)
      && fallbackTarget(r.body, 'bg')
      && fallbackTarget(r.body, 'fg'))
    if (full.length === 0) {
      problems.push(
        `${comp}.css ${label} 那一条没把两个手段都写全：`
        + 'box-shadow 用 inset 铺底、-webkit-text-fill-color 接回前景；'
        + '公开 autofill 槽的第二参须为已声明的实体语义色或私有状态派生槽',
      )
    }
    for (const rule of full) {
      for (const role of ['bg', 'fg']) {
        const chain = fallbackTarget(rule.body, role)
        for (const error of inspectFallback(comp, chain.target, role, css, globalDeclarations))
          problems.push(`${comp}.css:${rule.line} ${chain.slot} → ${chain.target}：${error}`)
      }
    }
  }

  // 同一份皮肤里把 input 的落影抹平的规则（一体式盒内那种），autofill 必须压得过它
  for (const r of rules) {
    if (!/data-part='input'/.test(r.selector))
      continue
    if (!/box-shadow:\s*none\s*(?:;|$)/.test(r.body))
      continue
    const floor = rank(maxSpecificity(r.selector))
    const wins = autofillRules.some((a) => {
      if (!/box-shadow:/.test(a.body))
        return false
      const got = rank(maxSpecificity(a.selector))
      return got > floor || (got === floor && a.at > r.at)
    })
    if (!wins) {
      problems.push(
        `${comp}.css:${r.line} 这条把 input 的落影抹成了 none，autofill 那层底压不过它——`
        + '同特异性时把 autofill 规则挪到它后面，或者提高一档特异性',
      )
    }
  }
}

if (problems.length > 0) {
  console.error('[check-autofill] ✗ 自动填充态没把底与字接回令牌：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-autofill] 通过：${candidates.length} 个带 input 部件的组件里 ${native.length} 个渲染原生表单控件，`
  + `共 ${ruleCount} 条 autofill 规则把底与字接回令牌（私有状态链正反自检 6 组；`
  + `不是原生控件的 ${Object.keys(NOT_NATIVE).length} 个已登记）`,
)
console.log(`[check-autofill] 适用面：${SCOPE}`)
