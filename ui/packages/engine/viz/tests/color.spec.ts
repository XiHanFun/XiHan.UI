import type { Rgba } from '../src'
import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  deltaEOk,
  formatHex,
  fromOklch,
  parseColor,
  relativeLuminance,
  simulateCvd,
  toOklab,
  toOklch,
  validateCategoricalPalette,
  validateOrdinalRamp,
} from '../src'
import { forAll, integer } from './helpers/property'

const hex = (text: string): Rgba => parseColor(text) as Rgba
const WHITE = hex('#ffffff')
const BLACK = hex('#000000')

/** 图表分类色板的机算初稿（亮暗两套），用作回归样例。 */
const LIGHT = ['#0057cb', '#c96d00', '#a51478', '#6b9900', '#00819f', '#b5041d', '#a15cf0', '#00a18a'].map(hex)
const DARK = ['#0067ea', '#c96d00', '#bf1d8c', '#6b9900', '#00819f', '#d10f25', '#a15cf0', '#00a18a'].map(hex)
const NEUTRAL_900 = hex('oklch(0.208 0.006 258)')

describe('颜色解析', () => {
  it('十六进制：3、4、6、8 位，# 可省', () => {
    expect(parseColor('#f0a')).toEqual({ r: 255, g: 0, b: 170, a: 1 })
    expect(parseColor('#ff00aa80')).toEqual({ r: 255, g: 0, b: 170, a: 128 / 255 })
    expect(parseColor('0057CB')).toEqual({ r: 0, g: 87, b: 203, a: 1 })
    expect(parseColor('#12345')).toBeNull()
  })

  it('rgb() 与 hsl()：逗号与空格写法、百分比、斜杠透明度', () => {
    expect(parseColor('rgb(255, 0, 170)')).toEqual({ r: 255, g: 0, b: 170, a: 1 })
    expect(parseColor('rgba(255 0 170 / 50%)')).toEqual({ r: 255, g: 0, b: 170, a: 0.5 })
    expect(parseColor('rgb(100% 0% 0%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(formatHex(hex('hsl(120, 100%, 25%)'))).toBe('#008000')
    expect(formatHex(hex('hsl(0.5turn 100% 50%)'))).toBe('#00ffff')
  })

  it('oklch() 与 oklab()；超出 sRGB 的颜色降彩度收回，色相不漂移', () => {
    expect(formatHex(hex('oklch(0.488 0.196 25)'))).toBe('#b5041d')
    expect(formatHex(hex('oklch(0% 0 0)'))).toBe('#000000')
    expect(formatHex(hex('oklab(1 0 0)'))).toBe('#ffffff')
    const wide = hex('oklch(0.7 0.4 150)')
    expect(Math.abs(toOklch(wide).h - 150)).toBeLessThan(1)
    expect(toOklch(wide).l).toBeCloseTo(0.7, 3)
  })

  it('越界按 CSS 规则钳制；无法解析时返回 null，不认颜色关键字', () => {
    expect(parseColor('rgb(300 -5 0 / 2)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColor('red')).toBeNull()
    expect(parseColor('rgb(1 2)')).toBeNull()
    expect(parseColor('rgb(1deg 2 3)')).toBeNull()
    expect(parseColor('')).toBeNull()
  })
})

describe('颜色空间', () => {
  it('白色的 OKLab 明度为 1、没有彩度', () => {
    const lab = toOklab(WHITE)
    expect(lab.l).toBeCloseTo(1, 6)
    expect(Math.hypot(lab.a, lab.b)).toBeLessThan(1e-4)
    expect(toOklch(WHITE).h).toBe(0)
  })

  it('性质：sRGB → OKLCH → sRGB 往返不变', () => {
    forAll(2000, 59, random => ({ r: integer(random, 0, 255), g: integer(random, 0, 255), b: integer(random, 0, 255), a: 1 }), (color) => {
      const back = fromOklch(toOklch(color))
      expect(Math.abs(back.r - color.r)).toBeLessThan(1e-3)
      expect(Math.abs(back.g - color.g)).toBeLessThan(1e-3)
      expect(Math.abs(back.b - color.b)).toBeLessThan(1e-3)
    })
  })
})

describe('对比度与色差', () => {
  it('wCAG 对比度：黑白 21:1，与参数先后无关', () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 12)
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 9)
    expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 9)
    expect(contrastRatio(hex('#767676'), WHITE)).toBeCloseTo(4.54, 2)
  })

  it('半透明前景先叠到背景上；背景必须不透明', () => {
    expect(contrastRatio({ ...BLACK, a: 0 }, WHITE)).toBeCloseTo(1, 12)
    expect(() => contrastRatio(BLACK, { ...WHITE, a: 0.5 })).toThrow(/不透明/)
  })

  it('δE_OK：同色为 0，黑白为 100', () => {
    expect(deltaEOk(LIGHT[0]!, LIGHT[0]!)).toBe(0)
    expect(deltaEOk(BLACK, WHITE)).toBeCloseTo(100, 4)
  })
})

describe('色觉障碍模拟', () => {
  it('灰阶在模拟下不变（矩阵每行之和为 1）', () => {
    for (const kind of ['protan', 'deutan', 'tritan'] as const) {
      for (const gray of ['#000000', '#777777', '#ffffff']) {
        const out = simulateCvd(hex(gray), kind)
        expect(deltaEOk(out, hex(gray))).toBeLessThan(0.01)
      }
    }
  })

  it('红绿色弱下红与绿在红绿对立轴上几乎重合，只剩明度差', () => {
    const red = hex('#d10f25')
    const green = hex('#2e9d3a')
    const redGreenGap = (a: Rgba, b: Rgba): number => Math.abs(toOklab(a).a - toOklab(b).a)
    for (const kind of ['protan', 'deutan'] as const) {
      expect(redGreenGap(simulateCvd(red, kind), simulateCvd(green, kind))).toBeLessThan(redGreenGap(red, green) / 3)
      expect(deltaEOk(simulateCvd(red, kind), simulateCvd(green, kind))).toBeLessThan(deltaEOk(red, green))
    }
    // 蓝色弱不影响红绿对立轴
    expect(redGreenGap(simulateCvd(red, 'tritan'), simulateCvd(green, 'tritan'))).toBeGreaterThan(redGreenGap(red, green) / 2)
  })

  it('严重度 0 是原色，严重度越高偏离越大', () => {
    const color = hex('#d10f25')
    expect(deltaEOk(simulateCvd(color, 'deutan', 0), color)).toBeLessThan(1e-9)
    expect(deltaEOk(simulateCvd(color, 'deutan', 0.5), color)).toBeLessThan(deltaEOk(simulateCvd(color, 'deutan', 1), color))
    expect(() => simulateCvd(color, 'deutan', 1.5)).toThrow(/严重度/)
  })
})

describe('分类色板校验', () => {
  it('机算初稿在亮色下六项通过：相邻色觉 ΔE 17.8、正常 ΔE 21.0', () => {
    const report = validateCategoricalPalette(LIGHT, { mode: 'light', surface: WHITE, pairs: 'adjacent', reference: DARK })
    expect(report.ok).toBe(true)
    expect(report.checks.map(c => [c.id, c.status])).toEqual([
      ['order', 'pass'],
      ['lightness', 'pass'],
      ['chroma', 'pass'],
      ['cvd', 'pass'],
      ['distinct', 'pass'],
      ['contrast', 'pass'],
    ])
    const worst = Object.fromEntries(report.checks.map(c => [c.id, c.worst]))
    expect(worst.cvd).toBeCloseTo(17.8, 1)
    expect(worst.distinct).toBeCloseTo(21.0, 1)
    expect(worst.contrast).toBeGreaterThanOrEqual(3)
  })

  it('散点形态按前 3 个色槽两两检查：亮色 14.7 / 25.1，暗色 16.2 / 23.8', () => {
    const light = validateCategoricalPalette(LIGHT, { mode: 'light', surface: WHITE, pairs: 'all' })
    const dark = validateCategoricalPalette(DARK, { mode: 'dark', surface: NEUTRAL_900, pairs: 'all' })
    const worst = (r: typeof light, id: string): number => r.checks.find(c => c.id === id)!.worst!
    expect(worst(light, 'cvd')).toBeCloseTo(14.7, 1)
    expect(worst(light, 'distinct')).toBeCloseTo(25.1, 1)
    expect(worst(dark, 'cvd')).toBeCloseTo(16.2, 1)
    expect(worst(dark, 'distinct')).toBeCloseTo(23.8, 1)
    expect(dark.ok).toBe(true)
  })

  it('没有 reference 时色相顺序跳过检查', () => {
    const report = validateCategoricalPalette(LIGHT, { mode: 'light', surface: WHITE, pairs: 'adjacent' })
    expect(report.checks[0]).toMatchObject({ id: 'order', status: 'skip', worst: null })
  })

  it('三个蓝色系挨在一起：色差不足判 fail 并指出色槽', () => {
    const blues = ['#0057cb', '#0067ea', '#1f6fe0'].map(hex)
    const report = validateCategoricalPalette(blues, { mode: 'light', surface: WHITE, pairs: 'adjacent' })
    expect(report.ok).toBe(false)
    const distinct = report.checks.find(c => c.id === 'distinct')!
    expect(distinct.status).toBe('fail')
    expect(distinct.findings.map(f => f.slots)).toContainEqual([1, 2])
  })

  it('明度出带与彩度不足判 fail；对比度不足只判 warn（有标签或数据表可以补偿）', () => {
    const pale = ['#9ec5ff', '#ffcf99'].map(hex)
    const report = validateCategoricalPalette(pale, { mode: 'light', surface: WHITE, pairs: 'adjacent' })
    const byId = Object.fromEntries(report.checks.map(c => [c.id, c.status]))
    expect(byId.lightness).toBe('fail')
    expect(byId.contrast).toBe('warn')
    const gray = validateCategoricalPalette(['#6b6b6b', '#0057cb'].map(hex), { mode: 'light', surface: WHITE, pairs: 'adjacent' })
    expect(gray.checks.find(c => c.id === 'chroma')?.findings[0]).toMatchObject({ slots: [1], status: 'fail' })
  })

  it('两套色板同一色槽色相不一致时判 fail', () => {
    const swapped = [DARK[1]!, DARK[0]!, ...DARK.slice(2)]
    const report = validateCategoricalPalette(LIGHT, { mode: 'light', surface: WHITE, pairs: 'adjacent', reference: swapped })
    expect(report.checks[0]).toMatchObject({ id: 'order', status: 'fail' })
  })

  it('色板为空、多于 8 色或 reference 长度不符时报错', () => {
    expect(() => validateCategoricalPalette([], { mode: 'light', surface: WHITE, pairs: 'adjacent' })).toThrow(/1–8/)
    expect(() => validateCategoricalPalette([...LIGHT, LIGHT[0]!], { mode: 'light', surface: WHITE, pairs: 'adjacent' })).toThrow(/1–8/)
    expect(() => validateCategoricalPalette(LIGHT, { mode: 'light', surface: WHITE, pairs: 'adjacent', reference: DARK.slice(1) })).toThrow(/reference/)
  })
})

describe('有序色阶校验', () => {
  const ramp = ['oklch(0.43 0.19 258)', 'oklch(0.52 0.2 258)', 'oklch(0.61 0.17 258)', 'oklch(0.7 0.13 258)'].map(hex)

  it('单色相、明度单调、最弱一档对表面 ≥ 2:1 时通过', () => {
    const report = validateOrdinalRamp(ramp, { mode: 'light', surface: WHITE })
    expect(report.ok).toBe(true)
    expect(report.mode).toBe('light')
    expect(report.checks.map(c => c.id)).toEqual(['hue', 'monotonic', 'contrast'])
  })

  it('明度折返、混入别的色相、最浅一档太淡都判 fail', () => {
    const zigzag = validateOrdinalRamp([ramp[0]!, ramp[2]!, ramp[1]!], { mode: 'light', surface: WHITE })
    expect(zigzag.checks.find(c => c.id === 'monotonic')?.status).toBe('fail')
    const mixed = validateOrdinalRamp([ramp[0]!, hex('oklch(0.6 0.17 60)')], { mode: 'light', surface: WHITE })
    expect(mixed.checks.find(c => c.id === 'hue')?.status).toBe('fail')
    const faint = validateOrdinalRamp([ramp[0]!, hex('oklch(0.93 0.03 258)')], { mode: 'light', surface: WHITE })
    expect(faint.checks.find(c => c.id === 'contrast')).toMatchObject({ status: 'fail', findings: [{ slots: [2] }] })
  })

  it('少于 2 档时报错', () => {
    expect(() => validateOrdinalRamp([ramp[0]!], { mode: 'light', surface: WHITE })).toThrow(/2 档/)
  })
})
