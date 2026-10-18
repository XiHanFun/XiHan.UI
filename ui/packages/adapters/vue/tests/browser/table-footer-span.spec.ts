// 表尾合并：footerCellSpan 让合计格横跨行表头的两列、纵跨两行表尾，被跨过的格子只留位置；几何只在 Chromium 里可信。
import type { TableColumnDef, TableFooterCellSpanDetails } from '@xihan-ui/headless'
import type { App } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableFooter,
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

const RULES = ['aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-valid-attr-value', 'empty-table-header']

const COLUMNS: TableColumnDef[] = [
  { id: 'region', label: '区域', width: 120, rowHeader: true },
  { id: 'city', label: '城市', width: 120, rowHeader: true },
  { id: 'q1', label: 'Q1', width: 80 },
  { id: 'q2', label: 'Q2', width: 80 },
]

const BODY = [
  { id: 'a', region: '华东', city: '上海', q1: '3', q2: '4' },
  { id: 'b', region: '华东', city: '杭州', q1: '5', q2: '6' },
]

const FOOTER = [
  { region: '合计', city: '', q1: '8', q2: '10' },
  { region: '', city: '', q1: '8%', q2: '10%' },
]

function footerCellSpan({ level, column }: TableFooterCellSpanDetails) {
  return level === 1 && column.id === 'region' ? { colSpan: 2, rowSpan: 2 } : null
}

function mount(): HTMLElement {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { 'columns': COLUMNS, 'rows': BODY.map(r => ({ id: r.id })), 'footerRows': 2, footerCellSpan, 'aria-label': '分区销量' }, () => [
      h(XhTableHeader, null, () => h(XhTableRow, null, () => COLUMNS.map(c =>
        h(XhTableColumnHeader, { key: c.id, value: c.id }, () => h(XhTableColumnLabel, null, () => c.label))))),
      h(XhTableBody, null, () => BODY.map(r => h(XhTableRow, { key: r.id, value: r.id }, () =>
        COLUMNS.map(c => h(XhTableCell, { key: c.id, value: c.id }, () => r[c.id as keyof typeof r]))))),
      h(XhTableFooter, null, () => FOOTER.map((r, i) => h(XhTableRow, { key: i, level: i + 1 }, () =>
        COLUMNS.map(c => h(XhTableCell, { key: c.id, value: c.id }, () => r[c.id as keyof typeof r]))))),
    ]),
  })
  app.mount(host)
  return host
}

function footerCell(level: number, column: string): HTMLElement {
  const rows = [...document.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"][data-section="footer"]')]
  return rows[level - 1]!.querySelector<HTMLElement>(`[data-scope="table"][data-part="cell"][data-value="${column}"]`)!
}

function header(column: string): DOMRect {
  return document.querySelector<HTMLElement>(`[data-scope="table"][data-part="column-header"][data-value="${column}"]`)!.getBoundingClientRect()
}

describe('表尾合并', () => {
  it('合计格横跨两列、纵跨两行表尾；同一行被跨过的不渲染，下一行留位置；没有空的行表头', async () => {
    const box = mount()
    await expect.poll(() => footerCell(1, 'region').getAttribute('aria-rowspan')).toBe('2')
    const origin = footerCell(1, 'region')
    expect(origin.getAttribute('aria-colspan')).toBe('2')
    expect(origin.getAttribute('role')).toBe('rowheader')
    expect(Math.round(origin.getBoundingClientRect().left)).toBe(Math.round(header('region').left))
    expect(Math.round(origin.getBoundingClientRect().right)).toBe(Math.round(header('city').right))
    await expect.poll(() => Math.round(origin.getBoundingClientRect().bottom)).toBe(Math.round(footerCell(2, 'q1').getBoundingClientRect().bottom))
    expect(footerCell(1, 'city').getBoundingClientRect().width).toBe(0)
    const spacer = footerCell(2, 'region')
    expect(spacer.getAttribute('aria-hidden')).toBe('true')
    expect(getComputedStyle(spacer).visibility).toBe('hidden')
    expect(Math.round(footerCell(2, 'q1').getBoundingClientRect().left)).toBe(Math.round(header('q1').left))
    const { violations } = await runAxe(box)
    expect(violations.filter(v => RULES.includes(v.id)).map(v => v.id)).toEqual([])
  })
})
