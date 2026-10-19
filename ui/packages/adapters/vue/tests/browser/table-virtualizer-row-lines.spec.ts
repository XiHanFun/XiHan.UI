// 虚拟滚动的表体里行包在虚拟条目里：行间线照样画在后一行的上沿，与普通表体同一条线；
// 完整行序里的第一行不画，滚动之后窗口里的第一行照画；条目里跟在数据行后面的详情行也画（Vue）。
import type { CollectionVirtualizer, VirtualizerItemState } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableExpandedRow,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ROW = 36
const COUNT = 200
const columns = [{ id: 'name', label: '姓名' }]
const rows = Array.from({ length: COUNT }, (_, i) => ({ id: `r${i}`, expandable: i === 1 }))
const plainRows = [{ id: 'p0' }, { id: 'p1' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '420px'
  document.body.append(host)
  app = createApp({
    render: () => [
      // 普通表体作对照：第二行上沿的那条线
      h(XhTableRoot, { 'columns': columns, 'rows': plainRows, 'aria-label': '对照', 'data-test': 'plain' }, () => [
        h(XhTableBody, null, () => plainRows.map(row =>
          h(XhTableRow, { key: row.id, value: row.id }, () => h(XhTableCell, { value: 'name' }, () => row.id)))),
      ]),
      h(XhVirtualizerRoot, { count: COUNT, estimateSize: ROW, scrollContainer: 'ancestor' }, {
        default: ({ virtualItems, collectionVirtualizer }: { virtualItems: readonly VirtualizerItemState[], collectionVirtualizer: CollectionVirtualizer }) =>
          h(XhTableRoot, {
            columns,
            rows,
            'virtualizer': collectionVirtualizer,
            'defaultExpandedValue': ['r1'],
            'aria-label': '虚拟',
            'data-test': 'virtual',
          }, () => [
            h(XhTableHeader, null, () => h(XhTableRow, null, () =>
              h(XhTableColumnHeader, { value: 'name' }, () => h(XhTableColumnLabel, null, () => '姓名')))),
            h(XhTableBody, null, () => h(XhVirtualizerViewport, null, () =>
              h(XhVirtualizerContent, null, () => virtualItems.map((item) => {
                const row = rows[item.index]!
                return h(XhVirtualizerItem, { key: item.key, value: item.index }, () => [
                  h(XhTableRow, { value: row.id }, () => h(XhTableCell, { value: 'name' }, () => row.id)),
                  row.expandable ? h(XhTableExpandedRow, { value: row.id }, () => h(XhTableCell, { value: 'name' }, () => `${row.id} 明细`)) : null,
                ])
              })))),
          ]),
      }),
    ],
  })
  app.mount(host)
  await settle()
}

function line(el: Element): string {
  const style = getComputedStyle(el)
  return `${style.borderBlockStartWidth} ${style.borderBlockStartStyle} ${style.borderBlockStartColor}`
}

function plainLine(): string {
  return line(host!.querySelectorAll('[data-test="plain"] [data-scope="table"][data-part="row"]')[1]!)
}

function virtualRows(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>('[data-test="virtual"] [data-scope="table"][data-part="row"][data-section="body"]')]
}

function virtualRow(id: string): HTMLElement | undefined {
  return virtualRows().find(el => el.getAttribute('data-value') === id)
}

describe('虚拟滚动表体的行间线（Vue）', () => {
  it('后一行上沿画线，与普通表体同一条；首行不画，条目里的详情行也画', async () => {
    await mount()
    await expect.poll(() => virtualRow('r3') != null).toBe(true)
    const plain = host!.querySelectorAll('[data-test="plain"] [data-scope="table"][data-part="row"]')
    const expected = plainLine()
    expect(expected).toMatch(/^[1-9][\d.]*px solid /)
    expect(line(plain[0]!)).toMatch(/^0px /)

    expect(line(virtualRow('r0')!)).toMatch(/^0px /)
    expect(line(virtualRow('r1')!)).toBe(expected)
    expect(line(virtualRow('r2')!)).toBe(expected)
    const detail = host!.querySelector('[data-test="virtual"] [data-scope="table"][data-part="expanded-row"]')!
    expect(detail.hasAttribute('hidden')).toBe(false)
    expect(line(detail)).toBe(expected)
  })

  it('滚动之后窗口里的第一行照画：线按完整行序判，不按窗口里的先后', async () => {
    await mount()
    await expect.poll(() => virtualRow('r3') != null).toBe(true)
    const expected = plainLine()
    const root = host!.querySelector<HTMLElement>('[data-test="virtual"]')!
    root.scrollTo({ top: 100 * ROW })
    root.dispatchEvent(new Event('scroll'))
    await settle()
    await expect.poll(() => virtualRow('r0') == null && virtualRow('r100') != null).toBe(true)
    expect(virtualRows().length).toBeGreaterThan(0)
    for (const row of virtualRows())
      expect(line(row)).toBe(expected)
  })
})
