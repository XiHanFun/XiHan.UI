// @vitest-environment jsdom
// 单元格级导航（navigation: 'cell'）：照 WAI-ARIA treegrid，焦点可以落在行上，也可以落在格子上，表体仍只占一个 Tab 位。
// 树形表：a 下挂 b、c（禁用）、d，e 是根行；b 的 value 格里放一个输入框。
import type { TableColumnDef, TableRowDef, TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTable, tableMachine } from '../src/table'

type Props = TableSchema['props']

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: 'Name' },
  { id: 'value', label: 'Value' },
  { id: 'note', label: 'Note' },
]

const ROWS: TableRowDef[] = [
  { id: 'a' },
  { id: 'b', parentId: 'a' },
  { id: 'c', parentId: 'a', disabled: true },
  { id: 'd', parentId: 'a' },
  { id: 'e' },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/** 与 table.spec 同一套翻译规则：on 之后全小写做事件名，其余落属性。 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  let map = listeners.get(el)
  if (!map) {
    map = new Map()
    listeners.set(el, map)
  }
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      const type = key.slice(2).toLowerCase()
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      map.set(type, value as EventListener)
      el.addEventListener(type, value as EventListener)
      continue
    }
    if (key === 'style' || key === 'class')
      continue
    if (value == null || value === false)
      el.removeAttribute(key)
    else
      el.setAttribute(key, value === true ? '' : String(value))
  }
}

interface Harness {
  api: () => ReturnType<typeof connectTable>
  body: HTMLElement
  row: (id: string) => HTMLElement
  cell: (row: string, column: string) => HTMLElement
  input: HTMLInputElement
  outside: HTMLButtonElement
}

function mount(initial: Partial<Props> = {}): Harness {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({ columns: COLUMNS, rows: ROWS, defaultExpandedValue: ['a'], navigation: 'cell', ...initial })
  const service = createService(tableMachine, { props: () => props.get(), runtime })
  runtime.start()

  const outside = document.createElement('button')
  outside.textContent = '起点'
  const root = document.createElement('div')
  const body = document.createElement('div')
  const rows = new Map<string, HTMLElement>()
  const cells = new Map<string, HTMLElement>()
  const input = document.createElement('input')
  input.setAttribute('aria-label', '取值')
  for (const row of ROWS) {
    const rowEl = document.createElement('div')
    for (const column of COLUMNS) {
      const cell = document.createElement('div')
      if (row.id === 'b' && column.id === 'value')
        cell.appendChild(input)
      else
        cell.textContent = `${row.id}-${column.id}`
      cells.set(`${row.id}:${column.id}`, cell)
      rowEl.appendChild(cell)
    }
    rows.set(row.id, rowEl)
    body.appendChild(rowEl)
  }
  root.appendChild(body)
  document.body.append(outside, root)

  const render = (): void => {
    const api = connectTable(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(body, api.getBodyProps() as Record<string, unknown>)
    for (const row of ROWS) {
      spread(rows.get(row.id)!, api.getRowProps({ value: row.id }) as Record<string, unknown>)
      for (const column of COLUMNS)
        spread(cells.get(`${row.id}:${column.id}`)!, api.getCellProps({ value: column.id, row: row.id }) as Record<string, unknown>)
    }
  }
  runtime.subscribe(render)
  render()

  return {
    api: () => connectTable(service, normalizeProps),
    body,
    row: id => rows.get(id)!,
    cell: (row, column) => cells.get(`${row}:${column}`)!,
    input,
    outside,
  }
}

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  ;(document.activeElement ?? document.body).dispatchEvent(event)
  return event
}

/** 焦点在哪：行报行 id，格子报「行:列」，其余报标签名。 */
function where(h: Harness): string {
  const el = document.activeElement as HTMLElement | null
  for (const row of ROWS) {
    if (el === h.row(row.id))
      return row.id
    for (const column of COLUMNS) {
      if (el === h.cell(row.id, column.id))
        return `${row.id}:${column.id}`
    }
  }
  return el?.tagName.toLowerCase() ?? 'none'
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('单元格级导航：Tab 位与锚点', () => {
  it('缺省 navigation 是 row：格子不带 tabindex，也不是焦点落点', () => {
    const h = mount({ navigation: undefined })
    expect(h.api().navigation).toBe('row')
    expect(h.cell('a', 'name').hasAttribute('tabindex')).toBe(false)
    h.row('a').focus()
    press('ArrowRight')
    expect(where(h)).toBe('a')
    expect(h.api().focusedColumn).toBeNull()
  })

  it('表体只留一个 Tab 位：锚点在行上时行是 0、格子都是 -1；落到格子上时那一格是 0、行退出', () => {
    const h = mount()
    h.row('a').focus()
    expect(h.row('a').getAttribute('tabindex')).toBe('0')
    expect(h.cell('a', 'name').getAttribute('tabindex')).toBe('-1')
    press('ArrowRight')
    expect(where(h)).toBe('a:name')
    expect(h.api().focusedColumn).toBe('name')
    expect(h.cell('a', 'name').getAttribute('tabindex')).toBe('0')
    expect(h.row('a').getAttribute('tabindex')).toBe('-1')
    const tabbable = [...h.body.querySelectorAll('[tabindex="0"]')]
    expect(tabbable).toEqual([h.cell('a', 'name')])
  })

  it('焦点离开表体时锚点连同列一起清掉：没有选中行时由表体兜底占 Tab 位，格子都退出', () => {
    const h = mount()
    h.row('a').focus()
    press('ArrowRight')
    h.outside.focus()
    expect(h.api().focusedRow).toBeNull()
    expect(h.api().focusedColumn).toBeNull()
    expect(h.body.getAttribute('tabindex')).toBe('0')
    expect(h.row('a').getAttribute('tabindex')).toBe('-1')
    expect(h.cell('a', 'name').getAttribute('tabindex')).toBe('-1')
  })
})

describe('单元格级导航：焦点在行上', () => {
  it('收起的可展开行上右键照旧展开；已展开时右键进到首格', () => {
    const h = mount({ defaultExpandedValue: [] })
    h.row('a').focus()
    press('ArrowRight')
    expect(h.api().expandedValue).toEqual(['a'])
    expect(where(h)).toBe('a')
    press('ArrowRight')
    expect(where(h)).toBe('a:name')
  })

  it('子行上左键回到父行，根行上不吞键；已展开的行上左键照旧收起', () => {
    const h = mount()
    h.row('b').focus()
    press('ArrowLeft')
    expect(where(h)).toBe('a')
    press('ArrowLeft')
    expect(h.api().expandedValue).toEqual([])
    expect(press('ArrowLeft').defaultPrevented).toBe(false)
  })

  it('ctrl + Home / End 到首行 / 末行', () => {
    const h = mount()
    h.row('b').focus()
    press('End', { ctrlKey: true })
    expect(where(h)).toBe('e')
    press('Home', { ctrlKey: true })
    expect(where(h)).toBe('a')
  })

  it('rtl 下左右键对调：左键进首格', () => {
    const h = mount({ dir: 'rtl' })
    h.row('e').focus()
    press('ArrowLeft')
    expect(where(h)).toBe('e:name')
    press('ArrowLeft')
    expect(where(h)).toBe('e:value')
    press('ArrowRight')
    expect(where(h)).toBe('e:name')
  })
})

describe('单元格级导航：焦点在格子上', () => {
  it('左右键在格子之间走：末格停住仍吞键，首格再按左键回到行', () => {
    const h = mount()
    h.cell('e', 'name').focus()
    press('ArrowRight')
    press('ArrowRight')
    expect(where(h)).toBe('e:note')
    expect(press('ArrowRight').defaultPrevented).toBe(true)
    expect(where(h)).toBe('e:note')
    press('ArrowLeft')
    press('ArrowLeft')
    expect(where(h)).toBe('e:name')
    press('ArrowLeft')
    expect(where(h)).toBe('e')
  })

  it('上下键走同一列，禁用行跳过', () => {
    const h = mount()
    h.cell('b', 'note').focus()
    press('ArrowDown')
    expect(where(h)).toBe('d:note')
    press('ArrowUp')
    expect(where(h)).toBe('b:note')
    press('ArrowUp')
    expect(where(h)).toBe('a:note')
  })

  it('home / End 到本行首末格，Ctrl + Home / End 到本列首末行', () => {
    const h = mount()
    h.cell('d', 'value').focus()
    press('End')
    expect(where(h)).toBe('d:note')
    press('Home')
    expect(where(h)).toBe('d:name')
    press('End', { ctrlKey: true })
    expect(where(h)).toBe('e:name')
    press('Home', { ctrlKey: true })
    expect(where(h)).toBe('a:name')
  })

  it('space 照旧选中这一行', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.cell('d', 'value').focus()
    press(' ')
    expect(h.api().isSelected('d')).toBe(true)
  })

  it('格内没有控件时 Enter 触发行主操作，带上列 id；F2 不做事', () => {
    const onAction = vi.fn()
    const h = mount({ onAction })
    h.cell('d', 'note').focus()
    press('Enter')
    expect(onAction).toHaveBeenCalledWith({ value: 'd', column: 'note' })
    press('F2')
    expect(where(h)).toBe('d:note')
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})

describe('单元格级导航：格内编辑', () => {
  it('enter 把焦点交给格内控件，编辑时方向键归控件，Esc 退回格子', () => {
    const h = mount()
    h.cell('b', 'value').focus()
    press('Enter')
    expect(document.activeElement).toBe(h.input)
    expect(h.api().focusedColumn).toBe('value')
    expect(press('ArrowDown').defaultPrevented).toBe(false)
    expect(press('ArrowLeft').defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(h.input)
    press('Escape')
    expect(where(h)).toBe('b:value')
  })

  it('f2 进入、F2 退出', () => {
    const h = mount()
    h.cell('b', 'value').focus()
    press('F2')
    expect(document.activeElement).toBe(h.input)
    press('F2')
    expect(where(h)).toBe('b:value')
  })

  it('控件自己用掉了 Esc 时不退出编辑', () => {
    const h = mount()
    h.input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape')
        event.preventDefault()
    })
    h.cell('b', 'value').focus()
    press('Enter')
    press('Escape')
    expect(document.activeElement).toBe(h.input)
  })

  it('直接点进格内控件：锚点记成这一格', () => {
    const h = mount()
    h.input.focus()
    expect(h.api().focusedRow).toBe('b')
    expect(h.api().focusedColumn).toBe('value')
    expect(h.cell('b', 'value').getAttribute('tabindex')).toBe('0')
  })
})

describe('单元格级导航：换位照旧可用', () => {
  it('格子上按 Alt + 下键换位，锚点的列留在原来那一列', () => {
    const onRowMove = vi.fn()
    const h = mount({ rowReorderable: true, onRowMove })
    h.cell('b', 'note').focus()
    press('ArrowDown', { altKey: true })
    expect(onRowMove).toHaveBeenCalledTimes(1)
    expect(onRowMove.mock.calls[0]![0]).toMatchObject({ id: 'b' })
    expect(h.api().focusedRow).toBe('b')
    expect(h.api().focusedColumn).toBe('note')
  })

  it('宿主写回时焦点先离开表体、再在换位的这一轮里落回那一格：锚点仍在格子上，连着再换位还是那一格', () => {
    let h: Harness
    // 浏览器里宿主挪走持有焦点的行节点时先派离场事件，之后焦点交回那一格；两件都发生在换位回调这一轮里
    const onRowMove = vi.fn(() => {
      ;(document.activeElement as HTMLElement | null)?.blur()
      h.cell('d', 'note').focus()
    })
    h = mount({ rowReorderable: true, onRowMove })
    h.cell('d', 'note').focus()
    for (let i = 0; i < 2; i++) {
      press('ArrowUp', { altKey: true })
      expect(document.activeElement).toBe(h.cell('d', 'note'))
      expect(h.api().focusedRow).toBe('d')
      expect(h.api().focusedColumn).toBe('note')
      expect(h.cell('d', 'note').getAttribute('tabindex')).toBe('0')
      expect(h.row('d').getAttribute('tabindex')).toBe('-1')
    }
    expect(onRowMove).toHaveBeenCalledTimes(2)
  })
})
