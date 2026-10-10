// @vitest-environment jsdom
// 页面可见性与视口进出共用一份监听：订阅方再多，文档里也只有一个 visibilitychange 监听、窗口里只有一个交叉观察器。
import type { TimestampProps } from '../src/timestamp'
import { createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { visibleToReader, watchInView, watchPageVisibility } from '../src/shared/view-watch'
import { timestampMachine } from '../src/timestamp'

class FakeObserver {
  static instances: FakeObserver[] = []
  observed = new Set<Element>()
  observe = vi.fn((el: Element) => this.observed.add(el))
  unobserve = vi.fn((el: Element) => this.observed.delete(el))
  disconnect = vi.fn(() => this.observed.clear())
  constructor(readonly callback: (entries: Array<{ target: Element, isIntersecting: boolean }>) => void) {
    FakeObserver.instances.push(this)
  }

  report(target: Element, isIntersecting: boolean): void {
    this.callback([{ target, isIntersecting }])
  }
}

function fakeWindow(): Window & typeof globalThis {
  FakeObserver.instances = []
  return { IntersectionObserver: FakeObserver } as unknown as Window & typeof globalThis
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('watchPageVisibility', () => {
  it('多个订阅方共用一个 visibilitychange 监听，最后一个退订时摘掉', () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const a: boolean[] = []
    const b: boolean[] = []
    const stopA = watchPageVisibility(document, visible => a.push(visible))
    const stopB = watchPageVisibility(document, visible => b.push(visible))
    expect(add.mock.calls.filter(([type]) => type === 'visibilitychange')).toHaveLength(1)

    const state = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    state.mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(a).toEqual([false, true])
    expect(b).toEqual([false, true])

    stopA()
    expect(remove.mock.calls.filter(([type]) => type === 'visibilitychange')).toHaveLength(0)
    stopB()
    expect(remove.mock.calls.filter(([type]) => type === 'visibilitychange')).toHaveLength(1)
  })
})

describe('watchInView', () => {
  it('没有 IntersectionObserver 的环境返回 null', () => {
    expect(watchInView({} as Window & typeof globalThis, document.createElement('div'), () => {})).toBeNull()
  })

  it('多个元素共用一个观察器，进出按元素分发', () => {
    const win = fakeWindow()
    const first = document.createElement('div')
    const second = document.createElement('div')
    const a: boolean[] = []
    const b: boolean[] = []
    watchInView(win, first, inView => a.push(inView))
    watchInView(win, second, inView => b.push(inView))
    expect(FakeObserver.instances).toHaveLength(1)
    const observer = FakeObserver.instances[0]!
    observer.report(first, false)
    observer.report(second, true)
    expect(a).toEqual([false])
    expect(b).toEqual([true])
  })

  it('同一节点再订阅时重新观察，让新订阅方也收到当前状态', () => {
    const win = fakeWindow()
    const el = document.createElement('div')
    watchInView(win, el, () => {})
    watchInView(win, el, () => {})
    const observer = FakeObserver.instances[0]!
    expect(observer.unobserve).toHaveBeenCalledWith(el)
    expect(observer.observe).toHaveBeenCalledTimes(2)
  })

  it('节点的最后一个订阅方退订时不再观察它，窗口里没有订阅方时断开观察器', () => {
    const win = fakeWindow()
    const first = document.createElement('div')
    const second = document.createElement('div')
    const stopFirstA = watchInView(win, first, () => {})!
    const stopFirstB = watchInView(win, first, () => {})!
    const stopSecond = watchInView(win, second, () => {})!
    const observer = FakeObserver.instances[0]!
    observer.unobserve.mockClear()

    stopFirstA()
    expect(observer.unobserve).not.toHaveBeenCalled()
    stopFirstB()
    expect(observer.unobserve).toHaveBeenCalledWith(first)
    expect(observer.disconnect).not.toHaveBeenCalled()
    stopSecond()
    expect(observer.disconnect).toHaveBeenCalledTimes(1)

    watchInView(win, first, () => {})
    expect(FakeObserver.instances).toHaveLength(2)
  })
})

describe('timestampMachine 共用可见性监听', () => {
  it('几台相对时间机器只挂一个 visibilitychange 监听，刷新重入后也不增加', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    vi.setSystemTime(new Date('2026-08-11T12:00:00'))
    const add = vi.spyOn(document, 'addEventListener')
    const runtimes = ['2026-08-11T11:58:30', '2026-08-11T11:57:10', '2026-08-11T11:50:00'].map((value) => {
      const runtime = createVanillaRuntime()
      const props = runtime.signal<TimestampProps>({ value, type: 'relative' })
      createService(timestampMachine, { props: () => props.get(), runtime })
      runtime.start()
      return runtime
    })
    const listeners = (): number => add.mock.calls.filter(([type]) => type === 'visibilitychange').length
    expect(listeners()).toBe(1)

    // 跨过几次刷新边界：每台机器都重入了 live，监听仍是同一个
    vi.advanceTimersByTime(3 * 60_000)
    expect(listeners()).toBe(1)
    for (const runtime of runtimes) runtime.stop()
  })
})

describe('visibleToReader', () => {
  it('作者关掉「进入视口才播」时一律算看得见；否则要视口观察报过在视口里、页面也不在后台', () => {
    const hidden = { visibilityState: 'hidden' } as Document
    expect(visibleToReader(false, null, hidden)).toBe(true)
    // 还没报过算看不见：入场先停着等它报
    expect(visibleToReader(undefined, null, document)).toBe(false)
    expect(visibleToReader(true, false, document)).toBe(false)
    expect(visibleToReader(undefined, true, document)).toBe(true)
    expect(visibleToReader(undefined, true, hidden)).toBe(false)
  })
})
