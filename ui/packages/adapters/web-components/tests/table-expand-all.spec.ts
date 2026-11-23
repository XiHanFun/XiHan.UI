// @vitest-environment jsdom
// 表格的默认全部展开与全部展开 / 收起：判据在 Headless，这里核自定义元素这一侧的接线——
// default-expand-all 属性、连接后才赋的 rows 与两个方法。

import type { XhTableElement } from '../src/elements/table'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

afterEach(() => {
  document.body.replaceChildren()
})

const ROWS = [
  { id: 'a' },
  { id: 'a1', parentId: 'a' },
  { id: 'a2', parentId: 'a1' },
  { id: 'note', expandable: true },
  { id: 'b' },
]

function create(): XhTableElement {
  const table = document.createElement('xh-table') as XhTableElement
  table.innerHTML = '<div data-xh-part="root"><div data-xh-part="body"></div></div>'
  table.setAttribute('default-expand-all', '')
  table.columns = [{ id: 'name', label: '名称' }]
  return table
}

function dataRows(table: XhTableElement): string[] {
  return table.visibleRows.filter(row => row.kind === 'data').map(row => row.id)
}

describe('xh-table 的全部展开', () => {
  it('default-expand-all 写成属性：挂上即逐层展开，不发变更事件', async () => {
    const onChange = vi.fn()
    const table = create()
    table.rows = ROWS
    table.addEventListener('expanded-value-change', onChange)
    document.body.append(table)
    await table.updateComplete

    expect(dataRows(table)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
    expect(table.isExpanded('note')).toBe(true)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('连接后才赋 rows：数据到了才展开，并发一次变更事件', async () => {
    const onChange = vi.fn()
    const table = create()
    table.addEventListener('expanded-value-change', onChange)
    document.body.append(table)
    await table.updateComplete
    expect(dataRows(table)).toEqual([])

    table.rows = ROWS
    await table.updateComplete
    await new Promise(r => setTimeout(r, 0))
    await table.updateComplete
    expect(dataRows(table)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect((onChange.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: ['a', 'a1', 'note'] })
  })

  it('expandAll() / collapseAll() 两个方法', async () => {
    const table = create()
    table.rows = ROWS
    document.body.append(table)
    await table.updateComplete

    table.collapseAll()
    await table.updateComplete
    expect(dataRows(table)).toEqual(['a', 'note', 'b'])

    table.expandAll()
    await table.updateComplete
    expect(dataRows(table)).toEqual(['a', 'a1', 'a2', 'note', 'b'])
  })
})
