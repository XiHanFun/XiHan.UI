// Web Components 下表格接 Virtualizer：行隔着一层 xh-virtualizer，用 data-xh-part-owner 归表格；
// 只挂窗口里的行，行号按完整行序，End 先滚进窗口再交焦点。
import type { XhTableElement } from '../../src/elements/table'
import type { XhVirtualizerElement } from '../../src/elements/virtualizer'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const ROW = 36
const people = Array.from({ length: 10000 }, (_, i) => ({ id: `u${i + 1}`, name: `员工 ${i + 1}` }))

afterEach(() => {
  document.body.querySelectorAll('[data-test="table-virtualizer"]').forEach(node => node.remove())
})

describe('表格接 Virtualizer（Web Components）', () => {
  it('只挂窗口里的行，行号按完整行序；End 跳到最后一行', async () => {
    const stage = document.createElement('div')
    stage.dataset.test = 'table-virtualizer'
    stage.style.inlineSize = '480px'
    stage.innerHTML = `
      <xh-table>
        <div data-xh-part="root" style="max-block-size: none; overflow: visible">
          <div data-xh-part="header">
            <div data-xh-part="row">
              <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">姓名</span></div>
            </div>
          </div>
          <div data-xh-part="body">
            <xh-virtualizer count="10000" estimate-size="${ROW}" overscan="2" viewport-tab-index="-1">
              <div data-xh-part="root">
                <div data-xh-part="viewport" style="block-size: ${ROW * 8}px">
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
    table.columns = [{ id: 'name', label: '姓名' }]
    table.rows = people.map(p => ({ id: p.id }))

    const render = (virtualItems: readonly { index: number }[]): void => {
      content.replaceChildren(...virtualItems.map((item) => {
        const shell = document.createElement('div')
        shell.dataset.xhPart = 'item'
        shell.setAttribute('value', String(item.index))
        const row = document.createElement('div')
        row.dataset.xhPart = 'row'
        row.dataset.xhPartOwner = 'table'
        row.setAttribute('value', people[item.index]!.id)
        row.style.blockSize = `${ROW}px`
        const cell = document.createElement('div')
        cell.dataset.xhPart = 'cell'
        cell.setAttribute('value', 'name')
        cell.textContent = people[item.index]!.name
        row.append(cell)
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

    const rows = (): HTMLElement[] => [...stage.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"][data-section="body"]')]
    await expect.poll(() => rows().length).toBeGreaterThan(0)
    expect(rows().length).toBeLessThan(20)
    expect(rows()[0]!.getAttribute('aria-rowindex')).toBe('2')

    rows()[0]!.focus()
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('u1')
    await userEvent.keyboard('{End}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('u10000')
    expect((document.activeElement as HTMLElement).getAttribute('aria-rowindex')).toBe('10001')
    expect(rows().length).toBeLessThan(20)
  })
})
