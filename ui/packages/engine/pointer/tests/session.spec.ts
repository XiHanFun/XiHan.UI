// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { createPointerSession, resolveSessionDoc } from '../src'

/** 造一枚指针事件。jsdom 有 PointerEvent，但不认 pressure，补在实例上。 */
function pointer(type: string, init: { clientX?: number, clientY?: number, pointerId?: number, pressure?: number } = {}): PointerEvent {
  const event = new PointerEvent(type, {
    bubbles: true,
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
    pointerId: init.pointerId ?? 1,
  })
  Object.defineProperty(event, 'pressure', { value: init.pressure ?? 0.5, configurable: true })
  return event
}

describe('指针会话', () => {
  it('跟随移动，回送坐标与压感', () => {
    const onMove = vi.fn()
    const session = createPointerSession({ doc: document, onMove, onEnd: vi.fn() })

    document.dispatchEvent(pointer('pointermove', { clientX: 12, clientY: 34, pressure: 0.75 }))

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0]![0]).toMatchObject({
      point: { clientX: 12, clientY: 34 },
      pointerId: 1,
      pressure: 0.75,
    })
    session.dispose()
  })

  it('抬起与被系统收走分别报出结束原因', () => {
    const up = vi.fn()
    const a = createPointerSession({ doc: document, onMove: vi.fn(), onEnd: up })
    document.dispatchEvent(pointer('pointerup'))
    expect(up.mock.calls[0]![0].reason).toBe('pointerup')
    a.dispose()

    const cancel = vi.fn()
    const b = createPointerSession({ doc: document, onMove: vi.fn(), onEnd: cancel })
    document.dispatchEvent(pointer('pointercancel'))
    expect(cancel.mock.calls[0]![0].reason).toBe('pointercancel')
    b.dispose()
  })

  it('一场只结束一次：抬起之后再来取消不重复回送', () => {
    const onEnd = vi.fn()
    const session = createPointerSession({ doc: document, onMove: vi.fn(), onEnd })

    document.dispatchEvent(pointer('pointerup'))
    document.dispatchEvent(pointer('pointercancel'))

    expect(onEnd).toHaveBeenCalledTimes(1)
    session.dispose()
  })

  it('结束之后不再跟随移动', () => {
    const onMove = vi.fn()
    const session = createPointerSession({ doc: document, onMove, onEnd: vi.fn() })

    document.dispatchEvent(pointer('pointerup'))
    document.dispatchEvent(pointer('pointermove', { clientX: 99 }))

    expect(onMove).not.toHaveBeenCalled()
    session.dispose()
  })

  it('dispose 之后完全静默，且可重复调用', () => {
    const onMove = vi.fn()
    const onEnd = vi.fn()
    const session = createPointerSession({ doc: document, onMove, onEnd })

    session.dispose()
    session.dispose()
    document.dispatchEvent(pointer('pointermove', { clientX: 5 }))
    document.dispatchEvent(pointer('pointerup'))

    expect(onMove).not.toHaveBeenCalled()
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('在 onEnd 里 dispose 不出问题——真实调用方就是这么收尾的', () => {
    let session: { dispose: () => void } | null = null
    const onEnd = vi.fn(() => session?.dispose())
    session = createPointerSession({ doc: document, onMove: vi.fn(), onEnd })

    expect(() => document.dispatchEvent(pointer('pointerup'))).not.toThrow()
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  describe('指定了 pointerId', () => {
    it('别的指针的移动不劫持这一场', () => {
      const onMove = vi.fn()
      const session = createPointerSession({ doc: document, pointerId: 7, onMove, onEnd: vi.fn() })

      document.dispatchEvent(pointer('pointermove', { pointerId: 8, clientX: 50 }))
      expect(onMove).not.toHaveBeenCalled()

      document.dispatchEvent(pointer('pointermove', { pointerId: 7, clientX: 50 }))
      expect(onMove).toHaveBeenCalledTimes(1)
      session.dispose()
    })

    it('别的指针抬起不结束这一场', () => {
      const onEnd = vi.fn()
      const session = createPointerSession({ doc: document, pointerId: 7, onMove: vi.fn(), onEnd })

      document.dispatchEvent(pointer('pointerup', { pointerId: 8 }))
      expect(onEnd).not.toHaveBeenCalled()

      document.dispatchEvent(pointer('pointerup', { pointerId: 7 }))
      expect(onEnd).toHaveBeenCalledTimes(1)
      session.dispose()
    })
  })

  it('不指定 pointerId 时不过滤——沿用收编前那七处的语义', () => {
    const onMove = vi.fn()
    const session = createPointerSession({ doc: document, onMove, onEnd: vi.fn() })

    document.dispatchEvent(pointer('pointermove', { pointerId: 3 }))
    document.dispatchEvent(pointer('pointermove', { pointerId: 9 }))

    expect(onMove).toHaveBeenCalledTimes(2)
    session.dispose()
  })

  it('拖出元素之后照样跟手：监听在文档上，不在按下的那个元素上', () => {
    const el = document.createElement('div')
    document.body.append(el)
    const outside = document.createElement('section')
    document.body.append(outside)

    const onMove = vi.fn()
    const session = createPointerSession({ doc: document, onMove, onEnd: vi.fn() })

    outside.dispatchEvent(pointer('pointermove', { clientX: 300 }))

    expect(onMove).toHaveBeenCalledTimes(1)
    session.dispose()
    el.remove()
    outside.remove()
  })

  it('没有文档时退化成空操作，dispose 照常可调', () => {
    const onMove = vi.fn()
    const session = createPointerSession({ doc: null, onMove, onEnd: vi.fn() })

    expect(() => session.dispose()).not.toThrow()
    expect(onMove).not.toHaveBeenCalled()
  })
})

describe('文档解析', () => {
  it('元素给得出就跟它自己的文档', () => {
    const el = document.createElement('div')
    expect(resolveSessionDoc(el)).toBe(el.ownerDocument)
  })

  it('元素跟另一个文档时不落到全局那一份', () => {
    const other = document.implementation.createHTMLDocument('other')
    const el = other.createElement('div')

    expect(resolveSessionDoc(el)).toBe(other)
    expect(resolveSessionDoc(el)).not.toBe(document)
  })

  it('元素还没就位时退回全局文档', () => {
    expect(resolveSessionDoc(null)).toBe(document)
    expect(resolveSessionDoc(undefined)).toBe(document)
  })
})
