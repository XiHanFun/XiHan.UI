#!/usr/bin/env node
// 门禁：环压在实心面上的那几档，环色必须取 currentColor。
//
// 聚焦环往内收（--xh-ring-offset = 负一个环宽），外沿与元素边框外沿重合，
// 环内侧相邻的就是元素自己那块面。本份查的是内侧这一对：面与环。
// 灌法是在那一档的 :focus-visible 规则里写 --xh-_ring-color: currentColor，
// 公共层 focus.css 读 var(--xh-_ring-color, var(--xh-ring-focus))。
//
// 「面是不是实心」按颜色算，不按形态名猜：皮肤里的面顺着令牌链解到 oklch 字面量，
// 与同主题的 --xh-ring-focus 算 WCAG 对比度，低于 3:1（SC 1.4.11 非文本对比）才进判定面。
// 浅深两档 × 六族语气加「没写语气」共十四种组合逐一算，取最低的那个。
//
// 判定面之外的几类，交给浏览器态判据：
//   · :hover / :active 限定的面
//   · ::before / ::after 铺的底（环压的是元素盒）
//   · @media / @supports 里的面
//   · 解不出颜色的面（半透明、渐变、连接层内联进 style 的色值），逐条登在 opaque
//
// 三条判据配三张登记表，每张两侧都反查：
//   一 实心档要被一条 currentColor 规则覆盖；这一档显式写了 outline: none 的除外
//   二 每条 currentColor 规则要落在一个算出来的实心档上，落不上的登进 declared 写明凭什么
//   三 算出来还没灌的实心档登进 backlog，带理由与实测比值
// 登记项过期（补上了、面换了、部件退役了、比值变了）一律判红。
//
// `--update` 只把新算出来的条目落进表里，理由留空由人补，不删条目。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { declarations, lineCounter, stripComments } from './lib/css-declarations.mjs'

const SKINS = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'
const TOKENS = 'packages/design/tokens/tokens.css'
const TONE_FILE = 'packages/design/styles/css/tone.css'
const REGISTRY = 'tooling/scripts/focus-ring-surface-registry.json'

/** WCAG 2.2 SC 1.4.11 非文本对比阈值。 */
const MIN_RATIO = 3

/** 语气轴的六族，外加「没写 data-tone」那一档（此时 --xh-_tone 未声明，走 var() 兜底）。 */
const TONES = [null, 'brand', 'neutral', 'danger', 'success', 'warning', 'info']
const THEMES = ['light', 'dark']

/** 取不出颜色的值：这些不是面，跳过且不报。 */
const NOT_A_COLOR = /^(?:transparent|none|inherit|initial|unset|revert|revert-layer|currentColor)$/i

/** 环由别处画或干脆不画的写法：环没画在这个部件上，实心与否无关。 */
const RING_OFF = /^(?:none|0)$/

// —— 颜色：把令牌链解成 oklab，再算 WCAG 对比度 —— //

/** 把一段 CSS 拆成 { selector, decls }，只认 `--xh-*: value;` 声明。 */
function parseBlocks(src) {
  const blocks = []
  for (const m of stripComments(src).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, ' ')
    const decls = new Map()
    for (const d of m[2].matchAll(/(--xh-[a-z0-9_-]+):([^;]+);/g))
      decls.set(d[1], d[2].trim())
    if (decls.size)
      blocks.push({ selector, decls })
  }
  return blocks
}

/** 摘掉 @supports 块：现推那一档要 color(from …)，本脚本只解兜底那一档，两档的面同值。 */
function dropSupports(src) {
  let out = ''
  let i = 0
  while (i < src.length) {
    const at = src.indexOf('@supports', i)
    if (at === -1) {
      out += src.slice(i)
      break
    }
    out += src.slice(i, at)
    const open = src.indexOf('{', at)
    let depth = 0
    let j = open
    for (; j < src.length; j++) {
      if (src[j] === '{')
        depth++
      else if (src[j] === '}' && --depth === 0)
        break
    }
    i = j + 1
  }
  return out
}

/** tokens.css：根原语 + 浅色基线合成 light，根原语 + 深色块合成 dark。 */
function loadThemes(blocks) {
  const root = new Map()
  const light = new Map()
  const dark = new Map()
  for (const { selector, decls } of blocks) {
    const target = selector.startsWith(':where(:root)')
      ? root
      : selector === ':where([data-theme=\'light\'])'
        ? light
        : selector === ':where([data-theme=\'dark\'])' ? dark : null
    if (!target)
      continue
    for (const [k, v] of decls) target.set(k, v)
  }
  return { light: new Map([...root, ...light]), dark: new Map([...root, ...dark]) }
}

/** tone.css：缺省块 + 各族块 + 深色专属覆盖块。 */
function loadTones(blocks) {
  const base = new Map()
  const perTone = new Map(TONES.filter(Boolean).map(t => [t, new Map()]))
  const darkOnly = new Map(TONES.filter(Boolean).map(t => [t, new Map()]))
  for (const { selector, decls } of blocks) {
    if (selector === '[data-tone]') {
      for (const [k, v] of decls) base.set(k, v)
      continue
    }
    const m = selector.match(/^(:is\(\[data-theme='dark'\] \*, \[data-theme='dark'\]\))?\[data-tone='([a-z]+)'\]$/)
    if (!m)
      continue
    const target = (m[1] ? darkOnly : perTone).get(m[2])
    if (target) {
      for (const [k, v] of decls) target.set(k, v)
    }
  }
  return { base, perTone, darkOnly }
}

/** 按顶层逗号拆实参：`var(--a, var(--b))` 里层的逗号不拆。 */
function splitArgs(s) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(')
      depth++
    if (ch === ')')
      depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

/** 取 `fn(` 开头表达式里与之配对的括号内容。 */
function inner(expr, start) {
  let depth = 0
  for (let i = start; i < expr.length; i++) {
    if (expr[i] === '(')
      depth++
    if (expr[i] === ')' && --depth === 0)
      return expr.slice(start + 1, i)
  }
  throw new Error(`括号不配对：${expr}`)
}

/** 把一个值求成 oklab {L,a,b}；scope 是按优先级排好的若干 Map。 */
function evaluate(expr, scope, trail = []) {
  expr = expr.trim()
  if (expr.startsWith('var(')) {
    const [name, ...fallback] = splitArgs(inner(expr, 3))
    if (trail.includes(name))
      throw new Error(`令牌循环引用：${[...trail, name].join(' → ')}`)
    for (const map of scope) {
      if (map.has(name))
        return evaluate(map.get(name), scope, [...trail, name])
    }
    if (fallback.length)
      return evaluate(fallback.join(','), scope, trail)
    throw new Error(`令牌未定义：${name}`)
  }
  if (expr.startsWith('oklch(')) {
    const [L, C, H] = inner(expr, 5).split('/')[0].trim().split(/\s+/).map(Number)
    const h = (H || 0) * Math.PI / 180
    return { L, a: C * Math.cos(h), b: C * Math.sin(h) }
  }
  if (expr.startsWith('color-mix(')) {
    const [space, p1, p2] = splitArgs(inner(expr, 9))
    if (space.trim() !== 'in oklab')
      throw new Error(`只支持 color-mix(in oklab, …)：${expr}`)
    const parse = (part) => {
      const bits = part.trim().split(' ')
      const last = bits[bits.length - 1]
      const weight = /^[\d.]+%$/.test(last) ? Number.parseFloat(last) / 100 : null
      const color = weight === null ? bits.join(' ') : bits.slice(0, -1).join(' ')
      return { color: evaluate(color, scope, trail), weight }
    }
    const A = parse(p1)
    const B = parse(p2)
    if (A.weight === null && B.weight === null)
      A.weight = B.weight = 0.5
    else if (A.weight === null)
      A.weight = 1 - B.weight
    else if (B.weight === null)
      B.weight = 1 - A.weight
    const sum = A.weight + B.weight
    const wa = A.weight / sum
    const wb = B.weight / sum
    return {
      L: A.color.L * wa + B.color.L * wb,
      a: A.color.a * wa + B.color.a * wb,
      b: A.color.b * wa + B.color.b * wb,
    }
  }
  throw new Error(`不认识的颜色表达式：${expr}`)
}

/** oklab → 线性 sRGB，分量截断到 [0,1]。 */
function toLinear({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
  const clamp = x => Math.min(1, Math.max(0, x))
  return [
    clamp(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ]
}

/** WCAG 相对亮度。 */
function luminance(oklab) {
  const [r, g, b] = toLinear(oklab)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 对比度 (L1 + 0.05) / (L2 + 0.05)。 */
function contrast(x, y) {
  const lx = luminance(x)
  const ly = luminance(y)
  return (Math.max(lx, ly) + 0.05) / (Math.min(lx, ly) + 0.05)
}

const themes = loadThemes(parseBlocks(await readFile(TOKENS, 'utf8')))
const toneSrc = loadTones(parseBlocks(dropSupports(stripComments(await readFile(TONE_FILE, 'utf8')))))

/** (主题, 语气) → 求值用的作用域链。 */
function scopeFor(theme, tone) {
  if (!tone)
    return [themes[theme]]
  const merged = new Map([
    ...toneSrc.base,
    ...toneSrc.perTone.get(tone),
    ...(theme === 'dark' ? toneSrc.darkOnly.get(tone) : []),
  ])
  return [merged, themes[theme]]
}

/** 全部 (主题, 语气) 组合，连同各自的环色。 */
const CONTEXTS = []
for (const theme of THEMES) {
  const ring = evaluate('var(--xh-ring-focus)', scopeFor(theme, null))
  for (const tone of TONES)
    CONTEXTS.push({ theme, tone, ring, scope: scopeFor(theme, tone) })
}

/** 全局令牌：tokens.css 与 tone.css 里声明过的名字，皮肤里的私有槽不算。 */
const GLOBAL = new Set([
  ...themes.light.keys(),
  ...themes.dark.keys(),
  ...toneSrc.base.keys(),
  ...[...toneSrc.perTone.values()].flatMap(m => [...m.keys()]),
])

/**
 * 一个面表达式在全部 (主题, 语气) 下与环色的最低对比度。
 * 某一档解不出来就跳过那一档：`var(--xh-_tone)` 在没写 data-tone 的档里本就无效，
 * 那一档的面不是这个值。全部档都解不出来才返回 null，由调用方另行记账。
 */
function worstAgainstRing(expr) {
  let worst = null
  for (const ctx of CONTEXTS) {
    let color
    try {
      color = evaluate(expr, ctx.scope)
    }
    catch {
      continue
    }
    const ratio = contrast(color, ctx.ring)
    if (worst === null || ratio < worst.ratio)
      worst = { ratio, theme: ctx.theme, tone: ctx.tone }
  }
  return worst
}

// —— 选择器：拆成「主语 + 祖先」，两条选择器之间做覆盖判定 —— //

/** 按顶层分隔符拆分，括号与方括号里的不拆。 */
function splitTop(text, isSep) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(' || ch === '[') {
      depth++
    }
    else if (ch === ')' || ch === ']') {
      depth--
    }
    else if (depth === 0 && isSep(ch)) {
      out.push(text.slice(start, i))
      start = i + 1
    }
  }
  out.push(text.slice(start))
  return out.map(s => s.trim()).filter(Boolean)
}

/** 属性存在但没写取值时占位。 */
const ANY = '\u0000any'

/**
 * 拆一段复合选择器：属性条件、data-part 的取值集合、以及除聚焦伪类外剩下的伪类。
 * `:is(…)` 里的分支按属性逐键并集合并；`:not(…)` 只记不参与覆盖判定。
 */
function parseCompound(text) {
  const attrs = new Map()
  const pseudos = []
  const add = (key, value) => {
    if (!attrs.has(key))
      attrs.set(key, new Set())
    attrs.get(key).add(value)
  }
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '[') {
      const end = text.indexOf(']', i)
      const body = text.slice(i + 1, end)
      const m = /^([\w-]+)(?:\s*[~|^$*]?=\s*'([^']*)')?$/.exec(body)
      if (!m)
        return null
      add(m[1], m[2] ?? ANY)
      i = end + 1
      continue
    }
    if (ch === ':') {
      const name = /^::?([\w-]+)/.exec(text.slice(i))
      if (!name)
        return null
      let arg = null
      let next = i + name[0].length
      if (text[next] === '(') {
        arg = inner(text.slice(next), 0)
        next += arg.length + 2
      }
      if (name[1] === 'is' || name[1] === 'where') {
        const branches = splitTop(arg ?? '', c => c === ',').map(parseCompound)
        if (branches.includes(null))
          return null
        // 各分支逐键并集：只有分支之间纯粹在取值上不同时才合得起来
        // （`:is([data-part='root'],[data-part='positioner'])` 这种）。
        // 分支之间形态不同的（`:is(:hover,[data-highlighted])` 一支是伪类一支是属性）
        // 是一条选言，合不成一组条件，整支记成一个读不出来的伪类：
        // 拿它当档位时条件只会更宽，拿它当覆盖规则时一律判为不覆盖
        const keys = new Set(branches.flatMap(b => [...b.attrs.keys()]))
        const mergeable = branches.every(b => !b.pseudos.length) && [...keys].every(key => branches.every(b => b.attrs.has(key)))
        if (!mergeable) {
          pseudos.push(name[1])
        }
        else {
          for (const key of keys) {
            for (const b of branches) {
              for (const v of b.attrs.get(key)) add(key, v)
            }
          }
        }
      }
      else if (name[1] !== 'not' && !/^focus(?:-visible|-within)?$/.test(name[1])) {
        pseudos.push(name[1])
      }
      i = next
      continue
    }
    // 标签名、`*`、以及 `&` 这类主语占位一概忽略
    i++
  }
  return { attrs, pseudos }
}

/** 拆一条选择器分支：末尾那个复合是主语，前面的都是祖先（组合子一律按后代处理）。 */
function parseBranch(branch) {
  const compounds = splitTop(branch, ch => ch === ' ' || ch === '\t' || ch === '\n' || ch === '>' || ch === '+' || ch === '~')
    .map(parseCompound)
  if (compounds.includes(null) || !compounds.length)
    return null
  const subject = compounds[compounds.length - 1]
  const ancestors = compounds.slice(0, -1).filter(c => c.attrs.has('data-part') || c.attrs.has('data-scope'))
  return { subject, ancestors }
}

/** 一个复合的落点：scope 与 part 各取唯一值时才算认得出。 */
function anchorOf(compound) {
  const scope = compound.attrs.get('data-scope')
  const part = compound.attrs.get('data-part')
  return {
    scope: scope && scope.size === 1 ? [...scope][0] : null,
    parts: part ? new Set(part) : null,
  }
}

/** 覆盖方（规则）对被覆盖方（档位）的复合条件判定。 */
function compoundCovers(r, t) {
  const ra = anchorOf(r)
  const ta = anchorOf(t)
  if (ra.scope && ra.scope !== ta.scope)
    return false
  if (ra.parts && (!ta.parts || [...ta.parts].some(p => !ra.parts.has(p))))
    return false
  if (r.pseudos.length)
    return false
  for (const [key, vals] of r.attrs) {
    if (key === 'data-scope' || key === 'data-part')
      continue
    const have = t.attrs.get(key)
    if (!have)
      return false
    if (vals.has(ANY))
      continue
    for (const v of have) {
      if (!vals.has(v))
        return false
    }
  }
  return true
}

/** 规则 r 是否覆盖档位 t：主语条件要被满足，r 写出来的祖先在 t 里都得找得到。 */
function covers(r, t) {
  if (!compoundCovers(r.subject, t.subject))
    return false
  return r.ancestors.every((ra) => {
    const a = anchorOf(ra)
    return t.ancestors.some((ta) => {
      const b = anchorOf(ta)
      if (a.scope && a.scope !== b.scope)
        return false
      if (a.parts && (!b.parts || [...b.parts].some(p => !a.parts.has(p))))
        return false
      return compoundCovers(ra, ta)
    })
  })
}

/** 两个复合合成同一个元素上的条件；取值集合无交集即这一档不可能出现。 */
function mergeCompound(a, b) {
  const attrs = new Map()
  for (const [key, vals] of a.attrs) attrs.set(key, new Set(vals))
  for (const [key, vals] of b.attrs) {
    const have = attrs.get(key)
    if (!have) {
      attrs.set(key, new Set(vals))
      continue
    }
    if (have.has(ANY)) {
      attrs.set(key, new Set(vals))
      continue
    }
    if (vals.has(ANY))
      continue
    const both = new Set([...vals].filter(v => have.has(v)))
    if (!both.size)
      return null
    attrs.set(key, both)
  }
  return { attrs, pseudos: [...a.pseudos, ...b.pseudos] }
}

/** 祖先按写出来的样子去重：同一条槽赋值被两处引用时不该在档位里出现两遍。 */
function dedupe(compounds) {
  const seen = new Map()
  for (const c of compounds) seen.set(renderCompound(c), c)
  return [...seen.values()]
}

/** 把一条声明所在的选择器并进档位：同一个部件就合条件，别的部件就添成祖先要求。 */
function mergeInto(tier, sel) {
  const at = anchorOf(tier.subject)
  const bt = anchorOf(sel.subject)
  const ancestors = [...tier.ancestors, ...sel.ancestors]
  if (at.scope === bt.scope && at.parts && bt.parts && [...bt.parts].every(p => at.parts.has(p))) {
    const subject = mergeCompound(tier.subject, sel.subject)
    return subject && { subject, ancestors: dedupe(ancestors) }
  }
  return { subject: tier.subject, ancestors: dedupe([...ancestors, sel.subject]) }
}

/** 把一个复合写回可读的样子；属性排序固定，登记表的键才稳。 */
function renderCompound(c) {
  const bits = []
  for (const key of [...c.attrs.keys()].sort()) {
    const vals = [...c.attrs.get(key)].sort()
    bits.push(vals[0] === ANY ? `[${key}]` : vals.length === 1 ? `[${key}='${vals[0]}']` : `[${key}=:is(${vals.join(',')})]`)
  }
  return bits.join('')
}

/** 把档位写成可读、可当登记表键的选择器。 */
function render(tier) {
  return [...tier.ancestors.map(renderCompound), renderCompound(tier.subject)].join(' ')
}

// —— 可聚焦部件：判定面只收连接层真的会落焦的那些 —— //

async function collectFocusableParts() {
  const found = new Map()
  const blocked = new Map()
  const dirs = (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort()
  for (const comp of dirs) {
    let src
    try {
      src = await readFile(join(HEADLESS, comp, `${comp}.connect.ts`), 'utf8')
    }
    catch {
      continue
    }
    src = stripComments(src).replace(/(^|[^:])\/\/.*$/gm, '$1')
    const marks = [...src.matchAll(/get([A-Z][A-Za-z0-9]*)Props\s*[:=]/g)]
    for (let i = 0; i < marks.length; i++) {
      const body = src.slice(marks[i].index, i + 1 < marks.length ? marks[i + 1].index : src.length)
      const kind = body.match(/normalize\.([a-z]+)\s*\(/)?.[1]
      const focusable = kind === 'button' || kind === 'input' || kind === 'textarea' || kind === 'select' || /\btabindex'?\s*:|'tabindex'\s*:/.test(body)
      // 连接层自己把它挡在 Tab 序之外的（藏起来的原生控件、对读屏隐藏的把手）落不上焦点。
      // 这条负面证据压过皮肤那边的推断：皮肤给它写了 :focus-visible 也不算数
      const off = /\binert:\s*true/.test(body) || /'aria-hidden':\s*true/.test(body)
      for (const ref of body.matchAll(/parts(?:\.([\w-]+)|\[\s*'([^']+)'\s*\])\.attrs/g))
        add(off ? blocked : found, comp, ref[1] ?? ref[2], off || focusable)
    }
    // 部件名由调用处传进来的小工厂：`const toolButton = (part, …) => normalize.button({ ...parts[part].attrs`
    for (const factory of src.matchAll(/const\s+([\w$]+)\s*=\s*\(\s*([\w$]+)(?![\w$])[\s\S]*?=>\s*normalize\.([a-z]+)\(\{\s*\.\.\.parts\[\s*\2\s*\]\.attrs/g)) {
      if (!/^(?:button|input|textarea|select)$/.test(factory[3]))
        continue
      for (const call of src.matchAll(new RegExp(`\\b${factory[1]}\\(\\s*'([^']+)'`, 'g')))
        add(found, comp, call[1], true)
    }
  }
  return { found, blocked }

  function add(target, comp, part, take) {
    if (!take)
      return
    if (!target.has(comp))
      target.set(comp, new Set())
    target.get(comp).add(part)
  }
}

// —— 扫皮肤 —— //

const { found: focusableParts, blocked: blockedParts } = await collectFocusableParts()
const files = (await readdir(SKINS)).filter(f => f.endsWith('.css')).sort()

/** 皮肤里的私有/公开槽赋值：名字 → [{ file, sel, value }]。 */
const slots = new Map()
/** 面的消费点：写了 background 的规则。 */
const surfaces = []
/** currentColor 规则与 outline:none 规则。 */
const declared = []
const ringless = []
/** 选择器形态读不出来的规则，逐条报出来，免得静默漏掉。 */
const unreadable = []
/** 皮肤自己写了 :focus-visible 规则的部件：皮肤这么写就是断言这里落得上焦点。 */
const skinFocusable = new Map()
/** 面解不出颜色的消费点：键 → 出处。 */
const opaqueValues = new Map()

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(SKINS, file), 'utf8'))
  const lineAt = lineCounter(css)
  for (const decl of declarations(css)) {
    // @media / @supports 里的档不收；@layer 只是分层，照收
    if (decl.selectors.some(s => s.startsWith('@') && !s.startsWith('@layer')))
      continue
    const raw = decl.selectors.filter(s => !s.startsWith('@')).join(' ')
    if (!raw)
      continue
    const at = `${file}:${lineAt(decl.index)}`

    for (const branchText of splitTop(raw, ch => ch === ',')) {
      // 伪元素铺的底不是元素自己的面
      if (/::[\w-]+/.test(branchText))
        continue
      const branch = parseBranch(branchText)
      if (!branch) {
        // 面与环两类声明读不出选择器就等于这一档从判定面里消失，报出来而不是跳过
        if (/^(?:background|background-color|outline|--xh-_ring-color)$/.test(decl.prop))
          unreadable.push(`${at} ${branchText.trim()} —— 本脚本读不出这条选择器的形态，${decl.prop} 这一档没进判定面`)
        continue
      }
      if (/:focus-visible/.test(branchText) && !/:not\(\s*:focus-visible\s*\)/.test(branchText)) {
        const anchor = anchorOf(branch.subject)
        if (anchor.parts) {
          if (!skinFocusable.has(comp))
            skinFocusable.set(comp, new Set())
          for (const p of anchor.parts) skinFocusable.get(comp).add(p)
        }
      }
      if (decl.prop.startsWith('--')) {
        if (!slots.has(decl.prop))
          slots.set(decl.prop, [])
        slots.get(decl.prop).push({ file, comp, branch, value: decl.value, at })
      }
      if (decl.prop === 'background' || decl.prop === 'background-color')
        surfaces.push({ file, comp, branch, value: decl.value, at, hover: /:hover|:active/.test(branchText) })
      if (decl.prop === '--xh-_ring-color' && decl.value.trim() === 'currentColor')
        declared.push({ file, comp, branch, at, key: `${comp} ${render(branch)}` })
      // 整条 outline 自写成 currentColor 的，同样是「环取面的前景色」
      if (decl.prop === 'outline' && /\bcurrentColor\b/.test(decl.value))
        declared.push({ file, comp, branch, at, key: `${comp} ${render(branch)}`, whole: true })
      // 只认真的把键盘焦点环关掉的那种：`:focus:not(:focus-visible)` 关的是指针落焦那一路，
      // 键盘环照画，把它当成关环会把整档从判定面里抹掉
      if (decl.prop === 'outline' && RING_OFF.test(decl.value.trim())
        && /:focus-visible|\[data-focus\]/.test(branchText) && !/:not\(\s*:focus-visible\s*\)/.test(branchText)) {
        ringless.push({ file, comp, branch })
      }
    }
  }
}

/**
 * 把一个面的取值摊成若干「终值 + 经过的槽赋值」。
 * var(--a, b) 两支都要摊：--a 在皮肤里另有赋值时走那一支，没赋值时走 b。
 *
 * 私有槽只在本份皮肤里连线：`--xh-_bg` 这类名字好几份皮肤各用各的，跨文件连起来会拼出
 * 「按钮嵌在开关根里」这种 DOM 里不存在的档。跨组件流下去的是使用者令牌
 * （`--xh-button-bg` 由 button-group 灌），那一支照连。
 */
function expand(value, file, trail = [], depth = 0) {
  const expr = value.trim()
  if (depth > 8)
    return []
  const m = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(expr)
  if (!m) {
    if (NOT_A_COLOR.test(expr))
      return []
    return [{ expr, trail }]
  }
  const [, name, fallback] = m
  // 全局令牌就地求值：连同 var() 自带的兜底一起交给求值器，没写语气那一档才取得到兜底
  if (GLOBAL.has(name))
    return [{ expr, trail }]
  const out = []
  const private_ = name.startsWith('--xh-_')
  for (const assign of slots.get(name) ?? []) {
    if (private_ && assign.file !== file)
      continue
    if (trail.some(t => t.name === name))
      continue
    out.push(...expand(assign.value, assign.file, [...trail, { name, ...assign }], depth + 1))
  }
  if (fallback != null)
    out.push(...expand(fallback, file, trail, depth + 1))
  return out
}

/** 算出来的实心档：键 → { comp, part, sel, ratio, theme, tone, expr, at } */
const solidTiers = new Map()

for (const surface of surfaces) {
  if (surface.hover)
    continue
  const off = blockedParts.get(surface.comp) ?? new Set()
  const parts = new Set(
    [...focusableParts.get(surface.comp) ?? [], ...skinFocusable.get(surface.comp) ?? []].filter(p => !off.has(p)),
  )
  const anchor = anchorOf(surface.branch.subject)
  if (!anchor.parts || [...anchor.parts].some(p => !parts.has(p)))
    continue

  for (const outcome of expand(surface.value, surface.file)) {
    const worst = worstAgainstRing(outcome.expr)
    if (worst === null) {
      // 键里不带行号：面没改过就不该因为上面插了几行而重新走一遍登记
      for (const part of anchor.parts)
        opaqueValues.set(`${surface.comp} [${part}] ${outcome.expr}`, surface.at)
      continue
    }
    if (worst.ratio >= MIN_RATIO)
      continue
    let tier = surface.branch
    for (const step of outcome.trail) {
      tier = mergeInto(tier, step.branch)
      if (!tier)
        break
    }
    if (!tier)
      continue
    const key = `${surface.comp} ${render(tier)}`
    const prev = solidTiers.get(key)
    if (prev && prev.ratio <= worst.ratio)
      continue
    solidTiers.set(key, {
      comp: surface.comp,
      tier,
      ratio: worst.ratio,
      theme: worst.theme,
      tone: worst.tone,
      expr: outcome.expr,
      at: surface.at,
    })
  }
}

// 环压根没画在这一档上的，实心与否与本门禁无关
for (const key of [...solidTiers.keys()]) {
  const tier = solidTiers.get(key)
  if (ringless.some(r => r.comp === tier.comp && covers(r.branch, tier.tier)))
    solidTiers.delete(key)
}

// —— 登记表 —— //

let registry = { backlog: {}, declared: {}, opaque: {} }
try {
  registry = { ...registry, ...JSON.parse(await readFile(REGISTRY, 'utf8')) }
}
catch {
  if (!process.argv.includes('--update')) {
    console.error(`[check-focus-ring-surface] ✗ 读不到 ${REGISTRY}——先跑 pnpm focus-ring-surface:update 落表`)
    process.exit(1)
  }
}

/** 每条 currentColor 规则覆盖到的实心档。 */
const declaredHits = new Map()
for (const rule of declared) {
  const hit = [...solidTiers.values()].filter(t => t.comp === rule.comp && covers(rule.branch, t.tier))
  declaredHits.set(rule.key, hit)
}

/** 没被任何 currentColor 规则覆盖的实心档。 */
const uncovered = []
for (const [key, tier] of solidTiers) {
  if (!declared.some(r => r.comp === tier.comp && covers(r.branch, tier.tier)))
    uncovered.push({ key, ...tier })
}

const round = n => Math.round(n * 100) / 100

if (process.argv.includes('--update')) {
  const backlog = { ...registry.backlog }
  for (const tier of uncovered)
    backlog[tier.key] = { ratio: round(tier.ratio), why: registry.backlog[tier.key]?.why ?? '' }
  const declaredTable = { ...registry.declared }
  for (const rule of declared) {
    if (!declaredHits.get(rule.key).length)
      declaredTable[rule.key] = registry.declared[rule.key] ?? ''
  }
  const opaqueTable = { ...registry.opaque }
  for (const key of opaqueValues.keys())
    opaqueTable[key] = registry.opaque[key] ?? ''
  const sorted = obj => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)))
  const out = { backlog: sorted(backlog), declared: sorted(declaredTable), opaque: sorted(opaqueTable) }
  await writeFile(REGISTRY, `${JSON.stringify(out, null, 2)}\n`, 'utf8')
  console.log(
    `[focus-ring-surface:update] 已写入 ${REGISTRY}：`
    + `未灌的实心档 ${Object.keys(backlog).length} 条、算不出实心档的 currentColor 规则 ${Object.keys(declaredTable).length} 条、`
    + `解不出颜色的面 ${Object.keys(opaqueTable).length} 条——理由留空的条目要人补上，门禁会拦`,
  )
  process.exit(0)
}

const problems = []

// 判据一 · 三：实心档要么灌了 currentColor，要么登记在 backlog 里并写明理由
for (const tier of uncovered) {
  const entry = registry.backlog[tier.key]
  const measured = `${round(tier.ratio)}:1（${tier.theme} · ${tier.tone ?? '无语气'}，面 ${tier.expr}）`
  if (!entry) {
    problems.push(
      `${tier.at} ${tier.key} 的面压着环最低只有 ${measured}，不到 ${MIN_RATIO}:1，`
      + `这一档没有一条 :focus-visible 规则把 --xh-_ring-color 灌成 currentColor——`
      + `补一条覆盖得住这一档的规则，或登进 backlog 并写一句理由`,
    )
    continue
  }
  if (!entry.why)
    problems.push(`${tier.key} 登在 backlog 里没写理由——补一句「这一档现在为什么还吃默认环」`)
  if (entry.ratio !== round(tier.ratio))
    problems.push(`${tier.key} 在 backlog 里登记 ${entry.ratio}:1，算出来最低 ${measured}——面的颜色改过了，跑 pnpm focus-ring-surface:update 重登`)
}

for (const [key, entry] of Object.entries(registry.backlog)) {
  if (!uncovered.some(t => t.key === key)) {
    problems.push(
      `${key} 登在 backlog 里，现在已经不是「未灌 currentColor 的实心档」了`
      + `——补上了、面换了、或者部件退役了，把这条一起删`,
    )
  }
  if (entry.why === undefined)
    problems.push(`${key} 在 backlog 里缺 why 字段`)
}

// 判据二：反查每条 currentColor 规则
const declaredSeen = new Set()
for (const rule of declared) {
  if (declaredHits.get(rule.key).length) {
    if (rule.key in registry.declared)
      problems.push(`${rule.at} ${rule.key} 已经能算出实心档了——declared 里那条过期，删掉`)
    continue
  }
  if (!(rule.key in registry.declared)) {
    problems.push(
      `${rule.at} ${rule.key} 灌了 currentColor，本脚本却算不出它压着的面低于 ${MIN_RATIO}:1——`
      + `要么这一档的面本来就够（那条规则多余），要么判定面漏了这种面，`
      + `登进 declared 并写明凭什么`,
    )
    continue
  }
  declaredSeen.add(rule.key)
  if (!registry.declared[rule.key])
    problems.push(`${rule.key} 登在 declared 里没写理由——补一句「这一档的面为什么算不出来」`)
}

for (const key of Object.keys(registry.declared)) {
  if (!declaredSeen.has(key))
    problems.push(`${key} 登在 declared 里，皮肤里却没有这条 currentColor 规则了——名单过期，删掉这条`)
}

// 面解不出颜色的，同样逐条登记：不登记就等于这一档从此没人再想起来
for (const [key, at] of opaqueValues) {
  if (!(key in registry.opaque)) {
    problems.push(
      `${at} ${key} —— 这块面本脚本解不出颜色（半透明、渐变、或使用者传进来的色值），`
      + `判不了实心与否；登进 opaque 并写明这一档的环由什么保证`,
    )
    continue
  }
  if (!registry.opaque[key])
    problems.push(`${key} 登在 opaque 里没写理由——补一句「这块面为什么算不出来、这一档的环靠什么」`)
}

for (const key of Object.keys(registry.opaque)) {
  if (!opaqueValues.has(key))
    problems.push(`${key} 登在 opaque 里，皮肤里已经没有这块面了——名单过期，删掉这条`)
}

for (const line of unreadable)
  problems.push(line)

if (problems.length) {
  console.error('[check-focus-ring-surface] ✗ 实心面上的聚焦环对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const covered = solidTiers.size - uncovered.length
console.log(
  `[check-focus-ring-surface] 通过：${files.length} 份皮肤里算出 ${solidTiers.size} 档面压环不到 ${MIN_RATIO}:1，`
  + `${covered} 档灌了 currentColor、${uncovered.length} 档登在 backlog；`
  + `${declared.length} 条 currentColor 选择器分支逐条反查（${Object.keys(registry.declared).length} 条算不出实心档、已登记）；`
  + `另有 ${opaqueValues.size} 块面解不出颜色，逐条登在 opaque`,
)
