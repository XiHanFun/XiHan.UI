#!/usr/bin/env node
// 门禁：伪元素上用底色填出来的字形，在高对比档（forced-colors: active）里必须另有系统色。
//
// 皮肤的兜底字形（关闭钮的叉、翻页箭头、展开箭头、选中对号、单选圆点……）是伪元素上的一块底色：
// 用 mask 挖出形状，或者干脆就是一块 currentColor 的实心点。这一档里系统把 background-color
// 统一换成 Canvas，字形与它所在的面同色，整块消失——按钮还在、可访问名还在，屏幕上却是一个空按钮。
// 伪元素退出强制换色（forced-color-adjust: none）后读 currentColor 也不行：读到的是被系统换掉之前的作者色。
// 只有「退出强制换色 + 直接写系统色关键字」可靠，取哪一个按字形身下那块面在这一档里的实际底色定
// （按钮面 ButtonText、页面与字段 CanvasText、涂成 Highlight 的面 HighlightText、禁用 GrayText），
// 那一层由浏览器用例 forced-colors-glyph.spec.ts 逐个比对；这里管静态的那一半：
//
//   ① 逐条字形规则——伪元素上、底色取 currentColor 或令牌（不是系统色），并且带 mask 或底色就是 currentColor 的，
//      同一份皮肤的 forced-colors 块里要有一条规则接住它：选到同一个伪元素（主体复合体的属性是字形那条的子集）、
//      特指度不低于它、排在它之后（同特指度靠源序取胜），并且同时写了 forced-color-adjust: none
//      与一个系统色关键字的底色。状态分支（悬停、按下、禁用）另写的规则不强求，由浏览器用例核。
//   ② 补救块里退出强制换色的伪元素，底色只许系统色关键字——写 currentColor 或 var() 等于把作者色原样放回来。
//
// 只填透明度、不取底色的 mask（跑马灯与滚动区的渐隐带、进度条的分段缝）不是字形：
// 这一档不改 mask，渐隐照旧生效、内容本身由系统色画，不在扫描面里。
// EXEMPT 留给「确实用底色填了形状、这一档里却该让它消失」的规则，键写成「皮肤:选择器」、值写清理由；
// 登了却没被用来放行过即判过期。
import process from 'node:process'
import { FAMILY_DIR, readSkins, SKINS_DIR, splitCompounds, splitSelectors } from '../lib/skin-rules.mjs'

/** 只有这九个关键字在这一档里拿得到系统当前主题的对应角色。 */
const SYSTEM_COLORS = new Set([
  'Canvas',
  'CanvasText',
  'ButtonFace',
  'ButtonText',
  'ButtonBorder',
  'Highlight',
  'HighlightText',
  'LinkText',
  'GrayText',
])

/** 放行：键「皮肤:选择器」，值写清为什么这一档里该让它消失。 */
const EXEMPT = {}

const FORCED_ACTIVE = /forced-colors\s*:\s*active/
const FORCED_ANY = /forced-colors\s*:/
const MASK_PROP = /^(?:-webkit-)?mask(?:-image)?$/
const FILL_PROP = /^background(?:-color)?$/

/** 规则里某个属性最后一次的取值；没写返回 null。 */
function valueOf(rule, test) {
  const hits = rule.decls.filter(decl => test.test(decl.prop))
  return hits.at(-1)?.value ?? null
}

/** 底色是不是一块「填色」：图像、none / transparent 这类不是，系统色已经是这一档的取值，也不算。 */
function isFill(value) {
  if (value == null || /gradient\(|url\(/i.test(value))
    return false
  const bare = value.trim()
  return !/^(?:none|transparent|inherit|initial|unset|revert)$/i.test(bare) && !SYSTEM_COLORS.has(bare)
}

/** 把复合体里的 :is() / :where() 摊成各自的分支，:not() / :has() 是条件，摘掉不计。 */
function expandCompound(compound) {
  const match = /:(is|where|not|has)\(/.exec(compound)
  if (!match)
    return [compound]
  const open = match.index + match[0].length - 1
  let depth = 0
  let close = open
  for (; close < compound.length; close++) {
    if (compound[close] === '(')
      depth++
    else if (compound[close] === ')' && --depth === 0)
      break
  }
  const head = compound.slice(0, match.index)
  const tail = compound.slice(close + 1)
  if (match[1] === 'not' || match[1] === 'has')
    return expandCompound(head + tail)
  const inner = splitSelectors(compound.slice(open + 1, close))
  // 参数里带组合符的（`:is(a b)`）不是同一个节点上的条件，摘掉不计
  return inner.flatMap(alt => (splitCompounds(alt).length > 1 ? expandCompound(head + tail) : expandCompound(head + alt + tail)))
}

/** 主体复合体上的属性表：名字 → 取值（只写了存在性的记 null）。 */
function attrsOf(compound) {
  const map = new Map()
  for (const m of compound.matchAll(/\[([\w-]+)(?:=(['"]?)([^'"\]]*)\2)?\]/g))
    map.set(m[1], m[3] ?? null)
  return map
}

/** 选择器分支 → [{ attrs, pseudo }]：主体复合体按 :is() / :where() 摊开后逐个给出。 */
function subjectsOf(branch) {
  const subject = splitCompounds(branch).at(-1) ?? ''
  const pseudo = /::(before|after)$/.exec(subject)?.[1] ?? null
  return expandCompound(subject).map(alt => ({ attrs: attrsOf(alt), pseudo }))
}

/** S 的属性是不是 G 的子集：S 只写存在性的，G 上同名属性取什么值都算。 */
function subset(small, big) {
  for (const [name, value] of small) {
    if (!big.has(name))
      return false
    if (value != null && big.get(name) !== value)
      return false
  }
  return true
}

/** 选择器特指度 [a, b, c]；:is / :not / :has 取参数里最高的一支，:where 记 0。 */
function specificity(selector) {
  let a = 0
  let b = 0
  let c = 0
  let i = 0
  const add = ([x, y, z]) => {
    a += x
    b += y
    c += z
  }
  while (i < selector.length) {
    const ch = selector[i]
    if (ch === '[') {
      b++
      i = selector.indexOf(']', i) + 1
    }
    else if (ch === '#') {
      a++
      i = skipName(selector, i + 1)
    }
    else if (ch === '.') {
      b++
      i = skipName(selector, i + 1)
    }
    else if (selector.startsWith('::', i)) {
      c++
      i = skipName(selector, i + 2)
    }
    else if (ch === ':') {
      const end = skipName(selector, i + 1)
      const name = selector.slice(i + 1, end)
      if (selector[end] === '(') {
        const close = matching(selector, end)
        const args = selector.slice(end + 1, close)
        if (/^(?:is|not|has|matches)$/.test(name))
          add(max(splitSelectors(args).map(specificity)))
        else if (name !== 'where')
          b++
        i = close + 1
      }
      else {
        b++
        i = end
      }
    }
    else if (/[a-z*]/i.test(ch)) {
      const end = skipName(selector, i)
      if (ch !== '*')
        c++
      i = end === i ? i + 1 : end
    }
    else {
      i++
    }
  }
  return [a, b, c]
}

function skipName(text, from) {
  let i = from
  while (i < text.length && /[\w-]/.test(text[i]))
    i++
  return i
}

function matching(text, open) {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(')
      depth++
    else if (text[i] === ')' && --depth === 0)
      return i
  }
  return text.length
}

function max(list) {
  return list.reduce((best, s) => (compare(s, best) > 0 ? s : best), [0, 0, 0])
}

function compare(x, y) {
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

const problems = []
const exemptSeen = new Set()
let glyphCount = 0
let fileCount = 0

for (const dir of [SKINS_DIR, FAMILY_DIR]) {
  for (const skin of await readSkins(dir)) {
    const forced = skin.rules.filter(rule => rule.stack.some(s => FORCED_ACTIVE.test(s)))
    const normal = skin.rules.filter(rule => !rule.stack.some(s => FORCED_ANY.test(s)))
    const label = `${dir === FAMILY_DIR ? 'family/' : ''}${skin.file}`

    // —— 判据②：补救块里退出强制换色的伪元素，底色只许系统色 ——
    for (const rule of forced) {
      if (!/::(?:before|after)/.test(rule.selector) || valueOf(rule, /^forced-color-adjust$/) !== 'none')
        continue
      const fill = valueOf(rule, FILL_PROP)
      if (fill != null && isFill(fill)) {
        problems.push(
          `${label}:${rule.line}  ${rule.selector.slice(0, 96)}\n`
          + `      退出了强制换色，底色却写 ${fill}——这一档里伪元素读到的是被系统换掉之前的作者色，改写系统色关键字`,
        )
      }
    }

    /** 能接住字形的补救规则：退出强制换色，底色是系统色。 */
    const catchers = forced
      .filter(rule => valueOf(rule, /^forced-color-adjust$/) === 'none' && SYSTEM_COLORS.has(valueOf(rule, FILL_PROP)?.trim() ?? ''))
      .flatMap(rule => splitSelectors(rule.selector).map(branch => ({ rule, branch, subjects: subjectsOf(branch), spec: specificity(branch) })))

    let fileHasGlyph = false
    // —— 判据①：逐条字形规则要有补救规则接住 ——
    for (const rule of normal) {
      const fill = valueOf(rule, FILL_PROP)
      if (!isFill(fill))
        continue
      const mask = valueOf(rule, MASK_PROP)
      const masked = mask != null && mask.trim() !== 'none'
      if (!masked && !/^currentColor$/i.test(fill.trim()))
        continue
      for (const branch of splitSelectors(rule.selector)) {
        const subjects = subjectsOf(branch)
        if (subjects[0].pseudo == null)
          continue
        glyphCount++
        fileHasGlyph = true
        const key = `${label}:${branch}`
        if (key in EXEMPT) {
          exemptSeen.add(key)
          continue
        }
        const spec = specificity(branch)
        const caught = subjects.every(glyph => catchers.some(catcher =>
          catcher.rule.line > rule.line
          && compare(catcher.spec, spec) >= 0
          && catcher.subjects.some(s => s.pseudo === glyph.pseudo && subset(s.attrs, glyph.attrs)),
        ))
        if (!caught) {
          problems.push(
            `${label}:${rule.line}  ${branch.slice(0, 110)}\n`
            + `      底色 ${fill}${masked ? ' + mask' : ''} 画的字形在高对比档里会被换成 Canvas 而消失。在本皮肤的 @media (forced-colors: active) 块里`
            + '补一条选到它的规则（特指度不低于它、排在它之后）：forced-color-adjust: none + 系统色关键字的底色',
          )
        }
      }
    }
    if (fileHasGlyph)
      fileCount++
  }
}

for (const key of Object.keys(EXEMPT)) {
  if (!exemptSeen.has(key))
    problems.push(`EXEMPT 里登着 ${key}，却没有一条字形规则是靠它放行的——名单过期了，删掉这一条`)
}

if (problems.length > 0) {
  console.error('[check-forced-glyphs] ✗ 高对比档里会消失的字形：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-forced-glyphs] 通过：${fileCount} 份皮肤里 ${glyphCount} 条字形分支都有系统色补救（登记放行 ${exemptSeen.size} 条）`)
