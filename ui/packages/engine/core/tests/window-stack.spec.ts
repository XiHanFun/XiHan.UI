// @vitest-environment jsdom
// 页面级窗口叠放序：提到最上、移出、从上往下数的序号随增删收紧；已经在最上时不通知；
// 按 Document 各一份，页面上几份 core 共用同一份；与层栈互不相干。
import { describe, expect, it, vi } from 'vitest'
import { getLayerRegistry } from '../src/kernel/structure/layer-registry'
import { getWindowStack } from '../src/kernel/structure/window-stack'

const freshDoc = (): Document => document.implementation.createHTMLDocument('stack')

describe('页面级窗口叠放序', () => {
  it('后提上来的在最上面：最上 0，往下 1、2；不在栈里为 -1', () => {
    const stack = getWindowStack(freshDoc())
    const a = {}
    const b = {}
    const c = {}
    stack.raise(a)
    stack.raise(b)
    stack.raise(c)
    expect([stack.depthOf(c), stack.depthOf(b), stack.depthOf(a)]).toEqual([0, 1, 2])
    expect(stack.depthOf({})).toBe(-1)
  })

  it('把下面的提到最上，其余的依次往下挪一格', () => {
    const stack = getWindowStack(freshDoc())
    const [a, b, c] = [{}, {}, {}]
    stack.raise(a)
    stack.raise(b)
    stack.raise(c)
    stack.raise(a)
    expect([stack.depthOf(a), stack.depthOf(c), stack.depthOf(b)]).toEqual([0, 1, 2])
  })

  it('移出后序号收紧；移出不在栈里的不做事、不通知', () => {
    const stack = getWindowStack(freshDoc())
    const [a, b, c] = [{}, {}, {}]
    stack.raise(a)
    stack.raise(b)
    stack.raise(c)
    const seen = vi.fn()
    stack.subscribe(seen)
    stack.remove(b)
    expect([stack.depthOf(c), stack.depthOf(a), stack.depthOf(b)]).toEqual([0, 1, -1])
    expect(seen).toHaveBeenCalledTimes(1)
    stack.remove(b)
    expect(seen).toHaveBeenCalledTimes(1)
  })

  it('已经在最上面时再提一次不变、不通知；退订后不再收到', () => {
    const stack = getWindowStack(freshDoc())
    const [a, b] = [{}, {}]
    const seen = vi.fn()
    const stop = stack.subscribe(seen)
    stack.raise(a)
    stack.raise(b)
    expect(seen).toHaveBeenCalledTimes(2)
    stack.raise(b)
    expect(seen).toHaveBeenCalledTimes(2)
    stop()
    stack.raise(a)
    expect(seen).toHaveBeenCalledTimes(2)
  })

  it('订阅者抛错不截断后面的订阅者，错误照样抛出；几个都抛错时聚合', () => {
    const stack = getWindowStack(freshDoc())
    const later = vi.fn()
    stack.subscribe(() => {
      throw new Error('一')
    })
    stack.subscribe(later)
    expect(() => stack.raise({})).toThrow('一')
    expect(later).toHaveBeenCalledTimes(1)
    stack.subscribe(() => {
      throw new Error('二')
    })
    expect(() => stack.raise({})).toThrow(AggregateError)
    expect(later).toHaveBeenCalledTimes(2)
  })

  it('按 Document 各一份，同一 Document 取到同一份并记下归属', () => {
    const doc = freshDoc()
    const other = freshDoc()
    expect(getWindowStack(doc)).toBe(getWindowStack(doc))
    expect(getWindowStack(doc)).not.toBe(getWindowStack(other))
    expect(getWindowStack(doc).ownerDocument).toBe(doc)
    const key = {}
    getWindowStack(doc).raise(key)
    expect(getWindowStack(other).depthOf(key)).toBe(-1)
  })

  it('页面上装了几份 core 也共用同一份', async () => {
    const doc = freshDoc()
    const key = {}
    getWindowStack(doc).raise(key)
    vi.resetModules()
    const other = await import('../src/kernel/structure/window-stack')
    expect(other.getWindowStack(doc)).toBe(getWindowStack(doc))
    expect(other.getWindowStack(doc).depthOf(key)).toBe(0)
  })

  it('不进层栈：提上来的窗口不登记成层', () => {
    const doc = freshDoc()
    getWindowStack(doc).raise({})
    expect(getLayerRegistry(doc).list()).toEqual([])
  })
})
