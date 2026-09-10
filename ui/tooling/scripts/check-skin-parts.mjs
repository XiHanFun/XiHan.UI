#!/usr/bin/env node
// 门禁：皮肤里每个 [data-part='Y'] 都要在它所属 scope 的解剖里。
//
// 部件名的真源是解剖（headless src/<scope>/<scope>.anatomy.ts）。宿主退役一个部件后，
// 皮肤里指向它的规则永远选不中任何节点，surface:update 还会把那条规则里的覆盖槽收回公开面。
//
// 所属 scope 按选择器现算：一条选择器先按顶层逗号拆成分支，各分支从头算；分支再按组合符拆成复合，
// 复合里写了带值的 `[data-scope='X']` 就是这一节的 scope（写在 [data-part] 前后都一样），没写的
// 沿用左边最近那一节的 scope——select.css 里 `[data-scope='tag'][data-part='root']` 那一段按 tag 的解剖核。
// `:is()` / `:where()` 里各分支同上，分支都落在同一个 scope 时那个 scope 也算这一节的；
// `:not()` / `:has()` 里各算各的，出了括号不带出来。存在式 `[data-scope]` 不点名 scope，
// 这一节按未知算。整条分支到这一节为止一个带值 scope 都没有的（reset.css 的
// `[data-scope][data-part='positioner']`、overlay-arrow.css 的 `[data-part='arrow']`），部件名要在全部解剖的并集里。
//
// 属性选择器读不出来的（转义、匹配符不是全等）逐条判红：读不出来等于这一处没核。
//
// 登记表 EXEMPT 逐条「文件:scope:part」放行，值写明为什么解剖外的名字在这里是对的。
// 两侧反查：登记了却不再命中（规则删了、部件回到解剖里了）一律判红。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { lineCounter, stripComments } from './lib/css-declarations.mjs'

const HEADLESS = 'packages/engine/headless/src'
const SKINS = 'packages/design/styles/css'

/** 解剖外的部件名放行表：键「文件:scope:part」，值写清这个名字为什么在这里是对的。 */
const EXEMPT = {
  // 段里的控件是 text-field / select 这些各自 scope 的控件，圆角落在它们自己的 control 盒上；
  // 段可以是任何控件，选择器点不了名，只能按名字抓
  'input-group.css:input-group:control': '段里控件自己的 control 盒（text-field / select 等各自的 scope），不是 input-group 的部件',
}

/** 不是组件的目录。 */
const NOT_COMPONENT = new Set(['config', 'shared', 'spec'])

/**
 * 一个属性选择器：名字、匹配符、取值（单引号、双引号或裸写）与大小写标志。
 * 名字与取值都只由字母、数字、连字符、下划线组成；带转义的读不出来。
 */
const ATTR = /^\[\s*([\w-]+)\s*(?:([~|^$*]?=)\s*(?:'([^'\\]*)'|"([^"\\]*)"|([\w-]+))\s*(?:[is]\s*)?)?\]/i

/** 组合符：空白与 > + ~。 */
const isCombinator = ch => ch === ' ' || ch === '\t' || ch === '\n' || ch === '>' || ch === '+' || ch === '~'

/** 分支里各节的 scope 可以合并出一个唯一值：都点名了同一个 scope。 */
const AMBIGUOUS = Symbol('ambiguous')

/** scope → 解剖里的部件名集合。 */
const anatomies = new Map()
for (const dir of (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory())) {
  if (NOT_COMPONENT.has(dir.name))
    continue
  let src
  try {
    src = await readFile(join(HEADLESS, dir.name, `${dir.name}.anatomy.ts`), 'utf8')
  }
  catch {
    continue
  }
  const block = src.match(/createAnatomy\(\s*'([a-z0-9-]+)'\s*,\s*\[([\s\S]*?)\]/)
  if (!block)
    continue
  anatomies.set(block[1], new Set([...block[2].matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1])))
}
const allParts = new Set([...anatomies.values()].flatMap(set => [...set]))

/** 取出每条规则的选择器前奏与它的起点偏移；@ 开头的前奏（@layer / @media / @keyframes）不算。 */
function* selectorPreludes(css) {
  let start = 0
  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (c === '{') {
      const text = css.slice(start, i)
      const lead = /\S/.exec(text)
      if (lead && text[lead.index] !== '@')
        yield { text: text.trim(), index: start + lead.index }
      start = i + 1
    }
    else if (c === '}' || c === ';') {
      start = i + 1
    }
  }
}

/** 按顶层分隔符切分，方括号、圆括号与引号里的不切；每段带自己在整条选择器里的偏移。 */
function splitTop(text, base, isSep) {
  const out = []
  let depth = 0
  let quote = null
  let start = 0
  const push = (end) => {
    const seg = text.slice(start, end)
    const lead = /\S/.exec(seg)
    if (lead)
      out.push({ text: seg.trim(), offset: base + start + lead.index })
  }
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quote) {
      if (c === quote)
        quote = null
      continue
    }
    if (c === '\'' || c === '"') {
      quote = c
      continue
    }
    if (c === '(' || c === '[') {
      depth++
    }
    else if (c === ')' || c === ']') {
      depth--
    }
    else if (depth === 0 && isSep(c)) {
      push(i)
      start = i + 1
    }
  }
  push(text.length)
  return out
}

/** 与 text[start] 处左括号配对的右括号位置；配不上返回 -1。 */
function closingParen(text, start) {
  let depth = 0
  let quote = null
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (quote) {
      if (c === quote)
        quote = null
      continue
    }
    if (c === '\'' || c === '"') {
      quote = c
      continue
    }
    if (c === '(')
      depth++
    else if (c === ')' && --depth === 0)
      return i
  }
  return -1
}

/**
 * 走一条选择器列表，收出每个 [data-part='Y'] 与它的 scope，以及读不出来的属性选择器。
 * inherited 是这段选择器落在哪个 scope 里（伪类函数里的分支从外面那一节继承）。
 * 返回各分支最后一节的 scope，供 :is() / :where() 把里面的 scope 带回外面那一节。
 */
function walkSelectorList(text, base, inherited, out) {
  const finals = []
  for (const branch of splitTop(text, base, ch => ch === ','))
    finals.push(walkBranch(branch.text, branch.offset, inherited, out))
  return finals
}

/** 走一条分支：按组合符拆成复合，scope 从左往右沿用。 */
function walkBranch(text, base, inherited, out) {
  let scope = inherited
  for (const compound of splitTop(text, base, isCombinator))
    scope = walkCompound(compound.text, compound.offset, scope, out)
  return scope
}

/**
 * 走一节复合：带值的 [data-scope] 定这一节的 scope，:is() / :where() 里分支一致的 scope 次之，
 * 存在式 [data-scope] 与分支不一致的算未知，都没写的沿用继承来的。
 * 这一节里每个 [data-part='Y'] 都按定下来的 scope 记；:not() / :has() 里的另走一遍，不带出来。
 */
function walkCompound(text, base, inherited, out) {
  const parts = []
  const nested = []
  let explicit = null
  let fromGroups = null
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (c === '[') {
      const m = ATTR.exec(text.slice(i))
      if (!m) {
        const end = text.indexOf(']', i)
        out.unreadable.push({ offset: base + i, text: text.slice(i, end === -1 ? text.length : end + 1) })
        i = end === -1 ? text.length : end + 1
        continue
      }
      const [whole, name, op, single, double, bare] = m
      const value = single ?? double ?? bare
      if (name === 'data-scope' || name === 'data-part') {
        if (op && op !== '=') {
          out.unreadable.push({ offset: base + i, text: whole })
        }
        else if (name === 'data-scope') {
          explicit = value === undefined ? AMBIGUOUS : value
        }
        else if (value !== undefined) {
          parts.push({ part: value, offset: base + i })
        }
      }
      i += whole.length
      continue
    }
    if (c === ':') {
      const name = /^::?([\w-]+)/.exec(text.slice(i))
      if (!name) {
        i++
        continue
      }
      let next = i + name[0].length
      if (text[next] === '(') {
        const close = closingParen(text, next)
        const end = close === -1 ? text.length : close
        nested.push({ kind: name[1].toLowerCase(), text: text.slice(next + 1, end), offset: base + next + 1 })
        next = end + 1
      }
      i = next
      continue
    }
    i++
  }
  // :is() / :where() 描述的还是这一节的元素：里面各分支的 scope 一致时就是这一节的 scope
  for (const group of nested) {
    if (group.kind !== 'is' && group.kind !== 'where')
      continue
    const finals = walkSelectorList(group.text, group.offset, inherited, out)
    const named = new Set(finals.filter(s => s !== inherited))
    if (!named.size)
      continue
    const merged = named.size === 1 ? [...named][0] : AMBIGUOUS
    fromGroups = fromGroups === null ? merged : fromGroups === merged ? merged : AMBIGUOUS
  }
  const scope = explicit ?? fromGroups ?? inherited
  for (const { part, offset } of parts)
    out.parts.push({ part, scope: scope === AMBIGUOUS ? null : scope, offset })
  // :not() 排掉的与 :has() 探到的都不是这一节自己，里面各算各的
  for (const group of nested) {
    if (group.kind === 'not')
      walkSelectorList(group.text, group.offset, scope === AMBIGUOUS ? null : scope, out)
    else if (group.kind === 'has')
      walkSelectorList(group.text, group.offset, scope === AMBIGUOUS ? null : scope, out)
  }
  return scope
}

const problems = []
/** 放行表里真放行过的键。 */
const hit = new Set()
/** 放行表里名字其实已在解剖里的键。 */
const stale = new Set()
let files = 0
let checked = 0

for (const file of (await readdir(SKINS)).filter(name => name.endsWith('.css')).sort()) {
  const css = stripComments(await readFile(join(SKINS, file), 'utf8'))
  const lineOf = lineCounter(css)
  files++
  for (const { text, index } of selectorPreludes(css)) {
    const out = { parts: [], unreadable: [] }
    walkSelectorList(text, 0, null, out)
    for (const { offset, text: attr } of out.unreadable)
      problems.push(`${file}:${lineOf(index + offset)} 的 ${attr} 本脚本读不出来——data-scope / data-part 只许写全等、不带转义的取值，这一处没核`)
    for (const { part, scope, offset } of out.parts) {
      checked++
      const key = `${file}:${scope ?? '*'}:${part}`
      const known = scope === null ? allParts.has(part) : (anatomies.get(scope)?.has(part) ?? false)
      if (known) {
        if (key in EXEMPT && !stale.has(key)) {
          stale.add(key)
          problems.push(`${key} 登记在 EXEMPT 里，但 ${part} 已在 ${scope === null ? '解剖并集' : `${scope} 的解剖`}里——这条过期了，删掉`)
        }
        continue
      }
      if (key in EXEMPT) {
        hit.add(key)
        continue
      }
      const where = `${file}:${lineOf(index + offset)}`
      if (scope === null)
        problems.push(`${where} 的 [data-part='${part}'] 不在任何解剖里——这条规则永远选不中节点`)
      else if (!anatomies.has(scope))
        problems.push(`${where} 的 [data-scope='${scope}'] 没有对应解剖——检查 scope 名`)
      else
        problems.push(`${where} 的 [data-scope='${scope}'][data-part='${part}'] 不在 ${scope} 的解剖里——部件已退役或名字写错，这条规则永远选不中节点`)
    }
  }
}

// 过期反查：登记了却没有命中
for (const key of Object.keys(EXEMPT)) {
  if (!hit.has(key) && !stale.has(key))
    problems.push(`${key} 登记在 EXEMPT 里却没有命中任何规则——这条过期了，删掉`)
}

if (problems.length > 0) {
  console.error('[check-skin-parts] ✗ 皮肤选择器里的部件名与解剖对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-skin-parts] 通过：${files} 份皮肤 · ${checked} 处 [data-part] · ${anatomies.size} 份解剖 · 例外 ${Object.keys(EXEMPT).length} 条`)
