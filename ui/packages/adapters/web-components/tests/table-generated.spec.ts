// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { StructureChild, TableColumnDef, TableRecord } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { unwrapDelegated } from '../src/dom/structure'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TableHost extends HTMLElement {
  updateComplete: Promise<unknown>
  columns?: TableColumnDef[]
  data?: TableRecord[]
  pagination?: boolean
  pageSize?: number
  virtual?: boolean
}

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: '姓名', sortable: true },
  { id: 'dept', label: '部门' },
]

const DATA: TableRecord[] = Array.from({ length: 12 }, (_, i) => ({ id: `u${i + 1}`, name: `员工 ${i + 1}`, dept: i % 2 ? '前端' : '平台' }))

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TableHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TableHost>, inner = '<div data-xh-part="root"></div>'): TableHost {
  const el = document.createElement('xh-table') as TableHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

const parts = (el: Element, name: string): Element[] => [...el.querySelectorAll(`[data-xh-part="${name}"]`)].filter(node => !node.closest('xh-pagination, xh-menu'))

describe('<xh-table> 只写 root：按标准结构生成', () => {
  it('生成表头、表体、在途与空态；格子文字取字段值；分页生成在 root 之后', async () => {
    const el = mount({ columns: COLUMNS, data: DATA, pagination: true, pageSize: 5 })
    await settle(el)
    const root = el.querySelector('[data-xh-part="root"]')!
    expect([...root.children].map(node => node.getAttribute('data-xh-part'))).toEqual(['header', 'body', 'loading', 'empty'])
    const rows = parts(root.querySelector('[data-xh-part="body"]')!, 'row')
    expect(rows.map(row => row.getAttribute('value'))).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
    expect(rows[0]!.querySelector('[data-xh-part="cell"][value="dept"]')!.textContent).toBe('平台')
    expect(root.nextElementSibling?.localName).toBe('xh-pagination')
  })

  it('元素自己挂的播报区不算作者写的部件：再渲一轮，生成的表头与表体还在', async () => {
    const el = mount({ columns: COLUMNS, data: DATA })
    await settle(el)
    expect(el.querySelector(':scope > [data-xh-part="live-region"]')).not.toBeNull()
    el.data = DATA.slice(0, 3)
    await settle(el)
    expect(parts(el, 'row').filter(row => row.closest('[data-xh-part="body"]'))).toHaveLength(3)
  })

  it('作者手写了结构：元素不生成，也不在 root 之后生成分页', async () => {
    const el = mount({ columns: COLUMNS, data: DATA, pagination: true }, '<div data-xh-part="root"><div data-xh-part="body"></div></div>')
    await settle(el)
    expect(parts(el, 'header')).toHaveLength(0)
    expect(el.querySelector('xh-pagination')).toBeNull()
  })

  it('开了 virtual、Virtualizer 那一块还没到时不铺它的视口与内容层，开发期也不报接不上线', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ columns: COLUMNS, data: DATA, virtual: true })
    await el.updateComplete
    expect(el.querySelector('[data-xh-part="virtual-viewport"]')).toBeNull()
    expect(parts(el, 'body')).toHaveLength(1)
    expect(records.filter(record => record.code === 'wc.unknown-part')).toEqual([])
  })
})

describe('unwrapDelegated', () => {
  it('委派给那个组件的节点换成它自己的子节点，别的节点与组合节点原样留着', () => {
    const nodes: StructureChild[] = [{
      key: 'list',
      tag: 'div',
      part: 'list',
      children: [
        { key: 'viewport', tag: 'div', part: 'virtual-viewport', component: 'virtualizer', children: [{ key: 'item', tag: 'div', part: 'item' }] },
        { key: 'menu', instance: 'menu' },
      ],
    }]
    expect(unwrapDelegated(nodes, 'virtualizer')).toEqual([{
      key: 'list',
      tag: 'div',
      part: 'list',
      children: [{ key: 'item', tag: 'div', part: 'item' }, { key: 'menu', instance: 'menu' }],
    }])
  })
})
