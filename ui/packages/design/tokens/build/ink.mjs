// 墨色域：彩色面声明自身底色的极性，域内的中性装饰改由墨色按比例透明表达。
//
// 墨色是所在面的前景基色：浅色面上是纯黑，深色面上是纯白。不透明的中性灰落在彩色底上
// 显著度随底色变化十几倍（neutral 200 描边在黄底上 1.06:1、黑底上 16.68:1），而墨色按固定
// 比例透明后，在任何底色上显著度一致，颜色取底色自身的深浅变体。
//
// 比例不手填：对每一支中性装饰令牌，在该主题的面（浅色 bg.surface、深色 bg.surface）上
// 求一个透明度，让「墨色按该透明度合成到面上」与「令牌原色」对面的对比度相等。合成按浏览器的
// 做法在 gamma sRGB 空间进行，对比度用 WCAG 相对亮度。
//
// 三种域：
//   data-xh-ink="dark"   浅色底，黑墨；同时是浅色主题边界，语气色、表面随浅色档
//   data-xh-ink="light"  深色底，白墨；同时是深色主题边界
//   data-xh-ink="auto"   由 --xh-ink-surface 用相对颜色语法按 0.179 选墨色，只决定墨色与中性装饰，
//                        其余语义沿用外层主题；引擎不认相对颜色语法时整块丢弃，等于未声明
// data-xh-ink-margin="ample" 表示底色离分界足够远，弱化文字可以取墨色 72%；缺省时弱化文字等于墨色。
//
// 库自己渲染的彩色面（实心语气面、Tooltip 反白面）打 data-xh-ink-surface，皮肤把自己的底色填进
// --xh-ink-surface，面内的子元素按 auto 同一套规则成域。域不落在面自己身上：面的底色就是从
// --xh-bg-brand、--xh-fg-default 这些被域改写的令牌取的，落在自身会让底色与墨色互相引用成环。

/** 由面上对比度等价推出墨色比例的令牌。 */
const EQUIVALENT = [
  '--xh-bg-subtle',
  '--xh-bg-subtle-hover',
  '--xh-bg-subtle-active',
  '--xh-bg-muted',
  '--xh-border-default',
  '--xh-border-subtle',
  '--xh-border-strong',
  '--xh-border-control-hover',
  '--xh-fg-disabled',
]

/** 比例固定、与主题无关的墨色表达。 */
const FIXED = [
  ['--xh-bg-brand-hover', 0.88],
  ['--xh-bg-brand-active', 0.78],
  ['--xh-bg-brand-subtle', 0.12],
  ['--xh-bg-brand-subtle-hover', 0.2],
  ['--xh-bg-brand-subtle-active', 0.28],
]

/** 直接取墨色本身的令牌。 */
const SOLID = [
  '--xh-fg-default',
  '--xh-fg-muted',
  '--xh-fg-subtle',
  '--xh-fg-brand',
  '--xh-fg-brand-strong',
  '--xh-fg-on-brand-subtle',
  '--xh-bg-brand',
  '--xh-ring-focus',
]

/** 余量充足时弱化文字取墨色的比例：黑墨在相对亮度 0.5 的底上 67% 才到 4.5:1，72% 留出余量。 */
const MUTED_AMPLE = 0.72
/** 黑白字对比度相等的相对亮度，与语气层的分界同一个数。 */
const CROSSOVER = 0.179
/** 余量充足的两端：黑墨底色亮度不低于它，白墨底色亮度不高于它。 */
const AMPLE_DARK_INK = 0.5
const AMPLE_LIGHT_INK = 0.05

/** 墨色域改写的全部令牌：主题边界上凡是引用了它们的声明，在 auto 域里都要重新求值。 */
export const INK_TOKENS = new Set([
  '--xh-ink',
  '--xh-fg-on-brand',
  ...SOLID,
  ...FIXED.map(([name]) => name),
  ...EQUIVALENT,
])

/** 库自有彩色面里的内容：面的直接子元素成为 auto 域，更深的后代沿继承拿到同一套取值。 */
export const INK_SURFACE_CONTENT = ':where([data-xh-ink-surface] > *)'

/** 与语气层同一个探针：只测得起 color(from …) 的引擎不会落进半截支持。 */
const RELATIVE_COLOR_PROBE = 'color: color(from red srgb-linear clamp(0, (0.179 - (0.2126 * r + 0.7152 * g + 0.0722 * b)) * infinity, 1) 0 0 / 1)'

function oklchToLinearRgb(l, c, h) {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ].map(v => Math.min(1, Math.max(0, v)))
}

const encode = v => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
const decode = v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const luminance = gamma => 0.2126 * decode(gamma[0]) + 0.7152 * decode(gamma[1]) + 0.0722 * decode(gamma[2])
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

/** oklch 字面量 → gamma sRGB。只认不带透明度的三分量写法：中性装饰令牌都是这种写法。 */
export function parseOklch(text) {
  const hit = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(text.trim())
  if (!hit)
    throw new Error(`[ink] 只能换算不透明的 oklch() 字面量，拿到的是 ${text}`)
  return oklchToLinearRgb(Number(hit[1]), Number(hit[2]), Number(hit[3])).map(encode)
}

/**
 * 在面上求墨色比例：墨色按该比例合成到面上，与令牌原色对面的对比度相等。
 * 结果按千分之一取整；令牌原色与面同色时比例为 0。
 */
export function equivalentAlpha(target, surface, ink) {
  const Ls = luminance(surface)
  const goal = ratio(luminance(target), Ls)
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    const mixed = ink.map((v, k) => v * mid + surface[k] * (1 - mid))
    if (ratio(luminance(mixed), Ls) < goal)
      lo = mid
    else hi = mid
  }
  return Math.round(hi * 1000) / 1000
}

const percent = alpha => `${Number((alpha * 100).toFixed(1))}%`
const inkMix = alpha => `color-mix(in oklab, var(--xh-ink) ${percent(alpha)}, transparent)`

/**
 * 生成墨色域的全部声明块。
 * @param {object} input
 * @param {(theme: 'light' | 'dark', name: string) => string} input.color 取某主题下某令牌解析到底的 oklch 字面量
 * @param {Map<string, string>} input.moreRoutes 参与对比度路由的令牌 → 高对比分支的取值
 * @param {string[]} input.reevaluate auto 域要重声明的主题边界声明（「名: 值」）：它们引用了墨色域改写的令牌，
 *   而自定义属性里的 var() 在声明处就求值，auto 域不是主题边界，不重声明就只继承到外层求好的旧值
 * @param {string} indent 块内缩进
 * @returns {{ alphas: Record<'light' | 'dark', Record<string, number>>, css: string }} 比例表与 CSS
 */
export function inkBlocks({ color, moreRoutes, reevaluate }, indent = '  ') {
  const inner = `${indent}  `
  const polarity = {
    light: { selector: `:where([data-xh-ink='dark'])`, ink: [0, 0, 0], inkLiteral: 'oklch(0 0 0)', opposite: 'oklch(1 0 0)' },
    dark: { selector: `:where([data-xh-ink='light'])`, ink: [1, 1, 1], inkLiteral: 'oklch(1 0 0)', opposite: 'oklch(0 0 0)' },
  }
  const alphas = { light: {}, dark: {} }
  for (const theme of ['light', 'dark']) {
    const surface = parseOklch(color(theme, '--xh-bg-surface'))
    for (const name of EQUIVALENT)
      alphas[theme][name] = equivalentAlpha(parseOklch(color(theme, name)), surface, polarity[theme].ink)
  }

  /** 参与对比度路由的令牌只换缺省分支，高对比分支沿用主题边界上的候选。 */
  const routed = (name, value) => {
    const more = moreRoutes.get(name)
    return more == null ? value : `var(--xh-_contrast-use-default, ${value}) var(--xh-_contrast-use-more, ${more})`
  }

  // 底色是作者在自己的区块上填的输入：每个域都从未声明开始，不从外层域继承，未填时各处 var() 走兜底。
  // 库自有彩色面里的内容不在此列：底色由面声明、沿继承流进来
  const blocks = [`${indent}:where([data-xh-ink]) {\n${inner}--xh-ink-surface: initial;\n${indent}}`]
  for (const theme of ['light', 'dark']) {
    const p = polarity[theme]
    const lines = [
      `${inner}--xh-ink: ${p.inkLiteral};`,
      ...SOLID.map(name => `${inner}${name}: var(--xh-ink);`),
      `${inner}--xh-fg-on-brand: var(--xh-ink-surface, ${p.opposite});`,
      ...FIXED.map(([name, alpha]) => `${inner}${name}: ${inkMix(alpha)};`),
      ...EQUIVALENT.map(name => `${inner}${name}: ${routed(name, inkMix(alphas[theme][name]))};`),
    ]
    blocks.push(`${indent}${p.selector} {\n${lines.join('\n')}\n${indent}}`)
  }

  blocks.push(`${indent}:where([data-xh-ink='dark'][data-xh-ink-margin='ample']), :where([data-xh-ink='light'][data-xh-ink-margin='ample']) {
${inner}--xh-fg-muted: ${inkMix(MUTED_AMPLE)};
${inner}--xh-fg-subtle: ${inkMix(MUTED_AMPLE)};
${indent}}`)

  // auto：墨色与比例都从底色现推。W 为 1 取白墨、为 0 取黑墨；比例在浅深两档之间按 W 取一端
  const surface = 'var(--xh-ink-surface, var(--xh-bg-surface))'
  const Y = '(0.2126 * r + 0.7152 * g + 0.0722 * b)'
  const W = `clamp(0, (${CROSSOVER} - ${Y}) * infinity, 1)`
  const fromSurface = alpha => `color(from ${surface} srgb-linear ${W} ${W} ${W} / ${alpha})`
  const between = (light, dark) => (light === dark ? String(light) : `calc(${light} + ${Number((dark - light).toFixed(3))} * ${W})`)
  const ample = `clamp(0, (${Y} - ${AMPLE_DARK_INK}) * infinity, 1) + clamp(0, (${AMPLE_LIGHT_INK} - ${Y}) * infinity, 1)`
  const mutedAuto = `color(from ${surface} srgb-linear ${W} ${W} ${W} / calc(1 - ${Number((1 - MUTED_AMPLE).toFixed(2))} * (${ample})))`
  const autoLines = [
    ...reevaluate.map(line => `${inner}  ${line}`),
    `${inner}  --xh-ink: ${fromSurface(1)};`,
    ...SOLID.filter(name => name !== '--xh-fg-muted' && name !== '--xh-fg-subtle').map(name => `${inner}  ${name}: var(--xh-ink);`),
    `${inner}  --xh-fg-muted: ${mutedAuto};`,
    `${inner}  --xh-fg-subtle: ${mutedAuto};`,
    `${inner}  --xh-fg-on-brand: ${surface};`,
    ...FIXED.map(([name, alpha]) => `${inner}  ${name}: ${fromSurface(alpha)};`),
    ...EQUIVALENT.map(name => `${inner}  ${name}: ${routed(name, fromSurface(between(alphas.light[name], alphas.dark[name])))};`),
  ]
  blocks.push(`${indent}@supports (${RELATIVE_COLOR_PROBE}) {
${inner}:where([data-xh-ink='auto']), ${INK_SURFACE_CONTENT} {
${autoLines.join('\n')}
${inner}}
${indent}}`)

  return { alphas, css: blocks.join('\n\n') }
}
