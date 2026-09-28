// @vitest-environment jsdom
// 流式：列式数据仓的推送按帧合成一次刷新；窗口跟随最新的数据（右端贴着末端才跟、拖离即停、写 true 跳回末端）；
// 数据流过停着的指针时按原位置重新拾取；换数据仓换订阅；追加出乱序时报出来。对象数组换数据时同样跟随。
import type { ColumnStore } from '@xihan-ui/viz/columns'
import type { Dict, Props, Rig } from './cartesian-rig'
import { DIAGNOSTIC_CODES, onDiagnostic } from '@xihan-ui/core'
import { createColumnStore } from '@xihan-ui/viz/columns'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cartesianModelOf } from '../src/cartesian-chart/cartesian-chart.logic'
import { makeRig, onCleanup, settle } from './cartesian-rig'

const STEP = 1000
const T0 = Date.UTC(2026, 8, 1, 9, 30)

/** 一条逐秒的价格线：n 个点。 */
function prices(n: number): ColumnStore {
  const store = createColumnStore({ fields: ['t', 'p'] })
  for (let i = 0; i < n; i++)
    store.append({ t: T0 + i * STEP, p: 100 + Math.sin(i / 3) * 5 })
  return store
}

function chart(store: ColumnStore, extra: Props = {}): Props {
  return { data: store, series: [{ mark: 'line', x: 't', y: 'p', name: '价格' }], xAxis: { scale: 'utc' }, locale: 'en-US', ...extra }
}

/** 追加第 i 个点。 */
function push(store: ColumnStore, i: number): void {
  store.append({ t: T0 + i * STEP, p: 100 + Math.sin(i / 3) * 5 })
}

function windowX(rig: Rig): number[] {
  return (rig.service.context.get('window').x ?? []).map(v => v.valueOf() as number)
}

/** 走一帧：假时钟里 requestAnimationFrame 每 16ms 一拍。 */
async function frame(): Promise<void> {
  vi.advanceTimersByTime(16)
  await settle()
}

function fakeFrames(): void {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('合帧', () => {
  it('同一帧里的多次推送只刷新一次；刷新后摘要、数据表与画布图层都是新数据', async () => {
    const store = prices(50)
    const rig = await makeRig(chart(store))
    fakeFrames()
    for (let i = 50; i < 60; i++)
      push(store, i)
    expect(rig.service.context.get('dataVersion')).toBe(0)
    await frame()
    expect(rig.service.context.get('dataVersion')).toBe(1)
    expect(rig.api().table.rows).toHaveLength(60)
    expect(cartesianModelOf(rig.service).columns!.data.length).toBe(60)
  })

  it('换了数据仓就撤掉旧的订阅', async () => {
    const first = prices(10)
    const rig = await makeRig(chart(first))
    const second = prices(20)
    rig.setProps({ data: second })
    await settle()
    fakeFrames()
    push(first, 10)
    await frame()
    expect(rig.service.context.get('dataVersion')).toBe(0)
    push(second, 20)
    await frame()
    expect(rig.service.context.get('dataVersion')).toBe(1)
  })
})

describe('跟随', () => {
  it('窗口右端贴着数据末端：新数据到来时窗口右移、宽度不变，派发 onWindowChange', async () => {
    const store = prices(100)
    const onWindowChange = vi.fn()
    const rig = await makeRig(chart(store, { zoom: 'x', defaultWindow: { x: [new Date(T0 + 80 * STEP), new Date(T0 + 99 * STEP)], y: null }, onWindowChange }))
    fakeFrames()
    for (let i = 100; i < 105; i++)
      push(store, i)
    await frame()
    expect(windowX(rig)).toEqual([T0 + 85 * STEP, T0 + 104 * STEP])
    expect(onWindowChange).toHaveBeenCalledTimes(1)
    expect(rig.service.context.get('follow')).toBe(true)
  })

  it('等距排列按新增的点数右移', async () => {
    const store = prices(100)
    const rig = await makeRig(chart(store, { xAxis: { scale: 'utc', ordinal: true }, zoom: 'x', defaultWindow: { x: [new Date(T0 + 90 * STEP), new Date(T0 + 99 * STEP)], y: null } }))
    fakeFrames()
    // 中间休市：时间跳过一大段，等距轴仍按点数移
    store.append({ t: T0 + 500 * STEP, p: 101 })
    store.append({ t: T0 + 501 * STEP, p: 102 })
    await frame()
    expect(windowX(rig)).toEqual([T0 + 92 * STEP, T0 + 501 * STEP])
  })

  it('窗口不在末端时数据流过不动它；用户把窗口拖回末端恢复跟随', async () => {
    const store = prices(100)
    const onFollowChange = vi.fn()
    const rig = await makeRig(chart(store, { zoom: 'x', defaultWindow: { x: [new Date(T0 + 10 * STEP), new Date(T0 + 29 * STEP)], y: null }, onFollowChange }))
    fakeFrames()
    push(store, 100)
    await frame()
    expect(windowX(rig)).toEqual([T0 + 10 * STEP, T0 + 29 * STEP])
    rig.service.send({ type: 'WINDOW.SET', window: { x: [new Date(T0 + 81 * STEP), new Date(T0 + 100 * STEP)], y: null } })
    await settle()
    expect(rig.service.context.get('follow')).toBe(true)
    rig.service.send({ type: 'WINDOW.SET', window: { x: [new Date(T0 + 50 * STEP), new Date(T0 + 69 * STEP)], y: null } })
    await settle()
    expect(rig.service.context.get('follow')).toBe(false)
    expect(onFollowChange.mock.calls.map(([details]) => (details as Dict).follow)).toEqual([false])
    // 停止跟随后，即使窗口右端恰好在末端附近，数据流过也不动
    rig.service.send({ type: 'WINDOW.SET', window: { x: [new Date(T0 + 81 * STEP), new Date(T0 + 100 * STEP)], y: null } })
    await settle()
    expect(onFollowChange.mock.calls.map(([details]) => (details as Dict).follow)).toEqual([false, true])
  })

  it('受控写成 true 时窗口一步跳到末端，宽度不变', async () => {
    const store = prices(100)
    const rig = await makeRig(chart(store, { zoom: 'x', follow: false, defaultWindow: { x: [new Date(T0 + 10 * STEP), new Date(T0 + 29 * STEP)], y: null } }))
    rig.setProps({ follow: true })
    await settle()
    expect(windowX(rig)).toEqual([T0 + 80 * STEP, T0 + 99 * STEP])
    expect(rig.service.context.get('windowStep')).toBe(true)
  })

  it('没放大时整条轴本来就包含新数据：窗口保持整条', async () => {
    const store = prices(20)
    const rig = await makeRig(chart(store, { zoom: 'x' }))
    fakeFrames()
    push(store, 20)
    await frame()
    expect(rig.service.context.get('window').x).toBeNull()
  })

  it('对象数组换数据时同样跟随：类目轴按新增的类目数右移', async () => {
    const rows = (n: number): Dict[] => Array.from({ length: n }, (_, i) => ({ day: `D${i}`, v: i }))
    const rig = await makeRig({ data: rows(30), series: [{ mark: 'bar', x: 'day', y: 'v' }], zoom: 'x', defaultWindow: { x: ['D20', 'D29'], y: null } })
    rig.setProps({ data: rows(33) })
    await settle()
    expect(rig.service.context.get('window').x).toEqual(['D23', 'D32'])
  })
})

describe('数据流过停着的指针', () => {
  it('按指针原来的位置重新拾取：提示框跟着指针下面换了的那个数据走', async () => {
    const store = prices(100)
    const rig = await makeRig(chart(store, { zoom: 'x', defaultWindow: { x: [new Date(T0 + 80 * STEP), new Date(T0 + 99 * STEP)], y: null } }))
    const plot = cartesianModelOf(rig.service).scene!.layout.plot
    const at = { x: plot.x + plot.width / 2, y: plot.y + plot.height / 2 }
    const target = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 240 }) }
    ;(rig.api().getPlotProps() as Dict).onPointerMove({ currentTarget: target, clientX: at.x, clientY: at.y, pointerType: 'mouse' })
    await settle()
    const before = rig.service.context.get('hover')!.ref.index
    fakeFrames()
    for (let i = 100; i < 104; i++)
      push(store, i)
    await frame()
    expect(rig.service.context.get('hover')!.ref.index).toBe(before + 4)
    expect(rig.api().active?.index).toBe(before + 4)
  })
})

describe('诊断', () => {
  it('追加出乱序的时间戳时报 chart.columns-unsorted，画面不画', async () => {
    const store = prices(20)
    const seen: string[] = []
    onCleanup(onDiagnostic(record => seen.push(record.code)))
    const rig = await makeRig(chart(store))
    fakeFrames()
    store.append({ t: T0, p: 1 })
    await frame()
    expect(seen).toContain(DIAGNOSTIC_CODES.chartColumnsUnsorted)
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
  })
})

describe('放大后的键盘落点', () => {
  it('没有焦点时锚点是窗口里的第一个数据：Tab 进来不落在窗外', async () => {
    const store = prices(100)
    const rig = await makeRig(chart(store, { zoom: 'x', defaultWindow: { x: [new Date(T0 + 60 * STEP), new Date(T0 + 99 * STEP)], y: null } }))
    const point = rig.api().layers.plot.find(m => m.part === 'point')
    expect(point).toBeUndefined()
    // 焦点落在绘图区自己身上：转投给锚点
    const plotEl = { matches: () => true }
    ;(rig.api().getPlotProps() as Dict).onFocusIn({ target: plotEl, currentTarget: plotEl })
    await settle()
    expect(rig.service.context.get('focused')?.index).toBe(60)
    const rows = await makeRig({ data: Array.from({ length: 30 }, (_, i) => ({ day: `D${i}`, v: i })), series: [{ mark: 'bar', x: 'day', y: 'v' }], zoom: 'x', defaultWindow: { x: ['D20', 'D29'], y: null } })
    const anchor = (rows.api().getPlotProps() as Dict).tabindex
    expect(anchor).toBe(-1)
    const bars = rows.api().layers.plot.flatMap(m => (m.kind === 'group' ? m.children : [])).filter(m => m.part === 'bar')
    expect(bars.filter(m => (rows.api().getMarkProps(m) as Dict).tabindex === 0).map(m => m.datum!.index)).toEqual([20])
  })
})

describe('窗口落在数据之外', () => {
  it('数据还没到时写了时间窗口：不抛错，自变量轴按整条画；数据到了窗口照常生效', async () => {
    const window = { x: [new Date(T0 + 10 * STEP), new Date(T0 + 19 * STEP)] as [Date, Date], y: null }
    const rig = await makeRig({ series: [{ mark: 'line', x: 't', y: 'p' }], xAxis: { scale: 'utc' }, zoom: 'x', defaultWindow: window })
    expect(cartesianModelOf(rig.service).scene!.layout.window.x).toEqual({ start: 0, end: 1 })
    rig.setProps({ data: prices(40) })
    await settle()
    const w = cartesianModelOf(rig.service).scene!.layout.window.x
    expect(w.end - w.start).toBeLessThan(0.5)
  })
})
