// @vitest-environment jsdom
// 直角坐标图的刷选：在绘图区里拖出一段（类目取整到整条带）、松手派发一次范围与框里的数据，框外的数据标记淡出；
// 点一下清掉，Shift + 方向键从锚点起沿自变量刷，Escape 清掉；开了刷选时拖动不再平移。
import type { RectMark } from '@xihan-ui/viz'
import type { CartesianBrushSelectionChangeDetails } from '../src/cartesian-chart'
import type { Dict, Props, Rig } from './cartesian-rig'
import { describe, expect, it, vi } from 'vitest'
import { makeRig, marksOf, settle } from './cartesian-rig'

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月']
const BARS: Props = {
  data: MONTHS.map((month, i) => ({ month, v: 10 + i })),
  series: [{ mark: 'bar', x: 'month', y: 'v' }],
  brush: 'x',
}
const POINTS: Props = {
  data: [{ x: 1, y: 1 }, { x: 2, y: 5 }, { x: 3, y: 2 }, { x: 4, y: 8 }, { x: 5, y: 4 }],
  series: [{ mark: 'scatter', x: 'x', y: 'y' }],
  brush: 'xy',
  xAxis: { min: 0, max: 6, nice: false },
  yAxis: { min: 0, max: 10, nice: false },
}

/** 绘图区里某个比例处的指针事件：currentTarget 按视口尺寸 1:1 显示。 */
function plotEvent(rig: Rig, fx: number, fy: number, extra: Dict = {}): Dict {
  const size = rig.service.context.get('size')!
  const { plot } = rig.api().model.scene!.layout
  return {
    clientX: plot.x + plot.width * fx,
    clientY: plot.y + plot.height * fy,
    currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width: size.width, height: size.height }), setPointerCapture: vi.fn() },
    preventDefault: vi.fn(),
    button: 0,
    pointerId: 1,
    pointerType: 'mouse',
    ...extra,
  }
}

/** 从一处按下、拖到另一处松手；每一步都取最新的连接层。 */
async function drag(rig: Rig, from: [number, number], to: [number, number]): Promise<void> {
  ;(rig.api().getPlotProps() as Dict).onPointerDown(plotEvent(rig, ...from))
  await settle()
  ;(rig.api().getPlotProps() as Dict).onPointerMove(plotEvent(rig, ...to))
  await settle()
  ;(rig.api().getPlotProps() as Dict).onPointerUp(plotEvent(rig, ...to))
  await settle()
}

async function key(rig: Rig, name: string, shiftKey = false): Promise<void> {
  ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: name, shiftKey, preventDefault: vi.fn() })
  await settle()
}

describe('指针刷选', () => {
  it('类目轴拖出一段：取中心落在框里的首尾类目，松手派发一次范围与框里的数据', async () => {
    const onBrushSelectionChange = vi.fn()
    const rig = await makeRig({ ...BARS, onBrushSelectionChange })
    ;(rig.api().getPlotProps() as Dict).onPointerDown(plotEvent(rig, 0.3, 0.5))
    await settle()
    ;(rig.api().getPlotProps() as Dict).onPointerMove(plotEvent(rig, 0.6, 0.5))
    await settle()
    // 拖着时框已经画出来、取整到整条类目带，但还没派发
    expect(onBrushSelectionChange).not.toHaveBeenCalled()
    expect(rig.api().brush.rect).not.toBeNull()
    expect((rig.api().getPlotProps() as Dict)['data-dragging']).toBe('')
    ;(rig.api().getPlotProps() as Dict).onPointerUp(plotEvent(rig, 0.6, 0.5))
    await settle()
    expect(onBrushSelectionChange).toHaveBeenCalledTimes(1)
    const details = onBrushSelectionChange.mock.lastCall![0] as CartesianBrushSelectionChangeDetails
    expect(details.selection).toEqual({ x: ['三月', '五月'], y: null })
    expect(details.data.map(d => d.key)).toEqual(['三月', '四月', '五月'])
  })

  it('框画在数据之下、盖住首尾类目的整条带；框外的柱淡出', async () => {
    const rig = await makeRig({ ...BARS, defaultBrushSelection: { x: ['三月', '四月'] } })
    const api = rig.api()
    const [box] = api.overlay.under as RectMark[]
    expect(box!.part).toBe('brush')
    const bars = marksOf(api, 'bar') as RectMark[]
    expect(box!.x).toBeLessThanOrEqual(bars[2]!.x)
    expect(box!.x + box!.width).toBeGreaterThanOrEqual(bars[3]!.x + bars[3]!.width)
    expect(box!.height).toBeCloseTo(api.model.scene!.layout.plot.height)
    expect(bars.map(bar => (api.getMarkProps(bar) as Dict)['data-dimmed'])).toEqual(['', '', undefined, undefined, '', '', '', ''])
    expect((api.getMarkProps(box!) as Dict)['aria-hidden']).toBe(true)
  })

  it('点一下（没拖开）清掉刷选', async () => {
    const onBrushSelectionChange = vi.fn()
    const rig = await makeRig({ ...BARS, defaultBrushSelection: { x: ['三月', '四月'] }, onBrushSelectionChange })
    await drag(rig, [0.5, 0.5], [0.5, 0.5])
    expect(onBrushSelectionChange).toHaveBeenCalledWith({ selection: null, data: [] })
    expect(rig.api().brush.rect).toBeNull()
  })

  it('xy 刷选框一个矩形：连续轴与数值轴按比例尺反算，锚点落在框里的点算在内', async () => {
    const onBrushSelectionChange = vi.fn()
    const rig = await makeRig({ ...POINTS, onBrushSelectionChange })
    // x 从 1.5 到 4.5，y 从 3 到 9：按比例尺换成绘图区里的比例（连续轴两端收进了一个点径）
    const { plot, keyScale, valueScale } = rig.api().model.scene!.layout
    const at = (x: number, y: number): [number, number] => [((keyScale.map as (v: number) => number)(x) - plot.x) / plot.width, (valueScale.map(y)! - plot.y) / plot.height]
    await drag(rig, at(1.5, 3), at(4.5, 9))
    const { selection, data } = onBrushSelectionChange.mock.lastCall![0] as CartesianBrushSelectionChangeDetails
    const [x0, x1] = selection!.x as [number, number]
    expect(x0).toBeCloseTo(1.5)
    expect(x1).toBeCloseTo(4.5)
    expect(selection!.y![0]).toBeCloseTo(3)
    expect(selection!.y![1]).toBeCloseTo(9)
    expect(data.map(d => d.datum.x)).toEqual([2, 4])
  })

  it('开了刷选时拖动是刷选而不是平移，也不命中数据', async () => {
    const rig = await makeRig({ ...BARS, zoom: 'x', defaultWindow: { x: ['一月', '四月'] } })
    await drag(rig, [0.1, 0.5], [0.9, 0.5])
    expect(rig.service.context.get('window').x).toEqual(['一月', '四月'])
    expect(rig.service.context.get('drag')).toBeFalsy()
    expect(rig.service.context.get('hover')).toBeFalsy()
    expect(rig.api().brush.selection).toEqual({ x: ['一月', '四月'], y: null })
  })
})

describe('键盘刷选', () => {
  it('按住 Shift 再按方向键从锚点起刷到焦点所在的键；不按 Shift 移动后锚点放下，范围留着', async () => {
    const onBrushSelectionChange = vi.fn()
    const rig = await makeRig({ ...BARS, onBrushSelectionChange })
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'v', index: 0 }, key: '一月', focus: true, visible: true })
    await settle()
    await key(rig, 'ArrowRight', true)
    await key(rig, 'ArrowRight', true)
    expect(rig.api().brush.selection).toEqual({ x: ['一月', '三月'], y: null })
    await key(rig, 'ArrowLeft', true)
    expect(rig.api().brush.selection).toEqual({ x: ['一月', '二月'], y: null })
    expect(onBrushSelectionChange).toHaveBeenCalledTimes(3)
    await key(rig, 'ArrowRight')
    await key(rig, 'ArrowRight')
    expect(rig.api().brush.selection).toEqual({ x: ['一月', '二月'], y: null })
    await key(rig, 'End', true)
    expect(rig.api().brush.selection).toEqual({ x: ['四月', '八月'], y: null })
  })

  it('按 Escape 清掉刷选', async () => {
    const onBrushSelectionChange = vi.fn()
    const rig = await makeRig({ ...BARS, defaultBrushSelection: { x: ['三月', '四月'] }, onBrushSelectionChange })
    await key(rig, 'Escape')
    expect(onBrushSelectionChange).toHaveBeenCalledWith({ selection: null, data: [] })
    expect(rig.api().brush.selection).toBeNull()
  })
})

describe('受控与关闭', () => {
  it('受控范围：只派发意图，由作者写回；写回同一个范围不再派发', async () => {
    const onBrushSelectionChange = vi.fn()
    const rig = await makeRig({ ...BARS, brushSelection: null, onBrushSelectionChange })
    rig.api().setBrushSelection({ x: ['二月', '三月'] })
    await settle()
    expect(onBrushSelectionChange).toHaveBeenCalledTimes(1)
    expect(rig.api().brush.rect).toBeNull()
    rig.setProps({ brushSelection: { x: ['二月', '三月'], y: null } })
    await settle()
    expect(rig.api().brush.rect).not.toBeNull()
    rig.api().setBrushSelection({ x: ['二月', '三月'], y: null })
    await settle()
    expect(onBrushSelectionChange).toHaveBeenCalledTimes(1)
  })

  it('没开刷选时作者写了范围也不画，拖动不刷', async () => {
    const onBrushSelectionChange = vi.fn()
    const rig = await makeRig({ ...BARS, brush: 'none', defaultBrushSelection: { x: ['三月', '四月'] }, onBrushSelectionChange })
    expect(rig.api().brush.rect).toBeNull()
    expect(marksOf(rig.api(), 'bar').every(bar => (rig.api().getMarkProps(bar) as Dict)['data-dimmed'] === undefined)).toBe(true)
    await drag(rig, [0.1, 0.5], [0.9, 0.5])
    expect(onBrushSelectionChange).not.toHaveBeenCalled()
  })

  it('触屏只拦刷选与缩放的方向：竖向图刷 x 时竖着滑照常滚页面', async () => {
    const rig = await makeRig(BARS)
    expect((rig.api().getPlotProps() as Dict)['data-touch-axis']).toBe('horizontal')
    expect((rig.api().getPlotProps() as Dict)['data-selectable']).toBe('')
    const both = await makeRig({ ...BARS, brush: 'xy' })
    expect((both.api().getPlotProps() as Dict)['data-touch-axis']).toBe('both')
  })
})
