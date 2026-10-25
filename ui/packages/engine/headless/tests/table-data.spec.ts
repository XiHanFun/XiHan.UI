// @vitest-environment jsdom
import type { TableColumnDef, TableDataInput, TableRecord, TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { computeTableDataView, connectTable, tableCellText, tableColumnField, tableColumnValue, tableMachine, tableVisibleDataRowCount } from '../src/table'

type Props = TableSchema['props']
type Dict = Record<string, unknown>

function mount(initial: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>(initial)
  const service = createService(tableMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectTable(service, normalizeProps),
    service,
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
  }
}

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: '姓名', sortable: true },
  { id: 'dept', label: '部门', sortable: true, filterOptions: [{ value: '平台' }, { value: '前端' }] },
  { id: 'age', label: '年龄', sortable: true },
  { id: 'note', label: '备注' },
]

const PEOPLE: TableRecord[] = [
  { id: 'u1', name: '赵一', dept: '平台', age: 30, note: 'a' },
  { id: 'u2', name: '钱二', dept: '前端', age: 25, note: null },
  { id: 'u3', name: '孙三', dept: '平台', age: null, note: 'c' },
  { id: 'u4', name: '李四', dept: '前端', age: 41, note: 'd' },
  { id: 'u5', name: '周五', dept: '测试', age: 25, note: 'e' },
]

function view(over: Partial<TableDataInput>) {
  return computeTableDataView({ data: PEOPLE, columns: COLUMNS, sort: [], filterValue: {}, paginate: false, page: 1, pageSize: 10, ...over })
}

const ids = (records: readonly TableRecord[]): unknown[] => records.map(record => record.id)

describe('数据管线：排序', () => {
  it('数字按大小比，空值无论升降都排最后；比不出高下的保持原来的先后', () => {
    expect(ids(view({ sort: [{ id: 'age', direction: 'asc' }] }).records)).toEqual(['u2', 'u5', 'u1', 'u4', 'u3'])
    expect(ids(view({ sort: [{ id: 'age', direction: 'desc' }] }).records)).toEqual(['u4', 'u1', 'u2', 'u5', 'u3'])
  })

  it('排序链逐环比：第一环比不出高下才看第二环', () => {
    const sorted = view({ sort: [{ id: 'dept', direction: 'asc' }, { id: 'age', direction: 'desc' }] })
    const depts = sorted.records.map(record => record.dept)
    // 同部门的人按年龄倒序
    expect(sorted.records.filter(record => record.dept === '前端').map(record => record.id)).toEqual(['u4', 'u2'])
    expect(new Set(depts).size).toBe(3)
  })

  it('字符串里的数字按数值序：第 10 项排在第 9 项之后', () => {
    const data = [{ id: 'a', name: '项 10' }, { id: 'b', name: '项 9' }, { id: 'c', name: '项 1' }]
    const sorted = computeTableDataView({ data, columns: COLUMNS, sort: [{ id: 'name', direction: 'asc' }], filterValue: {}, paginate: false, page: 1, pageSize: 10 })
    expect(ids(sorted.records)).toEqual(['c', 'b', 'a'])
  })

  it('列给了 compare 就用它，降序把它倒过来；没声明 sortable 的列不参与排序', () => {
    const columns: TableColumnDef[] = [
      { id: 'name', sortable: true, compare: (a, b) => String(a.note ?? '').localeCompare(String(b.note ?? '')) },
      { id: 'note' },
    ]
    const asc = computeTableDataView({ data: PEOPLE, columns, sort: [{ id: 'name', direction: 'asc' }], filterValue: {}, paginate: false, page: 1, pageSize: 10 })
    expect(ids(asc.records)).toEqual(['u2', 'u1', 'u3', 'u4', 'u5'])
    const desc = computeTableDataView({ data: PEOPLE, columns, sort: [{ id: 'name', direction: 'desc' }], filterValue: {}, paginate: false, page: 1, pageSize: 10 })
    expect(ids(desc.records)).toEqual(['u5', 'u4', 'u3', 'u1', 'u2'])
    const ignored = computeTableDataView({ data: PEOPLE, columns, sort: [{ id: 'note', direction: 'desc' }], filterValue: {}, paginate: false, page: 1, pageSize: 10 })
    expect(ids(ignored.records)).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
  })
})

describe('数据管线：筛选', () => {
  it('勾选值按字段值转成字符串比；一项都没勾就是不筛；不认识的列不筛', () => {
    expect(ids(view({ filterValue: { dept: ['前端'] } }).records)).toEqual(['u2', 'u4'])
    expect(ids(view({ filterValue: { dept: [] } }).records)).toHaveLength(5)
    expect(ids(view({ filterValue: { nope: ['x'] } }).records)).toHaveLength(5)
    expect(view({ filterValue: { dept: ['前端', '测试'] } }).count).toBe(3)
  })

  it('字段是数组时有一项在勾选值里就算命中；列给了 filter 就用它', () => {
    const data = [{ id: 'a', tags: ['x', 'y'] }, { id: 'b', tags: ['z'] }]
    const columns: TableColumnDef[] = [{ id: 'tags' }, { id: 'odd', filter: (record, values) => values.includes(String(record.id === 'b')) }]
    expect(ids(computeTableDataView({ data, columns, sort: [], filterValue: { tags: ['y'] }, paginate: false, page: 1, pageSize: 10 }).records)).toEqual(['a'])
    expect(ids(computeTableDataView({ data, columns, sort: [], filterValue: { odd: ['true'] }, paginate: false, page: 1, pageSize: 10 }).records)).toEqual(['b'])
  })
})

describe('数据管线：分页与行 id', () => {
  it('按页切片，页码夹到有效范围；不分页时整份交出', () => {
    const first = view({ paginate: true, pageSize: 2 })
    expect(ids(first.records)).toEqual(['u1', 'u2'])
    expect([first.count, first.page, first.pageCount, first.pageSize]).toEqual([5, 1, 3, 2])
    expect(ids(view({ paginate: true, pageSize: 2, page: 3 }).records)).toEqual(['u5'])
    // 数据变短：停在已经不存在的那一页时夹到最后一页
    expect(view({ paginate: true, pageSize: 2, page: 9 }).page).toBe(3)
    expect(view({ paginate: false, pageSize: 2, page: 3 }).records).toHaveLength(5)
  })

  it('行 id 缺省取 id 字段；rowKey 给字段名或函数；记录里取不到时退回下标', () => {
    const data = [{ key: 'k1' }, { key: 'k2' }]
    const base = { columns: COLUMNS, sort: [], filterValue: {}, paginate: false, page: 1, pageSize: 10 }
    expect(computeTableDataView({ ...base, data }).rows.map(row => row.id)).toEqual(['0', '1'])
    expect(computeTableDataView({ ...base, data, rowKey: 'key' }).rows.map(row => row.id)).toEqual(['k1', 'k2'])
    expect(computeTableDataView({ ...base, data, rowKey: record => `r-${String(record.key)}` }).rows.map(row => row.id)).toEqual(['r-k1', 'r-k2'])
  })

  it('格子文字：列的 format 优先，否则字段值转字符串，空值为空串', () => {
    expect(tableCellText(PEOPLE[0]!, { id: 'age' })).toBe('30')
    expect(tableCellText(PEOPLE[1]!, { id: 'note' })).toBe('')
    expect(tableCellText(PEOPLE[0]!, { id: 'age', format: (value, record) => `${String(value)} 岁（${String(record.name)}）` })).toBe('30 岁（赵一）')
  })
})

describe('数据管线：列的 field', () => {
  it('id 另起名字时按 field 读字段：排序、筛选与格子文字都认它，排序链与筛选值仍按列 id 记', () => {
    const columns: TableColumnDef[] = [
      { id: 'name' },
      { id: 'years', field: 'age', sortable: true },
      { id: 'team', field: 'dept', filterOptions: [{ value: '平台' }] },
    ]
    const base = { data: PEOPLE, columns, filterValue: {}, paginate: false, page: 1, pageSize: 10 }
    expect(ids(computeTableDataView({ ...base, sort: [{ id: 'years', direction: 'asc' }] }).records)).toEqual(['u2', 'u5', 'u1', 'u4', 'u3'])
    expect(ids(computeTableDataView({ ...base, sort: [], filterValue: { team: ['平台'] } }).records)).toEqual(['u1', 'u3'])
    expect(tableCellText(PEOPLE[0]!, { id: 'years', field: 'age' })).toBe('30')
    expect(tableColumnField({ id: 'years', field: 'age' })).toBe('age')
    expect(tableColumnField({ id: 'age' })).toBe('age')
  })

  it('field 为 null 是不读字段的列：值恒为 undefined，文字只靠 format，排序与筛选只靠 compare / filter', () => {
    const columns: TableColumnDef[] = [
      { id: 'card', field: null, sortable: true, format: (value, record) => `${String(value)}·${String(record.name)}` },
      { id: 'plain', field: null, sortable: true },
      { id: 'grown', field: null, sortable: true, compare: (a, b) => Number(a.age ?? 0) - Number(b.age ?? 0), filter: (record, values) => values.includes(String(Number(record.age) > 28)) },
    ]
    const base = { data: PEOPLE, columns, filterValue: {}, paginate: false, page: 1, pageSize: 10 }
    expect(tableColumnField({ id: 'card', field: null })).toBeNull()
    expect(tableColumnValue(PEOPLE[0]!, { id: 'name', field: null })).toBeUndefined()
    expect(tableCellText(PEOPLE[0]!, columns[0]!)).toBe('undefined·赵一')
    expect(tableCellText(PEOPLE[0]!, columns[1]!)).toBe('')
    // 没有 compare 时比不出高下，保持原来的先后
    expect(ids(computeTableDataView({ ...base, sort: [{ id: 'plain', direction: 'desc' }] }).records)).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
    expect(ids(computeTableDataView({ ...base, sort: [{ id: 'grown', direction: 'desc' }] }).records)).toEqual(['u4', 'u1', 'u2', 'u5', 'u3'])
    expect(ids(computeTableDataView({ ...base, sort: [], filterValue: { grown: ['true'] } }).records)).toEqual(['u1', 'u4'])
  })
})

describe('数据驱动模式：机器与 connect', () => {
  it('给了 data：行定义由它推出，records 与表体的数据行一一对应，rows 不再读', () => {
    const h = mount({ columns: COLUMNS, data: PEOPLE, rows: [{ id: 'ignored' }] })
    const api = h.api()
    expect(api.dataDriven).toBe(true)
    expect(api.rows.map(row => row.id)).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
    expect(ids(api.records)).toEqual(['u1', 'u2', 'u3', 'u4', 'u5'])
    expect(api.recordCount).toBe(5)
    expect(api.recordOf('u3')?.name).toBe('孙三')
    expect(api.cellText('u1', 'dept')).toBe('平台')
    expect(api.getRowProps({ value: 'u2' })['aria-rowindex']).toBe(3)
  })

  it('点排序钮：数据按排序链重排，行号跟着新次序走', () => {
    const h = mount({ columns: COLUMNS, data: PEOPLE })
    h.api().toggleSort('age')
    expect(ids(h.api().records)).toEqual(['u2', 'u5', 'u1', 'u4', 'u3'])
    expect(h.api().getRowProps({ value: 'u2' })['aria-rowindex']).toBe(2)
  })

  it('筛选：只留下命中的行，列头报 data-filtered；筛选值一变回到第 1 页', () => {
    const onFilterValueChange = vi.fn()
    const onPageChange = vi.fn()
    const h = mount({ columns: COLUMNS, data: PEOPLE, pagination: true, pageSize: 2, defaultPage: 2, onFilterValueChange, onPageChange })
    expect(h.api().page).toBe(2)
    h.api().setFilter('dept', ['平台'])
    expect(onFilterValueChange).toHaveBeenLastCalledWith({ value: { dept: ['平台'] } })
    expect(onPageChange).toHaveBeenLastCalledWith({ value: 1 })
    const api = h.api()
    expect(api.page).toBe(1)
    expect(ids(api.records)).toEqual(['u1', 'u3'])
    expect(api.recordCount).toBe(2)
    expect((api.getColumnHeaderProps({ value: 'dept' }) as Dict)['data-filtered']).toBe('')
    expect((api.getColumnHeaderProps({ value: 'name' }) as Dict)['data-filtered']).toBeUndefined()
    // 一项都不勾：这一列不留条目，不再筛
    h.api().setFilter('dept', [])
    expect(h.api().filterValue).toEqual({})
    expect(h.api().recordCount).toBe(5)
  })

  it('分页：按页切片，序号跨页连续；翻页受控时只发意图', () => {
    const onPageChange = vi.fn()
    const h = mount({ columns: COLUMNS, data: PEOPLE, pagination: true, pageSize: 2, page: 1, onPageChange })
    expect(h.api().paginated).toBe(true)
    expect(h.api().pageCount).toBe(3)
    h.api().setPage(2)
    expect(onPageChange).toHaveBeenLastCalledWith({ value: 2 })
    // 受控：宿主没写回之前仍是第 1 页
    expect(ids(h.api().records)).toEqual(['u1', 'u2'])
    h.setProps({ page: 2 })
    expect(ids(h.api().records)).toEqual(['u3', 'u4'])
    expect(h.api().rowNumber('u3')).toBe('3')
  })

  it('没开分页时不切片，page / pageSize 照旧只算序号；手写结构时 records 为空、条数取可见数据行', () => {
    const h = mount({ columns: COLUMNS, data: PEOPLE, pageSize: 2 })
    expect(h.api().paginated).toBe(false)
    expect(h.api().records).toHaveLength(5)
    const written = mount({ columns: COLUMNS, rows: [{ id: 'a' }, { id: 'b' }] })
    expect(written.api().dataDriven).toBe(false)
    expect(written.api().records).toEqual([])
    expect(written.api().recordCount).toBe(2)
    expect(written.api().cellText('a', 'name')).toBe('')
  })

  it('输入没换时拿上一份算好的：同一份 data、排序链、筛选值与页码求两次是同一个数组', () => {
    const h = mount({ columns: COLUMNS, data: PEOPLE })
    expect(h.api().records).toBe(h.api().records)
    expect(tableVisibleDataRowCount(h.service)).toBe(5)
  })

  it('没写宽度的数据列与序号列有确定的伸缩基准，列头与各行格子同一个；写了宽度的、选择列与手写结构照旧', () => {
    const style = (props: Dict): Dict | undefined => props.style as Dict | undefined
    const h = mount({ columns: [{ id: 'name', width: 120 }, { id: 'dept' }], data: PEOPLE, prefixColumns: ['index', 'select'], selectionMode: 'multiple' })
    const api = h.api()
    expect(style(api.getColumnHeaderProps({ value: 'dept' }) as Dict)?.inlineSize).toBe('8rem')
    expect(style(api.getCellProps({ value: 'dept', row: 'u1' }) as Dict)?.inlineSize).toBe('8rem')
    expect(style(api.getCellProps({ value: 'name', row: 'u1' }) as Dict)?.inlineSize).toBe('120px')
    expect(style(api.getCellProps({ value: '__index__', row: 'u1' }) as Dict)?.inlineSize).toBe('4rem')
    expect(style(api.getCellProps({ value: '__select__', row: 'u1' }) as Dict)?.inlineSize).toBeUndefined()
    const written = mount({ columns: [{ id: 'dept' }], rows: [{ id: 'a' }] })
    expect(style(written.api().getCellProps({ value: 'dept', row: 'a' }) as Dict)?.inlineSize).toBeUndefined()
  })

  it('全选的基数是当前页的行', () => {
    const onSelectionChange = vi.fn()
    const h = mount({ columns: COLUMNS, data: PEOPLE, pagination: true, pageSize: 2, selectionMode: 'multiple', onSelectionChange })
    h.api().toggleSelectAll()
    expect(onSelectionChange).toHaveBeenLastCalledWith({ value: ['u1', 'u2'] })
  })
})
