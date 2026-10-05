#!/usr/bin/env node
// 门禁：皮肤产物里的规则按浏览器的分桶方式摊开，不许重新挤回一个大桶。
//
// 浏览器匹配样式时先按规则最右侧那一节（主体复合选择器）分桶：有 id 认 id、有类认类、
// 再没有才按属性名、标签名，什么都没有的进通配桶。一个元素重算样式时只试与它沾边的几个桶。
// 属性选择器只按属性名分桶、不看取值：皮肤曾经全以 [data-scope='x'] 领头，六千多条规则挤在
// data-scope 一个桶里，每个组件节点每次重算都要逐条试一遍——大页面打一次 inert 上百毫秒。
// 现在 build/emit-entries.mjs 把产物里的 [data-scope='x'] 换成挂载类 .xh-scope-x（源文件照旧按属性写），
// 每个组件各占一个桶。这道门禁守住两件事：
//   1. 两份扁平产物的选择器里不再出现带取值的 [data-scope=…]——转换漏了，或有人绕开生成直接改产物；
//   2. index.css 各桶的规则数不超过预算：某个组件的皮肤膨胀、或新写的规则主体只剩 [data-part] / 通配，
//      都会让对应的桶变大，在这里报出来。
//
// 分桶键按 Blink 的取法近似：主体复合选择器里第一个 id > 第一个类 > 第一个属性名 > 标签 > 通配；
// 主体里没有键时，单参数的 :is() / :where() 取其内部最右一节的键。:not() / :has() 不提供键。
import { readFile } from 'node:fs/promises'

const PKG = 'packages/design/styles'
const OUTPUTS = ['index.css', 'index.unlayered.css']
const BUDGET_FILE = 'index.css'

/**
 * index.css 各桶的规则数上限。挂载类桶按组件计，最大的 grid 当下 277 条；
 * 非类名的桶是挂载类够不着的：data-part 主体（后代部件写成 [scope][part] [data-part=…]）、
 * 通配主体（`> *` 一类）、家族配方的根属性。上限给到当下规模之上一点，涨过去先看能不能把主体收回类名。
 */
const BUDGET = {
  class: 320,
  'attr:data-part': 190,
  universal: 100,
  attr: 100,
  tag: 60,
}

const scopeExact = /\[data-scope=(['"]?)[a-z][a-z0-9-]*\1\]/

/** 逐字符取出样式规则的选择器（含 @media 内与 CSS 嵌套的内层规则），注释与字符串跳过。 */
function collectSelectors(css) {
  const out = []
  let prelude = ''
  let i = 0
  while (i < css.length) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 2
      continue
    }
    if (c === '"' || c === '\'') {
      const end = skipString(css, i)
      prelude += css.slice(i, end + 1)
      i = end + 1
      continue
    }
    if (c === ';' || c === '}') {
      prelude = ''
      i++
      continue
    }
    if (c === '{') {
      const head = prelude.trim()
      prelude = ''
      const close = matchBrace(css, i)
      const body = css.slice(i + 1, close === -1 ? css.length : close)
      // @keyframes 的帧选择器不进规则分桶
      if (!head.startsWith('@'))
        out.push(...splitTop(head, ','))
      if (!/^@(?:-[a-z]+-)?keyframes\b/.test(head))
        out.push(...collectSelectors(body))
      i = close === -1 ? css.length : close + 1
      continue
    }
    prelude += c
    i++
  }
  return out.map(s => s.trim()).filter(Boolean)
}

/** 顶层切分：括号与方括号里的分隔符不算。 */
function splitTop(text, separator) {
  const parts = []
  let depth = 0
  let current = ''
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"' || c === '\'') {
      const end = skipString(text, i)
      current += text.slice(i, end + 1)
      i = end
      continue
    }
    if (c === '(' || c === '[')
      depth++
    else if (c === ')' || c === ']')
      depth--
    if (depth === 0 && c === separator) {
      parts.push(current)
      current = ''
      continue
    }
    current += c
  }
  parts.push(current)
  return parts
}

/** 最右侧的复合选择器：顶层最后一个组合符（空白、>、+、~）之后的那一段。 */
function subjectOf(selector) {
  let depth = 0
  let start = 0
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i]
    if (c === '"' || c === '\'') {
      i = skipString(selector, i)
      continue
    }
    if (c === '(' || c === '[')
      depth++
    else if (c === ')' || c === ']')
      depth--
    else if (depth === 0 && (c === ' ' || c === '\n' || c === '>' || c === '+' || c === '~'))
      start = i + 1
  }
  return selector.slice(start).trim()
}

/** 复合选择器的分桶键。 */
function bucketOf(compound) {
  // 只看顶层：括号与方括号里的内容先抹掉，伪类参数另行处理
  let flat = ''
  const args = []
  let depth = 0
  let arg = ''
  for (let i = 0; i < compound.length; i++) {
    const c = compound[i]
    if (c === '(') {
      if (depth === 0)
        arg = ''
      else
        arg += c
      depth++
      continue
    }
    if (c === ')') {
      depth--
      if (depth === 0) {
        args.push({ at: flat, text: arg })
        flat += '()'
      }
      else {
        arg += c
      }
      continue
    }
    if (depth > 0) {
      arg += c
      continue
    }
    flat += c
  }
  const noAttrs = flat.replace(/\[[^\]]*\]/g, '[]')
  const id = noAttrs.match(/#([\w-]+)/)
  if (id)
    return `id:${id[1]}`
  const cls = noAttrs.match(/\.([\w-]+)/)
  if (cls)
    return `class:${cls[1]}`
  const attr = flat.match(/\[\s*([\w-]+)/)
  if (attr)
    return `attr:${attr[1]}`
  const tag = flat.match(/^([a-z][\w-]*)/i)
  if (tag)
    return `tag:${tag[1].toLowerCase()}`
  for (const { at, text } of args) {
    if (!/:(?:is|where)$/.test(at))
      continue
    const options = splitTop(text, ',')
    if (options.length === 1) {
      const inner = bucketOf(subjectOf(options[0]))
      if (inner !== 'universal')
        return inner
    }
  }
  return 'universal'
}

function matchBrace(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    const c = css[i]
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 1
      continue
    }
    if (c === '"' || c === '\'') {
      i = skipString(css, i)
      continue
    }
    if (c === '{') {
      depth++
    }
    else if (c === '}') {
      depth--
      if (depth === 0)
        return i
    }
  }
  return -1
}

function skipString(css, start) {
  const quote = css[start]
  for (let i = start + 1; i < css.length; i++) {
    if (css[i] === '\\') {
      i++
      continue
    }
    if (css[i] === quote)
      return i
  }
  return css.length
}

function budgetFor(key) {
  if (key.startsWith('class:'))
    return BUDGET.class
  if (key in BUDGET)
    return BUDGET[key]
  if (key.startsWith('attr:'))
    return BUDGET.attr
  if (key.startsWith('tag:'))
    return BUDGET.tag
  return BUDGET.universal
}

const errors = []
let summary = ''
for (const file of OUTPUTS) {
  const selectors = collectSelectors(await readFile(`${PKG}/${file}`, 'utf8'))
  const leftovers = selectors.filter(s => scopeExact.test(s))
  for (const s of leftovers.slice(0, 5))
    errors.push(`${file} 里还有以属性写的组件选择器：${s.slice(0, 120)}`)
  if (leftovers.length > 5)
    errors.push(`${file} 里另有 ${leftovers.length - 5} 条同类选择器`)
  if (file !== BUDGET_FILE)
    continue
  const buckets = new Map()
  for (const s of selectors) {
    const key = bucketOf(subjectOf(s))
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  const sorted = [...buckets].sort((a, b) => b[1] - a[1])
  for (const [key, count] of sorted) {
    const limit = budgetFor(key)
    if (count > limit)
      errors.push(`${file} 的 ${key} 桶有 ${count} 条规则，超过预算 ${limit}：把规则主体收回挂载类，或拆掉重复的规则`)
  }
  summary = `${selectors.length} 条选择器分进 ${buckets.size} 个桶，最大的几个：${sorted.slice(0, 5).map(([k, n]) => `${k} ${n}`).join('、')}`
}

if (errors.length > 0) {
  console.error('[check-selector-buckets] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  console.error('先跑 pnpm --filter @xihan-ui/styles gen 重新生成产物；产物仍不过就看上面点名的桶。')
  process.exit(1)
}
console.log(`[check-selector-buckets] 通过：两份产物里没有以属性写的组件选择器；index.css 的 ${summary}`)
