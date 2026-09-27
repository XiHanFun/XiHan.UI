// @vitest-environment jsdom
// 直角坐标图的缩放：窗口写定义域里的值，裁出类目轴的一段键、换掉连续轴与数值轴的定义域；Ctrl（⌘）滚轮、拖动平移、键盘 + / −、
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
    const rig = await makeRig({ ...BARS, defaultWindow: { x: ['三月', '四月'] } })
    const api = rig.api()
    expect(api.model.scene!.layout.keyScale.domain).toEqual(['三月', '四月'])
    expect(marksOf(api, 'bar').map(m => m.key)).toEqual(['v:s三月', 'v:s四月'])
    expect(api.clip).toBeNull()
  })

  it('连续轴按窗口换定义域，缩放后系列按绘图区裁剪', async () => {
    const rig = await makeRig({ ...LINE, defaultWindow: { x: [50, 100] } })
    const api = rig.api()
    expect(api.model.scene!.layout.keyScale.domain).toEqual([50, 100])
    expect(api.clip).toMatchObject(api.model.scene!.layout.plot)
    const group = marksOf(api, 'series')[0]!
    expect((api.getMarkProps(group) as Dict)['clip-path']).toBe(`url(#${api.clip!.id})`)
    expect((api.getClipPathProps() as Dict).id).toBe(api.clip!.id)
  })

  it('没开缩放时窗口不进管线：作者写了窗口也画整条轴', async () => {
    const rig = await makeRig({ ...BARS, zoom: 'none', defaultWindow: { x: ['三月', '四月'] } })
    expect(marksOf(rig.api(), 'bar')).toHaveLength(8)
    expect((rig.api().getZoomSliderProps() as Dict).hidden).toBe(true)
  })

  it('数值轴缩放：y 窗口就是数值轴的定义域，越出取整后整条轴的部分夹回来', async () => {
    const rig = await makeRig({ ...LINE, zoom: 'y', defaultWindow: { y: [20, 30] } })
    expect(rig.api().model.scene!.layout.valueScale.domain).toEqual([20, 30])
    const wide = await makeRig({ ...LINE, zoom: 'y', defaultWindow: { y: [20, 1000] } })
    const { valueScale, valueExtent } = wide.api().model.scene!.layout
    expect(valueScale.domain).toEqual([20, valueExtent[1]])
  })

  it('窗口两端的类目不在数据里时取轴的那一端', async () => {
    const rig = await makeRig({ ...BARS, defaultWindow: { x: ['去年', '三月'] } })
    expect(rig.api().model.scene!.layout.keyScale.domain).toEqual(['一月', '二月', '三月'])
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
    const [a, b] = (onWindowChange.mock.lastCall![0].window as CartesianWindow).x as [number, number]
    expect(b - a).toBeLessThan(100)
    // 锚点对着的值不动：指针在 1/4 处（t = 25），缩放后窗口里 1/4 处仍是它
    expect(a + (b - a) * 0.25).toBeCloseTo(25)
  })

  it('放大后拖动绘图区平移：内容跟着指针走，窗口朝反方向挪', async () => {
    const rig = await makeRig({ ...LINE, defaultWindow: { x: [40, 60] } })
    ;(rig.api().getPlotProps() as Dict).onPointerDown(plotEvent(rig, 0.5, 0.5))
    await settle()
    expect(rig.service.context.get('drag')?.target).toBe('plot')
    ;(rig.api().getPlotProps() as Dict).onPointerMove(plotEvent(rig, 0.75, 0.5))
    await settle()
    const [a, b] = rig.service.context.get('window').x as [number, number]
    expect(a).toBeCloseTo(35)
    expect(b).toBeCloseTo(55)
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
    // 类目轴上键盘按整个类目缩放：8 个类目放大 1.5 倍露出 5 个，一月仍在窗口的开头
    expect(rig.service.context.get('window').x).toEqual(['一月', '五月'])
    expect(rig.api().zoom.ratio.x.end).toBeCloseTo(5 / 8)
    rig.service.send({ type: 'WINDOW.SET', window: { x: ['一月', '二月'] } })
    await settle()
    const key = (name: string): void => (rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault: vi.fn() })
    key('End')
    await settle()
    // 焦点到了八月（位置 7.5 / 8），窗口平移到以它为中心并推回轴内
    expect(rig.service.context.get('window').x).toEqual(['七月', '八月'])
  })

  it('细小的滚轮接着上一次的比例算：类目轴不会因为每次都取整到类目而原地不动', async () => {
    const onWindowChange = vi.fn()
    const rig = await makeRig({ ...BARS, onWindowChange })
    for (let i = 0; i < 30; i++) {
      ;(rig.api().getPlotProps() as Dict).onWheel(plotEvent(rig, 0.25, 0.5, { deltaY: -5, ctrlKey: true }))
      await settle()
    }
    expect(rig.service.context.get('window').x).toEqual(['一月', '七月'])
    expect(onWindowChange).toHaveBeenCalledTimes(1)
  })
})

describe('缩放条', () => {
  it('手柄是 slider：读出窗口那一端对着的键；类目轴方向键一步一个类目，Home / End 到头', async () => {
    const rig = await makeRig({ ...BARS, defaultWindow: { x: ['三月', '六月'] } })
    const start = rig.api().getZoomHandleProps('start') as Dict
    expect([start.role, start['aria-valuenow'], start['aria-valuetext']]).toEqual(['slider', 25, '三月'])
    expect((rig.api().getZoomHandleProps('end') as Dict)['aria-valuetext']).toBe('六月')
    start.onKeyDown({ key: 'ArrowLeft', preventDefault: vi.fn() })
    await settle()
    expect(rig.service.context.get('window').x).toEqual(['二月', '六月'])
    ;(rig.api().getZoomHandleProps('end') as Dict).onKeyDown({ key: 'End', preventDefault: vi.fn() })
    await settle()
    expect(rig.service.context.get('window').x).toEqual(['二月', '八月'])
    // 起点不能越过终点：至少露出一个类目
    ;(rig.api().getZoomHandleProps('start') as Dict).onKeyDown({ key: 'End', preventDefault: vi.fn() })
    await settle()
    expect(rig.service.context.get('window').x).toEqual(['八月', '八月'])
  })

  it('连续轴的手柄方向键移 1%，Shift 移 10%', async () => {
    const rig = await makeRig({ ...LINE, defaultWindow: { x: [20, 80] } })
    ;(rig.api().getZoomHandleProps('start') as Dict).onKeyDown({ key: 'ArrowRight', preventDefault: vi.fn() })
    await settle()
    expect((rig.service.context.get('window').x as number[])[0]).toBeCloseTo(21)
    ;(rig.api().getZoomHandleProps('end') as Dict).onKeyDown({ key: 'ArrowLeft', shiftKey: true, preventDefault: vi.fn() })
    await settle()
    expect((rig.service.context.get('window').x as number[])[1]).toBeCloseTo(70)
  })

  it('窗口的两端与缩放条对齐绘图区的左右内缩写成缩放条上的私有槽', async () => {
    const rig = await makeRig({ ...BARS, defaultWindow: { x: ['三月', '六月'] } })
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
    const rig = await makeRig({ ...BARS, window: { x: null }, onWindowChange })
    rig.api().setWindow({ x: ['一月', '四月'] })
    await settle()
    expect(onWindowChange).toHaveBeenCalledTimes(1)
    expect(marksOf(rig.api(), 'bar')).toHaveLength(8)
    rig.setProps({ window: { x: ['一月', '四月'] } })
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
    const rig = await makeRig({ ...BARS, defaultWindow: { x: ['一月', '二月'] } })
    const bars = marksOf(rig.api(), 'bar') as RectMark[]
    expect(bars).toHaveLength(2)
    expect(bars[1]!.x).toBeGreaterThan(rig.api().model.scene!.layout.plot.width / 2)
  })
})
