// 纵向合并格遇上虚拟滚动：只有窗口里的行在 DOM 里。合并区只按在场的行铺开；
// 起点行滚出窗口时，合并区里第一条在场的行接替起点，内容照常露出来、读屏照常读到。
import type { XhTableElement } from '../../src/elements/table'
import type { XhVirtualizerElement } from '../../src/elements/virtualizer'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const ROW = 36
const GROUP = 10
const COUNT = 40
const VISIBLE = 6

afterEach(() => {
  document.body.querySelectorAll('[data-test="table-span-virtualizer"]').forEach(node => node.remove())
})

/** 每十行一组：组名那一列从组首行起纵向合并十行；作者照常逐格写内容，被合并掉的格子也写组名。 */
async function mount(): Promise<{ stage: HTMLElement, viewport: HTMLElement }> {
  const stage = document.createElement('div')
  stage.dataset.test = 'table-span-virtualizer'
  stage.style.inlineSize = '480px'
  stage.innerHTML = `
    <xh-table>
      <div data-xh-part="root" style="max-block-size: none; overflow: visible">
        <div data-xh-part="header">
          <div data-xh-part="row">
            <div data-xh-part="column-header" value="group"><span data-xh-part="column-label">组</span></div>
            <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">名称</span></div>
          </div>
        </div>
        <div data-xh-part="body">
          <xh-virtualizer count="${COUNT}" estimate-size="${ROW}" overscan="0" viewport-tab-index="-1">
            <div data-xh-part="root">
              <div data-xh-part="viewport" style="block-size: ${ROW * VISIBLE}px">
                <div data-xh-part="content"></div>
              </div>
            </div>
          </xh-virtualizer>
        </div>
      </div>
    </xh-table>
  `
  document.body.append(stage)
  const table = stage.querySelector<XhTableElement>('xh-table')!
  const virtualizer = stage.querySelector<XhVirtualizerElement>('xh-virtualizer')!
  const content = virtualizer.querySelector<HTMLElement>('[data-xh-part="content"]')!
  table.columns = [{ id: 'group', label: '组', width: 120 }, { id: 'name', label: '名称', width: 200 }]
  table.rows = Array.from({ length: COUNT }, (_, i) => ({ id: `r${i}` }))
  table.cellSpan = ({ rowIndex, column }) => (column.id === 'group' && rowIndex % GROUP === 0 ? { rowSpan: GROUP } : null)

  const render = (items: readonly { index: number }[]): void => {
    content.replaceChildren(...items.map((item) => {
      const shell = document.createElement('div')
      shell.dataset.xhPart = 'item'
      shell.setAttribute('value', String(item.index))
      const row = document.createElement('div')
      row.dataset.xhPart = 'row'
      row.dataset.xhPartOwner = 'table'
      row.setAttribute('value', `r${item.index}`)
      row.style.blockSize = `${ROW}px`
      const group = document.createElement('div')
      group.dataset.xhPart = 'cell'
      group.setAttribute('value', 'group')
      group.textContent = `第 ${Math.floor(item.index / GROUP) + 1} 组`
      const name = document.createElement('div')
      name.dataset.xhPart = 'cell'
      name.setAttribute('value', 'name')
      name.textContent = `第 ${item.index + 1} 行`
      row.append(group, name)
      shell.append(row)
      return shell
    }))
    virtualizer.requestUpdate()
    const bridge = virtualizer.collectionVirtualizer
    if (bridge) {
      table.virtualizer = bridge
      table.requestUpdate()
    }
  }
  virtualizer.addEventListener('range-change', event => render((event as CustomEvent).detail.virtualItems))
  await expect.poll(() => virtualizer.collectionVirtualizer != null).toBe(true)
  render(virtualizer.virtualItems)
  const viewport = virtualizer.querySelector<HTMLElement>('[data-xh-part="viewport"]')!
  return { stage, viewport }
}

function groupCell(stage: HTMLElement, row: number): HTMLElement | null {
  return stage.querySelector<HTMLElement>(`[data-scope="table"][data-part="row"][data-value="r${row}"] [data-part="cell"][data-value="group"]`)
}

describe('纵向合并格 × 虚拟滚动（Web Components）', () => {
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
