// 颜色能力：亮度、对比度、择色、混色与深浅。
// 最后一组把皮肤那份 CSS 配方的判据读出来与本模块对账——两处算的必须是同一件事。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CONTRAST_MIN,
  contrastRatio,
  darken,
  lighten,
  meetsContrast,
  mixColors,
  ON_COLOR_CROSSOVER,
  pickAwayColor,
  pickOnColor,
  relativeLuminance,
  withAlpha,
} from '../src/runtime/color'

const WHITE = '#ffffff'
const BLACK = '#000000'

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
    const ys = ['#5887f7', 'rgb(88, 135, 247)', 'hsl(222.3 90.9% 65.7%)'].map(relativeLuminance)
    expect(ys[1]).toBeCloseTo(ys[0]!, 6)
    expect(ys[2]).toBeCloseTo(ys[0]!, 2)
    // 这枚是某消费方的出厂主色，压白字只有 3.37
    expect(ys[0]).toBeCloseTo(0.261, 2)
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

  it('换不透明度产出带 alpha 的 oklch 串', () => {
    expect(withAlpha('#3366cc', 0.5)).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+ \/ 0\.5\)$/)
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
