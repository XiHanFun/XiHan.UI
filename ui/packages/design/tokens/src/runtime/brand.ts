import { formatOklch, parseColorToOklch } from './color'

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

/* ---------- 派生 ---------- */

/**
 * 种子色 → 11 档品牌原语。色相取种子的，彩度按 种子C / 基线600档C 等比缩放并逐档收进
 * sRGB 色域，明度曲线原样保留。用基线 600 档当种子会得到与基线逐值一致的一套。
 */
export function deriveBrandScale(seed: string): BrandScale {
  const { c, h } = parseColorToOklch(seed)
  const k = c / BASE_C[ANCHOR_STEP]
  const out = {} as BrandScale
  for (const step of BRAND_STEPS) {
    out[step] = formatOklch({ l: BASE_L[step], c: BASE_C[step] * k, h })
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
