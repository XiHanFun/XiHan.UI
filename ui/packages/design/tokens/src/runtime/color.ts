// 颜色能力：解析、亮度、对比度、择前景、择反向、混色与深浅。
//
// 皮肤那侧有一份等价的 CSS 配方（styles/css/color.css），用相对颜色语法在浏览器里现算。
// 两处的判据必须一致：交叉点常量、通道权重、混色的色彩空间都在这里定义一次，
// CSS 那份的注释指回这里。

/** OKLCH 坐标。h 是角度（0-360），c 是绝对彩度（不是百分比），a 是透明度（0-1）。 */
export interface Oklch {
  l: number
  c: number
  h: number
  a: number
}

function clampAlpha(value: number): number {
  if (!Number.isFinite(value))
    throw new Error(`颜色透明度必须是有限数值：${value}`)
  return Math.min(1, Math.max(0, value))
}

/* ---------- 换算 ---------- */

/** sRGB 分量（0-1）→ 线性光。 */
export function srgbToLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

/** 线性光 → sRGB 分量（0-1）。 */
export function linearToSrgb(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
}

/** 线性 sRGB → OKLCH（Ottosson 矩阵）。 */
export function linearRgbToOklch(r: number, g: number, b: number, alpha = 1): Oklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(okA, okB)
  let h = (Math.atan2(okB, okA) * 180) / Math.PI
  if (h < 0)
    h += 360
  return { l: okL, c, h, a: clampAlpha(alpha) }
}

/** OKLCH → 线性 sRGB，不截断，色域判定要看原始分量。 */
export function oklchToLinearRgb({ l, c, h }: Oklch): [number, number, number] {
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
  ]
}

function rgb255ToOklch(r: number, g: number, b: number, alpha = 1): Oklch {
  return linearRgbToOklch(
    srgbToLinear(Math.min(255, Math.max(0, r)) / 255),
    srgbToLinear(Math.min(255, Math.max(0, g)) / 255),
    srgbToLinear(Math.min(255, Math.max(0, b)) / 255),
    alpha,
  )
}

function hslToOklch(h: number, s: number, l: number, alpha = 1): Oklch {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = ((h % 360) + 360) % 360 / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let rgb: [number, number, number]
  if (hp < 1)
    rgb = [c, x, 0]
  else if (hp < 2)
    rgb = [x, c, 0]
  else if (hp < 3)
    rgb = [0, c, x]
  else if (hp < 4)
    rgb = [0, x, c]
  else if (hp < 5)
    rgb = [x, 0, c]
  else rgb = [c, 0, x]
  const m = l - c / 2
  return linearRgbToOklch(
    srgbToLinear(rgb[0] + m),
    srgbToLinear(rgb[1] + m),
    srgbToLinear(rgb[2] + m),
    alpha,
  )
}

const NUM = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?`
const ANGLE = String.raw`(${NUM})(deg|grad|rad|turn)?`

function parseAlpha(value: string | undefined, percentage: string | undefined): number {
  if (value === undefined)
    return 1
  return clampAlpha(Number(value) / (percentage ? 100 : 1))
}

function parseHue(value: string, unit: string | undefined): number {
  const angle = Number(value)
  const normalizedUnit = unit?.toLowerCase()
  const degrees = normalizedUnit === 'grad'
    ? angle * 0.9
    : normalizedUnit === 'rad'
      ? angle * 180 / Math.PI
      : normalizedUnit === 'turn'
        ? angle * 360
        : angle
  return ((degrees % 360) + 360) % 360
}

interface FunctionalMatch {
  match: RegExpExecArray
  legacy: boolean
}

function parseRgb(text: string): FunctionalMatch | null {
  const modern = new RegExp(
    String.raw`^rgba?\(\s*(${NUM})(%?)\s+(${NUM})(%?)\s+(${NUM})(%?)(?:\s*\/\s*(${NUM})(%)?)?\s*\)$`,
    'i',
  )
  const legacy = new RegExp(
    String.raw`^rgba?\(\s*(${NUM})(%?)\s*,\s*(${NUM})(%?)\s*,\s*(${NUM})(%?)(?:\s*,\s*(${NUM})(%)?)?\s*\)$`,
    'i',
  )
  const modernMatch = modern.exec(text)
  if (modernMatch)
    return { match: modernMatch, legacy: false }
  const legacyMatch = legacy.exec(text)
  return legacyMatch ? { match: legacyMatch, legacy: true } : null
}

function parseHsl(text: string): RegExpExecArray | null {
  const modern = new RegExp(
    String.raw`^hsla?\(\s*${ANGLE}\s+(${NUM})%\s+(${NUM})%(?:\s*\/\s*(${NUM})(%)?)?\s*\)$`,
    'i',
  )
  const legacy = new RegExp(
    String.raw`^hsla?\(\s*${ANGLE}\s*,\s*(${NUM})%\s*,\s*(${NUM})%(?:\s*,\s*(${NUM})(%)?)?\s*\)$`,
    'i',
  )
  return modern.exec(text) ?? legacy.exec(text)
}

/** 解析 CSS 颜色到 OKLCH。认 #hex、rgb()/rgba()、hsl()/hsla()、oklch()；解不了就抛。 */
export function parseColorToOklch(input: string): Oklch {
  const text = input.trim()

  const hex = /^#([0-9a-f]{3,8})$/i.exec(text)
  if (hex) {
    const digits = hex[1]!
    if (digits.length === 3 || digits.length === 4) {
      const [r, g, b] = [0, 1, 2].map(i => Number.parseInt(digits[i]! + digits[i]!, 16))
      const alpha = digits.length === 4 ? Number.parseInt(digits[3]! + digits[3]!, 16) / 255 : 1
      return rgb255ToOklch(r!, g!, b!, alpha)
    }
    if (digits.length === 6 || digits.length === 8) {
      const [r, g, b] = [0, 2, 4].map(i => Number.parseInt(digits.slice(i, i + 2), 16))
      const alpha = digits.length === 8 ? Number.parseInt(digits.slice(6, 8), 16) / 255 : 1
      return rgb255ToOklch(r!, g!, b!, alpha)
    }
    throw new Error(`无法解析的颜色：${input}`)
  }

  const parsedRgb = parseRgb(text)
  if (parsedRgb) {
    const { match: rgb, legacy } = parsedRgb
    const percentageChannels = [rgb[2], rgb[4], rgb[6]].filter(Boolean).length
    if (legacy && percentageChannels !== 0 && percentageChannels !== 3)
      throw new Error(`rgb 三个通道必须统一使用数值或百分比：${input}`)
    const channel = (v: string, pct: string | undefined): number => (pct ? (Number(v) / 100) * 255 : Number(v))
    return rgb255ToOklch(
      channel(rgb[1]!, rgb[2]),
      channel(rgb[3]!, rgb[4]),
      channel(rgb[5]!, rgb[6]),
      parseAlpha(rgb[7], rgb[8]),
    )
  }

  const hsl = parseHsl(text)
  if (hsl) {
    return hslToOklch(
      parseHue(hsl[1]!, hsl[2]),
      Math.min(1, Math.max(0, Number(hsl[3]) / 100)),
      Math.min(1, Math.max(0, Number(hsl[4]) / 100)),
      parseAlpha(hsl[5], hsl[6]),
    )
  }

  const oklch = new RegExp(
    String.raw`^oklch\(\s*(${NUM})(%?)\s+(${NUM})(%?)\s+${ANGLE}(?:\s*\/\s*(${NUM})(%)?)?\s*\)$`,
    'i',
  ).exec(text)
  if (oklch) {
    const l = Math.min(1, Math.max(0, oklch[2] ? Number(oklch[1]) / 100 : Number(oklch[1])))
    // C 的百分比按规范以 0.4 为 100%
    const c = Math.max(0, oklch[4] ? (Number(oklch[3]) / 100) * 0.4 : Number(oklch[3]))
    return {
      l,
      c,
      h: parseHue(oklch[5]!, oklch[6]),
      a: parseAlpha(oklch[7], oklch[8]),
    }
  }

  throw new Error(`无法解析的颜色：${input}`)
}

/* ---------- 色域 ---------- */

/* 基线梯度自身就带最多 ~0.048 的线性出域量（交给浏览器钳制），容差取同量级：
   在这个量级内不动种子的彩度，超出才收，钳制造成的色相偏移就压在基线同等水平内。 */
const GAMUT_EPS = 0.05

/** 这个 OKLCH 落不落在 sRGB 色域内（带基线同量级的容差）。 */
export function inSrgbGamut(color: Oklch): boolean {
  return oklchToLinearRgb(color).every(v => v >= -GAMUT_EPS && v <= 1 + GAMUT_EPS)
}

/** 固定 L 与 H，把 C 收到 sRGB 色域内的最大可用值。 */
export function clampChroma(l: number, c: number, h: number): number {
  if (inSrgbGamut({ l, c, h, a: 1 }))
    return c
  let lo = 0
  let hi = c
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2
    if (inSrgbGamut({ l, c: mid, h, a: 1 }))
      lo = mid
    else hi = mid
  }
  return lo
}

function fmt(n: number, digits: number): string {
  return String(Number(n.toFixed(digits)))
}

function exact(n: number): string {
  return Object.is(n, -0) ? '0' : String(n)
}

/** OKLCH → CSS 颜色串，彩度按色域收过；不透明时省略 alpha。 */
export function formatOklch({ l, c, h, a }: Oklch): string {
  const body = `${fmt(l, 3)} ${fmt(clampChroma(l, c, h), 3)} ${fmt(h, 2)}`
  const alpha = clampAlpha(a)
  return alpha === 1 ? `oklch(${body})` : `oklch(${body} / ${exact(alpha)})`
}

/* ---------- 亮度与对比度 ---------- */

function toSrgb(color: Oklch): [number, number, number] {
  return oklchToLinearRgb(color)
    .map(v => linearToSrgb(Math.min(1, Math.max(0, v)))) as [number, number, number]
}

/** CSS source-over：先把颜色换成 sRGB 编码通道，再按预乘 alpha 合成。 */
function compositeOklch(foreground: Oklch, backdrop: Oklch): Oklch {
  const foregroundAlpha = clampAlpha(foreground.a)
  const backdropAlpha = clampAlpha(backdrop.a)
  if (foregroundAlpha === 1)
    return { ...foreground, a: 1 }
  const alpha = foregroundAlpha + backdropAlpha * (1 - foregroundAlpha)
  if (alpha === 0)
    return { l: 0, c: 0, h: 0, a: 0 }
  if (foregroundAlpha === 0)
    return { ...backdrop, a: backdropAlpha }

  const foregroundRgb = toSrgb(foreground)
  const backdropRgb = toSrgb(backdrop)
  const rgb = foregroundRgb.map((channel, index) => (
    channel * foregroundAlpha
    + backdropRgb[index]! * backdropAlpha * (1 - foregroundAlpha)
  ) / alpha) as [number, number, number]

  return linearRgbToOklch(
    srgbToLinear(rgb[0]),
    srgbToLinear(rgb[1]),
    srgbToLinear(rgb[2]),
    alpha,
  )
}

/** 把 foreground 以 CSS source-over 叠在 backdrop 上，保留尚未铺满时的结果 alpha。 */
export function compositeColors(foreground: string, backdrop: string): string {
  const { l, c, h, a } = compositeOklch(
    parseColorToOklch(foreground),
    parseColorToOklch(backdrop),
  )
  const body = `${exact(l)} ${exact(clampChroma(l, c, h))} ${exact(h)}`
  return a === 1 ? `oklch(${body})` : `oklch(${body} / ${exact(a)})`
}

function requireOpaque(color: Oklch, backdrop: string | undefined): Oklch {
  if (color.a === 1)
    return color
  if (backdrop === undefined)
    throw new Error('半透明颜色必须提供最终不透明背景后才能计算亮度或对比度')
  const resolved = compositeOklch(color, parseColorToOklch(backdrop))
  if (resolved.a !== 1)
    throw new Error('颜色与背景合成后仍然透明，必须提供最终不透明背景')
  return resolved
}

function luminanceOf(color: Oklch): number {
  const [r, g, b] = oklchToLinearRgb(color)
    .map(v => Math.min(1, Math.max(0, v))) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 白字与黑字对比度相等的那一点。
 *
 * 解 (1.05)/(Y+0.05) = (Y+0.05)/0.05 得 Y = √0.0525 − 0.05 ≈ 0.179。
 * 底色的相对亮度高于它就该配深字，低于它配浅字。
 */
export const ON_COLOR_CROSSOVER = 0.179

/** WCAG 相对亮度（0-1）。透明色必须同时提供最终不透明背景。 */
export function relativeLuminance(color: string, backdrop?: string): number {
  return luminanceOf(requireOpaque(parseColorToOklch(color), backdrop))
}

/** WCAG 对比度。透明背景需要最终 backdrop；透明前景压在解析后的背景上。 */
export function contrastRatio(foreground: string, background: string, backdrop?: string): number {
  const resolvedBackground = requireOpaque(parseColorToOklch(background), backdrop)
  const resolvedForeground = compositeOklch(parseColorToOklch(foreground), resolvedBackground)
  const [hi, lo] = [luminanceOf(resolvedForeground), luminanceOf(resolvedBackground)]
    .sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** 对比度阈值：正文 4.5、大字与非文字图形 3、加强档 7。 */
export const CONTRAST_MIN = { text: 4.5, large: 3, graphic: 3, enhanced: 7 } as const

/** 这一对够不够某一档阈值。 */
export function meetsContrast(
  foreground: string,
  background: string,
  level: keyof typeof CONTRAST_MIN = 'text',
  backdrop?: string,
): boolean {
  return contrastRatio(foreground, background, backdrop) >= CONTRAST_MIN[level]
}

/* ---------- 择色 ---------- */

/** 择色时用哪两档。缺省是纯白与纯黑——它们把对比度拉到最大。 */
export interface PickColorOptions {
  light?: string
  dark?: string
  /** background 自身透明时所压的最终不透明底色。 */
  backdrop?: string
}

const DEFAULT_PICK = { light: '#ffffff', dark: '#000000' } as const

/**
 * 压在这个底色上读得清的那一档：底色暗取浅色、亮取深色。
 *
 * 判据是 WCAG 相对亮度而不是 OKLCH 的 L——后者不含通道权重，
 * 同一个 L 上红与绿的实际亮度差得很远，按 L 分派会挑错边。
 */
export function pickOnColor(background: string, opts: PickColorOptions = {}): string {
  const { light = DEFAULT_PICK.light, dark = DEFAULT_PICK.dark, backdrop } = opts
  return contrastRatio(light, background, backdrop) >= contrastRatio(dark, background, backdrop)
    ? light
    : dark
}

/**
 * 交互态该往哪一侧挪：恒取 pickOnColor 的反面。
 *
 * 悬停与按下把底色往这个方向兑，对比度只会升不会降；
 * 跟着前景走的话，底色会越挪越贴近字色。
 */
export function pickAwayColor(background: string, opts: PickColorOptions = {}): string {
  const { light = DEFAULT_PICK.light, dark = DEFAULT_PICK.dark } = opts
  return pickOnColor(background, opts) === light ? dark : light
}

/* ---------- 变换 ---------- */

function oklchToOklab({ l, c, h }: Oklch): [number, number, number] {
  const hr = (h * Math.PI) / 180
  return [l, c * Math.cos(hr), c * Math.sin(hr)]
}

function oklabToOklch(l: number, a: number, b: number, alpha: number): Oklch {
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0)
    h += 360
  return { l, c: Math.hypot(a, b), h, a: clampAlpha(alpha) }
}

/**
 * 按比例混两个颜色，与 CSS 的 `color-mix(in oklab, a <weight>%, b)` 同一条路。
 *
 * weight 是 a 占的比例（0-1）。在 oklab 里插值而不是 oklch：
 * oklch 走的是极坐标，色相会绕远路，与 CSS 那条对不上。
 */
export function mixColors(a: string, b: string, weight = 0.5): string {
  const w = Math.min(1, Math.max(0, weight))
  const left = parseColorToOklch(a)
  const right = parseColorToOklch(b)
  const [al, aa, ab] = oklchToOklab(left)
  const [bl, ba, bb] = oklchToOklab(right)
  const leftWeight = left.a * w
  const rightWeight = right.a * (1 - w)
  const alpha = leftWeight + rightWeight
  if (alpha === 0)
    return formatOklch({ l: 0, c: 0, h: 0, a: 0 })
  return formatOklch(oklabToOklch(
    (al * leftWeight + bl * rightWeight) / alpha,
    (aa * leftWeight + ba * rightWeight) / alpha,
    (ab * leftWeight + bb * rightWeight) / alpha,
    alpha,
  ))
}

/** 提亮：把 OKLCH 的 L 往 1 抬 amount（0-1），彩度按色域收。 */
export function lighten(color: string, amount: number): string {
  const { l, c, h, a } = parseColorToOklch(color)
  return formatOklch({ l: Math.min(1, l + amount), c, h, a })
}

/** 压暗：把 OKLCH 的 L 往 0 压 amount（0-1），彩度按色域收。 */
export function darken(color: string, amount: number): string {
  const { l, c, h, a } = parseColorToOklch(color)
  return formatOklch({ l: Math.max(0, l - amount), c, h, a })
}

/** 换一档不透明度，产出 `oklch(l c h / a)`。原色自带的 alpha 不保留。 */
export function withAlpha(color: string, alpha: number): string {
  const { l, c, h } = parseColorToOklch(color)
  return formatOklch({ l, c, h, a: clampAlpha(alpha) })
}
