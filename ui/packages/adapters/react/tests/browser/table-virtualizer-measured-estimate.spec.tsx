// 虚拟滚动表格用 estimateFromMeasured：不写估算值，没量过的行按已量行的实测平均估。
// 大跨度设 scrollTop 之后读回的偏差在一行以内；切 compact、comfortable 之后再核一次（React）。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
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

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
}

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '375px'
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(
      <XhVirtualizerRoot count={COUNT} estimateFromMeasured scrollContainer="ancestor">
        {({ virtualItems, collectionVirtualizer }) => (
          <XhTableRoot columns={columns} rows={rows} stickyHeader virtualizer={collectionVirtualizer}>
            <XhTableHeader>
              <XhTableRow>
                {columns.map(c => <XhTableColumnHeader key={c.id} value={c.id}><XhTableColumnLabel>{c.label}</XhTableColumnLabel></XhTableColumnHeader>)}
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody>
              <XhVirtualizerViewport>
                <XhVirtualizerContent>
                  {virtualItems.map(item => (
                    <XhVirtualizerItem key={item.key} value={item.index} measure>
                      <XhTableRow value={`r${item.index}`}>
                        <XhTableCell value="no">{`#${item.index + 1}`}</XhTableCell>
                        <XhTableCell value="name">{`员工 ${item.index + 1}`}</XhTableCell>
                      </XhTableRow>
                    </XhVirtualizerItem>
                  ))}
                </XhVirtualizerContent>
              </XhVirtualizerViewport>
            </XhTableBody>
          </XhTableRoot>
        )}
      </XhVirtualizerRoot>,
    )
  })
  unmount = () => act(() => root.unmount())
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

describe('虚拟滚动表格按实测估算行高（React）', () => {
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
