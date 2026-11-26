// 四个运行时共用的受控 / 非受控桥：响应跟引用、报告跟 isEqual；先落值、再报告、最后通知宿主。
import { describe, expect, it, vi } from 'vitest'
import { createCell } from '../src/machine/reactive/cell'

interface Item { id: number }
const sameId = (a: Item, b: Item | undefined): boolean => b !== undefined && a.id === b.id

describe('createCell', () => {
  it('按 isEqual 相等的新引用照样落下并通知宿主，只是不报告、版本号不动', () => {
    const onChange = vi.fn()
    const changed = vi.fn()
    const reporting = vi.fn()
    const c = createCell<Item>(() => ({ defaultValue: { id: 1 }, isEqual: sameId, onChange }), { changed, reporting, notify: vi.fn() })
    const second = { id: 1 }
    c.set(second)
    // 盯引用的 track 要能看到「内容一样的另一份」
    expect(c.get()).toBe(second)
    expect(changed).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
    expect(reporting).not.toHaveBeenCalled()
    expect(c.version()).toBe(0)
  })

  it('同一个引用再写一遍什么都不做', () => {
    const first = { id: 1 }
    const onChange = vi.fn()
    const changed = vi.fn()
    const c = createCell<Item>(() => ({ defaultValue: first, isEqual: sameId, onChange }), { changed, notify: vi.fn() })
    c.set(first)
    expect(changed).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('真变时先落值、再报 onChange、最后通知宿主', () => {
    const order: string[] = []
    const c = createCell<string>(() => ({
      defaultValue: 'a',
      onChange: (value, prev) => order.push(`report ${prev}→${value} 读到 ${c.get()}`),
    }), {
      reporting: () => order.push('reporting'),
      changed: () => order.push('changed'),
      notify: vi.fn(),
    })
    c.set('b')
    expect(order).toEqual(['reporting', 'report a→b 读到 b', 'changed'])
    expect(c.version()).toBe(1)
  })

  it('没传 onChange 的 cell 不调 reporting，真变照样通知', () => {
    const reporting = vi.fn()
    const changed = vi.fn()
    const c = createCell<number>(() => ({ defaultValue: 0 }), { reporting, changed, notify: vi.fn() })
    c.set(1)
    expect(reporting).not.toHaveBeenCalled()
    expect(changed).toHaveBeenCalledTimes(1)
  })

  it('受控时不落内部值，只报意图；宿主写回后版本号才动', () => {
    let value = 'host'
    const onChange = vi.fn()
    const store = { get: vi.fn(() => 'inner'), set: vi.fn() }
    const c = createCell<string>(() => ({ value, onChange }), { store: () => store, notify: vi.fn() })
    c.set('next')
    expect(store.set).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith('next', 'host')
    expect(c.get()).toBe('host')
    expect(c.version()).toBe(0)
    value = 'next'
    expect(c.version()).toBe(1)
  })

  it('函数式写入拿当下的值求新值', () => {
    const c = createCell<number>(() => ({ defaultValue: 1 }), { notify: vi.fn() })
    c.set(prev => prev + 1)
    expect(c.get()).toBe(2)
  })
})
