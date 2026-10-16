// @vitest-environment jsdom

import type { XhTableElement } from '../src/elements/table'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

afterEach(() => {
  document.body.replaceChildren()
})

async function mount(): Promise<XhTableElement> {
  const table = document.createElement('xh-table') as XhTableElement
  table.innerHTML = '<div data-xh-part="root"><div data-xh-part="body"></div></div>'
  document.body.append(table)
  table.columns = [{ id: 'name', label: '名称' }]
  table.rows = [
    { id: 'a' },
    { id: 'a1', parentId: 'a' },
    { id: 'a2', parentId: 'a' },
    { id: 'b' },
  ]
  table.defaultExpandedValue = ['a']
  await table.updateComplete
  return table
}

describe('xh-table 可见行', () => {
  it('visibleRows 与 Vue / React 插槽载荷同源：展开的父行底下的子行在其中，带层级与大纲编号', async () => {
    const table = await mount()
    expect(table.visibleRows.map(row => [row.id, row.level])).toEqual([['a', 1], ['a1', 2], ['a2', 2], ['b', 1]])
    expect(table.rowNumber('a2')).toBe('1.2')
    expect(table.isExpanded('a')).toBe(true)
    expect(table.isExpanded('b')).toBe(false)
  })

  it('展开集合换掉后子行跟着离开或回到可见序列', async () => {
    const table = await mount()
    table.expandedValue = []
    await table.updateComplete
    expect(table.isExpanded('a')).toBe(false)
    expect(table.visibleRows.map(row => row.id)).toEqual(['a', 'b'])
    table.expandedValue = ['a']
    await table.updateComplete
    expect(table.visibleRows.map(row => row.id)).toEqual(['a', 'a1', 'a2', 'b'])
  })
})
