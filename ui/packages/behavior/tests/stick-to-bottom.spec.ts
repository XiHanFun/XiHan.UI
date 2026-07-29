// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import type { StickToBottomHandle, StickToBottomState } from '../src/stick-to-bottom'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStickToBottom, STICK_TO_BOTTOM_THRESHOLD } from '../src/stick-to-bottom'

// 假 ResizeObserver：只记录回调，由测试手动触发；几何量全部用 defineProperty 伪造。
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

function triggerResize(): void {
  for (const cb of [...roCallbacks]) cb()
}

function nextFrame(): Promise<void> {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function fakeConfig(reducedMotion = false): RuntimeConfig {
  const scope = createScope(document.body, createCounterIdGenerator())
  return { scope, reducedMotion: () => reducedMotion } as RuntimeConfig
}

interface Box {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

/** 伪造滚动几何，写 scrollTop 时按浏览器语义夹取到合法区间。 */
function defineBox(el: HTMLElement, init: Box): Box {
  const box = { ...init }
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => box.scrollTop,
    set: (v: number) => {
      box.scrollTop = Math.max(0, Math.min(v, box.scrollHeight - box.clientHeight))
    },
  })
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => box.scrollHeight })
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => box.clientHeight })
  return box
}

interface Harness {
  scrollEl: HTMLElement
  contentEl: HTMLElement
  box: Box
  /** 子节点的 offsetTop，可就地改写以模拟上方内容变高。 */
  offsets: number[]
  /** 被标为隐藏（offsetParent 为 null）的子节点下标，可就地增删。 */
  hidden: Set<number>
  changes: StickToBottomState[]
  handle: StickToBottomHandle
  scrollTo: (top: number) => void
  wheelUp: () => void
}

const handles: StickToBottomHandle[] = []

function harness(o: {
  box?: Partial<Box>
  offsets?: number[]
  hidden?: number[]
  threshold?: number
  reducedMotion?: boolean
} = {}): Harness {
  const scrollEl = document.createElement('div')
  const contentEl = document.createElement('div')
  scrollEl.appendChild(contentEl)
  document.body.appendChild(scrollEl)

  const offsets = [...(o.offsets ?? [])]
  // 记录哪些下标的子节点算隐藏
  const hidden = new Set<number>(o.hidden ?? [])
  offsets.forEach((_, i) => {
    const child = document.createElement('div')
    Object.defineProperty(child, 'offsetTop', { configurable: true, get: () => offsets[i] })
    // jsdom 下 offsetParent 恒为 null，按 hidden 集合伪造可见性
    Object.defineProperty(child, 'offsetParent', {
      configurable: true,
      get: () => (hidden.has(i) ? null : contentEl),
    })
    contentEl.appendChild(child)
  })

  const box = defineBox(scrollEl, {
    scrollTop: 700,
    scrollHeight: 1000,
    clientHeight: 300,
    ...o.box,
  })

  const changes: StickToBottomState[] = []
  const handle = createStickToBottom({
    config: fakeConfig(o.reducedMotion),
    scrollEl: () => scrollEl,
    contentEl: () => contentEl,
    threshold: o.threshold,
    onChange: s => void changes.push(s),
  })
  handles.push(handle)

  return {
    scrollEl,
    contentEl,
    box,
    offsets,
    hidden,
    changes,
    handle,
    scrollTo(top) {
      box.scrollTop = top
      scrollEl.dispatchEvent(new Event('scroll'))
    },
    wheelUp() {
      scrollEl.dispatchEvent(new WheelEvent('wheel', { deltaY: -1 }))
    },
  }
}

beforeEach(() => {
  Reflect.set(window, 'ResizeObserver', FakeResizeObserver)
})

afterEach(() => {
  for (const h of handles) h.dispose()
  handles.length = 0
  roCallbacks.clear()
  document.body.innerHTML = ''
})

describe('createStickToBottom（初值与判底）', () => {
  it('构造即粘附', () => {
    const h = harness()
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: true })
    expect(h.changes).toEqual([])
  })

  it('判底阈值含等号，超出一像素即不在底', () => {
    const h = harness()
    h.scrollTo(1000 - 300 - STICK_TO_BOTTOM_THRESHOLD)
    expect(h.handle.state().atBottom).toBe(true)
    h.scrollTo(1000 - 300 - STICK_TO_BOTTOM_THRESHOLD - 1)
    expect(h.handle.state().atBottom).toBe(false)
  })

  it('threshold 可配', () => {
    const h = harness({ threshold: 0 })
    h.scrollTo(699)
    expect(h.handle.state().atBottom).toBe(false)
    h.scrollTo(700)
    expect(h.handle.state().atBottom).toBe(true)
  })

  it('拖滚动条一类只产生 scroll 的上滚同样脱锚', () => {
    // 只派发 scroll，不派发 wheel / touchmove / keydown
    const h = harness()
    h.scrollTo(100)
    expect(h.handle.state()).toEqual({ atBottom: false, sticking: false })
  })

  it('向下滚不脱锚', () => {
    const h = harness({ box: { scrollTop: 100, scrollHeight: 1000, clientHeight: 300 } })
    h.scrollTo(300)
    expect(h.handle.state()).toEqual({ atBottom: false, sticking: true })
  })
})

describe('脱锚判据', () => {
  it('wheel deltaY<0 立即脱锚，deltaY>0 不脱', () => {
    const h = harness()
    h.scrollEl.dispatchEvent(new WheelEvent('wheel', { deltaY: 8 }))
    expect(h.handle.state().sticking).toBe(true)
    h.wheelUp()
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: false })
    expect(h.changes).toEqual([{ atBottom: true, sticking: false }])
  })

  it('touchmove 只在 scrollTop 变小时脱锚', () => {
    const h = harness({ box: { scrollTop: 400, scrollHeight: 1000, clientHeight: 300 } })
    h.box.scrollTop = 500
    h.scrollEl.dispatchEvent(new Event('touchmove'))
    expect(h.handle.state().sticking).toBe(true)
    h.box.scrollTop = 450
    h.scrollEl.dispatchEvent(new Event('touchmove'))
    expect(h.handle.state().sticking).toBe(false)
  })

  it('arrowUp / PageUp / Home 脱锚，其余键不脱', () => {
    for (const key of ['ArrowDown', 'PageDown', 'End', 'a']) {
      const h = harness()
      h.scrollEl.dispatchEvent(new KeyboardEvent('keydown', { key }))
      expect(h.handle.state().sticking, key).toBe(true)
    }
    for (const key of ['ArrowUp', 'PageUp', 'Home']) {
      const h = harness()
      h.scrollEl.dispatchEvent(new KeyboardEvent('keydown', { key }))
      expect(h.handle.state().sticking, key).toBe(false)
    }
  })
})

describe('尺寸变化', () => {
  it('粘附时 RO 回调直接吸底', () => {
    const h = harness()
    h.box.scrollHeight = 1600
    triggerResize()
    expect(h.box.scrollTop).toBe(1300)
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: true })
  })

  it('内容变矮不丢粘附：夹取引发的 scroll 只更新 atBottom', async () => {
    const h = harness()
    h.box.scrollHeight = 500
    triggerResize()
    expect(h.box.scrollTop).toBe(200)
    // 模拟浏览器夹小 scrollTop 后补发的 scroll
    h.scrollEl.dispatchEvent(new Event('scroll'))
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: true })
    await nextFrame()
    expect(h.handle.state().sticking).toBe(true)
  })

  it('脱锚后内容增高不自动跟到底', () => {
    const h = harness()
    h.wheelUp()
    h.scrollTo(300)
    h.box.scrollHeight = 1600
    triggerResize()
    expect(h.box.scrollTop).toBe(300)
    expect(h.handle.state()).toEqual({ atBottom: false, sticking: false })
  })

  it('不粘附时按二分选中的锚点补偿，上方内容变高不推动可视区', () => {
    const h = harness({ offsets: [0, 100, 200, 300] })
    h.wheelUp()
    h.scrollTo(250)
    // 锚点为最后一个 offsetTop <= 250 的子节点（200），delta = 50
    h.offsets[2] = 240
    h.offsets[3] = 340
    h.box.scrollHeight = 1040
    triggerResize()
    expect(h.box.scrollTop).toBe(290)
  })

  it('补偿窗口内即使写回到底部阈值内，也不自动重新粘附', () => {
    const h = harness({ offsets: [0, 100, 200, 300] })
    h.wheelUp()
    h.scrollTo(300)
    expect(h.handle.state()).toEqual({ atBottom: false, sticking: false })
    // 锚元素被推到 700，补偿写回后几何上已在底
    h.offsets[3] = 700
    triggerResize()
    expect(h.box.scrollTop).toBe(700)
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: false })
  })

  it('锚元素被移除时不补偿，下一次 scroll 自然重选', () => {
    const h = harness({ offsets: [0, 100, 200, 300] })
    h.wheelUp()
    h.scrollTo(250)
    h.contentEl.innerHTML = ''
    h.box.scrollHeight = 1600
    triggerResize()
    expect(h.box.scrollTop).toBe(250)
  })

  it('resizeObserver 缺席时降级为只跟滚动，不抛', () => {
    Reflect.deleteProperty(window, 'ResizeObserver')
    expect(() => harness()).not.toThrow()
    const h = harness()
    h.scrollTo(100)
    expect(h.handle.state()).toEqual({ atBottom: false, sticking: false })
  })

  it('隐藏子节点不被选作锚点', () => {
    const h = harness({ offsets: [0, 100, 200, 300], hidden: [2] })
    h.wheelUp()
    h.scrollTo(250)
    // 可见子节点中最后一个 offsetTop <= 250 的是下标 1（100），delta = 150
    h.offsets[1] = 160
    h.box.scrollHeight = 1060
    triggerResize()
    expect(h.box.scrollTop).toBe(310)
  })

  it('锚点选中后转为隐藏则不补偿', () => {
    const h = harness({ offsets: [0, 100, 200, 300] })
    h.wheelUp()
    h.scrollTo(250)
    h.hidden.add(2)
    h.offsets[2] = 240
    h.box.scrollHeight = 1040
    triggerResize()
    expect(h.box.scrollTop).toBe(250)
  })
})

describe('归位与重新粘附', () => {
  it('atBottom 由假变真时自动重新粘附', () => {
    const h = harness()
    h.wheelUp()
    h.scrollTo(100)
    expect(h.handle.state()).toEqual({ atBottom: false, sticking: false })
    h.scrollTo(700)
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: true })
  })

  it('scrollToBottom 立刻重新粘附，默认 smooth', () => {
    const h = harness()
    h.wheelUp()
    h.scrollTo(100)
    const spy = vi.fn((opts: ScrollToOptions) => {
      h.box.scrollTop = opts.top ?? 0
    })
    Object.defineProperty(h.scrollEl, 'scrollTo', { configurable: true, value: spy })
    h.handle.scrollToBottom()
    expect(spy).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' })
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: true })
  })

  it('reducedMotion 为真时强制 instant', () => {
    const h = harness({ reducedMotion: true })
    const spy = vi.fn()
    Object.defineProperty(h.scrollEl, 'scrollTo', { configurable: true, value: spy })
    h.handle.scrollToBottom('smooth')
    expect(spy).toHaveBeenCalledWith({ top: 1000, behavior: 'instant' })
  })

  it('scrollTo 缺席时直接写 scrollTop', () => {
    const h = harness()
    h.wheelUp()
    h.scrollTo(100)
    Object.defineProperty(h.scrollEl, 'scrollTo', { configurable: true, value: undefined })
    h.handle.scrollToBottom()
    expect(h.box.scrollTop).toBe(700)
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: true })
  })
})

describe('onChange 与 dispose', () => {
  it('onChange 只在值真变时调', () => {
    const h = harness()
    h.scrollTo(700)
    h.scrollTo(700)
    expect(h.changes).toEqual([])
    h.scrollTo(100)
    expect(h.changes).toEqual([{ atBottom: false, sticking: false }])
    h.scrollTo(100)
    expect(h.changes).toHaveLength(1)
  })

  it('dispose 幂等且摘干净监听与观察', () => {
    const h = harness()
    h.handle.dispose()
    h.handle.dispose()

    h.wheelUp()
    h.scrollTo(100)
    h.box.scrollHeight = 2000
    triggerResize()

    expect(h.box.scrollTop).toBe(100)
    expect(h.handle.state()).toEqual({ atBottom: true, sticking: true })
    expect(h.changes).toEqual([])
  })

  it('scrollEl 返回 null 时不挂监听、方法不抛', () => {
    const handle = createStickToBottom({
      config: fakeConfig(),
      scrollEl: () => null,
      contentEl: () => null,
    })
    expect(handle.state()).toEqual({ atBottom: true, sticking: true })
    expect(() => handle.scrollToBottom()).not.toThrow()
    expect(handle.state()).toEqual({ atBottom: true, sticking: true })
    handle.dispose()
    expect(() => handle.dispose()).not.toThrow()
  })

  it('节点晚一拍出现时 retarget 能把监听补挂上', () => {
    // 构造时 scrollEl 为 null，节点补齐后调 retarget
    let scrollEl: HTMLElement | null = null
    const contentEl = document.createElement('div')
    const changes: StickToBottomState[] = []
    const handle = createStickToBottom({
      config: fakeConfig(),
      scrollEl: () => scrollEl,
      contentEl: () => contentEl,
      onChange: s => void changes.push(s),
    })
    handles.push(handle)

    const el = document.createElement('div')
    el.appendChild(contentEl)
    document.body.appendChild(el)
    const box = defineBox(el, { scrollTop: 700, scrollHeight: 1000, clientHeight: 300 })
    scrollEl = el

    handle.retarget()

    box.scrollTop = 100
    el.dispatchEvent(new Event('scroll'))
    expect(handle.state()).toEqual({ atBottom: false, sticking: false })
    expect(changes).toEqual([{ atBottom: false, sticking: false }])
  })

  it('retarget 在节点没换时不做无谓的重绑', () => {
    const h = harness()
    h.wheelUp()
    expect(h.handle.state().sticking).toBe(false)
    h.handle.retarget()
    // 节点未变，粘附状态与锚点保持不变
    expect(h.handle.state().sticking).toBe(false)
    h.box.scrollHeight = 1600
    triggerResize()
    expect(h.box.scrollTop).toBe(700)
  })
})
