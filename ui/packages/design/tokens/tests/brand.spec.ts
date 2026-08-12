// @vitest-environment jsdom
// 品牌派生的判据用独立实现核对：oklch → 线性 sRGB 的换算照 CSS Color 4 公式另写一份，
// 不复用被测代码。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { brandScaleCss, deriveBrandScale, parseColorToOklch, registerBrand } from '../src/runtime'

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

const brandPrimitives = (() => {
  const raw = JSON.parse(
    readFileSync(join(import.meta.dirname, '../tokens/primitive.json'), 'utf8'),
  ) as { color: { brand: Record<string, { $value: string }> } }
  return raw.color.brand
})()

describe('parseColorToOklch', () => {
  it('四种写法解析同一颜色到同一 OKLCH', () => {
    const forms = ['#3b82f6', '#3B82F6', 'rgb(59 130 246)', 'rgb(59, 130, 246)', 'rgba(59,130,246,0.5)']
    const results = forms.map(parseColorToOklch)
    for (const r of results) {
      expect(r.l).toBeCloseTo(results[0]!.l, 5)
      expect(r.c).toBeCloseTo(results[0]!.c, 5)
      expect(r.h).toBeCloseTo(results[0]!.h, 3)
    }
  })

  it('短 hex 与长 hex 等价', () => {
    const a = parseColorToOklch('#f00')
    const b = parseColorToOklch('#ff0000')
    expect(a.l).toBeCloseTo(b.l, 6)
    expect(a.c).toBeCloseTo(b.c, 6)
  })

  it('纯红换算到已知 OKLCH 值', () => {
    // oklch(0.6280 0.2577 29.23) 是 #ff0000 的公认换算结果
    const red = parseColorToOklch('#ff0000')
    expect(red.l).toBeCloseTo(0.628, 2)
    expect(red.c).toBeCloseTo(0.2577, 2)
    expect(red.h).toBeCloseTo(29.23, 0)
  })

  it('hsl 与等值 rgb 一致', () => {
    const fromHsl = parseColorToOklch('hsl(0 100% 50%)')
    const fromRgb = parseColorToOklch('rgb(255 0 0)')
    expect(fromHsl.l).toBeCloseTo(fromRgb.l, 5)
    expect(fromHsl.h).toBeCloseTo(fromRgb.h, 3)
  })

  it('oklch 直读，百分号明度与 0.4 基准彩度按规范折算', () => {
    const a = parseColorToOklch('oklch(0.546 0.216 258)')
    expect(a).toEqual({ l: 0.546, c: 0.216, h: 258 })
    const b = parseColorToOklch('oklch(54.6% 54% 258deg)')
    expect(b.l).toBeCloseTo(0.546, 6)
    expect(b.c).toBeCloseTo(0.216, 6)
  })

  it('解不了的输入直接抛', () => {
    for (const bad of ['', 'blue', 'var(--x)', '#12345', 'rgb(1 2)', 'oklch(1)'])
      expect(() => parseColorToOklch(bad), bad).toThrow()
  })
})

describe('deriveBrandScale', () => {
  it('基线 600 档当种子 → 派生结果与 primitive.json 逐值一致', () => {
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
    const seedHue = parseColorToOklch('#e11d48').h
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
    for (const el of [...document.head.querySelectorAll('style[data-xh-brand]')])
      el.remove()
  })

  it('注入样式元素，重复注册同 id 只留一份', () => {
    registerBrand('acme', '#16a34a')
    registerBrand('acme', '#e11d48')
    const els = document.head.querySelectorAll(`style[data-xh-brand='acme']`)
    expect(els.length).toBe(1)
    const seedHue = parseColorToOklch('#e11d48').h
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
