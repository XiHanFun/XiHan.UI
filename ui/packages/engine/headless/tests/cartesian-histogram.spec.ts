// @vitest-environment jsdom
// 直角坐标图的直方图：柱的 x 写成 [起, 止] 分箱区间，落在数值轴上按区间的真实宽度画，键写成「起 – 止」。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { RectMark } from '@xihan-ui/viz'
import type { Dict, Props } from './cartesian-rig'
import { DIAGNOSTIC_CODES, onDiagnostic } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { makeRig, marksOf, onCleanup, settle } from './cartesian-rig'

const BINS: Props = {
  data: [
    { from: 0, to: 10, count: 3 },
    { from: 10, to: 20, count: 8 },
    { from: 20, to: 40, count: 5 },
  ],
  series: [{ mark: 'bar', x: ['from', 'to'], y: 'count', name: '人数' }],
}

describe('直方图', () => {
  it('自变量轴是数值轴，定义域盖到最后一箱的止点；柱按区间的真实宽度画，相邻两箱之间留一道表面间隙', async () => {
    const rig = await makeRig(BINS)
    const api = rig.api()
    const { keyScale, metrics } = api.model.scene!.layout
    expect(api.model.spec.keyScale).toBe('linear')
    expect(keyScale.domain).toEqual([0, 40])
    const x = (v: number): number => (keyScale.map as (v: number) => number)(v)
    const bars = marksOf(api, 'bar') as RectMark[]
    bars.forEach((bar, i) => {
      const [a, b] = [[0, 10], [10, 20], [20, 40]][i]!
      expect(bar.x).toBeCloseTo(x(a!) + metrics.gap / 2)
      expect(bar.x + bar.width).toBeCloseTo(x(b!) - metrics.gap / 2)
    })
    // 第三箱是前两箱的两倍宽
    expect(bars[2]!.width + metrics.gap).toBeCloseTo((bars[0]!.width + metrics.gap) * 2)
  })

  it('键写成「起 – 止」：提示框、可及名、数据表与摘要一致；锚点落在箱的正中', async () => {
    const rig = await makeRig(BINS)
    const api = rig.api()
    const bars = marksOf(api, 'bar') as RectMark[]
    expect((api.getMarkProps(bars[1]!) as Dict)['aria-label']).toBe('10 – 20, 人数 8')
    expect(api.table.rows.map(r => r.cells[0]!.text)).toEqual(['0 – 10', '10 – 20', '20 – 40'])
    expect(api.model.scene!.anchors.get('count')![2]!.x).toBeCloseTo(bars[2]!.x + bars[2]!.width / 2)
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'count', index: 2 }, x: 0, y: 0 }, key: 20 })
    await settle()
    expect(rig.api().tooltip?.header).toBe('20 – 40')
  })

  it('止点不在起点之后的一箱报 chart.invalid-range，整张图不画', async () => {
    const seen: DiagnosticRecord[] = []
    onCleanup(onDiagnostic(record => seen.push(record)))
    const rig = await makeRig({ ...BINS, data: [{ from: 0, to: 10, count: 1 }, { from: 10, to: 10, count: 2 }] })
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartInvalidRange)
  })

  it('横向时箱沿纵轴排开', async () => {
    const rig = await makeRig({ ...BINS, orientation: 'horizontal' })
    const bars = marksOf(rig.api(), 'bar') as RectMark[]
    expect(bars[2]!.height).toBeGreaterThan(bars[0]!.height * 1.9)
  })
})
