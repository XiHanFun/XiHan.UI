// 行表头列：列定义标了 rowHeader 的那一列，表体与脚注里的格子报 rowheader，列头仍是 columnheader，角色结构 axe 不报。
import type { TableColumnDef } from '@xihan-ui/headless'
import { runAxe } from '@xihan-ui/testing/a11y'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhTableBody, XhTableCell, XhTableColumnHeader, XhTableColumnLabel, XhTableFooter, XhTableHeader, XhTableRoot, XhTableRow } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

const ROLE_RULES = ['aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-valid-attr-value']

const LINES = [{ id: 'l1', item: '键盘', count: 2 }, { id: 'l2', item: '鼠标', count: 3 }]

async function mount(rowHeader: TableColumnDef['rowHeader']): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  const columns = [{ id: 'item', label: '条目', rowHeader }, { id: 'count', label: '数量' }]
  const root = createRoot(host)
  await act(async () => {
    root.render(
      <XhTableRoot columns={columns} rows={LINES.map(l => ({ id: l.id }))} footerRows={1} aria-label="采购清单">
        <XhTableHeader>
          <XhTableRow>
            {columns.map(c => <XhTableColumnHeader key={c.id} value={c.id}><XhTableColumnLabel>{c.label}</XhTableColumnLabel></XhTableColumnHeader>)}
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {LINES.map(l => (
            <XhTableRow key={l.id} value={l.id}>
              <XhTableCell value="item">{l.item}</XhTableCell>
              <XhTableCell value="count">{l.count}</XhTableCell>
            </XhTableRow>
          ))}
        </XhTableBody>
        <XhTableFooter>
          <XhTableRow>
            <XhTableCell value="item">合计</XhTableCell>
            <XhTableCell value="count">5</XhTableCell>
          </XhTableRow>
        </XhTableFooter>
      </XhTableRoot>,
    )
  })
  unmount = () => act(() => root.unmount())
  for (let i = 0; i < 3; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  return host
}

function roles(box: HTMLElement, selector: string): (string | null)[] {
  return [...box.querySelectorAll(selector)].map(el => el.getAttribute('role'))
}

describe('行表头列', () => {
  it('标了 rowHeader 的列：表体与脚注里的格子是 rowheader，其余是 gridcell，列头不变', async () => {
    const box = await mount(true)
    expect(roles(box, '[data-scope="table"][data-part="cell"][data-value="item"]')).toEqual(['rowheader', 'rowheader', 'rowheader'])
    expect(roles(box, '[data-scope="table"][data-part="cell"][data-value="count"]')).toEqual(['gridcell', 'gridcell', 'gridcell'])
    expect(roles(box, '[data-scope="table"][data-part="column-header"]')).toEqual(['columnheader', 'columnheader'])
    const { violations } = await runAxe(box)
    expect(violations.filter(v => ROLE_RULES.includes(v.id)).map(v => v.id)).toEqual([])
  })

  it('没标时格子一律是 gridcell', async () => {
    const box = await mount(false)
    expect(roles(box, '[data-scope="table"][data-part="cell"]')).toEqual(Array.from({ length: 6 }).fill('gridcell'))
  })

  it('给函数时按行决定：返回 false 的那一行照旧是 gridcell，表尾按行表头，角色结构 axe 不报', async () => {
    const box = await mount(row => row.id === 'l1')
    expect(roles(box, '[data-scope="table"][data-part="cell"][data-value="item"]')).toEqual(['rowheader', 'gridcell', 'rowheader'])
    expect(roles(box, '[data-scope="table"][data-part="cell"][data-value="count"]')).toEqual(['gridcell', 'gridcell', 'gridcell'])
    const { violations } = await runAxe(box)
    expect(violations.filter(v => ROLE_RULES.includes(v.id)).map(v => v.id)).toEqual([])
  })
})
