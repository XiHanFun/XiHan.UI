// 列的 minWidth / maxWidth 同时管布局：单元格是 flex: 1 1 auto，没有上下限时一列会随余量无限拉宽、
// 也会收到皮肤的 3rem 地板；写了上下限，伸缩分剩余空间时不越过它们，三者同值就是定宽。
// 表头格与数据格各自是一行里的 flex 项，两行按同一份上下限伸缩，列边界才对得齐。jsdom 不排版，只有真实浏览器量得出来。
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

// 各列都写了 width：伸缩的基准在表头行与数据行里相同，两行才按同一份上下限分余量
const columns = [
  { id: 'name', label: '名称', width: 80, minWidth: 240 },
  { id: 'size', label: '大小', width: 120, maxWidth: 96 },
  { id: 'state', label: '状态', width: 72, minWidth: 72, maxWidth: 72 },
  { id: 'note', label: '备注', width: 120 },
]
const rows = [{ id: 'a' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(width: number): Promise<void> {
  host = document.createElement('div')
  host.style.width = `${width}px`
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, {
              default: () => [h(XhTableColumnLabel, null, { default: () => column.label })],
            })),
          })],
        }),
        h(XhTableBody, null, {
          default: () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, {
            default: () => columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, { default: () => row.id })),
          })),
        }),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
}

function widthOf(part: 'column-header' | 'cell', column: string): number {
  const el = host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='${part}'][data-value='${column}']`)
  if (!el)
    throw new Error(`缺少 ${part}：${column}`)
  return el.getBoundingClientRect().width
}

describe('table 列宽上下限参与布局', () => {
  it('宽表：有上限的列不随余量拉宽，定宽列纹丝不动，余量交给没设上限的列', async () => {
    await mount(1200)
    expect(widthOf('column-header', 'size')).toBeLessThanOrEqual(96.5)
    expect(widthOf('column-header', 'state')).toBeCloseTo(72, 0)
    expect(widthOf('column-header', 'note')).toBeGreaterThan(120)
  })

  it('窄表：有下限的列不收到下限以下', async () => {
    await mount(360)
    expect(widthOf('column-header', 'name')).toBeGreaterThanOrEqual(239.5)
    expect(widthOf('column-header', 'state')).toBeCloseTo(72, 0)
  })

  it('表头格与数据格按同一份上下限伸缩，列边界对得齐', async () => {
    for (const width of [360, 1200]) {
      await mount(width)
      for (const column of ['name', 'size', 'state', 'note'])
        expect(Math.abs(widthOf('column-header', column) - widthOf('cell', column))).toBeLessThanOrEqual(0.5)
      app?.unmount()
      host?.remove()
      app = null
      host = null
    }
  })
})
