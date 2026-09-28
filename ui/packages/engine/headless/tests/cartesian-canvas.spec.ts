// @vitest-environment jsdom
// 画布渲染：renderer 的解析、垫层与绘图区的分层、样式探针、画布模式下的焦点代理，以及按探针的样式把数据层画上画布。
import type { Mark } from '@xihan-ui/viz'
import type { Dict, Props } from './cartesian-rig'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CARTESIAN_SVG_MARK_BUDGET, isCartesianProbe } from '../src/cartesian-chart/cartesian-chart.logic'
import { FakePath2D, mountProbes, recordingContext } from './cartesian-canvas-rig'
import { makeRig, settle, walk } from './cartesian-rig'

const SALES = [
  { month: '一月', online: 120, store: 80 },
  { month: '二月', online: 150, store: 60 },
  { month: '三月', online: 90, store: 110 },
]
const BARS: Props = {
  data: SALES,
  series: [
    { mark: 'bar', x: 'month', y: 'online', name: '线上' },
    { mark: 'bar', x: 'month', y: 'store', name: '门店' },
  ],
  locale: 'en-US',
}

/** 一个散点系列，点数可调：用来越过节点预算。 */
function scatter(count: number): Props {
  const data = Array.from({ length: count }, (_, i) => ({ x: i, y: (i * 37) % 101 }))
  return { data, series: [{ mark: 'scatter', x: 'x', y: 'y', name: '点' }], locale: 'en-US' }
}

function groups(marks: readonly Mark[]): Mark[] {
  return marks.filter(m => m.kind === 'group' && m.part === 'series')
}

describe('renderer 的解析', () => {
  it('auto（缺省）：数据层逐个成节点的标记在预算以内仍是 svg，超过预算改用画布', async () => {
    const small = await makeRig(scatter(CARTESIAN_SVG_MARK_BUDGET))
    expect(small.api().renderer).toBe('svg')
    const big = await makeRig(scatter(CARTESIAN_SVG_MARK_BUDGET + 1))
    expect(big.api().renderer).toBe('canvas')
  })

  it('显式写的渲染器原样生效；还没测量时 auto 按 svg', async () => {
    const rig = await makeRig({ ...BARS, renderer: 'canvas' })
    expect(rig.api().renderer).toBe('canvas')
    rig.setProps({ renderer: 'svg' })
    await settle()
    expect(rig.api().renderer).toBe('svg')
    const unmeasured = await makeRig(scatter(CARTESIAN_SVG_MARK_BUDGET + 1), { width: 0, height: 0 })
    expect(unmeasured.api().renderer).toBe('svg')
  })
})

describe('分层', () => {
  it('svg 模式：垫层为空，绘图区依次是网格与坐标轴、系列、前景', async () => {
    const rig = await makeRig(BARS)
    const { layers } = rig.api()
    expect(layers.underlay).toEqual([])
    expect(groups(layers.plot)).toHaveLength(2)
    expect(walk(layers.plot).filter(m => m.part === 'bar')).toHaveLength(6)
  })

  it('画布模式：网格与坐标轴在垫层；系列分组留在绘图区，子标记换成样式探针', async () => {
    const rig = await makeRig({ ...BARS, renderer: 'canvas' })
    const api = rig.api()
    expect(api.layers.underlay.map(m => m.part)).toEqual(['grid', 'axis', 'axis'])
    const series = groups(api.layers.plot)
    expect(series).toHaveLength(2)
    for (const group of series) {
      if (group.kind !== 'group')
        throw new Error('系列应是分组')
      expect(group.children).toHaveLength(1)
      expect(isCartesianProbe(group.children[0]!)).toBe(true)
      expect(group.children[0]!.part).toBe('bar')
    }
    // 真的柱不再成节点
    expect(walk(api.layers.plot).filter(m => m.part === 'bar' && !isCartesianProbe(m))).toHaveLength(0)
  })

  it('探针只给画布读样式：不进可访问树、不可聚焦，涨跌与画法照写', async () => {
    const rig = await makeRig({
      data: [
        { d: 'a', o: 1, h: 3, l: 0, c: 2 },
        { d: 'b', o: 2, h: 3, l: 1, c: 1.5 },
      ],
      series: [{ mark: 'candlestick', x: 'd', open: 'o', high: 'h', low: 'l', close: 'c', name: 'K' }],
      renderer: 'canvas',
      locale: 'en-US',
    })
    const api = rig.api()
    const probes = walk(api.layers.plot).filter(isCartesianProbe)
    const described = probes.map((m) => {
      const props = api.getMarkProps(m) as Dict
      expect(props['aria-hidden']).toBe(true)
      expect(props.role).toBeUndefined()
      expect(props.tabindex).toBeUndefined()
      return `${props['data-part']}:${props['data-trend'] ?? ''}:${props['data-style'] ?? ''}`
    })
    expect(described.sort()).toEqual(['candle:fall:candle', 'candle:rise:candle', 'wick:fall:', 'wick:rise:'])
  })

  it('按值着色的点：三个锚点探针依次写色阶的起点、中点与终点', async () => {
    const rig = await makeRig({
      data: [{ x: 1, y: 2, t: 1 }, { x: 2, y: 3, t: 5 }],
      series: [{ mark: 'scatter', x: 'x', y: 'y', color: 't', name: '点' }],
      renderer: 'canvas',
      locale: 'en-US',
    })
    const api = rig.api()
    const anchors = walk(api.layers.plot).filter(isCartesianProbe).map(m => api.getMarkProps(m) as Dict)
    expect(anchors.map(p => p['data-seg'])).toEqual(['low', 'low', 'high'])
    expect(anchors.map(p => (p.style as Dict)['--xh-_chart-p'])).toEqual(['0.0%', '100.0%', '100.0%'])
  })

  it('画布的部件属性：只给眼睛看，没有数据时写 data-empty', async () => {
    const rig = await makeRig({ ...BARS, renderer: 'canvas' })
    expect(rig.api().getCanvasProps() as Dict).toMatchObject({ 'data-part': 'canvas', 'aria-hidden': true })
    expect((rig.api().getCanvasProps() as Dict)['data-empty']).toBeUndefined()
    rig.setProps({ data: [] })
    await settle()
    expect((rig.api().getCanvasProps() as Dict)['data-empty']).toBe('')
    expect(rig.api().getUnderlayProps() as Dict).toMatchObject({ 'data-part': 'underlay', 'aria-hidden': true })
  })
})

describe('画布模式下的焦点', () => {
  it('绘图区占 Tab 位；键盘聚焦的柱把自己的 SVG 版本放回所属分组当焦点代理', async () => {
    const rig = await makeRig({ ...BARS, renderer: 'canvas' })
    expect((rig.api().getPlotProps() as Dict).tabindex).toBe(0)
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'store', index: 1 }, key: '二月', focus: true, visible: true })
    await settle()
    const api = rig.api()
    const [, store] = groups(api.layers.plot)
    if (store?.kind !== 'group')
      throw new Error('应有门店分组')
    const proxy = store.children.find(m => !isCartesianProbe(m))!
    expect(proxy.part).toBe('bar')
    expect(api.getMarkProps(proxy) as Dict).toMatchObject({ 'role': 'graphics-symbol', 'aria-label': '二月, 门店 60', 'tabindex': 0 })
    // 焦点环照旧画在前景
    expect(api.layers.plot.some(m => m.part === 'focus-ring')).toBe(true)
  })

  it('折线的焦点代理仍是前景里激活的点', async () => {
    const rig = await makeRig({
      data: SALES,
      series: [{ mark: 'line', x: 'month', y: 'online', name: '线上' }],
      renderer: 'canvas',
      locale: 'en-US',
    })
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'online', index: 2 }, key: '三月', focus: true, visible: true })
    await settle()
    const api = rig.api()
    const point = api.layers.plot.find(m => m.part === 'point')!
    expect((api.getMarkProps(point) as Dict).tabindex).toBe(0)
  })
})

describe('过渡', () => {
  it('画布模式不播几何过渡：数据换了场景直接落到终态', async () => {
    const rig = await makeRig({ ...BARS, renderer: 'canvas', animated: true })
    rig.setProps({ data: SALES.map(row => ({ ...row, online: row.online * 2 })) })
    await settle()
    expect(rig.service.context.get('frame')).toBeNull()
  })
})

// —— 画上画布：用记录调用的上下文与伪造的计算样式，核对画法取自探针、相邻同画法的标记合成一批 ——

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('画上画布', () => {
  it('按探针的计算样式填色；同一系列的柱合成一条路径一次填完；分组的不透明度乘进去', async () => {
    vi.stubGlobal('Path2D', FakePath2D)
    const canvas = document.createElement('canvas')
    const ctx = recordingContext(canvas)
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx)
    const native = window.getComputedStyle.bind(window)
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
      const part = el.getAttribute('data-part')
      const series = el.getAttribute('data-series-id') ?? el.parentElement?.getAttribute('data-series-id')
      if (part === 'bar')
        return { fill: series === 'online' ? 'rgb(10, 20, 30)' : 'rgb(40, 50, 60)', stroke: 'none', strokeWidth: '0px', fillOpacity: '1', strokeOpacity: '1', strokeDasharray: 'none', strokeLinejoin: 'miter', strokeLinecap: 'butt', opacity: '1' } as unknown as CSSStyleDeclaration
      if (part === 'series')
        return { opacity: series === 'store' ? '0.3' : '1' } as unknown as CSSStyleDeclaration
      return native(el)
    })
    const rig = await makeRig({ ...BARS, renderer: 'canvas' })
    rig.service.refs.set('getCanvasEl', () => canvas)
    mountProbes(rig)
    rig.service.refs.get('canvas')!.request()
    await settle()
    const fills = ctx.calls.filter(c => c.name === 'fill')
    // 两个系列各一批：每批三根柱
    expect(fills.map(c => c.fillStyle)).toEqual(['rgb(10, 20, 30)', 'rgb(40, 50, 60)'])
    expect(fills.map(c => (c.args[0] as FakePath2D).ops.filter(op => op === 'M').length)).toEqual([3, 3])
    expect(fills.map(c => c.globalAlpha)).toEqual([1, 0.3])
    // 后备尺寸按视口
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(240)
  })
})
