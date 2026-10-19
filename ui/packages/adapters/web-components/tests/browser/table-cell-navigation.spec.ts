// 单元格级导航（navigation="cell"）的真实键盘：Tab 进表体落在行上，右键进格子，格子上画一圈内收的聚焦环；
// Enter 进格内输入框，打字与方向键都归输入框，Esc 回到格子；格子上按 Alt + 下键换位，宿主写回行序后焦点仍在那一格。
// 宿主照文档示例的写法把行节点按新次序 append 回表体：挪的正是持有焦点的那一行，行级导航（缺省）下焦点同样要回到那一行。
// 树形表：a 下挂 b、c，d 是根行；b 的 value 格里放一个输入框。
import type { TableRowDef, TableRowMoveDetails } from '@xihan-ui/headless'
import type { XhTableElement } from '../../src/elements/table'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.replaceChildren()
})

const ROWS: TableRowDef[] = [{ id: 'a' }, { id: 'b', parentId: 'a' }, { id: 'c', parentId: 'a' }, { id: 'd' }]

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(navigation: 'row' | 'cell' = 'cell'): Promise<void> {
  const rowsHtml = ROWS.map(row => `
    <div data-xh-part="row" value="${row.id}">
      <div data-xh-part="cell" value="name">${row.id} 名称</div>
      <div data-xh-part="cell" value="value">${row.id === 'b' ? '<input aria-label="取值">' : `${row.id} 取值`}</div>
    </div>`).join('')
  document.body.innerHTML = `
    <div style="inline-size: 420px">
      <button type="button" data-test-start>起点</button>
      <xh-table navigation="${navigation}" row-reorderable aria-label="选项">
        <div data-xh-part="root">
          <div data-xh-part="header">
            <div data-xh-part="row">
              <div data-xh-part="column-header" value="name"><span data-xh-part="column-label">名称</span></div>
              <div data-xh-part="column-header" value="value"><span data-xh-part="column-label">取值</span></div>
            </div>
          </div>
          <div data-xh-part="body">${rowsHtml}</div>
        </div>
      </xh-table>
    </div>
  `
  const table = document.querySelector<XhTableElement>('xh-table')!
  table.columns = [{ id: 'name', label: '名称' }, { id: 'value', label: '取值' }]
  table.rows = ROWS
  table.defaultExpandedValue = ['a']
  // 宿主按 ids 重排、把这一行的 parentId 设成 parent，再按新次序把行节点排回表体
  table.addEventListener('row-move', (event) => {
    const details = (event as CustomEvent<TableRowMoveDetails>).detail
    const byId = new Map((table.rows ?? []).map(row => [row.id, row]))
    table.rows = details.ids.map(id => (id === details.id ? { ...byId.get(id)!, parentId: details.parent ?? undefined } : byId.get(id)!))
    const body = document.querySelector<HTMLElement>('[data-xh-part="body"]')!
    body.append(...details.ids.map(id => row(id)))
  })
  await table.updateComplete
  await settle()
}

function row(id: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="table"][data-part="row"][data-value="${id}"]`)!
}

function cell(rowId: string, column: string): HTMLElement {
  return row(rowId).querySelector<HTMLElement>(`[data-scope="table"][data-part="cell"][data-value="${column}"]`)!
}

async function enterBody(): Promise<void> {
  document.querySelector<HTMLElement>('[data-test-start]')!.focus()
  await userEvent.tab()
  await settle()
}

describe('xh-table 单元格级导航', () => {
  it('tab 进表体落在行上，右键进首格；格子上画一圈内收的聚焦环，表体只留一个 Tab 位', async () => {
    await mount()
    await enterBody()
    expect(document.activeElement).toBe(row('a'))
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    const first = cell('a', 'name')
    expect(document.activeElement).toBe(first)
    expect(first.matches(':focus-visible')).toBe(true)
    const style = getComputedStyle(first)
    expect(style.outlineStyle).toBe('solid')
    expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.outlineOffset)).toBeLessThan(0)
    const body = document.querySelector('[data-scope="table"][data-part="body"]')!
    expect([...body.querySelectorAll('[tabindex="0"]')]).toEqual([first])
  })

  it('enter 进格内输入框：打字、左右键与上下键都归输入框，Esc 回到格子', async () => {
    await mount()
    await enterBody()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{ArrowRight}')
    await settle()
    expect(document.activeElement).toBe(cell('b', 'value'))
    await userEvent.keyboard('{Enter}')
    const input = cell('b', 'value').querySelector('input')!
    expect(document.activeElement).toBe(input)
    await userEvent.keyboard('ab{ArrowLeft}')
    expect(input.value).toBe('ab')
    expect(input.selectionStart).toBe(1)
    await userEvent.keyboard('{ArrowDown}{ArrowUp}')
    expect(document.activeElement).toBe(input)
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.activeElement).toBe(cell('b', 'value'))
  })

  it('格子上按 Alt + 下键换位：宿主写回行序后焦点仍在那一格', async () => {
    await mount()
    await enterBody()
    await userEvent.keyboard('{ArrowDown}{ArrowRight}')
    await settle()
    expect(document.activeElement).toBe(cell('b', 'name'))
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await settle()
    expect([...document.querySelectorAll('[data-scope="table"][data-part="body"] [data-part="row"]')].map(el => el.getAttribute('data-value'))).toEqual(['a', 'c', 'b', 'd'])
    expect(document.activeElement).toBe(cell('b', 'name'))
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect(document.activeElement).toBe(cell('d', 'name'))
  })

  it('行级导航（缺省）下 Alt + 下键换位：宿主挪动了持有焦点的行节点，焦点仍回到那一行，能接着再挪', async () => {
    await mount('row')
    await enterBody()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect(document.activeElement).toBe(row('b'))
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await settle()
    expect(document.activeElement).toBe(row('b'))
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
    await settle()
    expect([...document.querySelectorAll('[data-scope="table"][data-part="body"] [data-part="row"]')].map(el => el.getAttribute('data-value'))).toEqual(['a', 'b', 'c', 'd'])
    expect(document.activeElement).toBe(row('b'))
  })
})
