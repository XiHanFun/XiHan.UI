// 行表头列：列定义标了 rowHeader 的那一列，表体与脚注里的格子报 rowheader，列头仍是 columnheader，角色结构 axe 不报。
import type { App } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTableBody, XhTableCell, XhTableColumnHeader, XhTableColumnLabel, XhTableFooter, XhTableHeader, XhTableRoot, XhTableRow } from '../../src'
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

const ROLE_RULES = ['aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-valid-attr-value']

const LINES = [{ id: 'l1', item: '键盘', count: 2 }, { id: 'l2', item: '鼠标', count: 3 }]

async function mount(rowHeader: boolean): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  const columns = [{ id: 'item', label: '条目', rowHeader }, { id: 'count', label: '数量' }]
  app = createApp({
    render: () => h(XhTableRoot, { 'columns': columns, 'rows': LINES.map(l => ({ id: l.id })), 'footer': true, 'aria-label': '采购清单' }, () => [
      h(XhTableHeader, null, () => [h(XhTableRow, null, () => columns.map(c => h(XhTableColumnHeader, { key: c.id, value: c.id }, () => [h(XhTableColumnLabel, null, () => c.label)])))]),
      h(XhTableBody, null, () => LINES.map(l => h(XhTableRow, { key: l.id, value: l.id }, () => [
        h(XhTableCell, { value: 'item' }, () => l.item),
        h(XhTableCell, { value: 'count' }, () => String(l.count)),
      ]))),
      h(XhTableFooter, null, () => [h(XhTableRow, null, () => [h(XhTableCell, { value: 'item' }, () => '合计'), h(XhTableCell, { value: 'count' }, () => '5')])]),
    ]),
  })
  app.mount(host)
  await nextTick()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
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
})
