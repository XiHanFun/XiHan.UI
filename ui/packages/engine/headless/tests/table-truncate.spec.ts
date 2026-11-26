// @vitest-environment jsdom
import type { TableColumnDef, TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectTable, tableMachine } from '../src/table'

type Props = TableSchema['props']
type Dict = Record<string, unknown>

// 列的 truncate：格子写 data-truncate；指针移进来时量一次，真被裁掉了才把全文写进 title，移出即撤。
function mount(initial: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>(initial)
  const service = createService(tableMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectTable(service, normalizeProps),
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
  }
}

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: '姓名' },
  { id: 'note', label: '备注', truncate: true },
]

/** 一个量得出尺寸的格子：jsdom 不排版，宽度由这里钉。 */
function cellEl(text: string, scrollWidth: number, clientWidth: number): HTMLElement {
  const el = document.createElement('div')
  el.textContent = text
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth })
  Object.defineProperty(el, 'clientWidth', { value: clientWidth })
  return el
}

function enter(props: Dict, el: HTMLElement, pointerType = 'mouse'): void {
  (props.onPointerEnter as (event: Partial<PointerEvent>) => void)({ currentTarget: el, pointerType })
}

function leave(props: Dict): void {
  (props.onPointerLeave as () => void)()
}

describe('列的 truncate', () => {
  it('只有开了 truncate 的列的格子写 data-truncate，表头与没开的列不写', () => {
    const api = mount({ columns: COLUMNS, rows: [{ id: 'a' }] }).api()
    expect((api.getCellProps({ value: 'note', row: 'a' }) as Dict)['data-truncate']).toBe('')
    expect((api.getCellProps({ value: 'name', row: 'a' }) as Dict)['data-truncate']).toBeUndefined()
    expect((api.getCellProps({ value: 'name', row: 'a' }) as Dict).onPointerEnter).toBeUndefined()
    expect((api.getColumnHeaderProps({ value: 'note' }) as Dict)['data-truncate']).toBeUndefined()
  })

  it('指针移进被裁掉的格子：title 是压过空白的全文，只写给这一格；移出即撤', () => {
    const h = mount({ columns: COLUMNS, rows: [{ id: 'a' }, { id: 'b' }] })
    enter(h.api().getCellProps({ value: 'note', row: 'a' }) as Dict, cellEl('  很长的\n  备注  ', 300, 120))
    expect((h.api().getCellProps({ value: 'note', row: 'a' }) as Dict).title).toBe('很长的 备注')
    expect((h.api().getCellProps({ value: 'note', row: 'b' }) as Dict).title).toBeUndefined()
    leave(h.api().getCellProps({ value: 'note', row: 'a' }) as Dict)
    expect((h.api().getCellProps({ value: 'note', row: 'a' }) as Dict).title).toBeUndefined()
  })

  it('放得下的、只差取整那 1px 的、触屏按下的都不出提示', () => {
    const h = mount({ columns: COLUMNS, rows: [{ id: 'a' }] })
    const props = (): Dict => h.api().getCellProps({ value: 'note', row: 'a' }) as Dict
    enter(props(), cellEl('短', 40, 120))
    expect(props().title).toBeUndefined()
    enter(props(), cellEl('刚好', 121, 120))
    expect(props().title).toBeUndefined()
    enter(props(), cellEl('很长的备注', 300, 120), 'touch')
    expect(props().title).toBeUndefined()
  })

  it('表尾格子按第几行表尾认；行换了一批时记下的全文撤掉', () => {
    const h = mount({ columns: COLUMNS, rows: [{ id: 'a' }], footerRows: 1 })
    enter(h.api().getCellProps({ value: 'note', footer: 1 }) as Dict, cellEl('合计说明很长', 300, 80))
    expect((h.api().getCellProps({ value: 'note', footer: 1 }) as Dict).title).toBe('合计说明很长')
    expect((h.api().getCellProps({ value: 'note', row: 'a' }) as Dict).title).toBeUndefined()
    h.setProps({ rows: [{ id: 'b' }] })
    expect((h.api().getCellProps({ value: 'note', footer: 1 }) as Dict).title).toBeUndefined()
  })
})
