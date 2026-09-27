// @vitest-environment jsdom
// 直角坐标图的箱线与小提琴：原始值按 x 分组统计五数与离群点，算好的五数直接用；箱是可聚焦的数据标记，
// 可及名、提示框与数据表写出五数；小提琴按整个系列的最大密度归一宽度。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { PathMark, RectMark, SymbolMark } from '@xihan-ui/viz'
import type { Dict, Props } from './cartesian-rig'
import { DIAGNOSTIC_CODES, onDiagnostic } from '@xihan-ui/core'
import { markPath } from '@xihan-ui/viz'
import { describe, expect, it } from 'vitest'
import { makeRig, marksOf, onCleanup, settle } from './cartesian-rig'

// 甲组 1–9 加一个 100（离群）；乙组 5–8
const RAW: Props = {
  data: [
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 100].map(v => ({ group: '甲', ms: v })),
    ...[5, 6, 7, 8].map(v => ({ group: '乙', ms: v })),
  ],
  series: [{ mark: 'boxplot', x: 'group', y: 'ms', name: '耗时' }],
}

describe('箱线', () => {
  it('原始值按 x 分组：R-7 四分位，须线到 1.5 倍四分距以内最远的点，其外是离群点', async () => {
    const rig = await makeRig(RAW)
    const api = rig.api()
    const box = api.model.derived.visible[0]!.boxes![0]!
    expect([box.min, box.q1, box.median, box.q3, box.max]).toEqual([1, 3.25, 5.5, 7.75, 9])
    expect(box.outliers).toEqual([100])
    expect(api.model.spec.keyScale).toBe('band')
    // 定义域盖住离群点
    expect(api.model.scene!.layout.valueScale.domain[1]).toBeGreaterThanOrEqual(100)
  })

  it('箱从下四分位画到上四分位，中位线横过箱，须线两端带短横，离群点是小圆', async () => {
    const rig = await makeRig(RAW)
    const api = rig.api()
    const y = (v: number): number => api.model.scene!.layout.valueScale.map(v)!
    const [box] = marksOf(api, 'box') as RectMark[]
    expect(box!.y).toBeCloseTo(y(7.75))
    expect(box!.y + box!.height).toBeCloseTo(y(3.25))
    // 箱体悬空，四角都圆
    expect(markPath(box!).match(/A/g)).toHaveLength(4)
    const median = marksOf(api, 'median')[0] as PathMark
    expect(median.d).toContain(`,${Math.round(y(5.5)) + 0.5}L`)
    expect((marksOf(api, 'whisker')[0] as PathMark).d.match(/M/g)).toHaveLength(4)
    const outliers = marksOf(api, 'outlier') as SymbolMark[]
    expect(outliers).toHaveLength(1)
    expect(outliers[0]!.y).toBeCloseTo(y(100))
    expect((api.getMarkProps(outliers[0]!) as Dict)['aria-hidden']).toBe(true)
  })

  it('箱可聚焦：可及名与提示框写出五数，数据表五数与离群点各一列', async () => {
    const rig = await makeRig(RAW)
    const api = rig.api()
    const [first] = marksOf(api, 'box')
    const props = api.getMarkProps(first!) as Dict
    expect([props.role, props.tabindex, props['data-style']]).toEqual(['graphics-symbol', 0, 'box'])
    expect(props['aria-label']).toBe('甲, 耗时 Min 1, Q1 3.25, Median 5.5, Q3 7.75, Max 9')
    expect(api.table.columns.map(c => c.label)).toEqual(['Category', 'Min', 'Q1', 'Median', 'Q3', 'Max', 'Outliers'])
    expect(api.table.rows[0]!.cells.at(-1)!.text).toBe('100')
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'ms', index: 10 }, x: 0, y: 0 }, key: '乙' })
    await settle()
    expect(rig.api().tooltip?.header).toBe('乙')
  })

  it('outliers: false 时须线直达最小与最大值，不画离群点', async () => {
    const rig = await makeRig({ ...RAW, series: [{ ...RAW.series![0]!, outliers: false } as never] })
    const box = rig.api().model.derived.visible[0]!.boxes![0]!
    expect([box.min, box.max, box.outliers]).toEqual([1, 100, []])
    expect(marksOf(rig.api(), 'outlier')).toHaveLength(0)
  })

  it('算好的五数每个键一行；五个数不是依次不减时报 chart.invalid-range', async () => {
    const rig = await makeRig({
      data: [{ g: 'a', lo: 1, a: 2, m: 3, b: 4, hi: 5 }],
      series: [{ mark: 'boxplot', x: 'g', y: { min: 'lo', q1: 'a', median: 'm', q3: 'b', max: 'hi' } }],
    })
    expect(rig.api().model.derived.visible[0]!.boxes![0]).toMatchObject({ min: 1, median: 3, max: 5, outliers: [] })
    const seen: DiagnosticRecord[] = []
    onCleanup(onDiagnostic(record => seen.push(record)))
    await makeRig({
      data: [{ g: 'a', lo: 1, a: 4, m: 3, b: 4, hi: 5 }],
      series: [{ mark: 'boxplot', x: 'g', y: { min: 'lo', q1: 'a', median: 'm', q3: 'b', max: 'hi' } }],
    })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartInvalidRange)
  })
})

describe('小提琴', () => {
  it('轮廓是对称的闭合路径，宽度按整个系列里最大的密度归一；中位线画在里面', async () => {
    const rig = await makeRig({ ...RAW, series: [{ ...RAW.series![0]!, style: 'violin' } as never] })
    const api = rig.api()
    const shapes = marksOf(api, 'box') as PathMark[]
    expect(shapes).toHaveLength(2)
    expect(shapes[0]!.d.endsWith('Z')).toBe(true)
    expect((api.getMarkProps(shapes[0]!) as Dict)['data-style']).toBe('violin')
    expect(marksOf(api, 'whisker')).toHaveLength(0)
    expect(marksOf(api, 'median')).toHaveLength(2)
    const xs = (d: string): number[] => d.slice(1, -1).split('L').map(p => Number(p.split(',')[0]))
    const widths = shapes.map(s => Math.max(...xs(s.d)) - Math.min(...xs(s.d)))
    // 乙组的值更集中，密度峰更高，轮廓更宽
    expect(widths[1]!).toBeGreaterThan(widths[0]!)
  })

  it('y 写成算好的五数时画不出小提琴，报 chart.violin-raw', async () => {
    const seen: DiagnosticRecord[] = []
    onCleanup(onDiagnostic(record => seen.push(record)))
    await makeRig({
      data: [{ g: 'a', lo: 1, a: 2, m: 3, b: 4, hi: 5 }],
      series: [{ mark: 'boxplot', x: 'g', y: { min: 'lo', q1: 'a', median: 'm', q3: 'b', max: 'hi' }, style: 'violin' } as never],
    })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartViolinRaw)
  })
})
