// 表格的合并与多级表头：起点格铺满合并的几行、被合并掉的格子只留位置；分组表头横跨它的叶子列、较浅的叶子列头纵向跨行；
// 冻结列没写数字宽度时按实测列宽累加偏移。几何只在 Chromium 里可信。
import type { TableCellSpanDetails, TableColumnDef, TableHeaderCell } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function mount(render: () => unknown, width = 640): void {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
}

function rect(selector: string): DOMRect {
  const el = document.querySelector<HTMLElement>(selector)
  if (!el)
    throw new Error(`找不到 ${selector}`)
  return el.getBoundingClientRect()
}

function cellSel(row: string, column: string): string {
  return `[data-scope="table"][data-part="row"][data-value="${row}"] > [data-scope="table"][data-part="cell"][data-value="${column}"]`
}

function rowSel(row: string): string {
  return `[data-scope="table"][data-part="row"][data-value="${row}"]`
}

describe('单元格合并', () => {
  const columns: TableColumnDef[] = [
    { id: 'dept', label: '部门', width: 120 },
    { id: 'name', label: '姓名', width: 120 },
    { id: 'q1', label: 'Q1', width: 80 },
    { id: 'q2', label: 'Q2', width: 80 },
  ]
  const people = [
    { id: 'a', dept: '研发', name: '赵一' },
    { id: 'b', dept: '研发', name: '钱二' },
    { id: 'c', dept: '运维', name: '孙三' },
  ]
  const cellSpan = ({ column, rowIndex, row }: TableCellSpanDetails) => {
    if (column.id === 'dept' && rowIndex === 0)
      return { rowSpan: 2 }
    if (row.id === 'c' && column.id === 'q1')
      return { colSpan: 2 }
    return null
  }

  function render() {
    return h(XhTableRoot, { columns, rows: people.map(p => ({ id: p.id })), cellSpan }, () => [
      h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(c =>
        h(XhTableColumnHeader, { key: c.id, value: c.id }, () => h(XhTableColumnLabel, null, () => c.label))))),
      h(XhTableBody, null, () => people.map(p => h(XhTableRow, { key: p.id, value: p.id }, () => [
        h(XhTableCell, { value: 'dept' }, () => p.dept),
        h(XhTableCell, { value: 'name' }, () => p.name),
        h(XhTableCell, { value: 'q1' }, () => '1'),
        h(XhTableCell, { value: 'q2' }, () => '2'),
      ]))),
    ])
  }

  it('纵向合并：起点格从自己那一行的上沿铺到下一行的下沿，行高不被撑高', async () => {
    mount(render)
    await expect.poll(() => Math.round(rect(cellSel('a', 'dept')).bottom)).toBe(Math.round(rect(rowSel('b')).bottom))
    // 起点那一行的格子与别的行一样高：首行没有行首分隔线，比的是格子不是行
    expect(Math.round(rect(cellSel('a', 'name')).height)).toBe(Math.round(rect(cellSel('c', 'name')).height))
    expect(Math.round(rect(cellSel('a', 'dept')).top)).toBe(Math.round(rect(cellSel('a', 'name')).top))
    // 下一行那一格只留位置：看不见、读屏也读不到，宽度仍是那一列的
    const covered = document.querySelector<HTMLElement>(cellSel('b', 'dept'))!
    expect(getComputedStyle(covered).visibility).toBe('hidden')
    expect(covered.getAttribute('aria-hidden')).toBe('true')
    expect(Math.round(covered.getBoundingClientRect().width)).toBe(Math.round(rect(cellSel('a', 'name')).left - rect(cellSel('a', 'dept')).left))
    expect(Math.round(rect(cellSel('b', 'name')).left)).toBe(Math.round(rect(cellSel('a', 'name')).left))
  })

  it('横向合并：起点格的宽度等于跨过的两列，同一行被跨过的格子不渲染', async () => {
    mount(render)
    await expect.poll(() => document.querySelector(cellSel('c', 'q2'))?.getBoundingClientRect().width).toBe(0)
    const origin = rect(cellSel('c', 'q1'))
    expect(Math.round(origin.left)).toBe(Math.round(rect(cellSel('a', 'q1')).left))
    expect(Math.round(origin.right)).toBe(Math.round(rect(cellSel('a', 'q2')).right))
  })
})

describe('多级表头', () => {
  const columns: TableColumnDef[] = [
    { id: 'team', label: '小组', width: 128 },
    { id: 'h1', label: '上半年', children: [{ id: 'q1', label: 'Q1', width: 80 }, { id: 'q2', label: 'Q2', width: 80 }] },
    { id: 'h2', label: '下半年', children: [{ id: 'q3', label: 'Q3', width: 80 }, { id: 'q4', label: 'Q4', width: 80 }] },
  ]
  const leaves = ['team', 'q1', 'q2', 'q3', 'q4']

  function render() {
    return h(XhTableRoot, { columns, rows: [{ id: 't1' }] }, {
      default: ({ headerRows }: { headerRows: readonly (readonly TableHeaderCell[])[] }) => [
        h(XhTableHeader, null, () => headerRows.map((cells, i) => h(XhTableRow, { key: i, level: i + 1 }, () => cells.map(cell =>
          h(XhTableColumnHeader, { key: cell.id, value: cell.id }, () => h(XhTableColumnLabel, null, () => cell.label)))))),
        h(XhTableBody, null, () => h(XhTableRow, { value: 't1' }, () => leaves.map(id => h(XhTableCell, { key: id, value: id }, () => id)))),
      ],
    })
  }

  const header = (id: string, level?: number): DOMRect => {
    const rows = [...document.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"][data-section="header"]')]
    const scope = level ? rows[level - 1]! : document
    const el = scope.querySelector<HTMLElement>(`[data-part="column-header"][data-value="${id}"]`)!
    return el.getBoundingClientRect()
  }

  it('分组格横跨它的叶子列，叶子列头与表体的列对齐', async () => {
    mount(render, 800)
    await expect.poll(() => document.querySelectorAll('[data-section="header"]').length).toBe(2)
    const group = header('h1')
    expect(Math.round(group.left)).toBe(Math.round(header('q1', 2).left))
    expect(Math.round(group.right)).toBe(Math.round(header('q2', 2).right))
    for (const id of ['q1', 'q2', 'q3', 'q4'])
      expect(Math.round(header(id, 2).left)).toBe(Math.round(rect(cellSel('t1', id)).left))
  })

  it('较浅的叶子列头纵向跨满两行表头，读屏只读到一格', async () => {
    mount(render, 800)
    const rows = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"][data-section="header"]')]
    await expect.poll(() => Math.round(header('team', 1).bottom)).toBe(Math.round(rows()[1]!.getBoundingClientRect().bottom))
    const team = rows()[0]!.querySelector<HTMLElement>('[data-value="team"]')!
    expect(team.getAttribute('aria-rowspan')).toBe('2')
    const spacer = rows()[1]!.querySelector<HTMLElement>('[data-value="team"]')!
    expect(spacer.getAttribute('aria-hidden')).toBe('true')
    expect(getComputedStyle(spacer).visibility).toBe('hidden')
    expect(document.querySelector('[data-scope="table"][data-part="row"][data-value="t1"]')!.getAttribute('aria-rowindex')).toBe('3')
  })
})

describe('冻结列按实测宽度累加偏移', () => {
  const columns: TableColumnDef[] = [
    { id: 'a', label: '编号', sticky: true },
    { id: 'b', label: '名称', sticky: true },
    { id: 'c', label: '说明', width: 600 },
    { id: 'd', label: '备注', width: 600 },
  ]

  it('两列冻结都没写数字宽度：横向滚动后第二列贴在第一列之后，不叠在一起', async () => {
    mount(() => h(XhTableRoot, { columns, rows: [{ id: 'r' }] }, () => [
      h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(c =>
        h(XhTableColumnHeader, { key: c.id, value: c.id }, () => h(XhTableColumnLabel, null, () => c.label))))),
      h(XhTableBody, null, () => h(XhTableRow, { value: 'r' }, () => columns.map(c => h(XhTableCell, { key: c.id, value: c.id }, () => c.label)))),
    ]), 480)
    const root = document.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!
    const b = (): HTMLElement => document.querySelector<HTMLElement>('[data-part="column-header"][data-value="b"]')!
    await expect.poll(() => b().style.getPropertyValue('--xh-table-sticky-inset')).not.toBe('')
    root.scrollLeft = 300
    await expect.poll(() => root.scrollLeft).toBe(300)
    const first = rect('[data-part="column-header"][data-value="a"]')
    expect(Math.round(first.left)).toBe(Math.round(root.getBoundingClientRect().left + root.clientLeft))
    expect(Math.round(b().getBoundingClientRect().left)).toBe(Math.round(first.right))
    expect(Math.round(rect(cellSel('r', 'b')).left)).toBe(Math.round(first.right))
  })
})
