// @vitest-environment jsdom
// 品牌派生的判据用独立实现核对：oklch → 线性 sRGB 的换算照 CSS Color 4 公式另写一份，
// 不复用被测代码。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { colorParseOklch } from '@xihan-ui/core/color'
import { afterEach, describe, expect, it } from 'vitest'
import { brandScaleCss, deriveBrandScale, registerBrand } from '../src/runtime'

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

function parseOklchString(css: string): { l: number, c: number, h: number } {
  const m = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(css)
  if (!m)
    throw new Error(`不是 oklch 颜色：${css}`)
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) }
}

/** 独立换算：oklch → 线性 sRGB，不截断。 */
function toLinearRgb({ l, c, h }: { l: number, c: number, h: number }): [number, number, number] {
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

/** 基线品牌曲线：基础色板色相 258 的 indigo（原缺省品牌）。缺省品牌 color.brand 换成色相 277 后不再是这条曲线本身。 */
const brandPrimitives = (() => {
  const raw = JSON.parse(
    readFileSync(join(import.meta.dirname, '../tokens/primitive.palette.json'), 'utf8'),
  ) as { color: { indigo: Record<string, { $value: string }> } }
  return raw.color.indigo
})()

describe('deriveBrandScale', () => {
  it('拒绝透明品牌种子，不把背景相关颜色静默当成实体品牌色', () => {
    expect(() => deriveBrandScale('rgb(59 130 246 / 50%)')).toThrow(/不透明/)
  })

  it('基线 600 档当种子 → 派生结果与基线曲线逐值一致', () => {
    const scale = deriveBrandScale(brandPrimitives['600']!.$value)
    for (const step of STEPS) {
      const derived = parseOklchString(scale[step])
      const base = parseOklchString(brandPrimitives[step]!.$value)
      expect(derived.l, `L@${step}`).toBeCloseTo(base.l, 3)
      expect(derived.c, `C@${step}`).toBeCloseTo(base.c, 3)
      expect(derived.h, `H@${step}`).toBeCloseTo(base.h, 1)
    }
  })

  it('明度曲线不随种子变：任意种子的 L 逐档等于基线', () => {
    for (const seed of ['#16a34a', '#e11d48', 'hsl(280 80% 40%)', '#111111']) {
      const scale = deriveBrandScale(seed)
      for (const step of STEPS) {
        const base = parseOklchString(brandPrimitives[step]!.$value)
        expect(parseOklchString(scale[step]).l, `${seed}@${step}`).toBeCloseTo(base.l, 3)
      }
    }
  })

  it('灰种子 → 全梯度彩度归零', () => {
    const scale = deriveBrandScale('#808080')
    for (const step of STEPS)
      expect(parseOklchString(scale[step]).c).toBeLessThan(0.001)
  })

  it('超饱和种子逐档收到基线同量级的出域容差内，且确实收过', () => {
    // 彩度拉满的绿：k ≈ 1.7，不收就会大面积出域
    const seed = 'oklch(0.7 0.37 145)'
    const scale = deriveBrandScale(seed)
    const k = 0.37 / 0.216
    let clampedSteps = 0
    for (const step of STEPS) {
      const { c } = parseOklchString(scale[step])
      const rgb = toLinearRgb(parseOklchString(scale[step]))
      for (const v of rgb) {
        expect(v).toBeGreaterThanOrEqual(-0.056)
        expect(v).toBeLessThanOrEqual(1.056)
      }
      const base = parseOklchString(brandPrimitives[step]!.$value)
      if (c < base.c * k - 0.002)
        clampedSteps++
    }
    expect(clampedSteps).toBeGreaterThan(0)
  })

  it('色相原样落到每一档', () => {
    const seedHue = colorParseOklch('#e11d48')!.h
    const scale = deriveBrandScale('#e11d48')
    for (const step of STEPS)
      expect(parseOklchString(scale[step]).h).toBeCloseTo(seedHue, 1)
  })
})

describe('brandScaleCss', () => {
  it('输出 [data-brand] 取值块，11 档齐全', () => {
    const css = brandScaleCss('acme', '#16a34a')
    expect(css).toMatch(/^\[data-brand='acme'\] \{/)
    for (const step of STEPS)
      expect(css).toContain(`--xh-color-brand-${step}:`)
  })

  it('显式梯度原样透传', () => {
    const scale = Object.fromEntries(STEPS.map(s => [s, `oklch(0.5 0.1 ${s})`])) as Record<(typeof STEPS)[number], string>
    const css = brandScaleCss('acme', scale)
    expect(css).toContain('--xh-color-brand-950: oklch(0.5 0.1 950);')
  })

  it('缺档的梯度拒收', () => {
    const partial = { 50: 'oklch(0.9 0.1 100)' } as never
    expect(() => brandScaleCss('acme', partial)).toThrow('100')
  })

  it('非法 id 拒收，选择器注入不进来', () => {
    for (const bad of ['Acme', 'a b', 'x\'] * { color: red } [\'', '1st', ''])
      expect(() => brandScaleCss(bad, '#16a34a'), bad).toThrow()
  })
})

describe('registerBrand', () => {
  afterEach(() => {
    for (const el of document.head.querySelectorAll('style[data-xh-brand]'))
      el.remove()
  })

  it('注入样式元素，重复注册同 id 只留一份', () => {
    registerBrand('acme', '#16a34a')
    registerBrand('acme', '#e11d48')
    const els = document.head.querySelectorAll(`style[data-xh-brand='acme']`)
    expect(els.length).toBe(1)
    const seedHue = colorParseOklch('#e11d48')!.h
    expect(els[0]!.textContent).toContain(`oklch(0.546`)
    expect(els[0]!.textContent).toContain(String(Number(seedHue.toFixed(2))))
  })

  it('返回的清理函数移除样式', () => {
    const dispose = registerBrand('acme', '#16a34a')
    dispose()
    expect(document.head.querySelector(`style[data-xh-brand='acme']`)).toBeNull()
  })

  it('不同 id 并存互不覆盖', () => {
    registerBrand('acme', '#16a34a')
    registerBrand('umbrella', '#e11d48')
    expect(document.head.querySelectorAll('style[data-xh-brand]').length).toBe(2)
  })
})
