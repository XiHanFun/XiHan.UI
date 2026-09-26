// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackAppearance } from '../src/behavior/arrival'

// jsdom 不排版：节点生成不生成盒、页面加载完没有、盒尺寸何时变化，都由这里的桩给出
let visible: WeakSet<Element>
let loaded: boolean
let observers: Array<{ callback: () => void, targets: Element[], disconnected: boolean }>
let stops: Array<() => void> = []

beforeEach(() => {
  visible = new WeakSet()
  loaded = false
  observers = []
  vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
    return (visible.has(this) ? [new DOMRect(0, 0, 10, 10)] : []) as unknown as DOMRectList
  })
  vi.spyOn(document, 'readyState', 'get').mockImplementation(() => (loaded ? 'complete' : 'interactive'))
  class FakeResizeObserver {
    private readonly record: (typeof observers)[number]
    constructor(callback: () => void) {
      this.record = { callback, targets: [], disconnected: false }
      observers.push(this.record)
    }

    observe(target: Element): void {
      this.record.targets.push(target)
    }

    disconnect(): void {
      this.record.disconnected = true
    }
  }
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
})

afterEach(() => {
  stops.forEach(stop => stop())
  stops = []
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

function node(shown: boolean): HTMLElement {
  const el = document.createElement('div')
  document.body.append(el)
  if (shown)
    visible.add(el)
  return el
}

function track(el: HTMLElement, adopted?: boolean): ReturnType<typeof vi.fn> {
  const release = vi.fn()
  stops.push(trackAppearance(el, release, { adopted }))
  return release
}

/** 盒尺寸变了：观察器回调一次。 */
function resize(): void {
  for (const o of observers) {
    if (!o.disconnected)
      o.callback()
  }
}

describe('trackAppearance', () => {
  it('页面加载完成之前挂上、此刻可见：属于首屏，不放开', () => {
    const release = track(node(true))
    expect(release).not.toHaveBeenCalled()
  })

  it('页面加载完成之后挂上：是新出现的，当场放开', () => {
    loaded = true
    const release = track(node(true))
    expect(release).toHaveBeenCalledTimes(1)
    expect(observers).toHaveLength(0)
  })

  it('水合来的节点在加载完成之后挂上，仍属于首屏', () => {
    loaded = true
    const release = track(node(true), true)
    expect(release).not.toHaveBeenCalled()
  })

  it('挂上时本就不可见：下一次显出就是出现，当场放开', () => {
    const release = track(node(false), true)
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('首屏可见的节点第一次收起时放开，只放开一次；尺寸变化但仍可见不算', () => {
    const el = node(true)
    const release = track(el)
    resize()
    expect(release).not.toHaveBeenCalled()
    visible.delete(el)
    resize()
    expect(release).toHaveBeenCalledTimes(1)
    expect(observers[0]!.disconnected).toBe(true)
    visible.add(el)
    resize()
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('停止后不再观察', () => {
    const el = node(true)
    const release = track(el)
    stops.pop()!()
    expect(observers[0]!.disconnected).toBe(true)
    visible.delete(el)
    resize()
    expect(release).not.toHaveBeenCalled()
  })
})
