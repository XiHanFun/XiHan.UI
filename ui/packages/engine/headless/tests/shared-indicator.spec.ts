// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { measureIndicatorBox, sameIndicatorBox, trackIndicatorLayout } from '../src/shared/indicator'

afterEach(() => {
  document.body.innerHTML = ''
})

/** jsdom 不排版：把排布位写死在节点上，offsetParent 由测试指定。 */
function layout(el: HTMLElement, box: { left?: number, top?: number, width?: number, height?: number, parent?: HTMLElement | null, border?: number, clientWidth?: number }): HTMLElement {
  const define = (key: string, value: unknown): void => {
    Object.defineProperty(el, key, { configurable: true, get: () => value })
  }
  define('offsetLeft', box.left ?? 0)
  define('offsetTop', box.top ?? 0)
  define('offsetWidth', box.width ?? 0)
  define('offsetHeight', box.height ?? 0)
  define('offsetParent', box.parent ?? null)
  define('clientLeft', box.border ?? 0)
  define('clientTop', box.border ?? 0)
  define('clientWidth', box.clientWidth ?? 0)
  return el
}

function fixture(dir?: 'rtl'): { container: HTMLElement, item: HTMLElement } {
  const container = layout(document.createElement('div'), { clientWidth: 300 })
  if (dir)
    container.setAttribute('dir', dir)
  const item = layout(document.createElement('button'), { left: 40, top: 4, width: 60, height: 28, parent: container })
  container.append(item)
  document.body.append(container)
  return { container, item }
}

describe('measureIndicatorBox', () => {
  it('取条目相对容器内衬盒的排布位', () => {
    const { container, item } = fixture()
    expect(measureIndicatorBox(container, item)).toEqual({ inlineStart: 40, blockStart: 4, inlineSize: 60, blockSize: 28 })
  })

  it('rTL 下起始缘从内衬盒的右缘往左量，方向从容器现读', () => {
    const { container, item } = fixture('rtl')
    expect(measureIndicatorBox(container, item)?.inlineStart).toBe(300 - 40 - 60)
  })

  it('显式给的方向优先于容器上读到的', () => {
    const { container, item } = fixture('rtl')
    expect(measureIndicatorBox(container, item, 'ltr')?.inlineStart).toBe(40)
  })

  it('越过中间一层定位祖先时累加它的偏移与描边', () => {
    const container = layout(document.createElement('div'), { clientWidth: 300 })
    const group = layout(document.createElement('div'), { left: 10, top: 6, parent: container, border: 1 })
    const item = layout(document.createElement('a'), { left: 20, top: 2, width: 50, height: 20, parent: group })
    group.append(item)
    container.append(group)
    expect(measureIndicatorBox(container, item)).toEqual({ inlineStart: 31, blockStart: 9, inlineSize: 50, blockSize: 20 })
  })

  it('条目不在容器的定位链里时量不出来', () => {
    const { container } = fixture()
    const stray = layout(document.createElement('button'), { left: 5, width: 10, parent: null })
    expect(measureIndicatorBox(container, stray)).toBeNull()
  })

  it('sameIndicatorBox 逐项比较，null 只与 null 相等', () => {
    const box = { inlineStart: 1, blockStart: 2, inlineSize: 3, blockSize: 4 }
    expect(sameIndicatorBox(box, { ...box })).toBe(true)
    expect(sameIndicatorBox(box, { ...box, inlineSize: 5 })).toBe(false)
    expect(sameIndicatorBox(null, null)).toBe(true)
    expect(sameIndicatorBox(box, null)).toBe(false)
  })
})

describe('trackIndicatorLayout', () => {
  function fakeWin() {
    const observed = new Set<Element>()
    let notify: () => void = () => {}
    class FakeResizeObserver {
      constructor(cb: () => void) {
        notify = cb
      }

      observe(el: Element): void {
        observed.add(el)
      }

      disconnect(): void {
        observed.clear()
      }
    }
    const frames: Array<() => void> = []
    const win = {
      ResizeObserver: FakeResizeObserver,
      MutationObserver: window.MutationObserver,
      requestAnimationFrame: (cb: () => void) => frames.push(cb),
      cancelAnimationFrame: vi.fn(),
    } as unknown as Window & typeof globalThis
    return { win, observed, resize: () => notify(), flushFrame: () => frames.splice(0).forEach(cb => cb()) }
  }

  it('盯住容器与每个条目的尺寸，同一帧里的多次变化只回调一次', () => {
    const { container, item } = fixture()
    const { win, observed, resize, flushFrame } = fakeWin()
    const onChange = vi.fn()
    const stop = trackIndicatorLayout(win, { container, items: () => [item], onChange })
    expect([...observed]).toEqual([container, item])

    resize()
    resize()
    flushFrame()
    expect(onChange).toHaveBeenCalledTimes(1)
    stop()
  })

  it('条目增减后重新盯住新条目并重量', async () => {
    const { container, item } = fixture()
    const { win, observed, flushFrame } = fakeWin()
    const onChange = vi.fn()
    const extra = document.createElement('button')
    const stop = trackIndicatorLayout(win, { container, items: () => container.querySelectorAll('button'), onChange })

    container.append(extra)
    await Promise.resolve()
    expect([...observed]).toEqual([container, item, extra])
    flushFrame()
    expect(onChange).toHaveBeenCalledTimes(1)
    stop()
  })

  it('停下之后不再回调', () => {
    const { container, item } = fixture()
    const { win, resize, flushFrame } = fakeWin()
    const onChange = vi.fn()
    const stop = trackIndicatorLayout(win, { container, items: () => [item], onChange })
    resize()
    stop()
    flushFrame()
    expect(onChange).not.toHaveBeenCalled()
  })
})
