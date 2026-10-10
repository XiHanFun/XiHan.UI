// 列与列之间的竖分隔线（ruled）不吃格子里放字的宽：开不开竖线，同一列宽里能放的字一样多。
// 此前竖线是格子自己的末端描边，内衬照旧 16px，60px 的序号列开了竖线只剩 27.33px，
// 「序号」两个字要 28px，差不到一个像素就出了省略号；关掉竖线又能放下。
// 盒宽与文字是否溢出要按真实排版量，只有 Chromium 量得出来。
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
  { id: 'index', label: '序号', width: 60, minWidth: 60, maxWidth: 60 },
  { id: 'name', label: '名称', width: 160 },
]
const rows = [{ id: '1' }, { id: '2' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(ruled: boolean): Promise<void> {
  host = document.createElement('div')
  host.style.width = '480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows, ruled }, () => [
      h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(column =>
        h(XhTableColumnHeader, { key: column.id, value: column.id }, () => h(XhTableColumnLabel, null, () => column.label))))),
      h(XhTableBody, null, () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, () =>
        columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, () => row.id))))),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function find(part: 'column-header' | 'cell', column: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='${part}'][data-value='${column}']`)!
}

/** 格子里放字的那一截：边框盒宽减去两侧描边与内衬。 */
function contentWidth(element: HTMLElement): number {
  const style = getComputedStyle(element)
  return element.getBoundingClientRect().width
    - Number.parseFloat(style.borderInlineStartWidth)
    - Number.parseFloat(style.borderInlineEndWidth)
    - Number.parseFloat(style.paddingInlineStart)
    - Number.parseFloat(style.paddingInlineEnd)
}

describe('table 竖分隔线与格内宽度', () => {
  it('开不开竖线，列头与单元格里放字的宽度都一样', async () => {
    await mount(false)
    const plain = { head: contentWidth(find('column-header', 'index')), cell: contentWidth(find('cell', 'index')) }
    app!.unmount()
    host!.remove()

    await mount(true)
    const head = find('column-header', 'index')
    expect(getComputedStyle(head).borderInlineEndStyle).toBe('solid')
    expect(contentWidth(head)).toBeCloseTo(plain.head, 1)
    expect(contentWidth(find('cell', 'index'))).toBeCloseTo(plain.cell, 1)
  })

  it('60px 的序号列开着竖线，「序号」两个字完整放下、不出省略号', async () => {
    await mount(true)
    const label = find('column-header', 'index').querySelector<HTMLElement>(`[data-part='column-label']`)!
    expect(label.textContent).toBe('序号')
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth)
  })
})
