// 虚拟滚动表格用 estimateFromMeasured：不写估算值，没量过的行按已量行的实测平均估。
// 大跨度设 scrollTop 之后读回的偏差在一行以内；切 compact、comfortable 之后再核一次（Vue）。
import type { CollectionVirtualizer } from '@xihan-ui/headless'
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
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const COUNT = 5000
const columns = [
  { id: 'no', label: '编号' },
  { id: 'name', label: '姓名' },
]
const rows = Array.from({ length: COUNT }, (_, i) => ({ id: `r${i}` }))

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function settle(): Promise<void> {
  await nextTick()
  for (let i = 0; i < 4; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '375px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhVirtualizerRoot, { count: COUNT, estimateFromMeasured: true, scrollContainer: 'ancestor' }, {
      default: ({ virtualItems, collectionVirtualizer }: { virtualItems: readonly { key: string | number, index: number }[], collectionVirtualizer: CollectionVirtualizer | undefined }) => h(XhTableRoot, {
        columns,
        rows,
        stickyHeader: true,
        virtualizer: collectionVirtualizer,
      }, () => [
        h(XhTableHeader, null, () => [h(XhTableRow, null, () => columns.map(c => h(XhTableColumnHeader, { key: c.id, value: c.id }, () => [h(XhTableColumnLabel, null, () => c.label)])))]),
        h(XhTableBody, null, () => [
          h(XhVirtualizerViewport, null, () => [
            h(XhVirtualizerContent, null, () => virtualItems.map(item => h(XhVirtualizerItem, { key: item.key, value: item.index, measure: true }, () => [
              h(XhTableRow, { value: `r${item.index}` }, () => [
                h(XhTableCell, { value: 'no' }, () => `#${item.index + 1}`),
                h(XhTableCell, { value: 'name' }, () => `员工 ${item.index + 1}`),
              ]),
            ]))),
          ]),
        ]),
      ]),
    }),
  })
  app.mount(host)
  await settle()
  return host.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!
}

async function scrollRoot(root: HTMLElement, top: number): Promise<void> {
  root.scrollTo({ top })
  root.dispatchEvent(new Event('scroll'))
  await settle()
}

/** 窗口里渲着的行，最高的那一行的高度。 */
function rowHeight(root: HTMLElement): number {
  const items = [...root.querySelectorAll<HTMLElement>('[data-scope="virtualizer"][data-part="item"]:not([hidden])')]
  return Math.max(...items.map(item => item.offsetHeight))
}

async function setDensity(density: 'compact' | 'comfortable'): Promise<void> {
  host!.setAttribute('data-density', density)
  await settle()
}

describe('虚拟滚动表格按实测估算行高（Vue）', () => {
  it('没写估算值：大跨度设 scrollTop，读回的偏差在一行以内', async () => {
    const root = await mount()
    const row = rowHeight(root)
    expect(row).toBeGreaterThan(0)
    for (const top of [3000, 60000, 12000]) {
      await scrollRoot(root, top)
      expect(Math.abs(root.scrollTop - top)).toBeLessThan(row)
    }
  })

  it('切 compact、comfortable 之后估算跟着新的实测走，读回的偏差仍在一行以内', async () => {
    const root = await mount()
    const base = rowHeight(root)
    await scrollRoot(root, 3000)

    await setDensity('compact')
    const compact = rowHeight(root)
    expect(compact).toBeLessThan(base)
    await scrollRoot(root, 60000)
    expect(Math.abs(root.scrollTop - 60000)).toBeLessThan(compact)

    await setDensity('comfortable')
    const comfortable = rowHeight(root)
    expect(comfortable).toBeGreaterThan(compact)
    await scrollRoot(root, 9000)
    expect(Math.abs(root.scrollTop - 9000)).toBeLessThan(comfortable)
  })
})
