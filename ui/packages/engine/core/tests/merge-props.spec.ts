import { describe, expect, it, vi } from 'vitest'
import { mergeProps } from '../src/kernel/merge-props'

describe('普通键', () => {
  it('后者覆盖前者', () => {
    expect(mergeProps<{ id: string, role: string }>({ id: 'a', role: 'button' }, { id: 'b' }))
      .toEqual({ id: 'b', role: 'button' })
  })

  it('后者显式给 undefined 也算覆盖', () => {
    expect(mergeProps({ id: 'a' }, { id: undefined })).toEqual({ id: undefined })
  })

  it('跳过 undefined 的整份来源', () => {
    expect(mergeProps<{ id: string, role: string }>({ id: 'a' }, undefined, { role: 'x' }))
      .toEqual({ id: 'a', role: 'x' })
  })

  it('不改动传入的对象', () => {
    const a = { id: 'a' }
    const b = { id: 'b' }
    mergeProps(a, b)
    expect(a).toEqual({ id: 'a' })
    expect(b).toEqual({ id: 'b' })
  })
})

describe('class 与 className', () => {
  it('空格拼接而不是覆盖', () => {
    expect(mergeProps({ class: 'a' }, { class: 'b' })).toEqual({ class: 'a b' })
    expect(mergeProps({ className: 'a' }, { className: 'b' })).toEqual({ className: 'a b' })
  })

  it('一侧缺席时保留另一侧', () => {
    expect(mergeProps({ class: 'a' }, {})).toEqual({ class: 'a' })
    expect(mergeProps({}, { class: 'b' })).toEqual({ class: 'b' })
  })

  it('class 与 className 各走各的，不互相拼', () => {
    expect(mergeProps<{ class: string, className: string }>({ class: 'a' }, { className: 'b' }))
      .toEqual({ class: 'a', className: 'b' })
  })

  it('两侧都是空值时不产出多余空格', () => {
    expect(mergeProps({ class: '' }, { class: '' })).toEqual({ class: '' })
  })
})

describe('style', () => {
  it('浅合并，后者的同名属性胜出', () => {
    expect(mergeProps<{ style: Record<string, string> }>(
      { style: { color: 'red', top: '1px' } },
      { style: { color: 'blue' } },
    )).toEqual({ style: { top: '1px', color: 'blue' } })
  })

  it('非对象的一侧按空对象处理', () => {
    expect(mergeProps<{ style: unknown }>({ style: 'color:red' }, { style: { top: '1px' } }))
      .toEqual({ style: { top: '1px' } })
  })
})

describe('事件处理器', () => {
  it('同名处理器按顺序串起来，都会被调用', () => {
    const order: string[] = []
    const merged = mergeProps<{ onClick: (e: string) => void }>(
      { onClick: () => order.push('first') },
      { onClick: () => order.push('second') },
    )
    merged.onClick('e')
    expect(order).toEqual(['first', 'second'])
  })

  it('参数原样透传给每一个', () => {
    const a = vi.fn()
    const b = vi.fn()
    mergeProps<{ onKeyDown: (e: string) => void }>({ onKeyDown: a }, { onKeyDown: b }).onKeyDown('ev')
    expect(a).toHaveBeenCalledWith('ev')
    expect(b).toHaveBeenCalledWith('ev')
  })

  // 串接的判定是「任一侧是函数」，所以后者给 undefined 不会把前者抹掉
  it('后者给 undefined 时前者仍会被调用', () => {
    const a = vi.fn()
    const merged = mergeProps<{ onClick?: (e: string) => void }>({ onClick: a }, { onClick: undefined })
    expect(typeof merged.onClick).toBe('function')
    merged.onClick!('e')
    expect(a).toHaveBeenCalledOnce()
  })

  it('全小写的 onclick 不当事件处理器，按普通键覆盖', () => {
    const a = vi.fn()
    const b = vi.fn()
    const merged = mergeProps<{ onclick: () => void }>({ onclick: a }, { onclick: b })
    merged.onclick()
    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalledOnce()
  })

  it('三份来源全部串起来', () => {
    const order: string[] = []
    mergeProps<{ onClick: () => void }>(
      { onClick: () => order.push('a') },
      { onClick: () => order.push('b') },
      { onClick: () => order.push('c') },
    ).onClick()
    expect(order).toEqual(['a', 'b', 'c'])
  })
})
