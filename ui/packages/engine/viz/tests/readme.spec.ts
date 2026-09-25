import { describe, expect, it } from 'vitest'
import { createEstimatingMeasurer, layoutAxis, line, scaleBand, scaleLinear, stack } from '../src'

// 与 README「用法」一节同一段代码：照抄即可运行
describe('包说明里的用法', () => {
  it('比例尺、堆叠、折线与坐标轴', () => {
    const rows = [
      { month: '一月', online: 120, retail: 80 },
      { month: '二月', online: 150, retail: 60 },
    ]
    const x = scaleBand({ domain: rows.map(r => r.month), range: [0, 320], paddingInner: 0.2 })
    const y = scaleLinear({ domain: [0, 250], range: [200, 0] }).nice()

    const series = stack(rows, { keys: ['online', 'retail'], value: (row, key) => row[key as 'online' | 'retail'] })

    const d = line<(typeof rows)[number]>({
      x: r => (x.map(r.month) ?? 0) + x.bandwidth / 2,
      y: r => y.map(r.online) ?? 0,
    })(rows)

    const axis = layoutAxis({
      scale: y,
      position: 'left',
      format: v => String(v),
      measure: createEstimatingMeasurer(),
      font: { family: 'sans-serif', size: 12, weight: 400, lineHeight: 16 },
      labelOverflow: 'auto',
      minLabelGap: 8,
      maxLabelSize: 80,
      tickLength: 4,
      labelGap: 4,
    })

    expect(series[1]!.segments.map(s => [s.y0, s.y1])).toEqual([[120, 200], [150, 210]])
    expect(d).toMatch(/^M[\d.]+,[\d.]+L[\d.]+,[\d.]+$/)
    expect(axis.ticks.length).toBeGreaterThan(1)
  })
})
