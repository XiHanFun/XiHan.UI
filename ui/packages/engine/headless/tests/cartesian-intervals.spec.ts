// @vitest-environment jsdom
// 直角坐标图的区间与流图：柱的 y 写成 [下, 上] 是浮动柱、棒棒糖形态是哑铃，折线的 y 写成 [下, 上] 是区间带；
// 折线堆叠的 silhouette 以 0 为中线对称、wiggle 让摆动最小。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { AreaMark, PathMark, RectMark, SymbolMark } from '@xihan-ui/viz'
import type { Dict, Props } from './cartesian-rig'
import { DIAGNOSTIC_CODES, onDiagnostic } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { makeRig, marksOf, onCleanup, settle } from './cartesian-rig'

const TEMPS = [
  { month: '一月', lo: -5, hi: 3, avg: -1 },
  { month: '二月', lo: -2, hi: 7, avg: 2 },
  { month: '三月', lo: 4, hi: 15, avg: 9 },
]

describe('浮动柱', () => {
  it('柱从下端画到上端，数值轴不强制含 0；系列 id 缺省取上端字段', async () => {
    const rig = await makeRig({ data: TEMPS.map(t => ({ ...t, lo: t.lo + 20, hi: t.hi + 20 })), series: [{ mark: 'bar', x: 'month', y: ['lo', 'hi'], name: '气温' }] })
    const api = rig.api()
    expect(api.model.spec.series[0]!.id).toBe('hi')
    const { valueScale } = api.model.scene!.layout
    expect(valueScale.domain[0]).toBeGreaterThan(0)
    const [bar] = marksOf(api, 'bar') as RectMark[]
    expect(bar!.y).toBeCloseTo(valueScale.map(23)!)
    expect(bar!.y + bar!.height).toBeCloseTo(valueScale.map(15)!)
  })

  it('可及名、提示框与数据表写成「下 – 上」', async () => {
    const rig = await makeRig({ data: TEMPS, series: [{ mark: 'bar', x: 'month', y: ['lo', 'hi'], name: '气温' }] })
    const api = rig.api()
    expect((api.getMarkProps(marksOf(api, 'bar')[1]!) as Dict)['aria-label']).toBe('二月, 气温 -2 – 7')
    expect(api.table.rows.map(r => r.cells[1]!.text)).toEqual(['-5 – 3', '-2 – 7', '4 – 15'])
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'hi', index: 2 }, x: 0, y: 0 }, key: '三月' })
    await settle()
    expect(rig.api().tooltip?.rows[0]!.value).toBe('4 – 15')
  })

  it('下端高于上端报 chart.invalid-range', async () => {
    const seen: DiagnosticRecord[] = []
    onCleanup(onDiagnostic(record => seen.push(record)))
    await makeRig({ data: [{ month: 'a', lo: 5, hi: 1 }], series: [{ mark: 'bar', x: 'month', y: ['lo', 'hi'] }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartInvalidRange)
  })
})

describe('棒棒糖与哑铃', () => {
  it('棒棒糖：细杆从 0 画到数值，杆顶一个可聚焦的点；色标画成圆', async () => {
    const rig = await makeRig({ data: TEMPS, series: [{ mark: 'bar', x: 'month', y: 'avg', shape: 'lollipop', name: '均温' }] })
    const api = rig.api()
    const { valueScale } = api.model.scene!.layout
    expect(marksOf(api, 'bar')).toHaveLength(0)
    const stems = marksOf(api, 'stem') as PathMark[]
    const heads = marksOf(api, 'point') as SymbolMark[]
    expect(stems).toHaveLength(3)
    expect(heads).toHaveLength(3)
    expect(heads[2]!.y).toBeCloseTo(valueScale.map(9)!)
    const props = api.getMarkProps(heads[0]!) as Dict
    expect([props.role, props.tabindex, props['aria-label']]).toEqual(['graphics-symbol', 0, '一月, 均温 -1'])
    expect((api.getMarkProps(heads[1]!) as Dict).tabindex).toBe(-1)
    expect((api.getMarkProps(stems[0]!) as Dict)['aria-hidden']).toBe(true)
    expect((api.getLegendSwatchProps(api.legendItems[0]!) as Dict)['data-mark']).toBe('point')
  })

  it('哑铃：区间的两头各一个点，只有上端的点可聚焦', async () => {
    const rig = await makeRig({ data: TEMPS, series: [{ mark: 'bar', x: 'month', y: ['lo', 'hi'], shape: 'lollipop' }] })
    const api = rig.api()
    const heads = marksOf(api, 'point')
    expect(heads).toHaveLength(6)
    const focusable = heads.filter(h => (api.getMarkProps(h) as Dict).role === 'graphics-symbol')
    expect(focusable.map(h => h.key)).toEqual(['hi:s一月', 'hi:s二月', 'hi:s三月'])
  })
})

describe('区间带', () => {
  it('只铺带不画线：带从下端铺到上端，锚点在带的正中', async () => {
    const rig = await makeRig({ data: TEMPS, series: [{ mark: 'line', x: 'month', y: ['lo', 'hi'], name: '范围' }] })
    const api = rig.api()
    const { valueScale } = api.model.scene!.layout
    expect(marksOf(api, 'line')).toHaveLength(0)
    const [band] = marksOf(api, 'area-fill') as AreaMark[]
    expect(band!.points[1]!.y).toBeCloseTo(valueScale.map(7)!)
    expect(band!.points[1]!.y0).toBeCloseTo(valueScale.map(-2)!)
    expect(api.model.scene!.anchors.get('hi')![1]!.y).toBeCloseTo((valueScale.map(7)! + valueScale.map(-2)!) / 2)
    expect((api.getLegendSwatchProps(api.legendItems[0]!) as Dict)['data-mark']).toBe('bar')
  })
})

describe('流图', () => {
  const FLOWS = [
    { t: 1, a: 3, b: 1, c: 2 },
    { t: 2, a: 4, b: 3, c: 1 },
    { t: 3, a: 2, b: 5, c: 1 },
  ]
  const stacked = (offset: 'silhouette' | 'wiggle'): Props => ({
    data: FLOWS,
    series: (['a', 'b', 'c'] as const).map(y => ({ mark: 'line', x: 't', y, area: true, stack: 's', stackOffset: offset })),
  })

  it('silhouette：每一列以 0 为中线上下对称', async () => {
    const rig = await makeRig(stacked('silhouette'))
    const visible = rig.api().model.derived.visible
    for (let j = 0; j < 3; j++) {
      const lows = visible.map(s => s.low[j]!)
      const highs = visible.map(s => s.high[j]!)
      expect(Math.min(...lows) + Math.max(...highs)).toBeCloseTo(0)
    }
  })

  it('wiggle：各层首尾相接、厚度等于各自的值，层按峰值出现的先后由内向外排', async () => {
    const rig = await makeRig(stacked('wiggle'))
    const visible = rig.api().model.derived.visible
    for (const s of visible) {
      s.values.forEach((v, j) => expect(s.high[j]! - s.low[j]!).toBeCloseTo(v!))
    }
    // a 在第 2 列出峰、b 在第 3 列、c 在第 1 列：c 最早，排在最里（与另一层相邻的层数最多）
    const order = visible.map(s => s.low[0]!)
    expect(new Set(order).size).toBe(3)
  })
})

describe('棒棒糖的留边', () => {
  it('贴着定义域两端的点整个落在绘图区里', async () => {
    const rig = await makeRig({
      data: [{ k: 'a', lo: 58, hi: 84 }, { k: 'b', lo: 60, hi: 70 }],
      series: [{ mark: 'bar', x: 'k', y: ['lo', 'hi'], shape: 'lollipop' }],
      orientation: 'horizontal',
    })
    const api = rig.api()
    const { plot } = api.model.scene!.layout
    for (const head of marksOf(api, 'point') as SymbolMark[]) {
      const r = Math.sqrt(head.size / Math.PI)
      expect(head.x - r).toBeGreaterThanOrEqual(plot.x - 0.5)
      expect(head.x + r).toBeLessThanOrEqual(plot.x + plot.width + 0.5)
    }
  })
})
