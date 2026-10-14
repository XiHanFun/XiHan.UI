// 单元格的行内内衬随尺寸档走：sm 8 / md 12 / lg 16，与行高同一把档位。
// 此前三档都是 16px，紧凑表格与缺省表格里左右对齐的字离分隔线一样远，md 下看起来空出一大截。
// 开着竖分隔线时线占的那一像素从末端内衬里让出来，起始内衬不变。内衬要按真实排版量，只有 Chromium 量得出来。
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
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [
  { id: 'name', label: '名称', width: 160 },
  { id: 'owner', label: '负责人', width: 160 },
]
const rows = [{ id: '1' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(size: 'sm' | 'md' | 'lg', ruled = false): Promise<void> {
  host = document.createElement('div')
  host.style.width = '480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows, size, ruled }, () => [
      h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(column =>
        h(XhTableColumnHeader, { key: column.id, value: column.id }, () => h(XhTableColumnLabel, null, () => column.label))))),
      h(XhTableBody, null, () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, () =>
        columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, () => `${column.id}-${row.id}`))))),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function find(part: 'column-header' | 'cell', column: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='${part}'][data-value='${column}']`)!
}

function inset(element: HTMLElement): { start: number, end: number } {
  const style = getComputedStyle(element)
  return { start: Number.parseFloat(style.paddingInlineStart), end: Number.parseFloat(style.paddingInlineEnd) }
}

describe.each([['sm', 8], ['md', 12], ['lg', 16]] as const)('table 单元格行内内衬（%s）', (size, px) => {
  it(`列头与单元格两侧内衬都是 ${px}px`, async () => {
    await mount(size)
    for (const part of ['column-header', 'cell'] as const) {
      for (const column of ['name', 'owner'])
        expect(inset(find(part, column)), `${part}[${column}]`).toEqual({ start: px, end: px })
    }
  })

  it('开着竖分隔线：起始内衬不变，末端让出线宽，末列不画线也不让', async () => {
    await mount(size, true)
    for (const part of ['column-header', 'cell'] as const) {
      expect(inset(find(part, 'name')), `${part}[name]`).toEqual({ start: px, end: px - 1 })
      expect(inset(find(part, 'owner')), `${part}[owner]`).toEqual({ start: px, end: px })
    }
  })
})
