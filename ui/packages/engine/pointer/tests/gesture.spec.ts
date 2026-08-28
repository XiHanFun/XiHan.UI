// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMultiPointerSession, pinchChange, pinchSnapshot } from '../src'

const at = (clientX: number, clientY: number) => ({ clientX, clientY })

describe('双指几何', () => {
  it('间距是两点的直线距离', () => {
    expect(pinchSnapshot(at(0, 0), at(3, 4)).distance).toBe(5)
  })

  it('中点在两点当中', () => {
    expect(pinchSnapshot(at(0, 0), at(10, 20)).center).toEqual({ x: 5, y: 10 })
  })

  it('谁先谁后不影响间距与中点', () => {
    const a = pinchSnapshot(at(0, 0), at(10, 20))
    const b = pinchSnapshot(at(10, 20), at(0, 0))
    expect(b.distance).toBe(a.distance)
    expect(b.center).toEqual(a.center)
  })

  it('两指落在同一点时间距为零', () => {
    expect(pinchSnapshot(at(5, 5), at(5, 5)).distance).toBe(0)
  })
})

describe('双指变化量', () => {
  it('撑开是放大，捏合是缩小', () => {
    const start = pinchSnapshot(at(0, 0), at(100, 0))
    expect(pinchChange(start, pinchSnapshot(at(0, 0), at(200, 0))).scale).toBe(2)
    expect(pinchChange(start, pinchSnapshot(at(0, 0), at(50, 0))).scale).toBe(0.5)
  })

  it('没动就是原样', () => {
    const start = pinchSnapshot(at(0, 0), at(100, 0))
    const change = pinchChange(start, start)
    expect(change.scale).toBe(1)
    expect(change.translate).toEqual({ x: 0, y: 0 })
    expect(change.rotate).toBe(0)
  })

  it('两指整体平移时只出位移，不出缩放', () => {
    const start = pinchSnapshot(at(0, 0), at(100, 0))
    const moved = pinchSnapshot(at(30, 40), at(130, 40))
    const change = pinchChange(start, moved)
    expect(change.scale).toBe(1)
    expect(change.translate).toEqual({ x: 30, y: 40 })
  })

  it('起始间距为零时缩放恒为 1——除以 0 会把尺寸整个吃掉', () => {
    const start = pinchSnapshot(at(5, 5), at(5, 5))
    expect(pinchChange(start, pinchSnapshot(at(0, 0), at(100, 0))).scale).toBe(1)
  })

  it('转角逆时针为正', () => {
    const start = pinchSnapshot(at(0, 0), at(100, 0))
    const turned = pinchSnapshot(at(0, 0), at(0, 100))
    expect(pinchChange(start, turned).rotate).toBeCloseTo(Math.PI / 2)
  })

  it('转过半圈以上时归一到 (-π, π]，不会看起来猛地转回去', () => {
    // 从 +175° 转到 -175°，实际只动了 10°；直接相减会得到 -350°，看起来像猛地倒转
    const start = pinchSnapshot(at(0, 0), at(-100, 8.75))
    const turned = pinchSnapshot(at(0, 0), at(-100, -8.75))
    const rotate = pinchChange(start, turned).rotate
    expect(rotate).toBeGreaterThan(0)
    expect(rotate).toBeLessThan(0.4)
  })
})

describe('多指会话', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  function pointer(type: string, pointerId: number, clientX = 0, clientY = 0): PointerEvent {
    return new PointerEvent(type, { pointerId, clientX, clientY, bubbles: true })
  }

  it('只跟调用方交进来的那几根指针', () => {
    const onChange = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange, onEnd: vi.fn() })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })

    document.dispatchEvent(pointer('pointermove', 1, 10, 0))
    expect(onChange).toHaveBeenCalledTimes(1)

    // 没交进来的那根不算数
    document.dispatchEvent(pointer('pointermove', 9, 50, 0))
    expect(onChange).toHaveBeenCalledTimes(1)
    s.dispose()
  })

  it('同一根指针就地更新，不重复堆进去', () => {
    const s = createMultiPointerSession({ doc: document, onChange: vi.fn(), onEnd: vi.fn() })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    s.add({ pointerId: 1, clientX: 5, clientY: 5 })
    expect(s.points()).toHaveLength(1)
    expect(s.points()[0]).toMatchObject({ clientX: 5, clientY: 5 })
    s.dispose()
  })

  it('触点按落下的先后排', () => {
    const s = createMultiPointerSession({ doc: document, onChange: vi.fn(), onEnd: vi.fn() })
    s.add({ pointerId: 7, clientX: 0, clientY: 0 })
    s.add({ pointerId: 3, clientX: 1, clientY: 1 })
    expect(s.points().map(p => p.pointerId)).toEqual([7, 3])
    s.dispose()
  })

  it('任意一根动都回送当前全部触点', () => {
    const onChange = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange, onEnd: vi.fn() })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    s.add({ pointerId: 2, clientX: 100, clientY: 0 })

    document.dispatchEvent(pointer('pointermove', 2, 200, 0))
    const points = onChange.mock.calls[0][0]
    expect(points).toHaveLength(2)
    expect(points[1]).toMatchObject({ pointerId: 2, clientX: 200 })
    s.dispose()
  })

  it('抬起一根之后先回送一次——剩下那根要重新拍基准，否则图会跳', () => {
    const onChange = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange, onEnd: vi.fn() })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    s.add({ pointerId: 2, clientX: 100, clientY: 0 })

    document.dispatchEvent(pointer('pointerup', 2))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toHaveLength(1)
    s.dispose()
  })

  it('最后一根离开才算结束', () => {
    const onEnd = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange: vi.fn(), onEnd })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    s.add({ pointerId: 2, clientX: 100, clientY: 0 })

    document.dispatchEvent(pointer('pointerup', 1))
    expect(onEnd).not.toHaveBeenCalled()
    document.dispatchEvent(pointer('pointerup', 2))
    expect(onEnd).toHaveBeenCalledTimes(1)
    s.dispose()
  })

  it('系统收走指针也收尾，但要如实报出是被收走的', () => {
    // 调用方常常要分开处理：被收走时退回原样，抬手才是落定
    const onEnd = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange: vi.fn(), onEnd })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    document.dispatchEvent(pointer('pointercancel', 1))
    expect(onEnd).toHaveBeenCalledWith({ reason: 'pointercancel' })
    s.dispose()
  })

  it('抬手报的是 pointerup', () => {
    const onEnd = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange: vi.fn(), onEnd })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    document.dispatchEvent(pointer('pointerup', 1))
    expect(onEnd).toHaveBeenCalledWith({ reason: 'pointerup' })
    s.dispose()
  })

  it('本场收尾之后，下一次 add 就是新的一场——会话整个生命周期只建一次，拖第二回还得能拖', () => {
    const onChange = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange, onEnd: vi.fn() })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    document.dispatchEvent(pointer('pointerup', 1))
    onChange.mockClear()

    s.add({ pointerId: 2, clientX: 0, clientY: 0 })
    document.dispatchEvent(pointer('pointermove', 2, 10, 0))
    expect(onChange).toHaveBeenCalledTimes(1)
    s.dispose()
  })

  it('收尾之后、下一场开始之前的杂散事件不回送', () => {
    const onChange = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange, onEnd: vi.fn() })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    document.dispatchEvent(pointer('pointerup', 1))
    onChange.mockClear()

    // 没有 add 就动的指针不算数
    document.dispatchEvent(pointer('pointermove', 9, 10, 0))
    expect(onChange).not.toHaveBeenCalled()
    s.dispose()
  })

  it('dispose 之后一切不再受理，且可重复调用', () => {
    const onChange = vi.fn()
    const s = createMultiPointerSession({ doc: document, onChange, onEnd: vi.fn() })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    s.dispose()

    s.add({ pointerId: 2, clientX: 0, clientY: 0 })
    document.dispatchEvent(pointer('pointermove', 2, 10, 0))
    expect(onChange).not.toHaveBeenCalled()
    expect(() => s.dispose()).not.toThrow()
  })

  it('没有文档时退化成空操作', () => {
    const s = createMultiPointerSession({ doc: null, onChange: vi.fn(), onEnd: vi.fn() })
    s.add({ pointerId: 1, clientX: 0, clientY: 0 })
    expect(s.points()).toHaveLength(1)
    expect(() => s.dispose()).not.toThrow()
  })
})
