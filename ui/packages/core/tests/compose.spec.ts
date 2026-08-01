import { describe, expect, it, vi } from 'vitest'
import { callAll, composeEventHandlers, composeRefs, isDict, isEventHandlerKey } from '../src/compose'

describe('composeRefs', () => {
  it('回调 ref 与容器 ref 同时写入', () => {
    const cb = vi.fn()
    const box: { value: string | null } = { value: null }
    composeRefs<string>(cb, box)('el')
    expect(cb).toHaveBeenCalledWith('el')
    expect(box.value).toBe('el')
  })

  it('null / undefined 的 ref 直接跳过，不抛', () => {
    const box: { value: string | null } = { value: null }
    expect(() => composeRefs<string>(null, undefined, box)('el')).not.toThrow()
    expect(box.value).toBe('el')
  })

  // 卸载时必须把 null 传下去，否则 ref 会一直钉着已移除的节点
  it('卸载时把 null 写回全部 ref', () => {
    const cb = vi.fn()
    const box: { value: string | null } = { value: 'el' }
    const set = composeRefs<string>(cb, box)
    set(null)
    expect(cb).toHaveBeenCalledWith(null)
    expect(box.value).toBeNull()
  })

  it('按传入顺序依次写入', () => {
    const order: string[] = []
    composeRefs<string>(() => order.push('a'), () => order.push('b'))('el')
    expect(order).toEqual(['a', 'b'])
  })
})

describe('composeEventHandlers', () => {
  it('消费者的处理器先于组件内部的', () => {
    const order: string[] = []
    composeEventHandlers(() => order.push('theirs'), () => order.push('ours'))({})
    expect(order).toEqual(['theirs', 'ours'])
  })

  it('没有消费者处理器时只跑内部的', () => {
    const ours = vi.fn()
    composeEventHandlers(undefined, ours)({})
    expect(ours).toHaveBeenCalledOnce()
  })

  it('默认不看 defaultPrevented，内部处理器照跑', () => {
    const ours = vi.fn()
    composeEventHandlers(() => {}, ours)({ defaultPrevented: true })
    expect(ours).toHaveBeenCalledOnce()
  })

  it('开了检查后，消费者 preventDefault 即短路', () => {
    const ours = vi.fn()
    const handler = composeEventHandlers<{ defaultPrevented?: boolean }>(
      event => void (event.defaultPrevented = true),
      ours,
      { checkForDefaultPrevented: true },
    )
    handler({ defaultPrevented: false })
    expect(ours).not.toHaveBeenCalled()
  })

  it('开了检查但没 preventDefault 时不短路', () => {
    const ours = vi.fn()
    composeEventHandlers(() => {}, ours, { checkForDefaultPrevented: true })({ defaultPrevented: false })
    expect(ours).toHaveBeenCalledOnce()
  })
})

describe('callAll', () => {
  it('按顺序调用并透传全部参数', () => {
    const order: string[] = []
    const a = vi.fn(() => order.push('a'))
    const b = vi.fn(() => order.push('b'))
    callAll<[number, string]>(a, undefined, b)(1, 'x')
    expect(order).toEqual(['a', 'b'])
    expect(a).toHaveBeenCalledWith(1, 'x')
    expect(b).toHaveBeenCalledWith(1, 'x')
  })
})

describe('isEventHandlerKey', () => {
  it('on 之后必须紧跟大写', () => {
    expect(isEventHandlerKey('onClick')).toBe(true)
    expect(isEventHandlerKey('onKeyDown')).toBe(true)
  })

  it('全小写与非 on 前缀都不算', () => {
    expect(isEventHandlerKey('onclick')).toBe(false)
    expect(isEventHandlerKey('on')).toBe(false)
    expect(isEventHandlerKey('once')).toBe(false)
    expect(isEventHandlerKey('className')).toBe(false)
  })
})

describe('isDict', () => {
  it('普通对象是 Dict', () => {
    expect(isDict({})).toBe(true)
    expect(isDict({ a: 1 })).toBe(true)
  })

  it('数组与 null 不是', () => {
    expect(isDict([])).toBe(false)
    expect(isDict(null)).toBe(false)
    expect(isDict('x')).toBe(false)
    expect(isDict(undefined)).toBe(false)
  })
})
