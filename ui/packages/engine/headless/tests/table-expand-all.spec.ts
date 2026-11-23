// @vitest-environment jsdom
// 表格的默认全部展开与全部展开 / 收起：可展开的行是「有子行的」与「声明了 expandable 的」（详情行）两种。
import type { TableRowDef, TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTable, expandableTableRows, tableMachine } from '../src/table'

type Props = TableSchema['props']

const runtimes: { stop: () => void }[] = []

function mount(initial: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>(initial)
  const service = createService(tableMachine, { props: () => props.get(), runtime })
  runtime.start()
  runtimes.push(runtime)
  return {
    api: () => connectTable(service, normalizeProps),
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
  }
}

function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  for (const runtime of runtimes.splice(0))
    runtime.stop()
})

const COLUMNS = [{ id: 'name' }]

/** 目录 → 菜单 → 按钮三层；note 是带详情的行，log 既没有子行也不带详情。 */
const ROWS: TableRowDef[] = [
  { id: 'system' },
  { id: 'user', parentId: 'system' },
  { id: 'user:add', parentId: 'user' },
  { id: 'role', parentId: 'system' },
  { id: 'note', expandable: true },
  { id: 'log' },
]

function rowIds(h: ReturnType<typeof mount>): string[] {
  return h.api().visibleRows.filter(row => row.kind === 'data').map(row => row.id)
}

describe('expandableTableRows 全部展开要展开哪些行', () => {
  it('有子行的逐层都算，声明了 expandable 的详情行也算；别的不算', () => {
    expect(expandableTableRows(ROWS)).toEqual(['system', 'user', 'note'])
  })

  it('父行不存在的按根行处理，不凭空多出一个可展开的行；id 重复只认先出现的', () => {
    expect(expandableTableRows([{ id: 'a', parentId: 'ghost' }, { id: 'b' }, { id: 'c', parentId: 'b' }, { id: 'b', expandable: true }])).toEqual(['b'])
  })
})

describe('table 的 defaultExpandAll', () => {
  it('挂上即逐层展开，不发变更通知', () => {
    const onExpandedValueChange = vi.fn()
    const h = mount({ columns: COLUMNS, rows: ROWS, defaultExpandAll: true, onExpandedValueChange })
    expect(h.api().expandedValue).toEqual(['system', 'user', 'note'])
    expect(rowIds(h)).toEqual(['system', 'user', 'user:add', 'role', 'note', 'log'])
    expect(onExpandedValueChange).not.toHaveBeenCalled()
  })

  it('defaultExpandedValue 优先；受控时无效', () => {
    expect(mount({ columns: COLUMNS, rows: ROWS, defaultExpandAll: true, defaultExpandedValue: ['note'] }).api().expandedValue).toEqual(['note'])
    expect(mount({ columns: COLUMNS, rows: ROWS, defaultExpandAll: true, expandedValue: [] }).api().expandedValue).toEqual([])
  })

  it('数据晚到：挂载时 rows 还是空的，第一份非空的到了才展开，只此一次', async () => {
    const onExpandedValueChange = vi.fn()
    const h = mount({ columns: COLUMNS, rows: [], defaultExpandAll: true, onExpandedValueChange })
    expect(h.api().expandedValue).toEqual([])

    h.setProps({ rows: ROWS })
    await tick()
    expect(h.api().expandedValue).toEqual(['system', 'user', 'note'])
    expect(onExpandedValueChange).toHaveBeenCalledTimes(1)

    h.api().collapseAll()
    h.setProps({ rows: [{ id: 'next' }, { id: 'next:1', parentId: 'next' }] })
    await tick()
    expect(h.api().expandedValue).toEqual([])
  })
})

describe('table 的 expandAll / collapseAll', () => {
  it('expandAll 并进现有的展开集合，collapseAll 全部收起', () => {
    const onExpandedValueChange = vi.fn()
    const h = mount({ columns: COLUMNS, rows: ROWS, defaultExpandedValue: ['note'], onExpandedValueChange })
    h.api().expandAll()
    expect(h.api().expandedValue).toEqual(['note', 'system', 'user'])
    h.api().expandAll()
    expect(onExpandedValueChange).toHaveBeenCalledTimes(1)

    h.api().collapseAll()
    expect(h.api().expandedValue).toEqual([])
    expect(rowIds(h)).toEqual(['system', 'note', 'log'])
  })

  it('受控：只发意图，宿主写回才生效', () => {
    const onExpandedValueChange = vi.fn()
    const h = mount({ columns: COLUMNS, rows: ROWS, expandedValue: [], onExpandedValueChange })
    h.api().expandAll()
    expect(h.api().expandedValue).toEqual([])
    expect(onExpandedValueChange).toHaveBeenCalledWith({ value: ['system', 'user', 'note'] })
  })
})
