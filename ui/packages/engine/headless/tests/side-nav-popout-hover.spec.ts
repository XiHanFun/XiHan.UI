// @vitest-environment jsdom
import type { SideNavSchema } from '../src/side-nav'
import { createService, HOVER_INTENT_OPEN_DELAY, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectSideNav, sideNavMachine } from '../src/side-nav'

type Props = SideNavSchema['props']

const COLLECTION = [
  { value: 'products', label: 'Products', children: [{ value: 'product-a', label: 'Product A' }] },
  { value: 'docs', label: 'Docs', children: [{ value: 'doc-a', label: 'Doc A' }] },
  { value: 'guide', label: 'Guide' },
]

let stops: Array<() => void> = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  stops.forEach(stop => stop())
  stops = []
  vi.useRealTimers()
})

/** 折叠成图标栏、顶层分支悬停弹出的一台侧栏。 */
function mount(initial: Partial<Props> = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(sideNavMachine, {
    props: () => ({ collection: COLLECTION, collapsed: true, ...initial }),
    runtime,
  })
  runtime.start()
  let stopped = false
  const stop = (): void => {
    if (!stopped)
      runtime.stop()
    stopped = true
  }
  stops.push(stop)
  const trigger = (value: string) => connectSideNav(service, normalizeProps).getBranchTriggerProps({ value }) as Record<string, (event?: unknown) => void>
  return {
    enter: (value: string, pointerType = 'mouse') => trigger(value).onPointerenter!({ pointerType }),
    leave: (value: string) => trigger(value).onPointerleave!(),
    popout: () => (service.state.get() === 'popout' ? service.context.get('popoutValue') : null),
    stop,
  }
}

describe('侧栏折叠态的悬停弹出', () => {
  it('指针停在分支上够久才弹出，等待取悬停意图的缺省开延时', () => {
    const nav = mount()
    nav.enter('products')
    vi.advanceTimersByTime(HOVER_INTENT_OPEN_DELAY - 1)
    expect(nav.popout()).toBeNull()
    vi.advanceTimersByTime(1)
    expect(nav.popout()).toBe('products')
  })

  it('等待期离开就地撤销；扫过一串分支只弹出最后停下的那个', () => {
    const nav = mount()
    nav.enter('products')
    nav.leave('products')
    vi.advanceTimersByTime(HOVER_INTENT_OPEN_DELAY * 3)
    expect(nav.popout()).toBeNull()

    nav.enter('products')
    vi.advanceTimersByTime(HOVER_INTENT_OPEN_DELAY / 2)
    nav.enter('docs')
    vi.advanceTimersByTime(HOVER_INTENT_OPEN_DELAY - 1)
    expect(nav.popout()).toBeNull()
    vi.advanceTimersByTime(1)
    expect(nav.popout()).toBe('docs')
  })

  it('已弹出一枝时停到另一枝上：到点换过去', () => {
    const nav = mount()
    nav.enter('products')
    vi.advanceTimersByTime(HOVER_INTENT_OPEN_DELAY)
    nav.enter('docs')
    vi.advanceTimersByTime(HOVER_INTENT_OPEN_DELAY)
    expect(nav.popout()).toBe('docs')
  })

  it('触屏没有悬停，不起等待', () => {
    const nav = mount()
    nav.enter('products', 'touch')
    vi.advanceTimersByTime(HOVER_INTENT_OPEN_DELAY * 3)
    expect(nav.popout()).toBeNull()
  })

  it('两台侧栏各自计时：一台的离开不撤销另一台的等待', () => {
    const a = mount()
    const b = mount()
    a.enter('products')
    b.enter('docs')
    b.leave('docs')
    vi.advanceTimersByTime(HOVER_INTENT_OPEN_DELAY)
    expect(a.popout()).toBe('products')
    expect(b.popout()).toBeNull()
  })

  it('等待期内卸载：到点不再往停掉的机器里送事件', () => {
    const nav = mount()
    nav.enter('products')
    nav.stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})
