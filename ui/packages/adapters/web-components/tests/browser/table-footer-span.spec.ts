// 表尾合并：footerCellSpan 让合计格横跨行表头的两列、纵跨两行表尾，被跨过的格子只留位置；几何只在 Chromium 里可信。
import type { TableColumnDef, TableFooterCellSpanDetails } from '@xihan-ui/headless'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

const RULES = ['aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-valid-attr-value', 'empty-table-header']

const COLUMNS: TableColumnDef[] = [
  { id: 'region', label: '区域', width: 120, rowHeader: true },
  { id: 'city', label: '城市', width: 120, rowHeader: true },
  { id: 'q1', label: 'Q1', width: 80 },
  { id: 'q2', label: 'Q2', width: 80 },
]

function footerCellSpan({ level, column }: TableFooterCellSpanDetails) {
  return level === 1 && column.id === 'region' ? { colSpan: 2, rowSpan: 2 } : null
}

function footerRow(level: number, cells: [string, string][]): string {
  return `<div data-xh-part="row" level="${level}">${cells.map(([id, text]) => `<div data-xh-part="cell" value="${id}">${text}</div>`).join('')}</div>`
}

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  host.innerHTML = `
    <xh-table footer-rows="2">
      <div data-xh-part="root" aria-label="分区销量">
        <div data-xh-part="header"><div data-xh-part="row">
          ${COLUMNS.map(c => `<div data-xh-part="column-header" value="${c.id}"><span data-xh-part="column-label">${c.label}</span></div>`).join('')}
        </div></div>
        <div data-xh-part="body">
          <div data-xh-part="row" value="a"><div data-xh-part="cell" value="region">华东</div><div data-xh-part="cell" value="city">上海</div><div data-xh-part="cell" value="q1">3</div><div data-xh-part="cell" value="q2">4</div></div>
          <div data-xh-part="row" value="b"><div data-xh-part="cell" value="region">华东</div><div data-xh-part="cell" value="city">杭州</div><div data-xh-part="cell" value="q1">5</div><div data-xh-part="cell" value="q2">6</div></div>
        </div>
        <div data-xh-part="footer">
          ${footerRow(1, [['region', '合计'], ['city', ''], ['q1', '8'], ['q2', '10']])}
          ${footerRow(2, [['region', ''], ['city', ''], ['q1', '8%'], ['q2', '10%']])}
        </div>
      </div>
    </xh-table>`
  document.body.append(host)
  const table = host.querySelector('xh-table') as unknown as Record<string, unknown>
  table.columns = COLUMNS
  table.rows = [{ id: 'a' }, { id: 'b' }]
  table.footerCellSpan = footerCellSpan
  await Promise.resolve()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
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
    const box = await mount()
    const origin = footerCell(1, 'region')
    expect(origin.getAttribute('aria-colspan')).toBe('2')
    expect(origin.getAttribute('aria-rowspan')).toBe('2')
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
