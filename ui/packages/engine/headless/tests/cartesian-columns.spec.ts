// @vitest-environment jsdom
// 列式数据：规格校验、画布分层、摘要与聚合数据表、拾取与键盘导航、焦点代理、等距轴与按窗口取数值轴、画布图层的降采样。
import type { Mark } from '@xihan-ui/viz'
import type { Dict, Props } from './cartesian-rig'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { createColumnStore } from '@xihan-ui/viz/columns'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { COLUMNS_TABLE_RANGES, COLUMNS_TABLE_ROWS } from '../src/cartesian-chart/cartesian-chart.columns'
import { cartesianModelOf, isCartesianProbe } from '../src/cartesian-chart/cartesian-chart.logic'
import { FakePath2D, mountProbes, recordingContext } from './cartesian-canvas-rig'
import { makeRig, settle, walk } from './cartesian-rig'

const DAY = 86_400_000
const T0 = Date.UTC(2026, 0, 5)

/** 一条按天的折线：n 个点，第 k 个缺失值的位置写 NaN。 */
function daily(n: number, gaps: readonly number[] = []): Props {
  const t = new Float64Array(n)
  const v = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    t[i] = T0 + i * DAY
    v[i] = gaps.includes(i) ? Number.NaN : 100 + Math.sin(i / 7) * 20 + (i % 5)
  }
  const data = createColumnStore({ fields: ['t', 'v'], columns: { t, v } })
  return {
    data,
    series: [{ mark: 'line', x: 't', y: 'v', name: '温度' }],
    xAxis: { scale: 'utc' },
    locale: 'en-US',
  }
}

/** K 线与成交量：n 根，收盘高于开盘时为涨。 */
function candles(n: number): Props {
  const cols = { t: new Float64Array(n), open: new Float64Array(n), high: new Float64Array(n), low: new Float64Array(n), close: new Float64Array(n), volume: new Float64Array(n) }
  for (let i = 0; i < n; i++) {
    const open = 50 + (i % 7)
    const close = open + (i % 2 ? 2 : -2)
    cols.t[i] = T0 + i * DAY
    cols.open[i] = open
    cols.close[i] = close
    cols.high[i] = Math.max(open, close) + 1
    cols.low[i] = Math.min(open, close) - 1
    cols.volume[i] = 1000 + i * 10
  }
  return {
    data: createColumnStore({ fields: Object.keys(cols), columns: cols }),
    series: [{ mark: 'candlestick', x: 't', open: 'open', high: 'high', low: 'low', close: 'close', name: '收盘' }],
    xAxis: { scale: 'utc' },
    locale: 'en-US',
  }
}

function groups(marks: readonly Mark[]): Mark[] {
  return marks.filter(m => m.kind === 'group' && m.part === 'series')
}

describe('规格', () => {
  it('列式数据总是画在画布上：写 svg、刷选、堆叠与横向都报规格错误', async () => {
    const base = daily(10)
    for (const extra of [{ renderer: 'svg' }, { brush: 'x' }, { orientation: 'horizontal' }] as Props[]) {
      const rig = await makeRig({ ...base, ...extra })
      const model = cartesianModelOf(rig.service)
      expect(model.issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartColumnsOption)
      expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
    }
    const stacked = await makeRig({ ...base, series: [{ mark: 'line', x: 't', y: 'v', stack: 'total' }] })
    expect(cartesianModelOf(stacked.service).issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartColumnsOption)
  })

  it('字段不存在、共用的自变量不一致都报出来', async () => {
    const base = daily(10)
    const missing = await makeRig({ ...base, series: [{ mark: 'line', x: 't', y: 'nope' }] })
    expect(cartesianModelOf(missing.service).issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartUnknownField)
    const mixed = await makeRig({ ...base, series: [{ mark: 'line', x: 't', y: 'v' }, { mark: 'bar', x: 'v', y: 't' }] })
    expect(cartesianModelOf(mixed.service).issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartColumnsOption)
  })

  it('共用的自变量不是升序时报出第一处乱序的行', async () => {
    const t = Float64Array.from([3, 1, 2])
    const v = Float64Array.from([1, 2, 3])
    const rig = await makeRig({ data: createColumnStore({ fields: ['t', 'v'], columns: { t, v } }), series: [{ mark: 'line', x: 't', y: 'v' }] })
    const issue = cartesianModelOf(rig.service).issues.find(i => i.code === DIAGNOSTIC_CODES.chartColumnsUnsorted)
    expect(issue?.detail).toMatchObject({ field: 't', row: 1 })
  })
})

describe('分层与无障碍', () => {
  it('渲染器是画布；垫层是网格与坐标轴，系列分组里只有样式探针', async () => {
    const rig = await makeRig(daily(200))
    const api = rig.api()
    expect(api.renderer).toBe('canvas')
    expect(api.measured).toBe(true)
    expect(api.layers.underlay.map(m => m.part)).toEqual(['grid', 'axis', 'axis'])
    const [series] = groups(api.layers.plot)
    if (series?.kind !== 'group')
      throw new Error('应有系列分组')
    expect(series.children.length).toBeGreaterThan(0)
    expect(series.children.every(isCartesianProbe)).toBe(true)
    expect(api.getMarkProps(series) as Dict).toMatchObject({ 'role': 'graphics-object', 'aria-label': '温度' })
    // 绘图区占 Tab 位
    expect((api.getPlotProps() as Dict).tabindex).toBe(0)
  })

  it('行数不多时数据表逐行写出；摘要按分块极值写最值', async () => {
    const rig = await makeRig(daily(30))
    const api = rig.api()
    expect(api.table.rows).toHaveLength(30)
    expect(api.tableCaption).toBe('Data table')
    expect(api.summary).toContain('温度')
  })

  it('超过行数上限时数据表按自变量区间聚合，表题注明聚合了多少行', async () => {
    const n = COLUMNS_TABLE_ROWS * 4
    const rig = await makeRig(daily(n))
    const api = rig.api()
    expect(api.table.rows.length).toBeGreaterThan(1)
    expect(api.table.rows.length).toBeLessThanOrEqual(COLUMNS_TABLE_RANGES)
    expect(api.tableCaption).toBe(`Data table (2,000 rows in ${api.table.rows.length} ranges)`)
    // 每行写区间与范围
    expect(api.table.rows[0]!.cells[0]!.text).toContain('–')
  })
})

describe('交互', () => {
  it('axis 模式按指针的 x 取最近的点；详情带键与格式化的值', async () => {
    const rig = await makeRig(daily(100))
    const model = cartesianModelOf(rig.service)
    const plot = model.scene!.layout.plot
    const api = rig.api()
    const handlers = api.getPlotProps() as Dict
    const target = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 240 }) }
    handlers.onPointerMove({ currentTarget: target, clientX: plot.x + plot.width / 2, clientY: plot.y + plot.height / 2, pointerType: 'mouse' })
    await settle()
    const active = rig.api().active
    expect(active?.seriesId).toBe('v')
    expect(active!.index).toBeGreaterThan(40)
    expect(active!.index).toBeLessThan(60)
    expect(active!.key).toBeInstanceOf(Date)
    expect(active!.formatted.value).toBe(model.formats.value(active!.values.value as number))
  })

  it('键盘逐点走、跳过缺失值，Home / End 到头，翻页跨一成', async () => {
    const rig = await makeRig(daily(50, [1, 2]))
    const focus = (index: number): void => rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'v', index }, key: T0 + index * DAY, focus: false, visible: true })
    focus(0)
    await settle()
    const key = async (k: string): Promise<number | undefined> => {
      ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: k, preventDefault() {}, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false })
      await settle()
      return rig.service.context.get('focused')?.index
    }
    rig.service.context.set('focusWithin', true)
    expect(await key('ArrowRight')).toBe(3)
    expect(await key('End')).toBe(49)
    expect(await key('PageUp')).toBe(44)
    expect(await key('Home')).toBe(0)
  })

  it('键盘聚焦 K 线：SVG 版本放回系列分组当焦点代理，可及名写开高低收', async () => {
    const rig = await makeRig(candles(40))
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'close', index: 3 }, key: T0 + 3 * DAY, focus: true, visible: true })
    await settle()
    const api = rig.api()
    const [series] = groups(api.layers.plot)
    if (series?.kind !== 'group')
      throw new Error('应有系列分组')
    const proxy = series.children.find(m => !isCartesianProbe(m))!
    expect(proxy.part).toBe('candle')
    const props = api.getMarkProps(proxy) as Dict
    expect(props.role).toBe('graphics-symbol')
    expect(props.tabindex).toBe(0)
    expect(props['data-trend']).toBe('rise')
    expect(props['aria-label']).toContain('Open 53')
    expect(api.layers.plot.some(m => m.part === 'focus-ring')).toBe(true)
  })

  it('折线的焦点代理是前景里的点；联动的 activeKey 按二分落到同一行', async () => {
    const rig = await makeRig(daily(60))
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'v', index: 10 }, key: T0 + 10 * DAY, focus: true, visible: true })
    await settle()
    const point = rig.api().layers.plot.find(m => m.part === 'point')!
    expect((rig.api().getMarkProps(point) as Dict).tabindex).toBe(0)
    const linked = await makeRig({ ...daily(60), activeKey: new Date(T0 + 20 * DAY) })
    expect(linked.api().active?.index).toBe(20)
  })
})

describe('坐标轴', () => {
  it('等距排列：自变量按下标铺开，缩放窗口换成下标区间', async () => {
    const rig = await makeRig({ ...candles(100), xAxis: { scale: 'utc', ordinal: true }, zoom: 'x', defaultWindow: { x: [new Date(T0 + 20 * DAY), new Date(T0 + 39 * DAY)], y: null } })
    const layout = cartesianModelOf(rig.service).columns!.layout!
    expect(layout.keyRange).toEqual([20, 39])
    expect(layout.keyExtent).toBeNull()
    // 一格的宽度 = 绘图区宽 / 露出的根数
    expect(layout.step).toBeCloseTo(layout.plot.width / 20, 5)
  })

  it('fit: window 时数值轴只盖住窗口里露出的那一段', async () => {
    const t = Float64Array.from({ length: 100 }, (_, i) => i)
    const v = Float64Array.from({ length: 100 }, (_, i) => (i < 50 ? 10 : 1000))
    const data = createColumnStore({ fields: ['t', 'v'], columns: { t, v } })
    const window = { x: [0, 40] as [number, number], y: null }
    const all = await makeRig({ data, series: [{ mark: 'line', x: 't', y: 'v' }], zoom: 'x', defaultWindow: window })
    const fitted = await makeRig({ data, series: [{ mark: 'line', x: 't', y: 'v' }], zoom: 'x', defaultWindow: window, yAxis: { fit: 'window' } })
    const top = (rig: typeof all): number => cartesianModelOf(rig.service).columns!.layout!.valueScale.domain[1]!
    expect(top(all)).toBeGreaterThanOrEqual(1000)
    expect(top(fitted)).toBeLessThan(100)
  })
})

describe('画布图层', () => {
  it('十万个点的折线降采样到像素列的量级，缺失值处断开', async () => {
    const n = 100_000
    const rig = await makeRig(daily(n, [n / 2]))
    const raster = cartesianModelOf(rig.service).columns!.raster!
    const [line] = raster.series
    if (line?.kind !== 'line')
      throw new Error('应是折线')
    expect(line.count).toBeLessThan(400 * 4 + 16)
    expect([...line.xs.subarray(0, line.count)].some(Number.isNaN)).toBe(true)
  })

  it('窄到画不出实体的 K 线按 2 的幂根一组合并', async () => {
    const rig = await makeRig(candles(5000))
    const raster = cartesianModelOf(rig.service).columns!.raster!
    const [bars] = raster.series
    if (bars?.kind !== 'candles')
      throw new Error('应是 K 线')
    expect(bars.count).toBeLessThan(400)
    expect(bars.width).toBeGreaterThanOrEqual(1)
  })

  it('隐藏的系列不进画布图层，也不进数据表', async () => {
    const t = Float64Array.from({ length: 10 }, (_, i) => i)
    const data = createColumnStore({ fields: ['t', 'a', 'b'], columns: { t, a: t, b: t } })
    const rig = await makeRig({ data, series: [{ mark: 'line', x: 't', y: 'a' }, { mark: 'bar', x: 't', y: 'b' }], hiddenSeries: ['b'] })
    const model = cartesianModelOf(rig.service)
    expect(model.columns!.raster!.series.map(s => s.id)).toEqual(['a'])
    expect(rig.api().table.columns.map(c => c.id)).toEqual(['key', 'a'])
    expect(walk(rig.api().layers.plot).filter(m => m.part === 'series')).toHaveLength(1)
  })
})

describe('画上画布', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('折线按 line 探针的描边一次描完；K 线按涨跌各画一批影线与实体', async () => {
    vi.stubGlobal('Path2D', FakePath2D)
    const canvas = document.createElement('canvas')
    const ctx = recordingContext(canvas)
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx)
    const native = window.getComputedStyle.bind(window)
    const paint = (fill: string, stroke: string): CSSStyleDeclaration => ({ fill, stroke, strokeWidth: stroke === 'none' ? '0px' : '1.5px', fillOpacity: '1', strokeOpacity: '1', strokeDasharray: 'none', strokeLinejoin: 'round', strokeLinecap: 'round', opacity: '1' }) as unknown as CSSStyleDeclaration
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
      const part = el.getAttribute('data-part')
      const trend = el.getAttribute('data-trend')
      if (part === 'line')
        return paint('none', 'rgb(1, 2, 3)')
      if (part === 'candle' || part === 'wick')
        return paint(trend === 'rise' ? 'rgb(0, 128, 0)' : 'rgb(200, 0, 0)', trend === 'rise' ? 'rgb(0, 128, 0)' : 'rgb(200, 0, 0)')
      if (part === 'series')
        return { opacity: '1' } as unknown as CSSStyleDeclaration
      return native(el)
    })

    const line = await makeRig(daily(10_000))
    line.service.refs.set('getCanvasEl', () => canvas)
    mountProbes(line)
    line.service.refs.get('canvas')!.request()
    await settle()
    const strokes = ctx.calls.filter(c => c.name === 'stroke')
    expect(strokes).toHaveLength(1)
    expect(strokes[0]!.strokeStyle).toBe('rgb(1, 2, 3)')
    const ops = (strokes[0]!.args[0] as FakePath2D).ops
    expect(ops[0]).toBe('M')
    expect(ops.length).toBeLessThan(400 * 4 + 16)

    ctx.calls.length = 0
    const k = await makeRig(candles(30))
    k.service.refs.set('getCanvasEl', () => canvas)
    mountProbes(k)
    k.service.refs.get('canvas')!.request()
    await settle()
    // 影线（跌、涨）各描一次，实体（跌、涨）各填一次
    expect(ctx.calls.filter(c => c.name === 'fill').map(c => c.fillStyle)).toEqual(['rgb(200, 0, 0)', 'rgb(0, 128, 0)', 'rgb(200, 0, 0)', 'rgb(0, 128, 0)'])
    const bodies = ctx.calls.filter(c => c.name === 'fill').slice(2).map(c => (c.args[0] as FakePath2D).ops.filter(op => op === 'R').length)
    expect(bodies).toEqual([15, 15])
  })
})

describe('对象数组上的 fit、trend 与 ordinal', () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({ day: i, price: i < 10 ? 10 + i : 500 + i, open: 10, close: i % 2 ? 12 : 8 }))

  it('fit: window 时数值轴只按窗口里露出的键（两端各带一个相邻的键）取', async () => {
    const series = [{ mark: 'line', x: 'day', y: 'price' }] as const
    const window = { x: [2, 6] as [number, number], y: null }
    const all = await makeRig({ data: rows, series, xAxis: { scale: 'linear' }, zoom: 'x', defaultWindow: window })
    const fitted = await makeRig({ data: rows, series, xAxis: { scale: 'linear' }, yAxis: { fit: 'window' }, zoom: 'x', defaultWindow: window })
    const top = (rig: typeof all): number => cartesianModelOf(rig.service).scene!.layout.valueScale.domain[1]!
    expect(top(all)).toBeGreaterThanOrEqual(519)
    expect(top(fitted)).toBeLessThan(40)
  })

  it('柱的 trend 按两个字段的涨跌取色；与瀑布同写报冲突', async () => {
    const rig = await makeRig({ data: rows, series: [{ mark: 'bar', x: 'day', y: 'price', trend: ['open', 'close'] }] })
    const trends = walk(rig.api().layers.plot).filter(m => m.part === 'bar').map(m => (rig.api().getMarkProps(m) as Dict)['data-trend'])
    expect(trends.slice(0, 4)).toEqual(['fall', 'rise', 'fall', 'rise'])
    const both = await makeRig({ data: rows, series: [{ mark: 'bar', x: 'day', y: 'price', trend: ['open', 'close'], waterfall: {} }] })
    expect(cartesianModelOf(both.service).issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartOptionConflict)
  })

  it('等距排列写在对象数组上报冲突', async () => {
    const rig = await makeRig({ data: rows, series: [{ mark: 'line', x: 'day', y: 'price' }], xAxis: { scale: 'linear', ordinal: true } })
    expect(cartesianModelOf(rig.service).issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartOptionConflict)
  })
})
