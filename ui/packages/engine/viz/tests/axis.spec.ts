import type { AxisLayoutInput, FontSpec, LabelOverflow } from '../src'
import { describe, expect, it } from 'vitest'
import { createEstimatingMeasurer, layoutAxis, scaleBand, scaleLinear, scaleUtc, solvePlotRect } from '../src'
import { forAll, integer } from './helpers/property'

const font: FontSpec = { family: 'sans-serif', size: 12, weight: 400, lineHeight: 16 }
const measure = createEstimatingMeasurer()
const widthOf = (text: string): number => measure.measure(text, font).width
const base = { measure, font, minLabelGap: 8, maxLabelSize: 80, tickLength: 4, labelGap: 4, format: (v: unknown) => String(v) } satisfies Partial<AxisLayoutInput>

describe('类目轴', () => {
  it('标签放得下时全部水平显示，刻度在带中心', () => {
    const scale = scaleBand({ domain: ['一月', '二月', '三月'], range: [0, 300] })
    const layout = layoutAxis({ ...base, scale, position: 'bottom', labelOverflow: 'auto' })
    expect(layout.ticks.map(t => t.offset)).toEqual([50, 150, 250])
    expect(layout.ticks.every(t => t.visible && t.rotate === 0 && !t.truncated)).toBe(true)
    expect(layout.thickness).toBe(4 + 4 + 16)
    expect(layout.gridOffsets).toEqual([50, 150, 250])
  })

  it('auto：放不下时转 −45°，仍冲突就隔几个显示；刻度线全部保留', () => {
    const domain = Array.from({ length: 30 }, (_, i) => `Category ${i}`)
    const scale = scaleBand({ domain, range: [0, 300] })
    const layout = layoutAxis({ ...base, scale, position: 'bottom', labelOverflow: 'auto' })
    expect(layout.ticks).toHaveLength(30)
    expect(layout.ticks[0]!.rotate).toBe(-45)
    const visible = layout.ticks.filter(t => t.visible)
    expect(visible.length).toBeLessThan(30)
    for (let i = 1; i < visible.length; i++)
      expect(visible[i]!.offset - visible[i - 1]!.offset).toBeGreaterThanOrEqual((16 + 8) / Math.SQRT1_2 - 1e-9)
  })

  it('rotate：−45° 仍放不下时转 −90°', () => {
    const domain = Array.from({ length: 20 }, (_, i) => `Long label ${i}`)
    const layout = layoutAxis({ ...base, scale: scaleBand({ domain, range: [0, 500] }), position: 'bottom', labelOverflow: 'rotate' })
    expect(layout.ticks[0]!.rotate).toBe(-90)
    expect(layout.ticks.every(t => t.visible)).toBe(true)
  })

  it('truncate：截断到一个步长内，完整标签保留给 title 与可及名', () => {
    const domain = ['华东区域销售额', '华南区域销售额', '华北区域销售额']
    const layout = layoutAxis({ ...base, scale: scaleBand({ domain, range: [0, 150] }), position: 'bottom', labelOverflow: 'truncate' })
    for (const tick of layout.ticks) {
      expect(tick.truncated).toBe(true)
      expect(tick.lines[0]!.endsWith('…')).toBe(true)
      expect(widthOf(tick.lines[0]!)).toBeLessThanOrEqual(50 - 8)
      expect(domain).toContain(tick.label)
    }
  })

  it('wrap：折成至多两行，轴厚随行数增加', () => {
    const domain = ['华东区域销售额', '华南区域销售额']
    const layout = layoutAxis({ ...base, scale: scaleBand({ domain, range: [0, 120] }), position: 'bottom', labelOverflow: 'wrap' })
    expect(layout.ticks[0]!.lines.length).toBe(2)
    expect(layout.thickness).toBe(4 + 4 + 32)
  })

  it('性质：任何溢出模式下，可见的水平标签互不重叠、刻度一个不少', () => {
    const modes: LabelOverflow[] = ['auto', 'rotate', 'truncate', 'wrap']
    forAll(300, 127, random => ({
      n: integer(random, 1, 40),
      length: integer(random, 3, 18),
      span: integer(random, 80, 900),
      mode: modes[integer(random, 0, 3)]!,
    }), ({ n, length, span, mode }) => {
      const domain = Array.from({ length: n }, (_, i) => `${'x'.repeat(length)}${i}`)
      const layout = layoutAxis({ ...base, scale: scaleBand({ domain, range: [0, span] }), position: 'bottom', labelOverflow: mode })
      expect(layout.ticks).toHaveLength(n)
      const visible = layout.ticks.filter(t => t.visible)
      for (let i = 1; i < visible.length; i++) {
        const a = visible[i - 1]!
        const b = visible[i]!
        const spacing = b.offset - a.offset
        if (a.rotate === 0) {
          const wa = Math.max(...a.lines.map(widthOf))
          const wb = Math.max(...b.lines.map(widthOf))
          expect(spacing).toBeGreaterThanOrEqual((wa + wb) / 2 + 8 - 1e-9)
        }
        else {
          expect(spacing).toBeGreaterThanOrEqual((a.rotate === -45 ? (16 + 8) / Math.SQRT1_2 : 16 + 8) - 1e-9)
        }
      }
    })
  })
})

describe('数值轴', () => {
  it('横轴刻度数按最宽标签推导，标签不重叠', () => {
    const scale = scaleLinear({ domain: [0, 1_000_000], range: [0, 240] })
    const layout = layoutAxis({ ...base, scale, position: 'bottom', labelOverflow: 'auto' })
    const visible = layout.ticks.filter(t => t.visible)
    expect(visible.length).toBeGreaterThanOrEqual(2)
    for (let i = 1; i < visible.length; i++)
      expect(visible[i]!.offset - visible[i - 1]!.offset).toBeGreaterThanOrEqual((widthOf(visible[i]!.label) + widthOf(visible[i - 1]!.label)) / 2 + 8)
  })

  it('性质：推导出的横轴刻度，标签水平放置也互不重叠', () => {
    forAll(300, 131, random => ({ max: 10 ** integer(random, 0, 9) * integer(random, 1, 9), length: integer(random, 60, 1200) }), ({ max, length }) => {
      const layout = layoutAxis({ ...base, scale: scaleLinear({ domain: [0, max], range: [0, length] }), position: 'bottom', labelOverflow: 'auto' })
      const visible = layout.ticks.filter(t => t.visible)
      expect(visible.every(t => t.rotate === 0)).toBe(true)
      for (let i = 1; i < visible.length; i++)
        expect(visible[i]!.offset - visible[i - 1]!.offset).toBeGreaterThanOrEqual((widthOf(visible[i]!.label) + widthOf(visible[i - 1]!.label)) / 2 + 8 - 1e-9)
    })
  })

  it('纵轴刻度数按 2.5 倍行高推导，厚度取最宽标签', () => {
    const scale = scaleLinear({ domain: [0, 100], range: [200, 0] })
    const layout = layoutAxis({ ...base, scale, position: 'left', labelOverflow: 'auto' })
    expect(layout.ticks.map(t => t.value)).toEqual([0, 20, 40, 60, 80, 100])
    expect(layout.thickness).toBeCloseTo(4 + 4 + widthOf('100'), 9)
  })

  it('纵轴标签超宽时截断到 maxLabelSize', () => {
    const scale = scaleBand({ domain: ['一个特别特别长的类目名称'], range: [0, 40] })
    const layout = layoutAxis({ ...base, scale, position: 'left', labelOverflow: 'auto', maxLabelSize: 50 })
    expect(layout.ticks[0]!.truncated).toBe(true)
    expect(widthOf(layout.ticks[0]!.lines[0]!)).toBeLessThanOrEqual(50)
  })

  it('显式刻度与数量提示', () => {
    const scale = scaleLinear({ domain: [0, 10], range: [0, 500] })
    expect(layoutAxis({ ...base, scale, position: 'bottom', labelOverflow: 'auto', ticks: [0, 5, 10] }).ticks.map(t => t.offset)).toEqual([0, 250, 500])
    expect(layoutAxis({ ...base, scale, position: 'bottom', labelOverflow: 'auto', ticks: 2 }).ticks.map(t => t.value)).toEqual([0, 5, 10])
  })

  it('时间轴', () => {
    const scale = scaleUtc({ domain: [new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 11, 31))], range: [0, 600] })
    const layout = layoutAxis({ ...base, scale, position: 'bottom', labelOverflow: 'auto', format: v => (v as Date).toISOString().slice(0, 7) })
    expect(layout.ticks.length).toBeGreaterThan(2)
    expect(layout.ticks.every(t => t.offset >= 0 && t.offset <= 600)).toBe(true)
  })

  it('标题占一行加间距', () => {
    const scale = scaleLinear({ domain: [0, 1], range: [0, 300] })
    const plain = layoutAxis({ ...base, scale, position: 'bottom', labelOverflow: 'auto' })
    const titled = layoutAxis({ ...base, scale, position: 'bottom', labelOverflow: 'auto', title: '收入（万元）' })
    expect(titled.thickness - plain.thickness).toBe(4 + 16)
  })

  it('负的间距参数报错', () => {
    expect(() => layoutAxis({ ...base, minLabelGap: -1, scale: scaleLinear(), position: 'bottom', labelOverflow: 'auto' })).toThrow(/minLabelGap/)
  })
})

describe('绘图区求解', () => {
  const outer = { x: 0, y: 0, width: 400, height: 300 }
  const axes = {
    bottom: { ...base, labelOverflow: 'auto' as const },
    left: { ...base, labelOverflow: 'auto' as const },
  }

  it('绘图区让出各轴的厚度，比例尺的值域取自绘图区', () => {
    const result = solvePlotRect({
      outer,
      axes,
      scales: {
        bottom: plot => scaleBand({ domain: ['A', 'B', 'C'], range: [plot.x, plot.x + plot.width] }),
        left: plot => scaleLinear({ domain: [0, 12345], range: [plot.y + plot.height, plot.y] }).nice(),
      },
    })
    const { plot } = result
    expect(plot.x).toBeCloseTo(result.axes.left!.thickness, 6)
    expect(outer.height - plot.height).toBeCloseTo(result.axes.bottom!.thickness, 6)
    expect(result.scales.bottom!.range).toEqual([plot.x, plot.x + plot.width])
  })

  it('纵轴标签越长，绘图区越窄', () => {
    const run = (max: number): number => solvePlotRect({
      outer,
      axes,
      scales: {
        bottom: plot => scaleBand({ domain: ['A'], range: [plot.x, plot.x + plot.width] }),
        left: plot => scaleLinear({ domain: [0, max], range: [plot.y + plot.height, plot.y] }),
      },
    }).plot.width
    expect(run(1_000_000)).toBeLessThan(run(10))
  })

  it('配置了坐标轴却没给比例尺时报错', () => {
    expect(() => solvePlotRect({ outer, axes, scales: {} })).toThrow(/比例尺/)
  })
})
