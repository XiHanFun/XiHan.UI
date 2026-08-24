// @vitest-environment jsdom
// useStickToBottom 在 Vue 里的两件事：句柄要交出去，节点到位后要真的绑上。
//
// 原语在建好那一刻就绑一次，而 setup 阶段模板 ref 还是 null——包装不替调用方重绑，
// 这个 use 在最常见的用法（两个 getter 读模板 ref）下就是个不动的壳：
// 状态永远停在初值，scrollToBottom 滚的是 null。
import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, ref } from 'vue'
import { useStickToBottom } from '../src/behavior'

// 假 ResizeObserver：jsdom 没有，原语绑定时要用
const roCallbacks = new Set<() => void>()

class FakeResizeObserver {
  private readonly cb: () => void
  constructor(cb: () => void) {
    this.cb = cb
  }

  observe(): void {
    roCallbacks.add(this.cb)
  }

  unobserve(): void {}
  disconnect(): void {
    roCallbacks.delete(this.cb)
  }
}

let app: App | null = null

beforeEach(() => {
  roCallbacks.clear()
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
})

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

interface Scroller {
  el: HTMLElement
  content: HTMLElement
  /** 这个容器上挂过哪些监听 */
  listeners: string[]
  scrollTo: ReturnType<typeof vi.fn>
}

/** 造一个几何可控、能记账的滚动容器。 */
function makeScroller(): Scroller {
  const el = document.createElement('div')
  const listeners: string[] = []
  const add = el.addEventListener.bind(el)
  el.addEventListener = ((type: string, ...rest: unknown[]) => {
    listeners.push(type)
    return (add as (...a: unknown[]) => void)(type, ...rest)
  }) as typeof el.addEventListener

  // jsdom 的 scrollTo 不改几何，换成记账的假货
  const scrollTo = vi.fn()
  el.scrollTo = scrollTo as unknown as typeof el.scrollTo
  Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true })
  Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true })

  const content = document.createElement('div')
  el.append(content)
  document.body.append(el)
  return { el, content, listeners, scrollTo }
}

/** 照最常见的用法接：两个 getter 读 ref，ref 在「挂载」后才有值。 */
function setup(initial: Scroller) {
  const scrollRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)
  let result!: ReturnType<typeof useStickToBottom>

  app = createApp({
    setup() {
      result = useStickToBottom({
        config: {
          scope: { getWin: () => window },
          reducedMotion: () => false,
        } as never,
        scrollEl: () => scrollRef.value,
        contentEl: () => contentRef.value,
      })
      return () => null
    },
  })
  app.mount(document.createElement('div'))

  return {
    result,
    /** 模拟挂载：模板 ref 这时候才拿到节点 */
    async attach(next: Scroller = initial) {
      scrollRef.value = next.el
      contentRef.value = next.content
      await nextTick()
      await nextTick()
    },
    /** 只换 ref、不等 watch 冲刷，用来单独验手动 retarget */
    swapWithoutFlush(next: Scroller) {
      scrollRef.value = next.el
      contentRef.value = next.content
    },
  }
}

describe('useStickToBottom', () => {
  it('句柄上的两个动作都交出来了', () => {
    const { result } = setup(makeScroller())
    expect(typeof result.scrollToBottom).toBe('function')
    expect(typeof result.retarget).toBe('function')
    expect(result.state.value).toBeNull()
  })

  it('setup 阶段 ref 还是空，节点到位后自动绑上', async () => {
    const scroller = makeScroller()
    const { attach } = setup(scroller)

    // 建的时候 getter 返回 null，容器上不该有任何监听
    expect(scroller.listeners).toEqual([])

    await attach()
    expect(scroller.listeners).toContain('scroll')
  })

  it('绑上之后 scrollToBottom 滚的是那个容器', async () => {
    const scroller = makeScroller()
    const { result, attach } = setup(scroller)
    await attach()

    result.scrollToBottom('instant')
    expect(scroller.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'instant' })
  })

  it('手动 retarget 能改绑到新容器，旧的不再被滚', async () => {
    const first = makeScroller()
    const { result, attach, swapWithoutFlush } = setup(first)
    await attach()
    first.scrollTo.mockClear()

    const second = makeScroller()
    swapWithoutFlush(second)
    result.retarget()

    result.scrollToBottom('instant')
    expect(second.scrollTo).toHaveBeenCalledTimes(1)
    expect(first.scrollTo).not.toHaveBeenCalled()
  })
})
