// 表格接 Virtualizer：一万行只挂窗口里那几行，滚动后行号仍按完整行序报；方向键与 Home / End 按完整行序走，
// 落点不在窗口里时先滚进来再交焦点。滚动与焦点只在 Chromium 里可信。
import type { CollectionVirtualizer, VirtualizerItemState } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
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
const people = Array.from({ length: 10000 }, (_, i) => ({ id: `u${i + 1}`, name: `员工 ${i + 1}` }))
const columns = [{ id: 'no', label: '编号', width: 96 }, { id: 'name', label: '姓名' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function mount(): void {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhVirtualizerRoot, { count: people.length, estimateSize: ROW, overscan: 2, viewportTabIndex: -1 }, {
      default: ({ virtualItems, collectionVirtualizer }: { virtualItems: readonly VirtualizerItemState[], collectionVirtualizer: CollectionVirtualizer }) =>
        h(XhTableRoot, {
          columns,
          rows: people.map(p => ({ id: p.id })),
          virtualizer: collectionVirtualizer,
          selectionMode: 'single',
          style: { maxBlockSize: 'none', overflow: 'visible' },
        }, () => [
          h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(c =>
            h(XhTableColumnHeader, { key: c.id, value: c.id }, () => h(XhTableColumnLabel, null, () => c.label))))),
          h(XhTableBody, null, () => h(XhVirtualizerViewport, { style: { blockSize: `${ROW * 8}px` } }, () =>
            h(XhVirtualizerContent, null, () => virtualItems.map(item => h(XhVirtualizerItem, { key: item.key, value: item.index }, () => {
              const p = people[item.index]!
              return h(XhTableRow, { value: p.id, style: { blockSize: `${ROW}px` } }, () => [
                h(XhTableCell, { value: 'no' }, () => String(item.index + 1)),
                h(XhTableCell, { value: 'name' }, () => p.name),
              ])
            }))))),
        ]),
    }),
  })
  app.mount(host)
}

function rows(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="body"] [data-scope="table"][data-part="row"]')]
}

function viewport(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')!
}

describe('表格接 Virtualizer', () => {
  it('一万行只挂窗口里那几行；滚动后换一批，行号仍按完整行序报', async () => {
    mount()
    await expect.poll(() => rows().length).toBeGreaterThan(0)
    expect(rows().length).toBeLessThan(20)
    const root = document.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!
    expect(root.getAttribute('aria-rowcount')).toBe('10001')

    viewport().scrollTop = 5000 * ROW
    await expect.poll(() => rows().some(row => row.getAttribute('data-value') === 'u5001')).toBe(true)
    const row = rows().find(el => el.getAttribute('data-value') === 'u5001')!
    // 表头占第 1 行：第 5001 条数据行的行号是 5002
    expect(row.getAttribute('aria-rowindex')).toBe('5002')
    expect(rows().length).toBeLessThan(20)
    expect(rows().every(el => el.getAttribute('aria-rowindex') === String(Number(el.getAttribute('data-value')!.slice(1)) + 1))).toBe(true)
  })

  it('end 跳到最后一行：先滚进窗口再交焦点；上键接着往回走，窗口跟着挪', async () => {
    mount()
    await expect.poll(() => rows().length).toBeGreaterThan(0)
    rows()[0]!.focus()
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('u1')
    await userEvent.keyboard('{End}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('u10000')
    expect(viewport().scrollTop).toBeGreaterThan(9000 * ROW)
    expect((document.activeElement as HTMLElement).getAttribute('aria-rowindex')).toBe('10001')
    await userEvent.keyboard('{ArrowUp}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('u9999')
    await userEvent.keyboard('{Home}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('u1')
    expect(viewport().scrollTop).toBe(0)
  })

  it('往下走到窗口边缘时窗口跟着滚，焦点行始终在视口里', async () => {
    mount()
    await expect.poll(() => rows().length).toBeGreaterThan(0)
    rows()[0]!.focus()
    for (let i = 0; i < 12; i++)
      await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('u13')
    const focused = (document.activeElement as HTMLElement).getBoundingClientRect()
    const box = viewport().getBoundingClientRect()
    expect(focused.top).toBeGreaterThanOrEqual(box.top - 1)
    expect(focused.bottom).toBeLessThanOrEqual(box.bottom + 1)
  })
})
