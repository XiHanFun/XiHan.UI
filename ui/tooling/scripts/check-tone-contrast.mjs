#!/usr/bin/env node
// 门禁：语气层（tone.css）每一族配色的对比度必须达到 WCAG 阈值。
//
// tone.css 的注释里写着「600 档上白字对 brand 5.08、neutral 7.80、danger 4.83 达标，
// success / warning / info 不到 4.5 所以配深字」这类实测数字。数字只在注释里就只是一句话，
// 改令牌时没人会复算；这条门禁把它们落成断言：
//   实心底 --xh-_tone        vs 实心底上的字 --xh-_tone-on   ≥ 4.5（AA 正文）
//     —— 这一对验两遍：@supports 里按相对亮度现推的那一档，与它外面各族写死的兜底档
//   淡底   --xh-_tone-subtle  vs 淡底上的字   --xh-_tone-fg   ≥ 4.5（AA 正文）
//   装饰档 --xh-_tone-soft    vs 画布         --xh-bg-canvas  ≥ 3  （非文字图形）
//   聚焦环 --xh-ring-focus    vs 画布         --xh-bg-canvas  ≥ 3  （非文字 UI 部件）
// 浅色与深色两档各算一遍，六族语气逐族算。
//
// 颜色全部由 tokens.css 的 oklch(...) 字面量算出：这里自己实现 oklch → oklab → 线性 sRGB →
// 相对亮度 → 对比度，以及 color-mix(in oklab, A p%, B) 的插值，不引第三方。
// 超出 sRGB 色域的分量按截断处理，与浏览器对 oklch 的默认裁切一致到足够判断阈值。
//
// KNOWN 名单登记的是当前明知不达标、但另有裁决不改颜色的配对；名单里的项只打印不拦，
// 一旦某项达标了会提示把它从名单移走，免得名单变成过期的免检通行证。
import { readFile } from 'node:fs/promises'

const TOKENS = 'packages/design/tokens/tokens.css'
const TONE = 'packages/design/styles/css/tone.css'

const TONES = ['brand', 'neutral', 'success', 'warning', 'danger', 'info']
const THEMES = ['light', 'dark']

/**
 * 明知不达标且不改颜色的配对。键为 `${theme}/${tone}/${pair}`，值为理由。
 * 聚焦环不随语气走（warning 本体压白底只有 2.70）所以这里只查 --xh-ring-focus 一条，不查各族。
 */
const KNOWN = new Map([])

// —— 解析 —— //

/**
 * 把 @supports 块摘出来：块内是够得着新特性时生效的增强档，块外是兜底档。
 * 两档都要各自成立，所以分开解析、分别断言。
 */
function splitSupports(src) {
  const bare = src.replace(/\/\*[\s\S]*?\*\//g, '')
  const guarded = []
  let rest = ''
  let i = 0
  while (i < bare.length) {
    const at = bare.indexOf('@supports', i)
    if (at === -1) {
      rest += bare.slice(i)
      break
    }
    rest += bare.slice(i, at)
    const open = bare.indexOf('{', at)
    if (open === -1)
      throw new Error('@supports 没有块')
    let depth = 0
    let j = open
    for (; j < bare.length; j++) {
      if (bare[j] === '{')
        depth++
      else if (bare[j] === '}' && --depth === 0)
        break
    }
    guarded.push(bare.slice(open + 1, j))
    i = j + 1
  }
  return { guarded: guarded.join('\n'), rest }
}

/** 把一段 CSS 拆成 { selector, decls } 数组，只认 `--xh-*: value;` 声明。 */
function parseBlocks(src) {
  const blocks = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  for (const m of src.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(re)) {
    const selector = m[1].trim().replace(/\s+/g, ' ')
    const decls = new Map()
    for (const d of m[2].matchAll(/(--xh-[a-z0-9_-]+):([^;]+);/g))
      decls.set(d[1], d[2].trim())
    if (decls.size)
      blocks.push({ selector, decls })
  }
  return blocks
}

/** tokens.css：根原语 + 浅色基线合并成 light；根原语 + 深色块合并成 dark。 */
function loadThemes(blocks) {
  const root = new Map()
  const light = new Map()
  const dark = new Map()
  for (const { selector, decls } of blocks) {
    const target = selector === ':where(:root)'
      ? root
      : selector === ':where([data-theme=\'light\'])'
        ? light
        : selector === ':where([data-theme=\'dark\'])' ? dark : null
    if (!target)
      continue
    for (const [k, v] of decls)
      target.set(k, v)
  }
  return {
    light: new Map([...root, ...light]),
    dark: new Map([...root, ...dark]),
  }
}

/** tone.css：缺省块 + 各族块 + 深色专属覆盖块。 */
function loadTones(blocks) {
  const base = new Map()
  const perTone = new Map(TONES.map(t => [t, new Map()]))
  const darkOverride = new Map(TONES.map(t => [t, new Map()]))
  for (const { selector, decls } of blocks) {
    if (selector === '[data-tone]') {
      for (const [k, v] of decls) base.set(k, v)
      continue
    }
    const m = selector.match(/^(:is\(\[data-theme='dark'\] \*, \[data-theme='dark'\]\))?\[data-tone='([a-z]+)'\]$/)
    if (!m)
      continue
    const target = (m[1] ? darkOverride : perTone).get(m[2])
    if (!target)
      continue
    for (const [k, v] of decls) target.set(k, v)
  }
  return { base, perTone, darkOverride }
}

/** @supports 块里落在 [data-tone] 上的声明，即现推那一档。 */
function loadDerived(blocks) {
  const derived = new Map()
  for (const { selector, decls } of blocks) {
    if (selector !== '[data-tone]')
      continue
    for (const [k, v] of decls) derived.set(k, v)
  }
  return derived
}

// —— 求值 —— //

/** 解析 var(--a, fallback) 的实参：第一个逗号之前是名字，其后是兜底。 */
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

/** 取出 `fn(` 开头表达式里与之配对的括号内容。 */
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

/** 把一个值求成 oklab 坐标 {L,a,b}。scope 是按优先级排好的若干 Map，前面的先命中。 */
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
    throw new Error(`令牌未定义：${name}（经 ${trail.join(' → ') || '顶层'}）`)
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
      const tokens = part.trim().split(' ')
      const last = tokens[tokens.length - 1]
      const weight = /^[\d.]+%$/.test(last) ? Number.parseFloat(last) / 100 : null
      const color = weight === null ? tokens.join(' ') : tokens.slice(0, -1).join(' ')
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
  if (expr.startsWith('color(')) {
    const m = inner(expr, 5).trim().match(/^from\s+(var\([^)]*\)|[\w-]+)\s+srgb-linear\s+([\s\S]+)$/)
    if (!m)
      throw new Error(`只认 color(from … srgb-linear …) 这一种写法：${expr}`)
    // alpha 走 `/ a` 后缀，与三个通道分开；tone.css 里恒写 1
    const [channelPart, alphaPart] = m[2].split('/')
    if (alphaPart !== undefined && alphaPart.trim() !== '1')
      throw new Error(`只认 alpha 为 1 的写法：${expr}`)
    const channels = topLevelParts(channelPart)
    if (channels.length !== 3 || new Set(channels).size !== 1)
      throw new Error(`三个通道必须是同一个式子：${expr}`)
    // 与 tone.css 里那两条逐字对上。Y 是 WCAG 相对亮度：
    //   clamp(0, (阈值 - Y) * 系数, 1)   低于阈值取 1（白）——前景那一支
    //   clamp(0, (Y - 阈值) * 系数, 1)   高于阈值取 1（白）——挪动方向那一支，取前景的反面
    const recipe = channels[0].replace(/\s+/g, '')
    const below = recipe.match(/^clamp\(0,\(([\d.]+)-\(0\.2126\*r\+0\.7152\*g\+0\.0722\*b\)\)\*(?:[\d.e+]+|infinity),1\)$/)
    const above = recipe.match(/^clamp\(0,\(\(0\.2126\*r\+0\.7152\*g\+0\.0722\*b\)-([\d.]+)\)\*(?:[\d.e+]+|infinity),1\)$/)
    if (!below && !above)
      throw new Error(`择色式子的形态对不上，改了式子要同步改本脚本：${channels[0]}`)
    const y = luminance(evaluate(m[1], scope, trail))
    const threshold = Number((below ?? above)[1])
    const white = below ? y < threshold : y > threshold
    // 通道同为 0 即纯黑、同为 1 即纯白（oklab 里 a=b=0、L 取 0 或 1）
    return white ? { L: 1, a: 0, b: 0 } : { L: 0, a: 0, b: 0 }
  }
  throw new Error(`不认识的颜色表达式：${expr}`)
}

/** 按顶层空白拆分；括号里的空白与逗号不拆。 */
function topLevelParts(s) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(')
      depth++
    if (ch === ')')
      depth--
    if (depth === 0 && /\s/.test(ch)) {
      if (cur)
        out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  if (cur)
    out.push(cur)
  return out
}

// —— 色彩数学 —— //

/** oklab → 线性 sRGB（分量截断到 [0,1]）。 */
function oklabToLinearSrgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const clamp = x => Math.min(1, Math.max(0, x))
  return [
    clamp(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ]
}

/** WCAG 相对亮度：对线性分量加权。 */
function luminance(oklab) {
  const [r, g, b] = oklabToLinearSrgb(oklab)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 对比度 (L1 + 0.05) / (L2 + 0.05)。 */
function contrast(x, y) {
  const lx = luminance(x)
  const ly = luminance(y)
  return (Math.max(lx, ly) + 0.05) / (Math.min(lx, ly) + 0.05)
}

/** 线性 sRGB 编码成 #rrggbb，只为了把失败项打印得能看。 */
function hex(oklab) {
  const enc = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
  return `#${oklabToLinearSrgb(oklab).map(c => Math.round(enc(c) * 255).toString(16).padStart(2, '0')).join('')}`
}

// —— 断言 —— //

const themes = loadThemes(parseBlocks(await readFile(TOKENS, 'utf8')))
const toneSrc = splitSupports(await readFile(TONE, 'utf8'))
const tones = loadTones(parseBlocks(toneSrc.rest))
const derived = loadDerived(parseBlocks(toneSrc.guarded))

const failures = []
const knownSeen = new Set()
const stale = []
let checked = 0

const VERBOSE = process.argv.includes('--verbose')

function assert(key, label, fg, bg, min) {
  checked++
  const ratio = contrast(fg, bg)
  if (VERBOSE)
    console.log(`  ${key.padEnd(28)} ${label}  ${ratio.toFixed(2)}  （${hex(fg)} 压 ${hex(bg)}）`)
  if (ratio >= min) {
    if (KNOWN.has(key))
      stale.push(`${key}  现已达标 ${ratio.toFixed(2)} ≥ ${min}，请从 KNOWN 名单移除`)
    return
  }
  const line = `${key.padEnd(28)} ${label}  ${ratio.toFixed(2)} < ${min}  （${hex(fg)} 压 ${hex(bg)}）`
  if (KNOWN.has(key)) {
    knownSeen.add(key)
    console.log(`  已知例外 ${line}  —— ${KNOWN.get(key)}`)
    return
  }
  failures.push(line)
}

for (const theme of THEMES) {
  const tokens = themes[theme]
  const canvas = evaluate('var(--xh-bg-canvas)', [tokens])
  assert(`${theme}/ring-focus`, '聚焦环 vs 画布', evaluate('var(--xh-ring-focus)', [tokens]), canvas, 3)

  for (const tone of TONES) {
    const scope = [
      ...(theme === 'dark' ? [tones.darkOverride.get(tone)] : []),
      tones.perTone.get(tone),
      tones.base,
      tokens,
    ]
    const at = name => evaluate(`var(${name})`, scope)
    // 现推那一档压在兜底档之上，两档各验一遍：够得着新特性与够不着的引擎都要成立
    const atDerived = name => evaluate(`var(${name})`, [derived, ...scope])
    assert(`${theme}/${tone}/solid`, '实心底 vs on 字（现推）', atDerived('--xh-_tone-on'), at('--xh-_tone'), 4.5)
    assert(`${theme}/${tone}/solid-fallback`, '实心底 vs on 字（兜底）', at('--xh-_tone-on'), at('--xh-_tone'), 4.5)
    assert(`${theme}/${tone}/subtle`, '淡底 vs fg 字', at('--xh-_tone-fg'), at('--xh-_tone-subtle'), 4.5)
    // 淡底的两个交互态跟静态档同样要读得清：悬停与按下时字色不变，底却更深一档
    assert(`${theme}/${tone}/subtle-hover`, '淡底悬停 vs fg 字', at('--xh-_tone-fg'), at('--xh-_tone-subtle-hover'), 4.5)
    assert(`${theme}/${tone}/subtle-active`, '淡底按下 vs fg 字', at('--xh-_tone-fg'), at('--xh-_tone-subtle-active'), 4.5)
    // 语气文字也常常直接压在面上（alert 的说明、通知的字形、表格里的状态列）
    assert(`${theme}/${tone}/on-surface`, '面 vs fg 字', at('--xh-_tone-fg'), evaluate('var(--xh-bg-surface)', scope), 4.5)
    assert(`${theme}/${tone}/on-raised`, '抬起的面 vs fg 字', at('--xh-_tone-fg'), evaluate('var(--xh-bg-surface-raised)', scope), 4.5)
    // 实心底的两个交互态：底更深，on 字不变
    assert(`${theme}/${tone}/solid-hover`, '实心底悬停 vs on 字（现推）', atDerived('--xh-_tone-on'), at('--xh-_tone-hover'), 4.5)
    assert(`${theme}/${tone}/solid-active`, '实心底按下 vs on 字（现推）', atDerived('--xh-_tone-on'), at('--xh-_tone-active'), 4.5)
    assert(`${theme}/${tone}/solid-hover-fallback`, '实心底悬停 vs on 字（兜底）', at('--xh-_tone-on'), at('--xh-_tone-hover'), 4.5)
    assert(`${theme}/${tone}/solid-active-fallback`, '实心底按下 vs on 字（兜底）', at('--xh-_tone-on'), at('--xh-_tone-active'), 4.5)
    // 可操作区的边界要 3:1，这一档是专门为它兜过底的
    assert(`${theme}/${tone}/border-control`, '控件边界 vs 面', at('--xh-_tone-border-control'), evaluate('var(--xh-bg-surface)', scope), 3)
    // 装饰档画的是色条、指示条这类非文字图形，压在画布上同样要 3:1
    assert(`${theme}/${tone}/soft`, '装饰档 vs 画布', at('--xh-_tone-soft'), canvas, 3)
  }
}

for (const key of KNOWN.keys()) {
  if (!knownSeen.has(key) && !stale.some(s => s.startsWith(key)))
    stale.push(`${key}  没有对应的检查项，请从 KNOWN 名单移除`)
}

if (failures.length || stale.length) {
  if (failures.length) {
    console.error('[check-tone-contrast] ✗ 语气配色对比度不达标：')
    for (const f of failures)
      console.error(`  ${f}`)
    console.error('改 tokens.css 里对应原语的明度，或在 tone.css 换一档更深/更浅的前景；明知不改的登记进 KNOWN 并写理由。')
  }
  if (stale.length) {
    console.error('[check-tone-contrast] ✗ KNOWN 名单过期：')
    for (const s of stale)
      console.error(`  ${s}`)
  }
  process.exit(1)
}

console.log(`[check-tone-contrast] 通过：${THEMES.length} 档主题 × ${TONES.length} 族语气，${checked} 组配对全部达标（已知例外 ${knownSeen.size} 组）`)
