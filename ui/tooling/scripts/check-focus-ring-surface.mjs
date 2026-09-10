#!/usr/bin/env node
// 门禁：环压在实心面上的那几档，环色必须换掉（灌）；非实心面一律吃库自己的环。
//
// 聚焦环往内收（--xh-ring-offset = 负一个环宽），外沿与元素边框外沿重合，
// 环内侧相邻的就是元素自己那块面。本份查的是内侧这一对：面与环。
// 公共层 focus.css 画 outline: var(--xh-ring-width) solid var(--xh-_ring-color, var(--xh-ring-focus))，
// 皮肤在那一档的 :focus-visible 规则里给 --xh-_ring-color 赋值（多数写 currentColor，取面配对的前景色）。
//
// 「灌」按求值判，不按字面量判：一条声明改了环色——给 --xh-_ring-color 或 outline-color 赋值，
// 或在键盘聚焦规则里写 outline 简写——它的值顺着皮肤里的槽摊开、再顺着令牌链解到 oklch，
// 在任一 (主题, 语气) 下与库自己的两支环（--xh-ring-focus、--xh-ring-invalid）都不相等，就是灌；
// 解不出来的（currentColor、使用者传进来的色值、没兜底的使用者令牌）同样算灌。求值后等于库环的
// （显式写回 var(--xh-ring-focus)、校验失败换 --xh-ring-invalid）不算。
// --xh-_ring-color 与 outline-color 写在哪条规则里都算（它们只喂环这一处）；outline 简写只认
// 键盘聚焦规则里的那些：:focus-visible、[data-focus]，以及裸 :focus（它包含键盘落焦；
// `:focus:not(:focus-visible)` 关的是指针那一路，不算）。选中态、高对比档的描边式 outline 不是聚焦环。
// 普通属性名不分大小写，先归成小写再认；自定义属性名分大小写，照原样。
//
// 库环两支令牌与它们在 tokens.css 里顺着解到底经过的每个名字，皮肤里一律不许赋值：
// 在子树上改了它们，库环在那棵子树上就不再是库环，本脚本按 tokens.css 求的值也就失真。
//
// 「面是不是实心」按颜色算，不按形态名猜：皮肤里的面顺着令牌链解到 oklch 字面量，
// 与同主题的 --xh-ring-focus 算 WCAG 对比度，低于 3:1（SC 1.4.11 非文本对比）才是实心档。
// 浅深两档 × 六族语气加「没写语气」共十四种组合逐一算，取最低的那个。
// 过了线的面与透空的面（transparent / none，环内侧透出祖先那一层）一起收进非实心档。
// 半透明的面（oklch 带 alpha、color-mix 兑 transparent）内侧的真色是它与底下那层叠出来的，
// 底下那层是谁静态不知道，逐条登在 opaque；报错信息附一句叠在画布上的估值。
//
// 条件块：@supports 按块内条件成立处理；@media 只有写成 CONDITIONAL_MEDIA 里那几种真实媒体条件
// （纸面、高对比、减动效、粗指针、断点）的才是条件块，块里的档不收；写成别的样子的
// （screen / all / 逗号并列 / not、以及任何 @container）静态判不出它什么时候不成立，一律按成立处理，
// 面与环色都照收。@keyframes 里的不是规则，不算。
//
// 规则罩没罩到某一档，按选择器判：规则写了、档位没写的属性，存在式（[data-state]）一律算罩得到——
// DOM 上多半有这个属性；写了取值的（[data-state='on']）看有没有一档兄弟档把它认领了：
// 兄弟档是这一档再加上那几个条件得出来的档（有自己的面），有就归兄弟档，没有就仍罩这一档。
//
// 判定面之外的几类，交给浏览器态判据：
//   · :hover / :active 限定的面
//   · ::before / ::after 铺的底（环压的是元素盒）
//   · 真实媒体条件里的面
//   · 解不出颜色的面（半透明、渐变、连接层内联进 style 的色值），逐条登在 opaque
//   · 环由 :focus-within 画在外框上的部件，环色走那份皮肤自己的槽
//
// 五条判据配五张登记表，每张两侧都反查：
//   一 实心档要被一条灌环色的规则覆盖，或被一条登了记的关环规则关掉环
//   二 灌环色的规则不许罩到非实心档；一档实心档都罩不上的登进 declared 写明凭什么
//   三 算出来还没灌的实心档登进 backlog，带理由与实测比值
//   四 :focus-visible 里把环关掉的规则（outline: none、outline-width: 0、outline-style: none）
//      逐条登进 ringless，写明环由谁画或为什么不画
//   五 画了不到 3:1 的实心面、连接层没给焦点、皮肤也没写 :focus-visible 的部件登进 unfocusable，
//      写明这块面不接焦点；接得上焦点的改成接 tabindex 或补 :focus-visible
// 登记项过期（补上了、面换了、部件退役了、比值变了）一律判红。
// 另有一个只读分区 solid：算出来的全部实心档，`--update` 整份重写，与算出来的对不上判红。
// 环色写成透明（--xh-_ring-color / outline-color 解出来 alpha 为 0）的聚焦规则没有登记表，直接判红：
// 失效档只豁免对比度，环不许消失。
//
// `--update` 只把新算出来的条目落进表里，理由留空由人补，不删条目。
// `--list` 把实心档、非实心档、不接焦点的面、关环规则、灌环色的规则、环色透明的规则、解不出的面与没进判定面的分支打成 JSON。
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

/** 透出祖先的写法：元素自己没铺面，环内侧是它底下那一层。 */
const SEE_THROUGH = /^(?:transparent|none|inherit|initial|unset|revert|revert-layer)$/i

/** 零长度：0 或带任意单位的 0。 */
const ZERO = /^0[a-z%]*$/i

/** 这条声明把环关了：outline 简写里带 none 或零宽，outline-width 为零，outline-style 为 none。 */
function turnsRingOff(prop, value) {
  const v = value.trim()
  if (prop === 'outline')
    return splitTop(v, ch => ch === ' ' || ch === '\t' || ch === '\n').some(tok => /^none$/i.test(tok) || ZERO.test(tok))
  if (prop === 'outline-width')
    return ZERO.test(v)
  if (prop === 'outline-style')
    return /^none$/i.test(v)
  return false
}

/** 这条声明里可能是环色的那几节：环色槽与 outline-color 整条算，outline 简写按顶层空白拆开逐节算。 */
function ringColorsOf(prop, value) {
  const v = value.trim()
  if (prop === '--xh-_ring-color' || prop === 'outline-color')
    return [v]
  if (prop === 'outline')
    return splitTop(v, ch => ch === ' ' || ch === '\t' || ch === '\n')
  return []
}

/** 改环色的三条声明。 */
const RING_PROP = /^(?:--xh-_ring-color|outline-color|outline)$/

/** 库自己的两支环：默认环与校验失败环。环色求值后落在这两支之外才算灌。 */
const LIBRARY_RINGS = ['--xh-ring-focus', '--xh-ring-invalid']

/**
 * 键盘聚焦规则：:focus-visible、[data-focus]、裸 :focus。
 * `:focus:not(:focus-visible)` 关的是指针落焦那一路，键盘环照画，不算。
 */
function isKeyboardFocus(selector) {
  return /:focus(?:-visible)?(?![\w-])|\[data-focus\]/.test(selector) && !/:not\(\s*:focus-visible\s*\)/.test(selector)
}

/**
 * 真实媒体条件：只在纸面、系统高对比、减动效偏好、粗指针设备或某个断点之上成立。
 * 只认这几种写法；写成别的样子的条件块静态判不出它什么时候不成立，按成立处理。
 */
const CONDITIONAL_MEDIA = [
  /^@media print$/,
  /^@media \(forced-colors: active\)$/,
  /^@media \(prefers-reduced-motion: reduce\)$/,
  /^@media \(prefers-contrast: more\)$/,
  /^@media \(pointer: coarse\)$/,
  /^@media \(min-width: \d+px\)$/,
]

/** 这条规则的选择器栈：是不是 @keyframes 里的、是不是落在真实媒体条件里。 */
function classifyStack(selectors) {
  let keyframes = false
  let conditional = false
  for (const s of selectors) {
    if (!s.startsWith('@'))
      continue
    const prelude = s.replace(/\s+/g, ' ').trim()
    if (prelude.startsWith('@keyframes'))
      keyframes = true
    else if (CONDITIONAL_MEDIA.some(re => re.test(prelude)))
      conditional = true
  }
  return { keyframes, conditional }
}

/** outline 简写里的线型关键字与粗细关键字，不是颜色。 */
const OUTLINE_KEYWORD = /^(?:none|auto|hidden|solid|dashed|dotted|double|groove|ridge|inset|outset|thin|medium|thick|invert)$/i

/** 长度：数字带单位，或 calc()。 */
const LENGTH = /^(?:-?(?:\d+(?:\.\d*)?|\.\d+)[a-z%]*|calc\(.*\))$/i

/** 面的声明。 */
const FACE_PROP = /^(?:background|background-color)$/

// —— 颜色：把令牌链解成带 alpha 的 oklab，再算 WCAG 对比度 —— //

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

/** oklch 斜杠后的 alpha：没写为 1，百分数按百分比。 */
function parseAlpha(text) {
  if (text === undefined)
    return 1
  const t = text.trim()
  return t.endsWith('%') ? Number.parseFloat(t) / 100 : Number(t)
}

/** 把一个值求成带 alpha 的 oklab {L,a,b,alpha}；scope 是按优先级排好的若干 Map。 */
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
  if (/^transparent$/i.test(expr))
    return { L: 0, a: 0, b: 0, alpha: 0 }
  if (expr.startsWith('oklch(')) {
    const [body, alphaText] = inner(expr, 5).split('/')
    const [L, C, H] = body.trim().split(/\s+/).map(Number)
    const h = (H || 0) * Math.PI / 180
    return { L, a: C * Math.cos(h), b: C * Math.sin(h), alpha: parseAlpha(alphaText) }
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
    // 分量按预乘 alpha 插值，权重之和不足 100% 时 alpha 按之和打折
    const alpha = (A.color.alpha * wa + B.color.alpha * wb) * Math.min(1, sum)
    if (alpha === 0)
      return { L: 0, a: 0, b: 0, alpha: 0 }
    const premul = A.color.alpha * wa + B.color.alpha * wb
    const mix = k => (A.color[k] * A.color.alpha * wa + B.color[k] * B.color.alpha * wb) / premul
    return { L: mix('L'), a: mix('a'), b: mix('b'), alpha }
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

/** 线性 sRGB 分量 ↔ 伽马编码分量。 */
const encode = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const decode = s => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4)

/** 不透明的 oklab → 伽马 sRGB 三分量。 */
function srgbOf(oklab) {
  return toLinear(oklab).map(encode)
}

/** 带 alpha 的色按 source-over 叠在一块不透明的底上，在伽马 sRGB 里叠。 */
function over(top, ground) {
  const t = srgbOf(top)
  const g = srgbOf(ground)
  return t.map((v, i) => v * top.alpha + g[i] * (1 - top.alpha))
}

/** WCAG 相对亮度，入参是伽马 sRGB。 */
function luminance(rgb) {
  const [r, g, b] = rgb.map(decode)
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

/** 库环两支令牌与它们在 tokens.css 里顺着解到底经过的每个名字：皮肤里给这些名字赋值就是在子树上换掉库环。 */
const RING_CHAIN = new Set()
{
  const queue = [...LIBRARY_RINGS]
  while (queue.length) {
    const name = queue.pop()
    if (RING_CHAIN.has(name))
      continue
    RING_CHAIN.add(name)
    for (const map of [themes.light, themes.dark]) {
      for (const ref of (map.get(name) ?? '').matchAll(/var\(\s*(--[\w-]+)/g))
        queue.push(ref[1])
    }
  }
}

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

/** 全部 (主题, 语气) 组合，连同各自的默认环色、库环（oklab）与画布色。 */
const CONTEXTS = []
for (const theme of THEMES) {
  const ring = srgbOf(evaluate('var(--xh-ring-focus)', scopeFor(theme, null)))
  const rings = LIBRARY_RINGS.map(name => evaluate(`var(${name})`, scopeFor(theme, null)))
  const canvas = evaluate('var(--xh-bg-canvas)', scopeFor(theme, null))
  for (const tone of TONES)
    CONTEXTS.push({ theme, tone, ring, rings, canvas, scope: scopeFor(theme, tone) })
}

/** 两个 oklab 色是不是同一个色：四个分量都对得上。 */
function sameColor(a, b) {
  return ['L', 'a', 'b', 'alpha'].every(k => Math.abs(a[k] - b[k]) < 1e-6)
}

/** 环色在任一 (主题, 语气) 下解成 alpha 为 0：环画了等于没画。解不出来的（currentColor、私有槽、宽度）不判。 */
function ringVanishes(exprs) {
  for (const expr of exprs) {
    for (const ctx of CONTEXTS) {
      let color
      try {
        color = evaluate(expr, ctx.scope)
      }
      catch {
        continue
      }
      if (color.alpha === 0)
        return true
    }
  }
  return false
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
 * 那一档的面不是这个值。全部档都解不出来返回 null，由调用方另行记账。
 * 全透明的档按透出祖先算，全部档都全透明返回 { seeThrough: true }；
 * 有一档半透明的记 translucent，比值是叠在画布上算的估值。
 */
function worstAgainstRing(expr) {
  let worst = null
  let evaluated = 0
  let translucent = false
  for (const ctx of CONTEXTS) {
    let color
    try {
      color = evaluate(expr, ctx.scope)
    }
    catch {
      continue
    }
    evaluated++
    if (color.alpha === 0)
      continue
    if (color.alpha < 1)
      translucent = true
    const face = color.alpha < 1 ? over(color, ctx.canvas) : srgbOf(color)
    const ratio = contrast(face, ctx.ring)
    if (worst === null || ratio < worst.ratio)
      worst = { ratio, theme: ctx.theme, tone: ctx.tone, alpha: color.alpha }
  }
  if (!evaluated)
    return null
  if (worst === null)
    return { seeThrough: true }
  return { ...worst, translucent }
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

/** 组合子：空白与 > + ~。 */
const isCombinator = ch => ch === ' ' || ch === '\t' || ch === '\n' || ch === '>' || ch === '+' || ch === '~'

/** 属性存在但没写取值时占位。 */
const ANY = '\u0000any'

/**
 * 拆一段复合选择器：属性条件、data-part 的取值集合、`:not(…)` 排除掉的条件，
 * 以及除聚焦伪类外剩下的伪类。`:is(…)` 里的分支按属性逐键并集合并。
 */
function parseCompound(text) {
  const attrs = new Map()
  const pseudos = []
  const nots = []
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
          pseudos.push(`${name[1]}(${arg})`)
        }
        else {
          for (const key of keys) {
            for (const b of branches) {
              for (const v of b.attrs.get(key)) add(key, v)
            }
          }
        }
      }
      else if (name[1] === 'not') {
        // 只收属性条件；`:not(:hover)` 这类伪类条件判不了，不记
        for (const branch of splitTop(arg ?? '', c => c === ',').map(parseCompound)) {
          if (branch && branch.attrs.size && !branch.pseudos.length)
            nots.push(branch)
        }
      }
      else if (!/^focus(?:-visible|-within)?$/.test(name[1])) {
        pseudos.push(arg === null ? name[1] : `${name[1]}(${arg})`)
      }
      i = next
      continue
    }
    // 标签名、`*`、以及 `&` 这类主语占位一概忽略
    i++
  }
  return { attrs, pseudos, nots }
}

/** 拆一条选择器分支：末尾那个复合是主语，前面的都是祖先（组合子一律按后代处理）。 */
function parseBranch(branch) {
  const compounds = splitTop(branch, isCombinator).map(parseCompound)
  if (compounds.includes(null) || !compounds.length)
    return null
  const subject = compounds[compounds.length - 1]
  const ancestors = compounds.slice(0, -1).filter(c => c.attrs.has('data-part') || c.attrs.has('data-scope'))
  return { subject, ancestors }
}

/** 一条分支的主语（末尾那个复合）里有没有写这个伪类。 */
function subjectHas(branchText, pseudo) {
  const compounds = splitTop(branchText, isCombinator)
  return compounds.length > 0 && compounds[compounds.length - 1].includes(pseudo)
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

/** 一组属性条件在档位上是否全部成立：档位写了这个属性，取值也都落在条件里。 */
function holds(cond, t) {
  for (const [key, vals] of cond.attrs) {
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

/**
 * 覆盖方（规则）对被覆盖方（档位）的复合条件判定。
 * 规则写了、档位没写的属性：unknown 为 null 时直接判不覆盖（严格判定）；
 * 给了数组就连同档位这一节一起收进去，由调用方按兄弟档裁决。
 */
function compoundCovers(r, t, unknown = null) {
  const ra = anchorOf(r)
  const ta = anchorOf(t)
  if (ra.scope && ra.scope !== ta.scope)
    return false
  if (ra.parts && (!ta.parts || [...ta.parts].some(p => !ra.parts.has(p))))
    return false
  // 规则带的伪类（:checked、:has(…) 这类）档位上也得写着同名的那个
  if (r.pseudos.some(p => !t.pseudos.includes(p)))
    return false
  // 规则用 :not(…) 排掉的条件在这一档上成立，规则就落不到这一档
  if (r.nots.some(n => holds(n, t)))
    return false
  // 档位用 :not(…) 排掉的条件正是规则要求的，规则同样落不到这一档
  if (t.nots.some(n => holds(n, r)))
    return false
  for (const [key, vals] of r.attrs) {
    if (key === 'data-scope' || key === 'data-part')
      continue
    const have = t.attrs.get(key)
    if (!have) {
      if (!unknown)
        return false
      unknown.push({ key, vals, tier: t })
      continue
    }
    if (vals.has(ANY))
      continue
    for (const v of have) {
      if (!vals.has(v))
        return false
    }
  }
  return true
}

/** 规则 r 的选择器条件在档位 t 上是否都成立（档位没写的属性按 unknown 的约定处理）。 */
function coversWith(r, t, unknown) {
  if (!compoundCovers(r.subject, t.subject, unknown))
    return false
  return r.ancestors.every((ra) => {
    const a = anchorOf(ra)
    return t.ancestors.some((ta) => {
      const b = anchorOf(ta)
      if (a.scope && a.scope !== b.scope)
        return false
      if (a.parts && (!b.parts || [...b.parts].some(p => !a.parts.has(p))))
        return false
      return compoundCovers(ra, ta, unknown)
    })
  })
}

/** 两节复合能落在同一个元素上：scope 相同、部件有交集、同名属性取值有交集、谁排掉的条件都不在对方身上成立。 */
function compatible(a, b) {
  const aa = anchorOf(a)
  const ba = anchorOf(b)
  if (aa.scope && ba.scope && aa.scope !== ba.scope)
    return false
  if (aa.parts && ba.parts && ![...aa.parts].some(p => ba.parts.has(p)))
    return false
  for (const [key, vals] of a.attrs) {
    const have = b.attrs.get(key)
    if (!have || vals.has(ANY) || have.has(ANY))
      continue
    if (![...vals].some(v => have.has(v)))
      return false
  }
  return !a.nots.some(n => holds(n, b)) && !b.nots.some(n => holds(n, a))
}

/**
 * 兄弟档们把规则 r 写了、档位 t 没写的那个条件认领走了：
 * 与 t 落得到同一个元素上、r 排掉的条件在它身上不成立的兄弟档，在对应的那一节上写了这个属性，
 * 它们写的取值合起来包住了 r 写的每个值（存在式只有存在式包得住）。
 * 认领了就是说满足 r 的元素都有某个兄弟档的面，r 不再罩 t。
 */
function claimed(siblings, t, r, u) {
  const taken = new Set()
  for (const s of siblings) {
    if (s === t || !compatible(t.subject, s.subject) || r.subject.nots.some(n => holds(n, s.subject)))
      continue
    const nodes = u.tier === t.subject ? [s.subject] : s.ancestors.filter(sa => compatible(u.tier, sa))
    for (const node of nodes) {
      for (const v of node.attrs.get(u.key) ?? []) taken.add(v)
    }
  }
  if (taken.has(ANY))
    return true
  return !u.vals.has(ANY) && [...u.vals].every(v => taken.has(v))
}

/**
 * 规则 r 是否覆盖档位 t：主语条件要被满足，r 写出来的祖先在 t 里都得找得到。
 * 规则写了、档位没写的属性：兄弟档认领了其中任何一个，规则就归兄弟档，不罩 t；
 * 一个都没人认领的（存在式 [data-state] 罩着写了取值的档、没有面的状态）仍罩 t。
 */
function covers(r, t, siblings = []) {
  const unknown = []
  if (!coversWith(r, t, unknown))
    return false
  return !unknown.some(u => claimed(siblings, t, r, u))
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
  return { attrs, pseudos: [...a.pseudos, ...b.pseudos], nots: [...a.nots, ...b.nots] }
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
  for (const n of [...c.nots].map(renderCompound).sort())
    bits.push(`:not(${n})`)
  for (const p of [...c.pseudos].sort())
    bits.push(`:${p}`)
  return bits.join('')
}

/** 把档位写成可读、可当登记表键的选择器。 */
function render(tier) {
  return [...tier.ancestors.map(renderCompound), renderCompound(tier.subject)].join(' ')
}

// —— 可聚焦部件：连接层给了焦点的那些 —— //

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
/** 改环色的声明，扫完皮肤、槽赋值齐了之后再逐条求值，判出哪些是灌。 */
const ringAssignments = []
/** 灌环色的规则：环色求值后落在库环之外。 */
const declared = []
/** :focus-visible 里把环关掉的规则。 */
const ringless = []
/** :focus-visible 里把环色写成透明的规则：没有登记表，逐条判红。 */
const vanished = []
/** 选择器形态读不出来的规则，逐条报出来，免得静默漏掉。 */
const unreadable = []
/** 皮肤自己写了 :focus-visible 规则的部件：皮肤这么写就是断言这里落得上焦点。 */
const skinFocusable = new Map()
/** 皮肤用 :focus-within 在外框上画环的部件：环色走那份皮肤自己的槽，不归本份。 */
const ringHosts = new Map()
/** 面解不出颜色的消费点：键 → { at, hint }。 */
const opaqueValues = new Map()
/** 没进判定面的面声明按原因计数。 */
const dropped = { conditional: 0, pseudoElement: 0, unreadable: 0, hover: 0, noPart: 0, blocked: 0, mixedParts: 0, focusWithinHost: 0, nativeDisabled: 0, impossible: 0 }
/** 皮肤里给库环令牌链上的名字赋值的声明：没有登记表，逐条判红。 */
const ringOverrides = []
/** 属性名带转义的声明：声明拆解读不出它，等于这一条从扫描面里消失，逐条判红。 */
const escapedProps = []

function markSkin(map, comp, parts) {
  if (!map.has(comp))
    map.set(comp, new Set())
  for (const p of parts) map.get(comp).add(p)
}

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const css = stripComments(await readFile(join(SKINS, file), 'utf8'))
  const lineAt = lineCounter(css)
  // 声明拆解只认字母、数字、连字符组成的属性名，带转义的整条静默跳过：先把这些点出来
  for (const body of css.matchAll(/\{([^{}]*)\}/g)) {
    let offset = body.index + 1
    for (const seg of body[1].split(';')) {
      const colon = seg.indexOf(':')
      if (colon > 0 && seg.slice(0, colon).includes('\\'))
        escapedProps.push(`${file}:${lineAt(offset)} 属性名 ${seg.slice(0, colon).trim()} 带转义——本脚本读不出这条声明，属性名照 CSS 原样写`)
      offset += seg.length + 1
    }
  }
  for (const decl of declarations(css)) {
    // 普通属性名不分大小写；自定义属性名分大小写
    const prop = decl.prop.startsWith('--') ? decl.prop : decl.prop.toLowerCase()
    const value = decl.value.trim()
    const isFace = FACE_PROP.test(prop)
    const stack = classifyStack(decl.selectors)
    if (stack.keyframes)
      continue
    const at = `${file}:${lineAt(decl.index)}`
    if (RING_CHAIN.has(prop))
      ringOverrides.push(`${at} 皮肤里给 ${prop} 赋值（${value}）——库环令牌链上的名字只在 tokens.css 里声明，皮肤在子树上改它等于换掉库环`)
    // 真实媒体条件里的档不收；@layer 只是分层、@supports 与写成别的样子的条件块按成立处理，都照收
    if (stack.conditional) {
      if (isFace)
        dropped.conditional++
      continue
    }
    const raw = decl.selectors.filter(s => !s.startsWith('@')).join(' ')
    if (!raw)
      continue

    for (const branchText of splitTop(raw, ch => ch === ',')) {
      // 伪元素铺的底不是元素自己的面
      if (/::[\w-]+/.test(branchText)) {
        if (isFace)
          dropped.pseudoElement++
        continue
      }
      const branch = parseBranch(branchText)
      if (!branch) {
        // 面与环两类声明读不出选择器就等于这一档从判定面里消失，报出来而不是跳过
        if (isFace || RING_PROP.test(prop)) {
          if (isFace)
            dropped.unreadable++
          unreadable.push(`${at} ${branchText.trim()} —— 本脚本读不出这条选择器的形态，${prop} 这一档没进判定面`)
        }
        continue
      }
      const anchor = anchorOf(branch.subject)
      // 键以主语的 scope 打头：宿主皮肤给内嵌部件写的规则（tags-input 给 tag 的叉）归那个部件，
      // 与浏览器态判据按选择器里的 scope 认组件同一条规矩；主语没写 scope 的才按皮肤文件算
      const keyComp = anchor.scope ?? comp
      if (anchor.parts) {
        if (subjectHas(branchText, ':focus-visible') && !/:not\(\s*:focus-visible\s*\)/.test(branchText))
          markSkin(skinFocusable, comp, anchor.parts)
        if (subjectHas(branchText, ':focus-within') && prop === 'outline' && !turnsRingOff(prop, value))
          markSkin(ringHosts, comp, anchor.parts)
      }
      if (prop.startsWith('--')) {
        if (!slots.has(prop))
          slots.set(prop, [])
        slots.get(prop).push({ file, comp, branch, value, at })
      }
      if (isFace)
        surfaces.push({ file, comp, keyComp, branch, value, at, hover: /:hover|:active/.test(branchText) })
      const keyboardFocus = isKeyboardFocus(branchText)
      const ringOff = turnsRingOff(prop, value)
      // 改环色的声明先收着：环色槽与 outline-color 写在哪都算，outline 简写只认聚焦规则里的
      if (RING_PROP.test(prop) && !ringOff && (prop !== 'outline' || keyboardFocus))
        ringAssignments.push({ file, comp, branch, at, key: `${keyComp} ${render(branch)}`, prop, value })
      if (keyboardFocus && ringOff)
        ringless.push({ file, comp, branch, at, key: `${keyComp} ${render(branch)}`, prop, value })
      // 环色解成透明：环还在画，只是画成了看不见的
      if (keyboardFocus && ringVanishes(ringColorsOf(prop, value)))
        vanished.push({ at, key: `${keyComp} ${render(branch)}`, prop, value })
    }
  }
}

/**
 * 把一个面的取值摊成若干「终值 + 经过的槽赋值」。
 * var(--a, b) 两支都要摊：--a 在皮肤里另有赋值时走那一支，没赋值时走 b。
 * 透出祖先的终值（transparent / none）照样摊出来，记 seeThrough。
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
    if (SEE_THROUGH.test(expr))
      return [{ expr, trail, seeThrough: true }]
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

/**
 * 顺着令牌链把一个值解到底，只看原文不解颜色：
 * 判 outline 简写里哪一节是粗细、哪一节是颜色用。解不到底返回 null。
 */
function rawOf(expr, depth = 0) {
  const m = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(expr.trim())
  if (!m)
    return expr.trim()
  if (depth > 8)
    return null
  const [, name, fallback] = m
  for (const map of [themes.light, toneSrc.base]) {
    if (map.has(name))
      return rawOf(map.get(name), depth + 1)
  }
  const assigns = slots.get(name)
  if (assigns?.length)
    return rawOf(assigns[0].value, depth + 1)
  return fallback == null ? null : rawOf(fallback, depth + 1)
}

/**
 * outline 简写里的颜色那一节：线型关键字与长度（含解到底是长度的令牌）都不是；
 * 一节颜色都没写时，简写把颜色重置成 currentColor。
 */
function outlineColorTokens(value) {
  const colors = ringColorsOf('outline', value).filter((tok) => {
    if (OUTLINE_KEYWORD.test(tok) || LENGTH.test(tok))
      return false
    const raw = rawOf(tok)
    return raw === null || !(OUTLINE_KEYWORD.test(raw) || LENGTH.test(raw))
  })
  return colors.length ? colors : ['currentColor']
}

/**
 * 这条改环色的声明是不是灌：值顺着皮肤里的槽摊开，每一支终值在任一 (主题, 语气) 下
 * 求值后落在库环之外就是灌；一档都解不出来的（currentColor、使用者色值）同样算灌；
 * 一支终值都摊不出来的（没兜底的使用者令牌、本份皮肤里没赋值的私有槽）值由使用者定，同样算灌。
 * 摊出来的每支终值都等于库环（显式写回默认环、校验失败换 --xh-ring-invalid）才不算。
 */
function pours(assign) {
  const exprs = assign.prop === 'outline' ? outlineColorTokens(assign.value) : [assign.value]
  for (const expr of exprs) {
    const outcomes = expand(expr, assign.file)
    if (!outcomes.length)
      return true
    for (const outcome of outcomes) {
      let evaluated = 0
      for (const ctx of CONTEXTS) {
        let color
        try {
          color = evaluate(outcome.expr, ctx.scope)
        }
        catch {
          continue
        }
        evaluated++
        if (!ctx.rings.some(ring => sameColor(ring, color)))
          return true
      }
      if (!evaluated)
        return true
    }
  }
  return false
}

for (const assign of ringAssignments) {
  if (pours(assign))
    declared.push(assign)
}

/** 算出来的实心档：键 → { comp, parts, tier, ratio, theme, tone, expr, at } */
const solidTiers = new Map()
/** 非实心档（面过了线、或透出祖先）：currentColor 规则罩到这里就是罩宽了。 */
const nonSolidTiers = new Map()
/** 不接焦点却画了实心面的部件：键 `comp [part]` → { ratio, theme, tone, expr, at, tier } */
const unfocusableFaces = new Map()
/** 每份皮肤推出来的全部档位（不论实心与否、接不接焦点），按键去重：覆盖判定里当兄弟档用。 */
const tiersByComp = new Map()

function rememberTier(comp, key, tier) {
  if (!tiersByComp.has(comp))
    tiersByComp.set(comp, new Map())
  tiersByComp.get(comp).set(key, tier)
}

const round = n => Math.round(n * 100) / 100

function describe(worst, expr) {
  return `${round(worst.ratio)}:1（${worst.theme} · ${worst.tone ?? '无语气'}，面 ${expr}）`
}

for (const surface of surfaces) {
  if (surface.hover) {
    dropped.hover++
    continue
  }
  const anchor = anchorOf(surface.branch.subject)
  if (!anchor.parts) {
    dropped.noPart++
    continue
  }
  const parts = [...anchor.parts]
  const off = blockedParts.get(surface.comp) ?? new Set()
  const focusable = new Set(
    [...focusableParts.get(surface.comp) ?? [], ...skinFocusable.get(surface.comp) ?? []].filter(p => !off.has(p)),
  )
  const hosts = ringHosts.get(surface.comp) ?? new Set()
  if (parts.every(p => off.has(p))) {
    dropped.blocked++
    continue
  }
  const takesFocus = parts.every(p => focusable.has(p))
  if (!takesFocus) {
    if (parts.some(p => focusable.has(p) || off.has(p))) {
      dropped.mixedParts++
      continue
    }
    if (parts.every(p => hosts.has(p))) {
      dropped.focusWithinHost++
      continue
    }
  }

  for (const outcome of expand(surface.value, surface.file)) {
    let tier = surface.branch
    for (const step of outcome.trail) {
      tier = mergeInto(tier, step.branch)
      if (!tier)
        break
    }
    if (!tier) {
      dropped.impossible++
      continue
    }
    // 原生禁用的控件落不上焦点
    if (tier.subject.pseudos.includes('disabled') || tier.subject.attrs.has('disabled')) {
      dropped.nativeDisabled++
      continue
    }
    const key = `${surface.keyComp} ${render(tier)}`
    rememberTier(surface.comp, key, tier)
    const worst = outcome.seeThrough ? { seeThrough: true } : worstAgainstRing(outcome.expr)
    if (worst === null) {
      // 键里不带行号：面没改过就不该因为上面插了几行而重新走一遍登记
      if (takesFocus) {
        for (const part of parts)
          opaqueValues.set(`${surface.comp} [${part}] ${outcome.expr}`, { at: surface.at, hint: '' })
      }
      continue
    }
    if (worst.seeThrough) {
      if (takesFocus && !solidTiers.has(key))
        nonSolidTiers.set(key, { comp: surface.comp, parts, tier, expr: outcome.expr, at: surface.at, seeThrough: true })
      continue
    }
    if (worst.translucent) {
      if (takesFocus) {
        const hint = `α=${round(worst.alpha)} 的半透明面，叠在 ${worst.theme} 画布上估约 ${round(worst.ratio)}:1`
        for (const part of parts)
          opaqueValues.set(`${surface.comp} [${part}] ${outcome.expr}`, { at: surface.at, hint })
      }
      continue
    }
    if (!takesFocus) {
      if (worst.ratio >= MIN_RATIO)
        continue
      for (const part of parts) {
        const k = `${surface.comp} [${part}]`
        const prev = unfocusableFaces.get(k)
        if (prev && prev.ratio <= worst.ratio)
          continue
        unfocusableFaces.set(k, { comp: surface.comp, part, tier, ...worst, expr: outcome.expr, at: surface.at })
      }
      continue
    }
    if (worst.ratio >= MIN_RATIO) {
      if (!solidTiers.has(key))
        nonSolidTiers.set(key, { comp: surface.comp, parts, tier, ...worst, expr: outcome.expr, at: surface.at })
      continue
    }
    const prev = solidTiers.get(key)
    if (prev && prev.ratio <= worst.ratio)
      continue
    nonSolidTiers.delete(key)
    solidTiers.set(key, { comp: surface.comp, parts, tier, ...worst, expr: outcome.expr, at: surface.at })
  }
}

/** 同一份皮肤推出来的其余档位，覆盖判定里当兄弟档。 */
const siblingsOf = comp => [...(tiersByComp.get(comp)?.values() ?? [])]

/** 每档实心档的环怎么来：被灌环色的规则罩住、被关环规则关掉、或者两者皆无。 */
for (const tier of solidTiers.values()) {
  const siblings = siblingsOf(tier.comp)
  tier.coveredBy = declared.filter(r => r.comp === tier.comp && covers(r.branch, tier.tier, siblings)).map(r => r.key)
  tier.ringlessBy = ringless.filter(r => r.comp === tier.comp && covers(r.branch, tier.tier, siblings)).map(r => r.key)
  tier.ring = tier.ringlessBy.length ? 'off' : tier.coveredBy.length ? 'poured' : 'backlog'
}

/** 每条灌环色的规则覆盖到的实心档与非实心档。 */
const declaredHits = new Map()
for (const rule of declared) {
  const siblings = siblingsOf(rule.comp)
  declaredHits.set(rule.key, {
    solid: [...solidTiers.entries()].filter(([, t]) => t.comp === rule.comp && covers(rule.branch, t.tier, siblings)).map(([k]) => k),
    nonSolid: [...nonSolidTiers.entries()].filter(([, t]) => t.comp === rule.comp && covers(rule.branch, t.tier, siblings)).map(([k]) => k),
  })
}

/** 没被任何灌环色的规则覆盖、环也没被关掉的实心档。 */
const uncovered = [...solidTiers.entries()].filter(([, t]) => t.ring === 'backlog').map(([key, t]) => ({ key, ...t }))

/** 只读分区 solid 的内容：算出来的全部实心档。 */
function solidPartition() {
  const out = {}
  for (const [key, t] of [...solidTiers.entries()].sort(([a], [b]) => a.localeCompare(b)))
    out[key] = { parts: [...t.parts].sort(), ratio: round(t.ratio), ring: t.ring }
  return out
}

// —— 登记表 —— //

let registry = { backlog: {}, declared: {}, opaque: {}, ringless: {}, unfocusable: {}, solid: {} }
try {
  registry = { ...registry, ...JSON.parse(await readFile(REGISTRY, 'utf8')) }
}
catch {
  if (!process.argv.includes('--update')) {
    console.error(`[check-focus-ring-surface] ✗ 读不到 ${REGISTRY}——先跑 pnpm focus-ring-surface:update 落表`)
    process.exit(1)
  }
}

const sorted = obj => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)))

if (process.argv.includes('--list')) {
  const list = {
    solid: [...solidTiers.entries()].map(([key, t]) => ({ key, comp: t.comp, parts: [...t.parts], selector: render(t.tier), ratio: round(t.ratio), theme: t.theme, tone: t.tone, face: t.expr, at: t.at, ring: t.ring, coveredBy: t.coveredBy, ringlessBy: t.ringlessBy })),
    nonSolid: [...nonSolidTiers.entries()].map(([key, t]) => ({ key, comp: t.comp, parts: [...t.parts], selector: render(t.tier), ratio: t.seeThrough ? null : round(t.ratio), face: t.expr, at: t.at, seeThrough: !!t.seeThrough })),
    unfocusable: [...unfocusableFaces.entries()].map(([key, t]) => ({ key, comp: t.comp, part: t.part, selector: render(t.tier), ratio: round(t.ratio), theme: t.theme, tone: t.tone, face: t.expr, at: t.at })),
    ringless: ringless.map(r => ({ key: r.key, comp: r.comp, selector: render(r.branch), at: r.at, prop: r.prop, value: r.value })),
    poured: declared.map(r => ({ key: r.key, comp: r.comp, selector: render(r.branch), at: r.at, prop: r.prop, value: r.value, ...declaredHits.get(r.key) })),
    ringAssignments: ringAssignments.map(r => ({ key: r.key, at: r.at, prop: r.prop, value: r.value, poured: declared.includes(r) })),
    vanished: vanished.map(r => ({ key: r.key, at: r.at, prop: r.prop, value: r.value })),
    opaque: [...opaqueValues.entries()].map(([key, v]) => ({ key, at: v.at, hint: v.hint })),
    focusWithinHosts: [...ringHosts.entries()].flatMap(([comp, parts]) => [...parts].map(part => `${comp} [${part}]`)),
    dropped,
  }
  console.log(JSON.stringify(list, null, 2))
  process.exit(0)
}

if (process.argv.includes('--update')) {
  const backlog = { ...registry.backlog }
  for (const tier of uncovered)
    backlog[tier.key] = { ratio: round(tier.ratio), why: registry.backlog[tier.key]?.why ?? '' }
  const declaredTable = { ...registry.declared }
  for (const rule of declared) {
    const hits = declaredHits.get(rule.key)
    if (!hits.solid.length && !hits.nonSolid.length)
      declaredTable[rule.key] = registry.declared[rule.key] ?? ''
  }
  const opaqueTable = { ...registry.opaque }
  for (const key of opaqueValues.keys())
    opaqueTable[key] = registry.opaque[key] ?? ''
  const ringlessTable = { ...registry.ringless }
  for (const rule of ringless)
    ringlessTable[rule.key] = registry.ringless[rule.key] ?? ''
  const unfocusableTable = { ...registry.unfocusable }
  for (const key of unfocusableFaces.keys())
    unfocusableTable[key] = registry.unfocusable[key] ?? ''
  const out = {
    backlog: sorted(backlog),
    declared: sorted(declaredTable),
    opaque: sorted(opaqueTable),
    ringless: sorted(ringlessTable),
    unfocusable: sorted(unfocusableTable),
    solid: solidPartition(),
  }
  await writeFile(REGISTRY, `${JSON.stringify(out, null, 2)}\n`, 'utf8')
  console.log(
    `[focus-ring-surface:update] 已写入 ${REGISTRY}：`
    + `未灌的实心档 ${Object.keys(backlog).length} 条、算不出实心档的灌环色规则 ${Object.keys(declaredTable).length} 条、`
    + `解不出颜色的面 ${Object.keys(opaqueTable).length} 条、关环规则 ${Object.keys(ringlessTable).length} 条、`
    + `不接焦点的实心面 ${Object.keys(unfocusableTable).length} 条；只读分区 solid 重写为 ${solidTiers.size} 档`
    + `——理由留空的条目要人补上，门禁会拦`,
  )
  process.exit(0)
}

const problems = []

// 判据一 · 三：实心档要么被灌环色的规则罩住、要么被登了记的关环规则关掉，要么登记在 backlog 里并写明理由
for (const tier of uncovered) {
  const entry = registry.backlog[tier.key]
  const measured = describe(tier, tier.expr)
  if (!entry) {
    problems.push(
      `${tier.at} ${tier.key} 的面压着环最低只有 ${measured}，不到 ${MIN_RATIO}:1，`
      + `这一档没有一条 :focus-visible 规则把环色换掉（--xh-_ring-color / outline-color / outline 求值后仍是库环 --xh-ring-focus）——`
      + `补一条覆盖得住这一档、把环色灌成 currentColor 或面配对的前景色的规则，或登进 backlog 并写一句理由`,
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
      `${key} 登在 backlog 里，现在已经不是「未灌环色的实心档」了`
      + `——补上了、面换了、或者部件退役了，把这条一起删`,
    )
  }
  if (entry.why === undefined)
    problems.push(`${key} 在 backlog 里缺 why 字段`)
}

// 判据二：反查每条灌环色的规则——罩到非实心档的判红，一档实心档都罩不上的要登记
const declaredSeen = new Set()
for (const rule of declared) {
  const hits = declaredHits.get(rule.key)
  for (const key of hits.nonSolid) {
    const t = nonSolidTiers.get(key)
    const face = t.seeThrough ? `面 ${t.expr}，透出祖先` : `面 ${t.expr} 压环最低 ${round(t.ratio)}:1（${t.theme} · ${t.tone ?? '无语气'}）`
    problems.push(
      `${rule.at} ${rule.key} 这条规则把 ${rule.prop} 灌成 ${rule.value}，罩到了非实心档 ${key}（${face}）——`
      + `非实心面一律吃库环 --xh-ring-focus，把选择器收窄到实心那一档`,
    )
  }
  if (hits.solid.length) {
    if (rule.key in registry.declared)
      problems.push(`${rule.at} ${rule.key} 已经能算出实心档了——declared 里那条过期，删掉`)
    continue
  }
  if (hits.nonSolid.length)
    continue
  if (!(rule.key in registry.declared)) {
    problems.push(
      `${rule.at} ${rule.key} 把 ${rule.prop} 灌成 ${rule.value}，本脚本却算不出它压着的面低于 ${MIN_RATIO}:1——`
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
    problems.push(`${key} 登在 declared 里，皮肤里却没有这条灌环色的规则了（或者它的环色已经求值回了库环），或者它已经罩到了算得出的档——名单过期，删掉这条`)
}

// 面解不出颜色的，同样逐条登记：不登记就等于这一档从此没人再想起来
for (const [key, { at, hint }] of opaqueValues) {
  if (!(key in registry.opaque)) {
    problems.push(
      `${at} ${key} —— 这块面本脚本解不出颜色（半透明、渐变、或使用者传进来的色值），`
      + `判不了实心与否${hint ? `；${hint}` : ''}；登进 opaque 并写明这一档的环由什么保证`,
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

// 判据四：:focus-visible 里关掉环的规则逐条登记——环由谁画、或为什么这一档不该有环
const ringlessSeen = new Set()
for (const rule of ringless) {
  ringlessSeen.add(rule.key)
  if (!(rule.key in registry.ringless)) {
    problems.push(
      `${rule.at} ${rule.key} 在聚焦规则里把 ${rule.prop} 写成 ${rule.value}，键盘焦点在这一档没有环——`
      + `环由别处画的（外框的 :focus-within、包一层的壳）登进 ringless 写明是谁画；`
      + `谁都不画的把这条删掉，失效档也只豁免对比度，环不许消失`,
    )
    continue
  }
  if (!registry.ringless[rule.key])
    problems.push(`${rule.key} 登在 ringless 里没写理由——补一句「这一档的环由谁画、或为什么不画」`)
}

for (const key of Object.keys(registry.ringless)) {
  if (!ringlessSeen.has(key))
    problems.push(`${key} 登在 ringless 里，皮肤里已经没有这条关环规则了——名单过期，删掉这条`)
}

// 判据五：画了实心面却两条来路都查无此人的部件，必须表态
for (const [key, face] of unfocusableFaces) {
  if (!(key in registry.unfocusable)) {
    problems.push(
      `${face.at} ${key} 画了一块面，压环最低只有 ${describe(face, face.expr)}，`
      + `连接层没给它 tabindex、皮肤也没写 :focus-visible——`
      + `接焦点的在连接层接 tabindex 或在皮肤补 :focus-visible；不接焦点的登进 unfocusable 写明「这块面不接焦点」`,
    )
    continue
  }
  if (!registry.unfocusable[key])
    problems.push(`${key} 登在 unfocusable 里没写理由——补一句「这块面为什么不接焦点」`)
}

for (const key of Object.keys(registry.unfocusable)) {
  if (!unfocusableFaces.has(key))
    problems.push(`${key} 登在 unfocusable 里，现在要么接上了焦点、要么面已经过线或没了——名单过期，删掉这条`)
}

// 只读分区 solid：与算出来的逐档对拍，供浏览器态判据对账
const expectedSolid = solidPartition()
const storedSolid = registry.solid ?? {}
for (const [key, entry] of Object.entries(expectedSolid)) {
  const have = storedSolid[key]
  if (!have)
    problems.push(`${key} 是算出来的实心档，solid 分区里没有——跑 pnpm focus-ring-surface:update 重写分区`)
  else if (JSON.stringify(have) !== JSON.stringify(entry))
    problems.push(`${key} 在 solid 分区里登记 ${JSON.stringify(have)}，算出来 ${JSON.stringify(entry)}——跑 pnpm focus-ring-surface:update 重写分区`)
}
for (const key of Object.keys(storedSolid)) {
  if (!(key in expectedSolid))
    problems.push(`${key} 登在 solid 分区里，已经算不出这一档了——跑 pnpm focus-ring-surface:update 重写分区`)
}

// 环色写成透明的聚焦规则：没有登记表，环不许消失
for (const rule of vanished) {
  problems.push(
    `${rule.at} ${rule.key} 在聚焦规则里把 ${rule.prop} 写成 ${rule.value}，环色解出来是透明的——`
    + `环画了等于没画；失效档也只豁免对比度，环不许消失，把这一行删掉或换成看得见的色`,
  )
}

for (const line of unreadable)
  problems.push(line)

// 库环令牌链上的名字在皮肤里被赋值：没有登记表，逐条判红
for (const line of ringOverrides)
  problems.push(line)

// 属性名带转义：声明拆解读不出，逐条判红
for (const line of escapedProps)
  problems.push(line)

if (problems.length) {
  console.error('[check-focus-ring-surface] ✗ 实心面上的聚焦环对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const byRing = { poured: 0, off: 0, backlog: 0 }
for (const t of solidTiers.values()) byRing[t.ring]++
const droppedTotal = Object.values(dropped).reduce((a, b) => a + b, 0)
console.log(
  `[check-focus-ring-surface] 通过：${files.length} 份皮肤里算出 ${solidTiers.size} 档面压环不到 ${MIN_RATIO}:1，`
  + `${byRing.poured} 档灌了环色、${byRing.off} 档由登了记的关环规则关掉、${byRing.backlog} 档登在 backlog；`
  + `另有 ${nonSolidTiers.size} 档非实心档（${[...nonSolidTiers.values()].filter(t => t.seeThrough).length} 档透出祖先），`
  + `${ringAssignments.length} 条改环色的声明里 ${declared.length} 条是灌（${Object.keys(registry.declared).length} 条算不出实心档、已登记）；`
  + `${ringless.length} 条关环规则、${unfocusableFaces.size} 块不接焦点的实心面、${opaqueValues.size} 块解不出颜色的面逐条登记；`
  + `${droppedTotal} 条面声明没进判定面（${Object.entries(dropped).filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join('、')}）`,
)
