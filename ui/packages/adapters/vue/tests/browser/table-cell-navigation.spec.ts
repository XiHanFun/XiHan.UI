// 单元格级导航（navigation="cell"）的真实键盘：Tab 进表体落在行上，右键进格子，格子上画一圈内收的聚焦环；
// Enter 进格内输入框，打字与方向键都归输入框，Esc 回到格子；格子上按 Alt + 下键换位，宿主写回行序后焦点仍在那一格。
// 格内控件平时退出 Tab 序列，Tab 一次就离开表格；进编辑后 Tab / Shift + Tab 不出这一格，退出后控件回到 -1；宿主后插的控件也管到。
// 树形表：a 下挂 b、c，d 是根行；b 的 value 格里放两个输入框。
import type { TableRowDef } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref, shallowRef } from 'vue'
import { XhTableBody, XhTableCell, XhTableColumnHeader, XhTableColumnLabel, XhTableHeader, XhTableRoot, XhTableRow } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let lateWidget: { value: boolean } | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const COLUMNS = [{ id: 'name', label: '名称' }, { id: 'value', label: '取值' }]
const ROWS: TableRowDef[] = [{ id: 'a' }, { id: 'b', parentId: 'a' }, { id: 'c', parentId: 'a' }, { id: 'd' }]
const FLAT: TableRowDef[] = [{ id: 'w' }, { id: 'x' }, { id: 'y' }, { id: 'z' }]

async function settle(): Promise<void> {
  await nextTick()
  for (let i = 0; i < 2; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(initial: TableRowDef[] = ROWS): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '420px'
  document.body.append(host)
  const rows = ref<TableRowDef[]>(initial)
  lateWidget = shallowRef(false)
  const late = lateWidget
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
          h(XhTableCell, { value: 'value' }, () => (row.id === 'b'
            ? [h('input', { 'aria-label': '取值' }), h('input', { 'aria-label': '单位' })]
            : row.id === 'd' && late.value ? h('button', { type: 'button' }, '改') : `${row.id} 取值`)),
        ]))),
      ]),
      h('button', { 'type': 'button', 'data-test-end': '' }, '终点'),
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

  it('平表上格子里连按三次 Alt + 上键：宿主每次写回行序后焦点都回到同一列的格子，锚点跟着在格子上', async () => {
    await mount(FLAT)
    await enterBody()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}{ArrowRight}')
    await settle()
    expect(document.activeElement).toBe(cell('z', 'value'))
    const expected = [['w', 'x', 'z', 'y'], ['w', 'z', 'x', 'y'], ['z', 'w', 'x', 'y']]
    for (const order of expected) {
      await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
      await settle()
      expect([...host!.querySelectorAll('[data-scope="table"][data-part="body"] [data-part="row"]')].map(el => el.getAttribute('data-value'))).toEqual(order)
      expect(document.activeElement).toBe(cell('z', 'value'))
      expect(cell('z', 'value').getAttribute('tabindex')).toBe('0')
      expect(row('z').getAttribute('tabindex')).toBe('-1')
    }
  })

  it('格内控件平时都是 -1：Tab 进表体落在行上，再按一次 Tab 就离开表格', async () => {
    await mount()
    await enterBody()
    expect(document.activeElement).toBe(row('a'))
    const widgets = [...host!.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="body"] input')]
    expect(widgets).toHaveLength(2)
    expect(widgets.map(el => el.getAttribute('tabindex'))).toEqual(['-1', '-1'])
    await userEvent.tab()
    expect(document.activeElement).toBe(host!.querySelector('[data-test-end]'))
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
    expect(document.activeElement).toBe(host!.querySelector('[data-test-end]'))
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
    lateWidget!.value = true
    await settle()
    const late = cell('d', 'value').querySelector<HTMLElement>('button')!
    expect(late.getAttribute('tabindex')).toBe('-1')
    await enterBody()
    await userEvent.tab()
    expect(document.activeElement).toBe(host!.querySelector('[data-test-end]'))
  })
})
