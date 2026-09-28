/** @vitest-environment jsdom */

import { createTypeahead, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { describe, expect, it, vi } from 'vitest'
import { createGridCollection, fromInlineControl, normalizeGridSelection, readGridKey, toggleGridSelection } from '../src/shared/grid-collection'

function key(init: Partial<KeyboardEvent> & { key: string }): KeyboardEvent {
  return { ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...init } as KeyboardEvent
}

function grid(values: string[], disabled: string[] = []): { container: HTMLElement, rows: HTMLElement[] } {
  const container = document.createElement('div')
  container.tabIndex = 0
  const rows = values.map((value) => {
    const row = document.createElement('div')
    row.tabIndex = -1
    row.setAttribute(ITEM_VALUE_ATTR, value)
    row.textContent = value.toUpperCase()
    if (disabled.includes(value))
      row.setAttribute('aria-disabled', 'true')
    container.append(row)
    return row
  })
  document.body.append(container)
  return { container, rows }
}

describe('网格集合的选中集', () => {
  it('按选择模式归一：none 清空、single 截到一条、multiple 去重', () => {
    expect(normalizeGridSelection(['a', 'b'], 'none')).toEqual([])
    expect(normalizeGridSelection(['a', 'b'], 'single')).toEqual(['a'])
    expect(normalizeGridSelection(['a', 'b', 'a'], 'multiple')).toEqual(['a', 'b'])
  })

  it('切换：复选增减，单选退化成选中这一条（点已选中的仍是它），none 原样', () => {
    expect(toggleGridSelection(['a'], 'b', 'multiple')).toEqual(['a', 'b'])
    expect(toggleGridSelection(['a', 'b'], 'a', 'multiple')).toEqual(['b'])
    expect(toggleGridSelection(['a'], 'b', 'single')).toEqual(['b'])
    expect(toggleGridSelection(['a'], 'a', 'single')).toEqual(['a'])
    expect(toggleGridSelection([], 'a', 'none')).toEqual([])
  })
})

describe('网格集合的按键分派', () => {
  const options = { axis: 'vertical' as const, dir: 'ltr' as const, typeahead: null }

  it('全选、导航、摘除、确认各归一类；导航与空格带着 Shift', () => {
    expect(readGridKey(key({ key: 'a', ctrlKey: true }), options)).toEqual({ kind: 'select-all' })
    expect(readGridKey(key({ key: 'A', metaKey: true }), options)).toEqual({ kind: 'select-all' })
    expect(readGridKey(key({ key: 'ArrowDown', shiftKey: true }), options)).toEqual({ kind: 'navigate', intent: 'next', extend: true })
    expect(readGridKey(key({ key: 'End' }), options)).toEqual({ kind: 'navigate', intent: 'last', extend: false })
    expect(readGridKey(key({ key: 'Backspace' }), options)).toEqual({ kind: 'delete' })
    expect(readGridKey(key({ key: 'Enter' }), options)).toEqual({ kind: 'enter' })
    expect(readGridKey(key({ key: ' ', shiftKey: true }), options)).toEqual({ kind: 'space', extend: true })
  })

  it('方向键按轴取：竖排不认左右，横排按书写方向镜像；带 Ctrl / Alt 的方向键不算导航', () => {
    expect(readGridKey(key({ key: 'ArrowRight' }), options)).toBeNull()
    expect(readGridKey(key({ key: 'ArrowRight' }), { ...options, axis: 'horizontal', dir: 'rtl' })).toEqual({ kind: 'navigate', intent: 'prev', extend: false })
    expect(readGridKey(key({ key: 'ArrowDown', altKey: true }), options)).toBeNull()
  })

  it('连打检索排在空格之前：缓冲区空时空格是确认键，非空时是检索串的一部分', () => {
    const typeahead = createTypeahead()
    const withTypeahead = { ...options, typeahead }
    expect(readGridKey(key({ key: ' ' }), withTypeahead)).toEqual({ kind: 'space', extend: false })
    expect(readGridKey(key({ key: 'n' }), withTypeahead)).toEqual({ kind: 'typeahead', query: 'n' })
    expect(readGridKey(key({ key: ' ' }), withTypeahead)).toEqual({ kind: 'typeahead', query: 'n ' })
    // 带 Ctrl 的字母不参与检索
    expect(readGridKey(key({ key: 'x', ctrlKey: true }), withTypeahead)).toBeNull()
  })

  it('行内控件：落在行里的按钮上算，落在行自身上不算', () => {
    const row = document.createElement('div')
    const button = document.createElement('button')
    const text = document.createElement('span')
    button.append(text)
    row.append(button)
    expect(fromInlineControl(text, row)).toBe(true)
    expect(fromInlineControl(row, row)).toBe(false)
    expect(fromInlineControl(button, null)).toBe(false)
  })
})

describe('网格集合的焦点与全选', () => {
  it('方向键从锚点走、跳过禁用条目，并把落点报给机器', () => {
    const onFocus = vi.fn()
    const { container, rows } = grid(['a', 'b', 'c'], ['b'])
    const collection = createGridCollection({ items: c => [...c.children] as HTMLElement[], text: el => el.textContent ?? '', anchor: 'a', loop: false, isSelected: () => false, onFocus })
    expect(collection.focusBy(container, 'next')).toBe('c')
    expect(document.activeElement).toBe(rows[2])
    expect(onFocus).toHaveBeenCalledWith('c')
    container.remove()
  })

  it('从组外进来时落在首个可停留的选中条目上；冒泡上来的条目焦点不接管', () => {
    const { container, rows } = grid(['a', 'b', 'c'], ['a'])
    const collection = createGridCollection({ items: c => [...c.children] as HTMLElement[], text: el => el.textContent ?? '', anchor: null, loop: true, isSelected: value => value === 'a' || value === 'c', onFocus: () => {} })
    collection.enter({ currentTarget: container, target: container, relatedTarget: null } as unknown as FocusEvent)
    expect(document.activeElement).toBe(rows[2])
    rows[1]!.focus()
    collection.enter({ currentTarget: container, target: rows[1], relatedTarget: null } as unknown as FocusEvent)
    expect(document.activeElement).toBe(rows[1])
    container.remove()
  })

  it('全选按全序只动可选条目：已全选就整段取消，选中的禁用条目留着', () => {
    const { container } = grid(['a', 'b', 'c'], ['c'])
    const collection = createGridCollection({ items: c => [...c.children] as HTMLElement[], text: el => el.textContent ?? '', anchor: null, loop: true, isSelected: () => false, onFocus: () => {} })
    expect(collection.selectAll(container, ['c'])).toEqual(['c', 'a', 'b'])
    expect(collection.selectAll(container, ['a', 'b', 'c'])).toEqual(['c'])
    // 数据序优先于 DOM 序
    const ordered = createGridCollection({ items: () => [], text: () => '', anchor: null, loop: true, isSelected: () => false, onFocus: () => {}, order: { items: ['x', 'y'] } })
    expect(ordered.selectAll(container, [])).toEqual(['x', 'y'])
    container.remove()
  })
})
