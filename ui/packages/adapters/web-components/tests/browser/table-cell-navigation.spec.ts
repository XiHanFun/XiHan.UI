// 单元格级导航（navigation="cell"）的真实键盘：Tab 进表体落在行上，右键进格子，格子上画一圈内收的聚焦环；
// Enter 进格内输入框，打字与方向键都归输入框，Esc 回到格子；格子上按 Alt + 下键换位，宿主写回行序后焦点仍在那一格。
// 宿主照文档示例的写法把行节点按新次序 append 回表体：挪的正是持有焦点的那一行，行级导航（缺省）下焦点同样要回到那一行。
// 格内控件平时退出 Tab 序列，Tab 一次就离开表格；进编辑后 Tab / Shift + Tab 不出这一格，退出后控件回到 -1；宿主后插的控件也管到。
// 树形表：a 下挂 b、c，d 是根行；b 的 value 格里放两个输入框。
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
const FLAT: TableRowDef[] = [{ id: 'w' }, { id: 'x' }, { id: 'y' }, { id: 'z' }]

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(navigation: 'row' | 'cell' = 'cell', initial: TableRowDef[] = ROWS, insert = false): Promise<void> {
  const rowsHtml = initial.map(row => `
    <div data-xh-part="row" value="${row.id}">
      <div data-xh-part="cell" value="name">${row.id} 名称</div>
      <div data-xh-part="cell" value="value">${row.id === 'b' ? '<input aria-label="取值"><input aria-label="单位">' : `${row.id} 取值`}</div>
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
      <button type="button" data-test-end>终点</button>
    </div>
  `
  const table = document.querySelector<XhTableElement>('xh-table')!
  table.columns = [{ id: 'name', label: '名称' }, { id: 'value', label: '取值' }]
  table.rows = initial
  table.defaultExpandedValue = ['a']
  // 宿主按 ids 重排、把这一行的 parentId 设成 parent，再按新次序把行节点排回表体
  table.addEventListener('row-move', (event) => {
    const details = (event as CustomEvent<TableRowMoveDetails>).detail
    const byId = new Map((table.rows ?? []).map(row => [row.id, row]))
    table.rows = details.ids.map(id => (id === details.id ? { ...byId.get(id)!, parentId: details.parent ?? undefined } : byId.get(id)!))
    const body = document.querySelector<HTMLElement>('[data-xh-part="body"]')!
    if (insert) {
      details.ids.forEach((id, index) => {
        const node = row(id)
        if (body.children[index] !== node)
          body.insertBefore(node, body.children[index] ?? null)
      })
    }
    else {
      body.append(...details.ids.map(id => row(id)))
    }
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

  it('平表上格子里连按三次 Alt + 上键：宿主每次写回行序后焦点都回到同一列的格子，锚点跟着在格子上', async () => {
    await mount('cell', FLAT, true)
    await enterBody()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}{ArrowRight}')
    await settle()
    expect(document.activeElement).toBe(cell('z', 'value'))
    const expected = [['w', 'x', 'z', 'y'], ['w', 'z', 'x', 'y'], ['z', 'w', 'x', 'y']]
    for (const order of expected) {
      await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
      await settle()
      expect([...document.querySelectorAll('[data-scope="table"][data-part="body"] [data-part="row"]')].map(el => el.getAttribute('data-value'))).toEqual(order)
      expect(document.activeElement).toBe(cell('z', 'value'))
      expect(cell('z', 'value').getAttribute('tabindex')).toBe('0')
      expect(row('z').getAttribute('tabindex')).toBe('-1')
    }
  })

  it('格内控件平时都是 -1：Tab 进表体落在行上，再按一次 Tab 就离开表格', async () => {
    await mount()
    await enterBody()
    expect(document.activeElement).toBe(row('a'))
    const widgets = [...document.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="body"] input')]
    expect(widgets).toHaveLength(2)
    expect(widgets.map(el => el.getAttribute('tabindex'))).toEqual(['-1', '-1'])
    await userEvent.tab()
    expect(document.activeElement).toBe(document.querySelector('[data-test-end]'))
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(row('a'))
  })

  it('进编辑后 Tab / Shift + Tab 只在这一格的控件之间走；Esc 退回格子，控件回到 -1，再按 Tab 离开表格', async () => {
    await mount()
    await enterBody()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{ArrowRight}')
    await settle()
    const [first, second] = [...cell('b', 'value').querySelectorAll('input')]
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(first)
    expect([first!.getAttribute('tabindex'), second!.getAttribute('tabindex')]).toEqual([null, null])
    await userEvent.tab()
    expect(document.activeElement).toBe(second)
    await userEvent.tab()
    expect(document.activeElement).toBe(first)
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(second)
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.activeElement).toBe(cell('b', 'value'))
    expect([first!.getAttribute('tabindex'), second!.getAttribute('tabindex')]).toEqual(['-1', '-1'])
    await userEvent.tab()
    expect(document.activeElement).toBe(document.querySelector('[data-test-end]'))
  })

  it('指针点进格内控件：只放开那一格，Tab 照样不出这一格', async () => {
    await mount()
    const [first, second] = [...cell('b', 'value').querySelectorAll('input')]
    await userEvent.click(second!)
    await settle()
    expect(document.activeElement).toBe(second)
    expect([first!.getAttribute('tabindex'), second!.getAttribute('tabindex')]).toEqual([null, null])
    await userEvent.tab()
    expect(document.activeElement).toBe(first)
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.activeElement).toBe(cell('b', 'value'))
    expect(second!.getAttribute('tabindex')).toBe('-1')
  })

  it('宿主后来往格子里插进的控件也退出 Tab 序列', async () => {
    await mount()
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = '改'
    cell('d', 'value').replaceChildren(button)
    await settle()
    const late = cell('d', 'value').querySelector<HTMLElement>('button')!
    expect(late.getAttribute('tabindex')).toBe('-1')
    await enterBody()
    await userEvent.tab()
    expect(document.activeElement).toBe(document.querySelector('[data-test-end]'))
  })
})
