// @vitest-environment jsdom
// 直角坐标图的缩放：窗口裁出类目轴的一段键、换掉连续轴与数值轴的定义域；Ctrl（⌘）滚轮、拖动平移、键盘 + / −、
// 焦点跟随与缩放条都只改窗口；连续轴缩放后按绘图区裁剪；点多时降采样。
import type { LineMark, RectMark } from '@xihan-ui/viz'
import type { CartesianWindow } from '../src/cartesian-chart'
import type { Dict, Props, Rig } from './cartesian-rig'
import { describe, expect, it, vi } from 'vitest'
import { makeRig, marksOf, settle } from './cartesian-rig'

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月']
const BARS: Props = {
  data: MONTHS.map((month, i) => ({ month, v: 10 + i })),
  series: [{ mark: 'bar', x: 'month', y: 'v' }],
  zoom: 'x',
}
const LINE: Props = {
  data: Array.from({ length: 101 }, (_, i) => ({ t: i, v: Math.sin(i / 10) * 10 + 20 })),
  series: [{ mark: 'line', x: 't', y: 'v' }],
  zoom: 'x',
}
const w = (x: [number, number], y: [number, number] = [0, 1]): CartesianWindow => ({ x: { start: x[0], end: x[1] }, y: { start: y[0], end: y[1] } })

/** 在绘图区里某个比例处派发事件：currentTarget 按视口尺寸 1:1 显示。 */
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
    deltaMode: 0,
    ...extra,
  }
}

describe('窗口', () => {
  it('类目轴按窗口露出一段键：窗外的柱不画，不需要裁剪', async () => {
    const rig = await makeRig({ ...BARS, defaultWindow: w([0.25, 0.5]) })
    const api = rig.api()
    expect(api.model.scene!.layout.keyScale.domain).toEqual(['三月', '四月'])
    expect(marksOf(api, 'bar').map(m => m.key)).toEqual(['v:s三月', 'v:s四月'])
    expect(api.clip).toBeNull()
  })

  it('连续轴按窗口换定义域，缩放后系列按绘图区裁剪', async () => {
    const rig = await makeRig({ ...LINE, defaultWindow: w([0.5, 1]) })
    const api = rig.api()
    expect(api.model.scene!.layout.keyScale.domain).toEqual([50, 100])
    expect(api.clip).toMatchObject(api.model.scene!.layout.plot)
    const group = marksOf(api, 'series')[0]!
    expect((api.getMarkProps(group) as Dict)['clip-path']).toBe(`url(#${api.clip!.id})`)
    expect((api.getClipPathProps() as Dict).id).toBe(api.clip!.id)
  })

  it('没开缩放时窗口不进管线：作者写了窗口也画整条轴', async () => {
    const rig = await makeRig({ ...BARS, zoom: 'none', defaultWindow: w([0.25, 0.5]) })
    expect(marksOf(rig.api(), 'bar')).toHaveLength(8)
    expect((rig.api().getZoomSliderProps() as Dict).hidden).toBe(true)
  })

  it('数值轴缩放：y 窗口换数值轴的定义域', async () => {
    const rig = await makeRig({ ...LINE, zoom: 'y', defaultWindow: w([0, 1], [0.5, 1]) })
    const { valueScale } = rig.api().model.scene!.layout
    const [lo, hi] = valueScale.domain
    expect(lo).toBeGreaterThan(15)
    expect(hi).toBeGreaterThanOrEqual(30)
  })
})

describe('手势与键盘', () => {
  it('按住 Ctrl 滚轮以指针为中心缩放；不按 Ctrl 时不拦截滚动', async () => {
    const onWindowChange = vi.fn()
    const rig = await makeRig({ ...LINE, onWindowChange })
    const plain = plotEvent(rig, 0.25, 0.5, { deltaY: -100 })
    ;(rig.api().getPlotProps() as Dict).onWheel(plain)
    expect(plain.preventDefault).not.toHaveBeenCalled()
    const zoomIn = plotEvent(rig, 0.25, 0.5, { deltaY: -100, ctrlKey: true })
    ;(rig.api().getPlotProps() as Dict).onWheel(zoomIn)
    await settle()
    expect(zoomIn.preventDefault).toHaveBeenCalled()
    const { x } = onWindowChange.mock.lastCall![0].window as CartesianWindow
    expect(x.end - x.start).toBeLessThan(1)
    // 锚点对着的位置不动：指针在 1/4 处，缩放后窗口里 1/4 处仍是它
    expect(x.start + (x.end - x.start) * 0.25).toBeCloseTo(0.25)
  })

  it('放大后拖动绘图区平移：内容跟着指针走，窗口朝反方向挪', async () => {
    const rig = await makeRig({ ...LINE, defaultWindow: w([0.4, 0.6]) })
    ;(rig.api().getPlotProps() as Dict).onPointerDown(plotEvent(rig, 0.5, 0.5))
    await settle()
    expect(rig.service.context.get('drag')?.target).toBe('plot')
    ;(rig.api().getPlotProps() as Dict).onPointerMove(plotEvent(rig, 0.75, 0.5))
    await settle()
    const { x } = rig.service.context.get('window')
    expect(x.start).toBeCloseTo(0.35)
    expect(x.end).toBeCloseTo(0.55)
    ;(rig.api().getPlotProps() as Dict).onPointerUp(plotEvent(rig, 0.75, 0.5))
    await settle()
    expect(rig.service.context.get('drag')).toBeNull()
  })

  it('键盘 + / − 以焦点为中心缩放；焦点走出窗口时窗口跟过去', async () => {
    const rig = await makeRig(BARS)
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'v', index: 0 }, key: '一月' })
    await settle()
    ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: '+', preventDefault: vi.fn() })
    await settle()
    const zoomed = rig.service.context.get('window').x
    expect(zoomed.end - zoomed.start).toBeCloseTo(1 / 1.5)
    rig.service.send({ type: 'WINDOW.SET', window: w([0, 0.25]) })
    await settle()
    const key = (name: string): void => (rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault: vi.fn() })
    key('End')
    await settle()
    const { x } = rig.service.context.get('window')
    // 焦点到了八月（位置 7.5 / 8），窗口平移到以它为中心并推回轴内
    expect(x.end).toBeCloseTo(1)
    expect(x.end - x.start).toBeCloseTo(0.25)
  })
})

describe('缩放条', () => {
  it('手柄是 slider：读出窗口那一端对着的键，方向键移 1%，Shift 移 10%，Home / End 到头', async () => {
    const rig = await makeRig({ ...BARS, defaultWindow: w([0.25, 0.75]) })
    const start = rig.api().getZoomHandleProps('start') as Dict
    expect([start.role, start['aria-valuenow'], start['aria-valuetext']]).toEqual(['slider', 25, '三月'])
    expect((rig.api().getZoomHandleProps('end') as Dict)['aria-valuetext']).toBe('六月')
    start.onKeyDown({ key: 'ArrowLeft', shiftKey: true, preventDefault: vi.fn() })
    await settle()
    expect(rig.service.context.get('window').x.start).toBeCloseTo(0.15)
    ;(rig.api().getZoomHandleProps('end') as Dict).onKeyDown({ key: 'End', preventDefault: vi.fn() })
    await settle()
    expect(rig.service.context.get('window').x.end).toBe(1)
    // 起点不能越过终点：至少露出一个类目
    ;(rig.api().getZoomHandleProps('start') as Dict).onKeyDown({ key: 'End', preventDefault: vi.fn() })
    await settle()
    const { x } = rig.service.context.get('window')
    expect(x.end - x.start).toBeCloseTo(1 / 8)
  })

  it('窗口的两端与缩放条对齐绘图区的左右内缩写成缩放条上的私有槽', async () => {
    const rig = await makeRig({ ...BARS, defaultWindow: w([0.25, 0.75]) })
    const props = rig.api().getZoomSliderProps() as Dict
    const { plot } = rig.api().model.scene!.layout
    const { width } = rig.service.context.get('size')!
    expect(props.style).toEqual({
      '--xh-_chart-zoom-start': '25.000%',
      '--xh-_chart-zoom-end': '75.000%',
      '--xh-_chart-zoom-left': `${plot.x}px`,
      '--xh-_chart-zoom-right': `${width - plot.x - plot.width}px`,
    })
    expect([props.role, props.hidden]).toEqual(['group', undefined])
  })
})

describe('受控与降采样', () => {
  it('受控窗口：只派发意图，由作者写回', async () => {
    const onWindowChange = vi.fn()
    const rig = await makeRig({ ...BARS, window: w([0, 1]), onWindowChange })
    rig.api().setWindow(w([0, 0.5]))
    await settle()
    expect(onWindowChange).toHaveBeenCalledTimes(1)
    expect(marksOf(rig.api(), 'bar')).toHaveLength(8)
    rig.setProps({ window: w([0, 0.5]) })
    await settle()
    expect(marksOf(rig.api(), 'bar')).toHaveLength(4)
  })

  it('点比绘图区的像素多一倍以上时降采样：线上的点不超过绘图区的宽度，锚点仍是全部', async () => {
    const rig = await makeRig({
      data: Array.from({ length: 5000 }, (_, i) => ({ t: i, v: Math.sin(i / 50) })),
      series: [{ mark: 'line', x: 't', y: 'v', symbols: 'none' }],
    })
    const api = rig.api()
    const [line] = marksOf(api, 'line') as LineMark[]
    expect(line!.points.length).toBeLessThanOrEqual(Math.round(api.model.scene!.layout.plot.width))
    expect(api.model.scene!.anchors.get('v')!.filter(Boolean)).toHaveLength(5000)
  })

  it('类目轴缩放后柱照样按露出的类目排满', async () => {
    const rig = await makeRig({ ...BARS, defaultWindow: w([0, 0.25]) })
    const bars = marksOf(rig.api(), 'bar') as RectMark[]
    expect(bars).toHaveLength(2)
    expect(bars[1]!.x).toBeGreaterThan(rig.api().model.scene!.layout.plot.width / 2)
  })
})
