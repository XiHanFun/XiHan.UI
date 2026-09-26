// @vitest-environment jsdom
// 直角坐标图的瀑布：每一步浮在上一步的累计值上，涨跌分色，小计从 0 画到累计值，相邻两步之间连一道细线。
import type { PathMark, RectMark } from '@xihan-ui/viz'
import type { Dict, Props } from './cartesian-rig'
import { describe, expect, it } from 'vitest'
import { makeRig, marksOf } from './cartesian-rig'

const PROFIT: Props = {
  data: [
    { item: '收入', amount: 500 },
    { item: '成本', amount: -200 },
    { item: '毛利', total: true },
    { item: '费用', amount: -120 },
    { item: '其他', amount: 30 },
    { item: '净利', total: true },
  ],
  series: [{ mark: 'bar', x: 'item', y: 'amount', name: '利润', waterfall: { total: 'total' }, labels: 'end' }],
}

describe('瀑布', () => {
  it('每一步从上一步的累计值画到新的累计值；小计从 0 画到累计值', async () => {
    const rig = await makeRig(PROFIT)
    const api = rig.api()
    const { valueScale } = api.model.scene!.layout
    const y = (v: number): number => valueScale.map(v)!
    const bars = marksOf(api, 'bar') as RectMark[]
    const spans = bars.map(b => [b.y + b.height, b.y])
    const expected = [[0, 500], [500, 300], [0, 300], [300, 180], [180, 210], [0, 210]]
    spans.forEach(([bottom, top], i) => {
      const [lo, hi] = [Math.min(...expected[i]!), Math.max(...expected[i]!)]
      expect(bottom).toBeCloseTo(y(lo))
      expect(top).toBeCloseTo(y(hi))
    })
  })

  it('涨跌写在柱上，小计不写；数值与标签是这一步的增减，小计是累计值', async () => {
    const rig = await makeRig(PROFIT)
    const api = rig.api()
    const bars = marksOf(api, 'bar')
    expect(bars.map(b => (api.getMarkProps(b) as Dict)['data-trend'])).toEqual(['rise', 'fall', undefined, 'fall', 'rise', undefined])
    expect(api.model.derived.visible[0]!.values).toEqual([500, -200, 300, -120, 30, 210])
    expect(marksOf(api, 'data-label').map(m => (m as { text: string }).text)).toEqual(['500', '-200', '300', '-120', '30', '210'])
    expect((api.getMarkProps(bars[1]!) as Dict)['aria-label']).toBe('成本, 利润 -200')
  })

  it('相邻两步之间的连接线：与上一步的终点同高，从上一根柱的右缘连到下一根的左缘，只给眼睛看', async () => {
    const rig = await makeRig(PROFIT)
    const api = rig.api()
    const bars = marksOf(api, 'bar') as RectMark[]
    const links = marksOf(api, 'connector') as PathMark[]
    expect(links).toHaveLength(5)
    const y = Math.round(api.model.scene!.layout.valueScale.map(500)!) + 0.5
    expect(links[0]!.d).toBe(`M${bars[0]!.x + bars[0]!.width},${y}L${bars[1]!.x},${y}`)
    expect((api.getMarkProps(links[0]!) as Dict)['aria-hidden']).toBe(true)
  })

  it('缺失的一步不画、不改累计，连接线跨过它连到下一根', async () => {
    const rig = await makeRig({
      data: [{ item: 'a', amount: 100 }, { item: 'b', amount: null }, { item: 'c', amount: 50 }],
      series: [{ mark: 'bar', x: 'item', y: 'amount', waterfall: {} }],
    })
    const api = rig.api()
    expect(marksOf(api, 'bar')).toHaveLength(2)
    expect(api.model.derived.visible[0]!.high).toEqual([100, null, 150])
    expect(marksOf(api, 'connector')).toHaveLength(1)
  })

  it('瀑布不参与堆叠：写了 stack 也按瀑布画', async () => {
    const rig = await makeRig({ ...PROFIT, series: [{ ...PROFIT.series![0]!, stack: 's' } as never] })
    expect(rig.api().model.spec.series[0]!.stack).toBeNull()
    expect(rig.api().model.derived.visible[0]!.low[1]).toBe(500)
  })
})
