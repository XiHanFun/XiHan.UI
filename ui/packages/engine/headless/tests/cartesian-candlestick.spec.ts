// @vitest-environment jsdom
// 直角坐标图的 K 线：开高低收四个字段，蜡烛（影线加实体）与美国线两种画法，涨跌分色，
// 开高低收对不上时报诊断；可及名、提示框与数据表写出四个价。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { PathMark, RectMark } from '@xihan-ui/viz'
import type { Dict, Props } from './cartesian-rig'
import { DIAGNOSTIC_CODES, onDiagnostic } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { makeRig, marksOf, onCleanup, settle } from './cartesian-rig'

const PRICES: Props = {
  data: [
    { day: '周一', open: 10, high: 12, low: 9, close: 11 },
    { day: '周二', open: 11, high: 11.5, low: 8, close: 9 },
    { day: '周三', open: 9, high: 10, low: 9, close: 9 },
  ],
  series: [{ mark: 'candlestick', x: 'day', open: 'open', high: 'high', low: 'low', close: 'close', name: '股价' }],
}

describe('k 线的折线段几何', () => {
  it('影线与美国线带着折线段几何：值域变化时按点插值，不只淡变', async () => {
    const rig = await makeRig(PRICES)
    const wick = (marksOf(rig.api(), 'wick') as PathMark[])[0]!
    expect(wick.segments).toHaveLength(1)
    expect(wick.segments![0]!.points).toHaveLength(2)
    const ohlc = await makeRig({ ...PRICES, series: [{ ...PRICES.series![0]!, style: 'ohlc' }] } as Props)
    const bar = (marksOf(ohlc.api(), 'candle') as PathMark[])[0]!
    expect(bar.segments).toHaveLength(3)
  })
})

describe('k 线', () => {
  it('系列 id 缺省取收盘字段；定义域盖住最低价与最高价，不强制含 0', async () => {
    const rig = await makeRig(PRICES)
    const api = rig.api()
    expect(api.model.spec.series[0]!.id).toBe('close')
    expect(api.model.spec.keyScale).toBe('band')
    const [lo, hi] = api.model.scene!.layout.valueScale.domain
    expect(lo).toBeGreaterThan(0)
    expect(lo).toBeLessThanOrEqual(8)
    expect(hi).toBeGreaterThanOrEqual(12)
  })

  it('蜡烛：影线从最低画到最高，实体从开盘画到收盘；十字星的实体至少一像素高；涨跌写在标记上', async () => {
    const rig = await makeRig(PRICES)
    const api = rig.api()
    const y = (v: number): number => api.model.scene!.layout.valueScale.map(v)!
    const bodies = marksOf(api, 'candle') as RectMark[]
    const wicks = marksOf(api, 'wick') as PathMark[]
    expect(bodies).toHaveLength(3)
    expect(bodies[0]!.y).toBeCloseTo(y(11))
    expect(bodies[0]!.y + bodies[0]!.height).toBeCloseTo(y(10))
    expect(bodies[2]!.height).toBe(1)
    const [top, bottom] = wicks[0]!.d.slice(1).split('L').map(p => Number(p.split(',')[1]))
    expect(top).toBeCloseTo(y(12))
    expect(bottom).toBeCloseTo(y(9))
    expect(bodies.map(b => (api.getMarkProps(b) as Dict)['data-trend'])).toEqual(['rise', 'fall', 'rise'])
    expect((api.getMarkProps(wicks[1]!) as Dict)['data-trend']).toBe('fall')
    expect((api.getMarkProps(wicks[1]!) as Dict)['aria-hidden']).toBe(true)
  })

  it('实体是可聚焦的数据标记：可及名与提示框写出四个价，锚点是收盘价', async () => {
    const rig = await makeRig(PRICES)
    const api = rig.api()
    const body = marksOf(api, 'candle')[1]!
    const props = api.getMarkProps(body) as Dict
    expect([props.role, props.tabindex]).toEqual(['graphics-symbol', -1])
    expect(props['aria-label']).toBe('周二, 股价 Open 11, High 11.5, Low 8, Close 9')
    expect((api.getMarkProps(marksOf(api, 'candle')[0]!) as Dict).tabindex).toBe(0)
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'close', index: 1 }, x: 0, y: 0 }, key: '周二' })
    await settle()
    expect(rig.api().tooltip?.rows[0]!.value).toBe('Open 11, High 11.5, Low 8, Close 9')
    expect(api.model.scene!.anchors.get('close')![1]!.y).toBeCloseTo(api.model.scene!.layout.valueScale.map(9)!)
  })

  it('数据表开高低收各一列，列名可以替换', async () => {
    const rig = await makeRig({ ...PRICES, translations: { ohlcColumns: { open: '开', high: '高', low: '低', close: '收' } } })
    const { table } = rig.api()
    expect(table.columns.map(c => c.label)).toEqual(['Category', '开', '高', '低', '收'])
    expect(table.rows[1]!.cells.map(c => c.text)).toEqual(['周二', '11', '11.5', '8', '9'])
  })

  it('美国线：一条路径画竖线与左开右收两道短横', async () => {
    const rig = await makeRig({ ...PRICES, series: [{ ...PRICES.series![0]!, style: 'ohlc' } as never] })
    const api = rig.api()
    expect(marksOf(api, 'wick')).toHaveLength(0)
    const line = marksOf(api, 'candle')[0] as PathMark
    expect(line.kind).toBe('path')
    expect(line.d.match(/M/g)).toHaveLength(3)
    expect((api.getMarkProps(line) as Dict)['data-style']).toBe('ohlc')
  })

  it('最低价高于开盘、或最高价低于收盘时报 chart.ohlc-range，整张图不画', async () => {
    const seen: DiagnosticRecord[] = []
    onCleanup(onDiagnostic(record => seen.push(record)))
    const rig = await makeRig({ ...PRICES, data: [{ day: 'x', open: 10, high: 9, low: 8, close: 9.5 }] })
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartOhlcRange)
  })
})
