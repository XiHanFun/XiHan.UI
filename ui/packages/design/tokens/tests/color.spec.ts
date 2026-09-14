// 颜色能力：亮度、对比度、择色、混色与深浅。
// 最后一组把皮肤那份 CSS 配方的判据读出来与本模块对账——两处算的必须是同一件事。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  compositeColors,
  CONTRAST_MIN,
  contrastRatio,
  darken,
  formatOklch,
  lighten,
  meetsContrast,
  mixColors,
  ON_COLOR_CROSSOVER,
  parseColorToOklch,
  pickAwayColor,
  pickOnColor,
  relativeLuminance,
  withAlpha,
} from '../src/runtime/color'

const WHITE = '#ffffff'
const BLACK = '#000000'

/** CSS source-over 在 sRGB 通道合成，再按 WCAG 线性化求亮度。 */
function halfSrgbLuminance(): number {
  return ((0.5 + 0.055) / 1.055) ** 2.4
}

/** 铺一层覆盖色相与明度的样本，性质断言按它逐个过。 */
function sampleColors(): string[] {
  const out: string[] = []
  for (let h = 0; h < 360; h += 15) {
    for (const l of [0.15, 0.3, 0.45, 0.55, 0.62, 0.7, 0.85]) {
      for (const c of [0, 0.08, 0.18]) out.push(`oklch(${l} ${c} ${h})`)
    }
  }
  return out
}

describe('相对亮度', () => {
  it('白是 1、黑是 0', () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 6)
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 6)
  })

  it('认 hex / rgb / hsl / oklch 四种写法，同一个颜色算出同一个值', () => {
    const ys = ['#5887f7', 'rgb(88, 135, 247)', 'hsl(222.3 90.9% 65.7%)']
      .map(color => relativeLuminance(color))
    expect(ys[1]).toBeCloseTo(ys[0]!, 6)
    expect(ys[2]).toBeCloseTo(ys[0]!, 2)
    // 这枚是某消费方的出厂主色，压白字只有 3.37
    expect(ys[0]).toBeCloseTo(0.261, 2)
  })
})

describe('透明颜色与背景合成', () => {
  it('hex、rgb、hsl 与 oklch 都保留 alpha，未声明时为 1', () => {
    expect(parseColorToOklch('#1234').a).toBeCloseTo(0x44 / 255, 6)
    expect(parseColorToOklch('#11223380').a).toBeCloseTo(0x80 / 255, 6)
    expect(parseColorToOklch('rgb(17 34 51 / 40%)').a).toBeCloseTo(0.4, 6)
    expect(parseColorToOklch('rgba(17, 34, 51, 0.4)').a).toBeCloseTo(0.4, 6)
    expect(parseColorToOklch('hsl(210 50% 13.3% / 40%)').a).toBeCloseTo(0.4, 6)
    expect(parseColorToOklch('hsla(210, 50%, 13.3%, 0.4)').a).toBeCloseTo(0.4, 6)
    expect(parseColorToOklch('oklch(0.25 0.04 250 / 40%)').a).toBeCloseTo(0.4, 6)
    expect(parseColorToOklch('#123').a).toBe(1)
  })

  it('现代 rgb 允许数值与百分比通道混用，逗号旧语法仍要求统一', () => {
    const mixed = parseColorToOklch('rgb(17% 34 51% / 40%)')
    const numeric = parseColorToOklch('rgb(43.35 34 130.05 / 0.4)')
    expect(mixed.l).toBeCloseTo(numeric.l, 6)
    expect(mixed.c).toBeCloseTo(numeric.c, 6)
    expect(mixed.h).toBeCloseTo(numeric.h, 6)
    expect(mixed.a).toBeCloseTo(0.4, 6)
    expect(() => parseColorToOklch('rgb(17%, 34, 51%)')).toThrow(/统一/)
  })

  it('hsl 与 oklch 接受完整角度单位，并按 CSS 规则钳制 oklch 的 L/C', () => {
    const hslHue = parseColorToOklch('hsl(180deg 50% 50%)').h
    const equivalentHslHues = [
      parseColorToOklch('hsl(200grad 50% 50%)').h,
      parseColorToOklch(`hsl(${Math.PI}rad 50% 50%)`).h,
      parseColorToOklch('hsl(0.5TURN 50% 50%)').h,
    ]
    for (const hue of equivalentHslHues) expect(hue).toBeCloseTo(hslHue, 6)
    expect(parseColorToOklch('oklch(0.5 0.1 0.5turn)').h).toBeCloseTo(180, 6)
    expect(parseColorToOklch('oklch(120% -0.1 20)')).toMatchObject({ l: 1, c: 0 })
    expect(parseColorToOklch('oklch(-0.2 0.1 20)').l).toBe(0)
  })

  it('拒绝无法解释的 alpha，不把错误输入当成不透明色', () => {
    for (const color of [
      'rgb(17 34 51 / nope)',
      'rgba(17, 34, 51, nope)',
      'rgb(17 34, 51 / 40%)',
      'hsl(210 50% 13.3% / nope)',
      'hsla(210 50%, 13.3%, 0.4)',
      'oklch(0.25 0.04 250 / nope)',
    ]) expect(() => parseColorToOklch(color), color).toThrow()
  })

  it('按 CSS 规则把数值和百分比 alpha 钳在 0 到 1', () => {
    expect(parseColorToOklch('rgb(17 34 51 / -0.2)').a).toBe(0)
    expect(parseColorToOklch('hsl(210 50% 13.3% / 120%)').a).toBe(1)
    expect(parseColorToOklch('oklch(0.25 0.04 250 / 2)').a).toBe(1)
  })

  it('按 CSS sRGB source-over 合成，再以合成像素计算亮度和对比度', () => {
    const composite = compositeColors('rgb(0 0 0 / 50%)', WHITE)
    expect(parseColorToOklch(composite).a).toBe(1)
    expect(relativeLuminance(composite)).toBeCloseTo(halfSrgbLuminance(), 3)
    expect(relativeLuminance('rgb(0 0 0 / 50%)', WHITE)).toBeCloseTo(halfSrgbLuminance(), 6)
    expect(contrastRatio('rgb(0 0 0 / 50%)', WHITE))
      .toBeCloseTo(1.05 / (halfSrgbLuminance() + 0.05), 3)
  })

  it('半透明背景必须给出最终底色，不能继续按不透明色计算', () => {
    expect(() => relativeLuminance('rgb(255 255 255 / 50%)')).toThrow(/背景/)
    expect(() => contrastRatio(BLACK, 'rgb(255 255 255 / 50%)')).toThrow(/背景/)
    expect(contrastRatio(BLACK, 'rgb(255 255 255 / 50%)', BLACK))
      .toBeCloseTo((halfSrgbLuminance() + 0.05) / 0.05, 6)
    expect(meetsContrast(BLACK, 'rgb(255 255 255 / 50%)', 'text', BLACK)).toBe(true)
    expect(
      contrastRatio('rgb(0 0 0 / 50%)', WHITE),
    ).not.toBeCloseTo(contrastRatio(WHITE, 'rgb(0 0 0 / 50%)', BLACK), 2)
  })

  it('连续合成保留结果 alpha，格式化不会再次丢失', () => {
    const composite = compositeColors('rgb(255 0 0 / 50%)', 'rgb(0 0 255 / 50%)')
    const parsed = parseColorToOklch(composite)
    expect(parsed.a).toBeCloseTo(0.75, 3)
    expect(formatOklch(parsed)).toContain('/ 0.75')
  })

  it('全透明前景不改变背景，全不透明前景完全覆盖背景', () => {
    expect(relativeLuminance(compositeColors('rgb(255 0 0 / 0)', '#336699')))
      .toBeCloseTo(relativeLuminance('#336699'), 3)
    expect(relativeLuminance(compositeColors('#ffffff', 'rgb(0 0 0 / 20%)')))
      .toBeCloseTo(1, 6)
    expect(parseColorToOklch(compositeColors('rgb(255 0 0 / 0)', 'rgb(0 0 255 / 0)')))
      .toEqual({ l: 0, c: 0, h: 0, a: 0 })
  })

  it('格式化与连续合成都保留接近不透明的 alpha 精度', () => {
    const formatted = formatOklch({ l: 0.5, c: 0.1, h: 200, a: 0.9999999 })
    expect(formatted).toContain('/ 0.9999999')
    expect(parseColorToOklch(formatted).a).toBeCloseTo(0.9999999, 7)
    expect(parseColorToOklch(compositeColors(
      'rgb(0 0 0 / 99.99%)',
      'rgb(255 255 255 / 99.99%)',
    )).a).toBeCloseTo(0.99999999, 8)
  })

  it('合成结果往返不会把临界对比度从通过翻成失败', () => {
    const surface = 'rgb(0 0 0 / 21%)'
    const backdrop = 'rgb(147 147 147)'
    const direct = contrastRatio(BLACK, surface, backdrop)
    const serialized = contrastRatio(BLACK, compositeColors(surface, backdrop))
    expect(direct).toBeGreaterThan(4.5)
    expect(serialized).toBeCloseTo(direct, 6)
  })
})

describe('对比度', () => {
  it('黑白是 21，自己压自己是 1', () => {
    expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 1)
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 6)
  })

  it('与前后次序无关', () => {
    expect(contrastRatio('#123456', '#abcdef')).toBeCloseTo(contrastRatio('#abcdef', '#123456'), 9)
  })

  it('阈值判定按档走', () => {
    expect(meetsContrast(BLACK, WHITE, 'enhanced')).toBe(true)
    // 4.54，够正文不够加强档
    expect(meetsContrast('#767676', WHITE, 'text')).toBe(true)
    expect(meetsContrast('#767676', WHITE, 'enhanced')).toBe(false)
    expect(CONTRAST_MIN.text).toBe(4.5)
  })
})

describe('择色', () => {
  it('交叉点取的是解析解 √0.0525 − 0.05', () => {
    expect(ON_COLOR_CROSSOVER).toBeCloseTo(Math.sqrt(0.0525) - 0.05, 3)
    // 落在这一点上时白字与黑字对比度相等
    const y = ON_COLOR_CROSSOVER
    expect((1.05) / (y + 0.05)).toBeCloseTo((y + 0.05) / 0.05, 1)
  })

  it('任何样本色上，选中的那一侧对比度都不低于另一侧', () => {
    for (const color of sampleColors()) {
      const on = contrastRatio(pickOnColor(color), color)
      const away = contrastRatio(pickAwayColor(color), color)
      expect(on, `${color} 选错了边`).toBeGreaterThanOrEqual(away)
    }
  })

  it('挪动方向恒是前景的反面', () => {
    for (const color of sampleColors())
      expect(pickAwayColor(color)).not.toBe(pickOnColor(color))
  })

  it('按亮度分派而不是按 OKLCH 的 L：同一个 L 上不同色相会挑到不同边', () => {
    // 按 L 分派的话同一档 L 只会有一种结果；实际亮度带通道权重，黄比蓝亮得多
    const sameL = (l: number) => Array.from({ length: 24 }, (_, i) => `oklch(${l} 0.16 ${i * 15})`)
    const split = [0.55, 0.6, 0.65, 0.7].some((l) => {
      const picks = new Set(sameL(l).map(c => pickOnColor(c)))
      return picks.size === 2
    })
    expect(split, '同一档 L 上没有出现两种选边，说明判据退化成了按 L 分派').toBe(true)
  })

  it('两档可以换成别的颜色', () => {
    expect(pickOnColor('#000000', { light: '#eee', dark: '#111' })).toBe('#eee')
    expect(pickOnColor('#ffffff', { light: '#eee', dark: '#111' })).toBe('#111')
  })

  it('自定义候选按真实对比度选择，透明背景使用显式 backdrop', () => {
    expect(pickOnColor('#777', { light: '#aaa', dark: '#555' })).toBe('#aaa')
    expect(pickAwayColor('#777', { light: '#aaa', dark: '#555' })).toBe('#555')
    expect(pickOnColor('rgb(0 0 0 / 50%)', { backdrop: WHITE })).toBe(BLACK)
    expect(pickOnColor('rgb(0 0 0 / 50%)', { backdrop: BLACK })).toBe(WHITE)
  })
})

describe('混色与深浅', () => {
  it('权重取两端就是两端本身', () => {
    expect(relativeLuminance(mixColors('#ff0000', '#0000ff', 1))).toBeCloseTo(relativeLuminance('#ff0000'), 3)
    expect(relativeLuminance(mixColors('#ff0000', '#0000ff', 0))).toBeCloseTo(relativeLuminance('#0000ff'), 3)
  })

  it('权重越大越靠近第一个颜色', () => {
    const target = relativeLuminance('#ffffff')
    const near = Math.abs(relativeLuminance(mixColors(WHITE, BLACK, 0.8)) - target)
    const far = Math.abs(relativeLuminance(mixColors(WHITE, BLACK, 0.2)) - target)
    expect(near).toBeLessThan(far)
  })

  it('提亮变亮、压暗变暗，且都在两端夹住', () => {
    const base = '#3366cc'
    expect(relativeLuminance(lighten(base, 0.2))).toBeGreaterThan(relativeLuminance(base))
    expect(relativeLuminance(darken(base, 0.2))).toBeLessThan(relativeLuminance(base))
    expect(relativeLuminance(lighten(base, 5))).toBeLessThanOrEqual(1)
    expect(relativeLuminance(darken(base, 5))).toBeGreaterThanOrEqual(0)
  })

  it('混色、提亮与压暗都保留透明度', () => {
    const mixed = parseColorToOklch(mixColors('rgb(255 0 0 / 0%)', '#0000ff', 0.5))
    const blue = parseColorToOklch('#0000ff')
    expect(mixed.a).toBeCloseTo(0.5, 3)
    expect(mixed.l).toBeCloseTo(blue.l, 2)
    expect(mixed.c).toBeCloseTo(blue.c, 2)
    expect(mixed.h).toBeCloseTo(blue.h, 1)
    expect(parseColorToOklch(lighten('rgb(51 102 204 / 40%)', 0.2)).a).toBeCloseTo(0.4, 3)
    expect(parseColorToOklch(darken('rgb(51 102 204 / 40%)', 0.2)).a).toBeCloseTo(0.4, 3)
  })

  it('换不透明度产出带 alpha 的 oklch 串', () => {
    expect(withAlpha('#3366cc', 0.5)).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+ \/ 0\.5\)$/)
    expect(parseColorToOklch(withAlpha('rgb(51 102 204 / 20%)', 0.7)).a).toBeCloseTo(0.7, 3)
  })
})

describe('与皮肤里那条 CSS 配方对账', () => {
  const toneCss = readFileSync(
    join(import.meta.dirname, '../../styles/css/tone.css'),
    'utf8',
  )

  it('cSS 里的交叉点与本模块的常量是同一个数', () => {
    const found = [...toneCss.matchAll(/([\d.]+)\s*-\s*\(0\.2126|\(0\.2126[^)]*\)\s*-\s*([\d.]+)/g)]
      .map(m => Number(m[1] ?? m[2]))
      .filter(n => Number.isFinite(n))
    expect(found.length, 'CSS 配方里没找到阈值').toBeGreaterThan(0)
    for (const n of found) expect(n).toBe(ON_COLOR_CROSSOVER)
  })

  it('cSS 里的通道权重与 WCAG 一致', () => {
    expect(toneCss).toContain('0.2126 * r + 0.7152 * g + 0.0722 * b')
  })
})
