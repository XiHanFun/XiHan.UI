// 纵向合并格遇上虚拟滚动：只有窗口里的行在 DOM 里。合并区只按在场的行铺开；
// 起点行滚出窗口时，合并区里第一条在场的行接替起点，内容照常露出来、读屏照常读到。
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

const ROW = 36
const GROUP = 10
const COUNT = 40
const VISIBLE = 6

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

const columns = [{ id: 'group', label: '组', width: 120 }, { id: 'name', label: '名称', width: 200 }]
const rows = Array.from({ length: COUNT }, (_, i) => ({ id: `r${i}` }))

/** 每十行一组：组名那一列从组首行起纵向合并十行；作者照常逐格写内容，被合并掉的格子也写组名。 */
async function mount(): Promise<{ stage: HTMLElement, viewport: HTMLElement }> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(
      <XhVirtualizerRoot count={COUNT} estimateSize={ROW} overscan={0} viewportTabIndex={-1}>
        {({ virtualItems, collectionVirtualizer }) => (
          <XhTableRoot
            columns={columns}
            rows={rows}
            cellSpan={({ rowIndex, column }) => (column.id === 'group' && rowIndex % GROUP === 0 ? { rowSpan: GROUP } : null)}
            virtualizer={collectionVirtualizer}
            style={{ maxBlockSize: 'none', overflow: 'visible' }}
          >
            <XhTableHeader>
              <XhTableRow>
                {columns.map(c => <XhTableColumnHeader key={c.id} value={c.id}><XhTableColumnLabel>{c.label}</XhTableColumnLabel></XhTableColumnHeader>)}
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody>
              <XhVirtualizerViewport style={{ blockSize: ROW * VISIBLE }}>
                <XhVirtualizerContent>
                  {virtualItems.map(item => (
                    <XhVirtualizerItem key={item.key} value={item.index}>
                      <XhTableRow value={`r${item.index}`} style={{ blockSize: ROW }}>
                        <XhTableCell value="group">{`第 ${Math.floor(item.index / GROUP) + 1} 组`}</XhTableCell>
                        <XhTableCell value="name">{`第 ${item.index + 1} 行`}</XhTableCell>
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
  for (let i = 0; i < 3; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  return { stage: host, viewport: host.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')! }
}

function groupCell(stage: HTMLElement, row: number): HTMLElement | null {
  return stage.querySelector<HTMLElement>(`[data-scope="table"][data-part="row"][data-value="r${row}"] [data-part="cell"][data-value="group"]`)
}

describe('纵向合并格 × 虚拟滚动（React）', () => {
  it('起点行在窗口里、末行不在：合并格铺到窗口里最后一条在场的行', async () => {
    const { stage } = await mount()
    await expect.poll(() => groupCell(stage, 0)?.getBoundingClientRect().height ?? 0).toBeGreaterThan(ROW * (VISIBLE - 0.5))
    const origin = groupCell(stage, 0)!
    expect(origin.getAttribute('aria-rowspan')).toBe(String(GROUP))
    // 压在下面几行之上：点在第 3 行那一格的位置，命中的是起点格
    const box = groupCell(stage, 2)!.getBoundingClientRect()
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
    expect(origin.contains(hit)).toBe(true)
  })

  it('起点行滚出窗口：合并区里第一条在场的行接替起点，内容露出、读屏读得到，跨度是剩下的行数', async () => {
    const { stage, viewport } = await mount()
    viewport.scrollTop = ROW * 3
    await expect.poll(() => groupCell(stage, 0)).toBeNull()
    await expect.poll(() => groupCell(stage, 3)?.getAttribute('aria-rowspan') ?? null).toBe(String(GROUP - 3))
    const relay = groupCell(stage, 3)!
    expect(relay.hasAttribute('aria-hidden')).toBe(false)
    expect(getComputedStyle(relay).visibility).toBe('visible')
    expect(relay.textContent).toBe('第 1 组')
    await expect.poll(() => relay.getBoundingClientRect().height).toBeGreaterThan(ROW * (VISIBLE - 1.5))
    // 下面几行那一格仍是占位
    expect(groupCell(stage, 4)!.getAttribute('aria-hidden')).toBe('true')
  })

  it('滚过合并区的边界：上一组的接替格与下一组的起点各管各的', async () => {
    const { stage, viewport } = await mount()
    viewport.scrollTop = ROW * 7
    await expect.poll(() => groupCell(stage, 7)?.getAttribute('aria-rowspan') ?? null).toBe(String(GROUP - 7))
    await expect.poll(() => groupCell(stage, 10)?.getAttribute('aria-rowspan') ?? null).toBe(String(GROUP))
    expect(groupCell(stage, 7)!.textContent).toBe('第 1 组')
    expect(groupCell(stage, 10)!.textContent).toBe('第 2 组')
  })
})
