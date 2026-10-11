// 字段族控件放进表格格子（就地编辑）铺满这一格：格子声明 --xh-control-w: 100%，与放进 Field 时一样。
// 此前字段照旧按单独摆放的 16rem 缺省宽，格子窄了顶出格、宽了留一截空，示例只好在每个字段上手写 --xh-control-w。
// 宽度要按真实排版量。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
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

const columns = [{ id: 'item', label: '条目', width: 120 }, { id: 'note', label: '备注', width: 420 }]
const rows = [{ id: 'a' }]

describe('表格格子里的字段（Vue）', () => {
  it('文本框铺满所在的格子，格子比 16rem 宽也跟着走', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '560px'
    document.body.append(host)
    app = createApp({
      render: () => h(XhTableRoot, { columns, rows }, () => [
        h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(column =>
          h(XhTableColumnHeader, { key: column.id, value: column.id }, () => h(XhTableColumnLabel, null, () => column.label))))),
        h(XhTableBody, null, () => h(XhTableRow, { value: 'a' }, () => [
          h(XhTableCell, { value: 'item' }, () => '键盘'),
          h(XhTableCell, { value: 'note' }, () =>
            h(XhTextFieldRoot, { 'size': 'sm', 'aria-label': '备注' }, () => h(XhTextFieldControl, null, () => h(XhTextFieldInput)))),
        ])),
      ]),
    })
    app.mount(host)
    await nextTick()
    const root = host.querySelector<HTMLElement>(`[data-scope='text-field'][data-part='root']`)!
    const cell = root.closest<HTMLElement>(`[data-scope='table'][data-part='cell']`)!
    const style = getComputedStyle(cell)
    const content = cell.clientWidth - Number.parseFloat(style.paddingInlineStart) - Number.parseFloat(style.paddingInlineEnd)
    expect(content).toBeGreaterThan(256)
    expect(root.getBoundingClientRect().width).toBeCloseTo(content, 0)
  })
})
