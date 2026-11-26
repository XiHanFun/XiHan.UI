// @vitest-environment jsdom
// 数据驱动模式的自定义筛选：filterMode 为 custom 的列，宿主直接子节点上写 slot="filter:<列 id>" 的作者节点
// 挪进那一列的列头、排在列名之后；作者经 setFilter 写回，远程模式下只派发事件。

import type { TableColumnDef, TableRecord } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TableHost extends HTMLElement {
  updateComplete: Promise<unknown>
  columns?: TableColumnDef[]
  data?: TableRecord[]
  remote?: boolean
  setFilter: (columnId: string, values: string[]) => void
}

const DATA: TableRecord[] = [
  { id: 'u1', name: '赵一' },
  { id: 'u2', name: '钱二' },
  { id: 'u3', name: '孙三' },
]

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: '姓名', filterMode: 'custom', filter: (record, values) => String(record.name).includes(values[0] ?? '') },
]

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: TableHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TableHost>): TableHost {
  const el = document.createElement('xh-table') as TableHost
  Object.assign(el, props)
  el.innerHTML = '<div data-xh-part="root"></div><input slot="filter:name" aria-label="筛选姓名">'
  document.body.append(el)
  return el
}

const rowValues = (el: Element): (string | null)[] => [...el.querySelectorAll('[data-xh-part="body"] [data-xh-part="row"]')].map(row => row.getAttribute('value'))

describe('<xh-table> 的自定义筛选面板', () => {
  it('作者节点挪进那一列的列头、排在列名之后；setFilter 写回后按列的 filter 筛并派发事件', async () => {
    const el = mount({ columns: COLUMNS, data: DATA })
    const events: unknown[] = []
    el.addEventListener('filter-value-change', e => events.push((e as CustomEvent).detail))
    await settle(el)
    const input = el.querySelector<HTMLInputElement>('input[slot="filter:name"]')!
    expect(input.closest('[data-xh-part="column-header"]')?.getAttribute('value')).toBe('name')
    expect(input.previousElementSibling?.getAttribute('data-xh-part')).toBe('column-label')

    el.setFilter('name', ['钱'])
    await settle(el)
    expect(events).toEqual([{ value: { name: ['钱'] } }])
    expect(rowValues(el)).toEqual(['u2'])
    // 重渲之后作者节点还在原处
    expect(el.querySelector('input[slot="filter:name"]')?.closest('[data-xh-part="column-header"]')).not.toBeNull()
  })

  it('远程模式：setFilter 只派发事件，表体照 data 原样铺', async () => {
    const el = mount({ columns: COLUMNS, data: DATA, remote: true })
    const events: unknown[] = []
    el.addEventListener('filter-value-change', e => events.push((e as CustomEvent).detail))
    await settle(el)
    el.setFilter('name', ['钱'])
    await settle(el)
    expect(events).toEqual([{ value: { name: ['钱'] } }])
    expect(rowValues(el)).toEqual(['u1', 'u2', 'u3'])
  })
})
