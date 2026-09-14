// @vitest-environment jsdom
// 列设置区与工具条：把表格早就有的排序、列宽、显隐三样接出来的两个部件。
//
// 列设置区照 columnSettings 渲——它与生效列的差别只有一处：藏起来的列也在其中，
// 而设置区正是把它们放回来的地方。
import type { TableColumnDef, TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectTable, tableMachine } from '../src/table'

type Props = TableSchema['props']
type Dict = Record<string, unknown>

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: '名称', sortable: true, resizable: true },
  { id: 'owner', label: '负责人', reorderable: true },
  { id: 'status', label: '状态', width: 120, sticky: 'end' },
]

function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = { columns: COLUMNS, rows: [{ id: 'a' }], ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(tableMachine, { props: () => props, runtime })
  runtime.start()
  return {
    service,
    api: () => connectTable(service, normalizeProps),
    pref: () => service.context.get('columnPreference'),
  }
}

type Harness = ReturnType<typeof mount>

function click(h: Harness, id: string): void {
  const props = h.api().getColumnVisibilityTriggerProps({ value: id }) as Dict
  ;(props.onClick as (e: MouseEvent) => void)({} as MouseEvent)
}

function press(h: Harness, id: string, key: string, repeat = false): { prevented: boolean } {
  let prevented = false
  const props = h.api().getColumnVisibilityTriggerProps({ value: id }) as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)(
    { key, repeat, preventDefault: () => { prevented = true } } as KeyboardEvent,
  )
  return { prevented }
}

describe('列设置区那一份列', () => {
  it('藏起来的列也在其中：生效列滤掉了它，设置区要把它放回来', () => {
    const h = mount({ defaultColumnPreference: { hidden: ['owner'] } })
    expect(h.api().columns.map(c => c.id)).toEqual(['name', 'status'])
    expect(h.api().columnSettings.map(c => c.id)).toEqual(['name', 'owner', 'status'])
    expect(h.api().columnSettings[1]!.hidden).toBe(true)
  })

  it('跟着列偏好排序，位次即设置区里的第几行', () => {
    const h = mount({ defaultColumnPreference: { order: ['status'] } })
    expect(h.api().columnSettings.map(c => c.id)).toEqual(['status', 'name', 'owner'])
    expect(h.api().columnSettings.map(c => c.index)).toEqual([0, 1, 2])
  })

  it('前缀列不在其中：那些是结构性的，不归用户调', () => {
    const h = mount({ prefixColumns: ['index', 'select'] })
    expect(h.api().columns).toHaveLength(5)
    expect(h.api().columnSettings.map(c => c.id)).toEqual(['name', 'owner', 'status'])
  })

  it('每条自带宽、冻结与三样能力声明，够渲一整行设置项', () => {
    const h = mount()
    const [name, owner, status] = h.api().columnSettings
    expect(name).toMatchObject({ sortable: true, resizable: true, reorderable: false })
    expect(owner!.reorderable).toBe(true)
    expect(status).toMatchObject({ width: 120, sticky: 'end' })
  })

  it('偏好里的宽与冻结盖过列定义', () => {
    const h = mount({ defaultColumnPreference: { widths: { status: 240 }, sticky: { status: false } } })
    expect(h.api().columnSettings[2]).toMatchObject({ width: 240, sticky: false })
  })

  it('排序方向与优先级跟着排序链走', () => {
    const h = mount({ defaultSort: [{ id: 'name', direction: 'desc' }] })
    expect(h.api().columnSettings[0]).toMatchObject({ sortDirection: 'desc', sortPriority: 1 })
    expect(h.api().columnSettings[1]).toMatchObject({ sortDirection: null, sortPriority: 0 })
  })
})

describe('显隐把手', () => {
  it('勾着即这一列显示着', () => {
    const h = mount({ defaultColumnPreference: { hidden: ['owner'] } })
    const shown = h.api().getColumnVisibilityTriggerProps({ value: 'name' }) as Dict
    const hidden = h.api().getColumnVisibilityTriggerProps({ value: 'owner' }) as Dict
    expect(shown['aria-checked']).toBe('true')
    expect(shown['data-state']).toBe('checked')
    expect(hidden['aria-checked']).toBe('false')
    expect(hidden['data-state']).toBe('unchecked')
  })

  it('名字取列定义里的展示名，没有就用列 id', () => {
    const h = mount({ columns: [{ id: 'name', label: '名称' }, { id: 'bare' }] })
    const named = h.api().getColumnVisibilityTriggerProps({ value: 'name' }) as Dict
    const bare = h.api().getColumnVisibilityTriggerProps({ value: 'bare' }) as Dict
    expect(named['aria-label']).toBe('Show column 名称')
    expect(bare['aria-label']).toBe('Show column bare')
  })

  it('点一下藏起来，再点一下放回去', () => {
    const h = mount()
    click(h, 'owner')
    expect(h.pref().hidden).toEqual(['owner'])
    expect(h.api().columns.map(c => c.id)).toEqual(['name', 'status'])
    click(h, 'owner')
    expect(h.pref().hidden).toEqual([])
  })

  it('确认键与点击同一条路，且拦下默认行为', () => {
    const h = mount()
    expect(press(h, 'owner', 'Enter').prevented).toBe(true)
    expect(h.pref().hidden).toEqual(['owner'])
    press(h, 'owner', ' ')
    expect(h.pref().hidden).toEqual([])
  })

  it('按住不放连发的那几下不算数：切换重复执行会来回翻转', () => {
    const h = mount()
    press(h, 'owner', 'Enter', true)
    expect(h.pref().hidden ?? []).toEqual([])
  })

  it('只剩最后一列显示着时不许再藏——全藏起来之后没有把手能把列放回来', () => {
    const h = mount({ defaultColumnPreference: { hidden: ['owner', 'status'] } })
    const last = h.api().getColumnVisibilityTriggerProps({ value: 'name' }) as Dict
    expect(last['aria-disabled']).toBe('true')
    expect(h.api().columnSettings[0]!.toggleable).toBe(false)
    click(h, 'name')
    expect(h.api().columns.map(c => c.id)).toEqual(['name'])
    // 藏起来的那些照旧放得回来
    expect(h.api().columnSettings[1]!.toggleable).toBe(true)
    click(h, 'owner')
    expect(h.api().columns.map(c => c.id)).toEqual(['name', 'owner'])
  })
})

describe('冻结档的写入口', () => {
  it('setColumnSticky 落进偏好，也落进生效列', () => {
    const h = mount()
    h.api().setColumnSticky('name', 'start')
    expect(h.pref().sticky).toEqual({ name: 'start' })
    expect(h.api().columns[0]!.sticky).toBe('start')
  })

  it('改一列不动另一列', () => {
    const h = mount({ defaultColumnPreference: { sticky: { status: 'end' } } })
    h.api().setColumnSticky('name', true)
    expect(h.pref().sticky).toEqual({ status: 'end', name: true })
  })
})

describe('工具条与列设置区两个容器', () => {
  it('工具条不给 role：要不要 role=toolbar 连同那套方向键归作者', () => {
    const props = mount({ size: 'sm' }).api().getToolbarProps() as Dict
    expect(props.role).toBeUndefined()
    expect(props['aria-label']).toBe('Table toolbar')
    expect(props['data-size']).toBe('sm')
  })

  it('列设置区是一组带名字的控件', () => {
    const props = mount().api().getColumnListProps() as Dict
    expect(props.role).toBe('group')
    expect(props['aria-label']).toBe('Column settings')
  })

  it('三处文案都可覆盖', () => {
    const h = mount({
      translations: {
        toolbar: '表格工具条',
        columnList: '列设置',
        columnVisibility: (label: string) => `显示${label}列`,
      },
    })
    expect((h.api().getToolbarProps() as Dict)['aria-label']).toBe('表格工具条')
    expect((h.api().getColumnListProps() as Dict)['aria-label']).toBe('列设置')
    expect((h.api().getColumnVisibilityTriggerProps({ value: 'name' }) as Dict)['aria-label']).toBe('显示名称列')
  })
})
