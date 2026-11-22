// 冻结列不挡住滚进来的格子：把一格滚进可视区（scrollIntoView、焦点移入）时，它落在两侧冻结列之外，
// 而不是停在视口边上、一半压在冻结列底下。滚动位置与 scroll-padding 的效果只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaViewport,
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
  { id: 'select', label: '', width: 56, sticky: 'start' as const },
  { id: 'name', label: '名称', width: 120, sticky: 'start' as const },
  { id: 'size', label: '大小', width: 240 },
  { id: 'owner', label: '负责人', width: 240 },
  { id: 'action', label: '操作', width: 96, sticky: 'end' as const },
]
const rows = [{ id: 'a' }, { id: 'b' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function table() {
  return h(XhTableRoot, { columns, rows }, () => [
    h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, () => h(XhTableColumnLabel, null, () => column.label))))),
    h(XhTableBody, null, () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, () => columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, () => `${row.id}-${column.id}`))))),
  ])
}

/** 挂一张 640px 宽的表（扣掉两侧冻结列还放得下一整列，总宽又超出一截能横向滚）；inScrollArea 时放进滚动区，滚动交给滚动区的视口 */
async function mount(options: { dir?: 'ltr' | 'rtl', inScrollArea?: boolean } = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  host.dir = options.dir ?? 'ltr'
  document.body.append(host)
  app = createApp({
    render: () => options.inScrollArea
      ? h(XhScrollAreaRoot, { style: { inlineSize: '640px' } }, () => h(XhScrollAreaViewport, null, () => h(XhScrollAreaContent, null, () => table())))
      : table(),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  const scroller = options.inScrollArea
    ? host.querySelector<HTMLElement>(`[data-scope='scroll-area'][data-part='viewport']`)
    : host.querySelector<HTMLElement>(`[data-scope='table'][data-part='root']`)
  return scroller!
}

function header(column: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-part='column-header'][data-value='${column}']`)!
}

function cell(row: string, column: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-part='row'][data-value='${row}'] [data-part='cell'][data-value='${column}']`)!
}

/** 两个盒在行内向上有没有重叠（容 1px 的舍入） */
function overlaps(a: HTMLElement, b: HTMLElement): boolean {
  const ra = a.getBoundingClientRect()
  const rb = b.getBoundingClientRect()
  return Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left) > 1
}

describe('table 冻结列不挡滚进来的格子', () => {
  it('滚到行尾一侧：列头停在行尾冻结列之前，不压在它底下', async () => {
    const scroller = await mount()
    expect(scroller.scrollLeft).toBe(0)

    header('owner').scrollIntoView({ block: 'nearest', inline: 'nearest' })

    expect(scroller.scrollLeft).toBeGreaterThan(0)
    expect(overlaps(header('owner'), header('action'))).toBe(false)
  })

  it('滚回行首一侧：格子停在行首那几列冻结列之后', async () => {
    const scroller = await mount()
    scroller.scrollLeft = scroller.scrollWidth

    cell('b', 'size').scrollIntoView({ block: 'nearest', inline: 'nearest' })

    expect(overlaps(cell('b', 'size'), cell('b', 'name'))).toBe(false)
    expect(overlaps(cell('b', 'size'), cell('b', 'select'))).toBe(false)
  })

  it('rtl：两侧按逻辑方向让开', async () => {
    const scroller = await mount({ dir: 'rtl' })

    header('owner').scrollIntoView({ block: 'nearest', inline: 'nearest' })

    expect(scroller.scrollLeft).toBeLessThan(0)
    expect(overlaps(header('owner'), header('action'))).toBe(false)
  })

  it('放进滚动区：滚的是滚动区的视口，同样让开冻结列', async () => {
    const scroller = await mount({ inScrollArea: true })
    expect(scroller.scrollLeft).toBe(0)

    header('owner').scrollIntoView({ block: 'nearest', inline: 'nearest' })

    expect(scroller.scrollLeft).toBeGreaterThan(0)
    expect(overlaps(header('owner'), header('action'))).toBe(false)
  })
})
