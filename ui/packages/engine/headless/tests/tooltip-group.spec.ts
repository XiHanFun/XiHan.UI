// @vitest-environment jsdom
// 提示组与跟随鼠标：Provider 建的一组共用接替窗口、同组只开一个，并给组内提示下发延时缺省；
// 跟随鼠标时提示锚在指针落点上，随移动重挂，触屏与聚焦打开退回锚定到 trigger。
import type { Anchor, PositionEnginePort, PositionOptions } from '@xihan-ui/core'
import type { TooltipGroup, TooltipSchema } from '../src/tooltip'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTooltip, createTooltipGroup, tooltipMachine } from '../src/tooltip'

type Props = TooltipSchema['props']

const live: Array<() => void> = []

afterEach(() => {
  for (const stop of live.splice(0))
    stop()
  vi.useRealTimers()
})

/** 离别的用例收起的提示足够远：接替窗口按 Date 算，先把钟拨到远处。 */
function farClock(): void {
  vi.useFakeTimers()
  vi.setSystemTime(Date.now() + 60_000)
}

interface Harness {
  service: ReturnType<typeof createService<TooltipSchema>>
  open: () => boolean
  send: (event: TooltipSchema['event']) => void
  api: () => ReturnType<typeof connectTooltip>
}

function makeTooltip(props: Props, setup?: (service: Harness['service']) => void): Harness {
  const runtime = createVanillaRuntime()
  const service = createService(tooltipMachine, { props: () => props, runtime })
  setup?.(service)
  runtime.start()
  live.push(() => runtime.stop())
  const api = () => connectTooltip(service, normalizeProps)
  return { service, open: () => api().open, send: event => service.send(event), api }
}

function inGroup(group: TooltipGroup, props: Props = {}): Harness {
  return makeTooltip(props, service => service.refs.set('group', group))
}

describe('提示组的延时缺省', () => {
  it('组给的 openDelay / closeDelay 作为组内提示的缺省；提示自己写的压过组', () => {
    farClock()
    const group = createTooltipGroup(() => ({ openDelay: 100, closeDelay: 50, skipDelayDuration: 0 }))
    const plain = inGroup(group)
    plain.send({ type: 'POINTER.ENTER' })
    vi.advanceTimersByTime(99)
    expect(plain.open()).toBe(false)
    vi.advanceTimersByTime(1)
    expect(plain.open()).toBe(true)
    plain.send({ type: 'POINTER.LEAVE' })
    vi.advanceTimersByTime(49)
    expect(plain.open()).toBe(true)
    vi.advanceTimersByTime(1)
    expect(plain.open()).toBe(false)

    const own = inGroup(group, { openDelay: 400 })
    own.send({ type: 'POINTER.ENTER' })
    vi.advanceTimersByTime(100)
    expect(own.open()).toBe(false)
    vi.advanceTimersByTime(300)
    expect(own.open()).toBe(true)
  })

  it('组的缺省每次现读：Provider 改了值，下一次开合就按新值等', () => {
    farClock()
    let openDelay = 100
    const group = createTooltipGroup(() => ({ openDelay, skipDelayDuration: 0 }))
    const t = inGroup(group)
    openDelay = 250
    t.send({ type: 'POINTER.ENTER' })
    vi.advanceTimersByTime(100)
    expect(t.open()).toBe(false)
    vi.advanceTimersByTime(150)
    expect(t.open()).toBe(true)
  })
})

describe('同组只开一个', () => {
  it('组里另一个开着时，指向这一个按组的接替窗口直接打开，上一个随之收起', () => {
    farClock()
    const group = createTooltipGroup(() => ({ openDelay: 500, skipDelayDuration: 300 }))
    const first = inGroup(group)
    const second = inGroup(group)
    first.send({ type: 'OPEN' })
    second.send({ type: 'POINTER.ENTER' })
    vi.advanceTimersByTime(0)
    expect(second.open()).toBe(true)
    expect((second.api().getContentProps() as Record<string, unknown>)['data-instant']).toBe('')
    expect(first.open()).toBe(false)
  })

  it('不同组互不接替、互不收起：组外的提示照样等 openDelay，组里开着的不被它收走', () => {
    farClock()
    const group = createTooltipGroup(() => ({ openDelay: 500, skipDelayDuration: 300 }))
    const other = createTooltipGroup(() => ({ openDelay: 500, skipDelayDuration: 300 }))
    const inside = inGroup(group)
    const outside = inGroup(other)
    inside.send({ type: 'OPEN' })
    outside.send({ type: 'POINTER.ENTER' })
    vi.advanceTimersByTime(0)
    expect(outside.open()).toBe(false)
    vi.advanceTimersByTime(500)
    expect(outside.open()).toBe(true)
    expect(inside.open()).toBe(true)
  })
})

describe('跟随鼠标', () => {
  /** 记下每一轮挂上的锚点与参数；不量 DOM，结果一律落在原点。 */
  function recordingEngine(): { engine: PositionEnginePort, anchors: Anchor[], options: PositionOptions[] } {
    const anchors: Anchor[] = []
    const options: PositionOptions[] = []
    return {
      anchors,
      options,
      engine: {
        attach(anchor, _floating, opts, onResult) {
          anchors.push(anchor)
          options.push(opts)
          onResult({ x: 0, y: 0, placement: opts.placement ?? 'top', hidden: false })
          return () => {}
        },
      },
    }
  }

  function followed(props: Props = {}) {
    const trigger = document.createElement('button')
    const floating = document.createElement('div')
    const recorder = recordingEngine()
    const t = makeTooltip({ followCursor: true, openDelay: 0, skipDelayDuration: 0, ...props }, (service) => {
      service.refs.set('position', recorder.engine)
      service.refs.set('getAnchorEl', () => trigger)
      service.refs.set('getFloatingEl', () => floating)
    })
    return { ...t, trigger, recorder }
  }

  const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

  it('指针打开时锚在落点上，移动后按新落点重挂一轮', async () => {
    const t = followed()
    t.send({ type: 'POINTER.ENTER', point: { x: 40, y: 30 }, pointerType: 'mouse' })
    await flush()
    await flush()
    expect(t.open()).toBe(true)
    const first = t.recorder.anchors.at(-1)!
    expect(first).not.toBe(t.trigger)
    expect(first.getBoundingClientRect()).toEqual({ x: 40, y: 30, width: 0, height: 0 })

    const before = t.recorder.anchors.length
    t.send({ type: 'POINTER.MOVE', point: { x: 90, y: 35 }, pointerType: 'mouse' })
    await flush()
    expect(t.recorder.anchors.length).toBeGreaterThan(before)
    expect(t.recorder.anchors.at(-1)!.getBoundingClientRect()).toEqual({ x: 90, y: 35, width: 0, height: 0 })
  })

  it('触屏没有悬停落点：退回锚定到 trigger', async () => {
    const t = followed()
    t.send({ type: 'POINTER.ENTER', point: { x: 40, y: 30 }, pointerType: 'touch' })
    await flush()
    await flush()
    expect(t.open()).toBe(true)
    expect(t.recorder.anchors.at(-1)).toBe(t.trigger)
  })

  it('聚焦打开没有指针：锚定到 trigger', async () => {
    const t = followed()
    t.send({ type: 'FOCUS' })
    await flush()
    expect(t.recorder.anchors.at(-1)).toBe(t.trigger)
  })

  it('没开跟随鼠标：移动不重挂，定位层不带跟随标记', async () => {
    const t = followed({ followCursor: false })
    t.send({ type: 'POINTER.ENTER', point: { x: 40, y: 30 }, pointerType: 'mouse' })
    await flush()
    await flush()
    const count = t.recorder.anchors.length
    expect(t.recorder.anchors.at(-1)).toBe(t.trigger)
    t.send({ type: 'POINTER.MOVE', point: { x: 90, y: 35 }, pointerType: 'mouse' })
    await flush()
    expect(t.recorder.anchors.length).toBe(count)
    expect((t.api().getPositionerProps() as Record<string, unknown>)['data-follow-cursor']).toBeUndefined()
    expect((t.api().getTriggerProps() as Record<string, unknown>).onPointermove).toBeUndefined()
  })

  it('开了跟随鼠标：定位层带跟随标记，trigger 听指针移动', () => {
    const t = followed()
    expect((t.api().getPositionerProps() as Record<string, unknown>)['data-follow-cursor']).toBe('')
    expect(typeof (t.api().getTriggerProps() as Record<string, unknown>).onPointermove).toBe('function')
  })
})
