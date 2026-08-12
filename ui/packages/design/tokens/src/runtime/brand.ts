// 品牌轴的取值来源：把一枚种子色派生成整套 brand 原语（--xh-color-brand-50…950），
// 以 [data-brand='<id>'] 取值块注入。派生只取种子的色相与彩度，明度曲线沿用基线，
// 语义层与语气层建立在明度之上的对比度保证因此对任何种子都成立。

const BRAND_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

export type BrandStep = (typeof BRAND_STEPS)[number]

/** 一套完整的品牌原语：11 档，值是任意可解析的 CSS 颜色。 */
export type BrandScale = Record<BrandStep, string>

/* 基线品牌曲线（与 tokens/primitive.json 的 color.brand 逐值一致，有测试守着不漂移）。
   L 决定对比度，C 决定饱和感；派生时 L 原样保留、C 按种子等比缩放。 */
const BASE_L: Record<BrandStep, number> = {
  50: 0.971,
  100: 0.936,
  200: 0.885,
  300: 0.809,
  400: 0.702,
  500: 0.623,
  600: 0.546,
  700: 0.488,
  800: 0.424,
  900: 0.379,
  950: 0.282,
}
const BASE_C: Record<BrandStep, number> = {
  50: 0.014,
  100: 0.032,
  200: 0.062,
  300: 0.105,
  400: 0.165,
  500: 0.214,
  600: 0.216,
  700: 0.196,
  800: 0.164,
  900: 0.132,
  950: 0.089,
}
/** 种子锚定在 600 档：那是实心底与强调文字用的档位。 */
const ANCHOR_STEP: BrandStep = '600'

interface Oklch {
  l: number
  c: number
  h: number
}

/* ---------- 颜色解析：hex / rgb() / hsl() / oklch() ---------- */

function srgbToLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

/** 线性 sRGB → OKLCH（Ottosson 矩阵）。 */
function linearRgbToOklch(r: number, g: number, b: number): Oklch {
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
  return { l: okL, c, h }
}

/** OKLCH → 线性 sRGB，不截断，色域判定要看原始分量。 */
function oklchToLinearRgb({ l, c, h }: Oklch): [number, number, number] {
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

function rgb255ToOklch(r: number, g: number, b: number): Oklch {
  return linearRgbToOklch(srgbToLinear(r / 255), srgbToLinear(g / 255), srgbToLinear(b / 255))
}

function hslToOklch(h: number, s: number, l: number): Oklch {
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
  return linearRgbToOklch(srgbToLinear(rgb[0] + m), srgbToLinear(rgb[1] + m), srgbToLinear(rgb[2] + m))
}

const NUM = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)`
const SEP = String.raw`(?:\s*,\s*|\s+)`

/** 解析 CSS 颜色到 OKLCH。认 #hex、rgb()/rgba()、hsl()/hsla()、oklch()；解不了就抛。 */
export function parseColorToOklch(input: string): Oklch {
  const text = input.trim()

  const hex = /^#([0-9a-f]{3,8})$/i.exec(text)
  if (hex) {
    const digits = hex[1]!
    if (digits.length === 3 || digits.length === 4) {
      const [r, g, b] = [0, 1, 2].map(i => Number.parseInt(digits[i]! + digits[i]!, 16))
      return rgb255ToOklch(r!, g!, b!)
    }
    if (digits.length === 6 || digits.length === 8) {
      const [r, g, b] = [0, 2, 4].map(i => Number.parseInt(digits.slice(i, i + 2), 16))
      return rgb255ToOklch(r!, g!, b!)
    }
    throw new Error(`无法解析的颜色：${input}`)
  }

  const rgb = new RegExp(
    String.raw`^rgba?\(\s*(${NUM})(%?)${SEP}(${NUM})(%?)${SEP}(${NUM})(%?)\s*(?:[,/][^)]*)?\)$`,
    'i',
  ).exec(text)
  if (rgb) {
    const channel = (v: string, pct: string): number => (pct ? (Number(v) / 100) * 255 : Number(v))
    return rgb255ToOklch(channel(rgb[1]!, rgb[2]!), channel(rgb[3]!, rgb[4]!), channel(rgb[5]!, rgb[6]!))
  }

  const hsl = new RegExp(
    String.raw`^hsla?\(\s*(${NUM})(?:deg)?${SEP}(${NUM})%${SEP}(${NUM})%\s*(?:[,/][^)]*)?\)$`,
    'i',
  ).exec(text)
  if (hsl)
    return hslToOklch(Number(hsl[1]), Number(hsl[2]) / 100, Number(hsl[3]) / 100)

  const oklch = new RegExp(
    String.raw`^oklch\(\s*(${NUM})(%?)\s+(${NUM})(%?)\s+(${NUM})(?:deg)?\s*(?:/[^)]*)?\)$`,
    'i',
  ).exec(text)
  if (oklch) {
    const l = oklch[2] ? Number(oklch[1]) / 100 : Number(oklch[1])
    // C 的百分比按规范以 0.4 为 100%
    const c = oklch[4] ? (Number(oklch[3]) / 100) * 0.4 : Number(oklch[3])
    return { l, c, h: ((Number(oklch[5]) % 360) + 360) % 360 }
  }

  throw new Error(`无法解析的颜色：${input}`)
}

/* ---------- 派生 ---------- */

/* 基线梯度自身就带最多 ~0.048 的线性出域量（交给浏览器钳制），容差取同量级：
   在这个量级内不动种子的彩度，超出才收，钳制造成的色相偏移就压在基线同等水平内。 */
const GAMUT_EPS = 0.05

function inSrgbGamut(color: Oklch): boolean {
  return oklchToLinearRgb(color).every(v => v >= -GAMUT_EPS && v <= 1 + GAMUT_EPS)
}

/** 固定 L 与 H，把 C 收到 sRGB 色域内的最大可用值。 */
function clampChroma(l: number, c: number, h: number): number {
  if (inSrgbGamut({ l, c, h }))
    return c
  let lo = 0
  let hi = c
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2
    if (inSrgbGamut({ l, c: mid, h }))
      lo = mid
    else hi = mid
  }
  return lo
}

function fmt(n: number, digits: number): string {
  return String(Number(n.toFixed(digits)))
}

/**
 * 种子色 → 11 档品牌原语。色相取种子的，彩度按 种子C / 基线600档C 等比缩放并逐档收进
 * sRGB 色域，明度曲线原样保留。用基线 600 档当种子会得到与基线逐值一致的一套。
 */
export function deriveBrandScale(seed: string): BrandScale {
  const { c, h } = parseColorToOklch(seed)
  const k = c / BASE_C[ANCHOR_STEP]
  const out = {} as BrandScale
  for (const step of BRAND_STEPS) {
    const l = BASE_L[step]
    const chroma = clampChroma(l, BASE_C[step] * k, h)
    out[step] = `oklch(${fmt(l, 3)} ${fmt(chroma, 3)} ${fmt(h, 2)})`
  }
  return out
}

/* ---------- 注入 ---------- */

const BRAND_ID_PATTERN = /^[a-z][a-z0-9-]*$/

function assertBrandRegistryId(id: string): void {
  if (!BRAND_ID_PATTERN.test(id))
    throw new Error(`品牌 id 只允许小写字母开头、小写字母/数字/连字符组成：${id}`)
}

function toScale(seedOrScale: string | BrandScale): BrandScale {
  if (typeof seedOrScale === 'string')
    return deriveBrandScale(seedOrScale)
  const out = {} as BrandScale
  for (const step of BRAND_STEPS) {
    const value = seedOrScale[step]
    if (typeof value !== 'string' || !value.trim())
      throw new Error(`品牌梯度缺少 ${step} 档`)
    out[step] = value.trim()
  }
  return out
}

/** 一个品牌 id 的取值块。选择器不在任何 @layer 里，稳压生成产物里零特异度的原语声明。 */
export function brandScaleCss(id: string, seedOrScale: string | BrandScale): string {
  assertBrandRegistryId(id)
  const scale = toScale(seedOrScale)
  const lines = BRAND_STEPS.map(step => `  --xh-color-brand-${step}: ${scale[step]};`)
  return `[data-brand='${id}'] {\n${lines.join('\n')}\n}`
}

export interface RegisterBrandOptions {
  /** 注入样式的文档，默认当前 document。 */
  doc?: Document
}

/**
 * 把一个品牌注册进文档：注入（或替换）该 id 的 [data-brand] 取值块。
 * 之后 setPreference({ brand }) 切到这个 id 即生效。返回移除函数。
 * SSR 下没有可注入的文档，请改用 brandScaleCss 把取值块随首屏 HTML 下发。
 */
export function registerBrand(id: string, seedOrScale: string | BrandScale, opts: RegisterBrandOptions = {}): () => void {
  const doc = opts.doc ?? (typeof document === 'undefined' ? undefined : document)
  if (!doc)
    throw new Error('registerBrand 需要 document；SSR 场景请用 brandScaleCss 随首屏 HTML 下发取值块')
  const css = brandScaleCss(id, seedOrScale)
  let el = doc.head.querySelector<HTMLStyleElement>(`style[data-xh-brand='${id}']`)
  if (!el) {
    el = doc.createElement('style')
    el.setAttribute('data-xh-brand', id)
    doc.head.appendChild(el)
  }
  el.textContent = css
  return () => {
    el?.remove()
    el = null
  }
}
