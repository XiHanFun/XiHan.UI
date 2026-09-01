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

const ANATOMY_DIR = 'packages/engine/headless/src'
const VUE_DIR = 'packages/adapters/vue/src/components'
const SKIN_DIR = 'packages/design/styles/css'

/**
 * 解剖里有 input 部件、但渲染的不是原生表单控件的组件。
 * 值写清它实际渲染成什么，以及为什么不受这条约束。
 */
const NOT_NATIVE = {
  'time-picker': { tag: 'span', reason: '时分秒各是一个可聚焦的文字段，不是输入框，浏览器不会往里填' },
  'tool-call': { tag: 'div', reason: '展示工具调用的入参，是只读的代码块容器，不接受键入' },
}

/** 注释挖空但保留换行，行号不移位。 */
const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))

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

// —— 四、逐份皮肤查规则 ——
const BG_TOKEN = /var\(\s*--xh-[a-z0-9-]*autofill-bg\s*,\s*var\(\s*--xh-bg-[a-z0-9-]+\s*\)\s*\)/
const FG_TOKEN = /var\(\s*--xh-[a-z0-9-]*autofill-fg\s*,\s*var\(\s*--xh-fg-[a-z0-9-]+\s*\)\s*\)/

let ruleCount = 0

for (const comp of native.sort()) {
  let css
  try {
    css = strip(await readFile(join(SKIN_DIR, `${comp}.css`), 'utf8'))
  }
  catch {
    problems.push(`${comp}.css 读不到——有 input 部件就得有这份皮肤`)
    continue
  }

  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({
    selector: m[1].replace(/\s+/g, ' ').trim(),
    body: m[2],
    at: m.index,
    line: css.slice(0, m.index).split('\n').length,
  }))

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
    const full = hit.filter(r => /box-shadow:[^;]*\binset\b/.test(r.body) && BG_TOKEN.test(r.body) && FG_TOKEN.test(r.body))
    if (full.length === 0) {
      problems.push(
        `${comp}.css ${label} 那一条没把两个手段都写全：`
        + 'box-shadow 用 inset 铺底（var(--xh-<组件>-…-autofill-bg, var(--xh-bg-…))）、'
        + '-webkit-text-fill-color 接回前景（var(--xh-<组件>-…-autofill-fg, var(--xh-fg-…))）',
      )
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
  + `共 ${ruleCount} 条 autofill 规则把底与字接回令牌（不是原生控件的 ${Object.keys(NOT_NATIVE).length} 个已登记）`,
)
