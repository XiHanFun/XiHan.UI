// 单元格级导航（navigation="cell"）的真实键盘：Tab 进表体落在行上，右键进格子，格子上画一圈内收的聚焦环；
// Enter 进格内输入框，打字与方向键都归输入框，Esc 回到格子；格子上按 Alt + 下键换位，宿主写回行序后焦点仍在那一格。
// 树形表：a 下挂 b、c，d 是根行；b 的 value 格里放一个输入框。
import type { TableRowDef } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTableBody, XhTableCell, XhTableColumnHeader, XhTableColumnLabel, XhTableHeader, XhTableRoot, XhTableRow } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const COLUMNS = [{ id: 'name', label: '名称' }, { id: 'value', label: '取值' }]
const ROWS: TableRowDef[] = [{ id: 'a' }, { id: 'b', parentId: 'a' }, { id: 'c', parentId: 'a' }, { id: 'd' }]

async function settle(): Promise<void> {
  await nextTick()
  for (let i = 0; i < 2; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '420px'
  document.body.append(host)
  const rows = ref<TableRowDef[]>(ROWS)
  app = createApp({
    render: () => h('div', [
      h('button', { 'type': 'button', 'data-test-start': '' }, '起点'),
      h(XhTableRoot, {
        'columns': COLUMNS,
        'rows': rows.value,
        'defaultExpandedValue': ['a'],
        'navigation': 'cell',
        'rowReorderable': true,
        'aria-label': '选项',
        // 宿主按 ids 重排、把这一行的 parentId 设成 parent
        'onRowMove': (details: { id: string, parent: string | null, ids: string[] }) => {
          const byId = new Map(rows.value.map(row => [row.id, row]))
          rows.value = details.ids.map(id => (id === details.id ? { ...byId.get(id)!, parentId: details.parent ?? undefined } : byId.get(id)!))
        },
      }, () => [
        h(XhTableHeader, null, () => [h(XhTableRow, null, () => COLUMNS.map(column => h(XhTableColumnHeader, { value: column.id }, () => [h(XhTableColumnLabel, null, () => column.label)])))]),
        h(XhTableBody, null, () => rows.value.map(row => h(XhTableRow, { key: row.id, value: row.id }, () => [
          h(XhTableCell, { value: 'name' }, () => `${row.id} 名称`),
          h(XhTableCell, { value: 'value' }, () => (row.id === 'b' ? h('input', { 'aria-label': '取值' }) : `${row.id} 取值`)),
        ]))),
      ]),
    ]),
  })
  app.mount(host)
  await settle()
}

function row(id: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="table"][data-part="row"][data-value="${id}"]`)!
}

function cell(rowId: string, column: string): HTMLElement {
  return row(rowId).querySelector<HTMLElement>(`[data-scope="table"][data-part="cell"][data-value="${column}"]`)!
}

async function enterBody(): Promise<void> {
  host!.querySelector<HTMLElement>('[data-test-start]')!.focus()
  await userEvent.tab()
  await settle()
}

describe('xhTable 单元格级导航（Vue）', () => {
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
    const body = host!.querySelector('[data-scope="table"][data-part="body"]')!
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
    expect([...host!.querySelectorAll('[data-scope="table"][data-part="body"] [data-part="row"]')].map(el => el.getAttribute('data-value'))).toEqual(['a', 'c', 'b', 'd'])
    expect(document.activeElement).toBe(cell('b', 'name'))
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect(document.activeElement).toBe(cell('d', 'name'))
  })
})
