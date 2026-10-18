// @vitest-environment jsdom
import type { TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { buildTableHeaderRows, connectTable, resolveTableColumns, tableColumnAncestors, tableLayoutNeeds, tableLeafColumns, tableMachine } from '../src/table'

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

// 两级表头：小组不分组、跨两行；上半年 / 下半年各管两个季度
const GROUPED: NonNullable<Props['columns']> = [
  { id: 'team', label: '小组', width: 128 },
  { id: 'h1', label: '上半年', children: [{ id: 'q1', label: 'Q1', width: 80 }, { id: 'q2', label: 'Q2', width: 80 }] },
  { id: 'h2', label: '下半年', children: [{ id: 'q3', label: 'Q3', width: 80 }, { id: 'q4', label: 'Q4', width: 80 }] },
]

describe('多级表头', () => {
  it('分组列摊成叶子列，列号只算叶子；表头逐层排好', () => {
    const leaves = tableLeafColumns(GROUPED)
    expect(leaves.map(column => column.id)).toEqual(['team', 'q1', 'q2', 'q3', 'q4'])
    const rows = buildTableHeaderRows(resolveTableColumns(leaves, []), tableColumnAncestors(GROUPED))
    expect(rows).toHaveLength(2)
    expect(rows[0]!.map(cell => [cell.id, cell.colIndex, cell.colSpan, cell.rowSpan, cell.leaf])).toEqual([
      ['team', 1, 1, 2, true],
      ['h1', 2, 2, 1, false],
      ['h2', 4, 2, 1, false],
    ])
    expect(rows[1]!.map(cell => [cell.id, cell.covered])).toEqual([
      ['team', true],
      ['q1', false],
      ['q2', false],
      ['q3', false],
      ['q4', false],
    ])
  })

  it('行号空间把两行表头都算进去：数据行从第 3 行起，aria-rowcount 跟着多一', () => {
    const t = mount({ columns: GROUPED, rows: [{ id: 'a' }, { id: 'b' }] })
    const api = t.api()
    expect(api.headerRowCount).toBe(2)
    expect((api.getRootProps() as Dict)['aria-rowcount']).toBe(4)
    expect((api.getRootProps() as Dict)['aria-colcount']).toBe(5)
    expect((api.getHeaderRowProps({ level: 2 }) as Dict)['aria-rowindex']).toBe(2)
    expect((api.getRowProps({ value: 'a' }) as Dict)['aria-rowindex']).toBe(3)
  })

  it('minWidth / maxWidth 同时管布局：列头与数据格都带上下限，写成同一个数就是定宽', () => {
    const t = mount({
      columns: [
        { id: 'name', label: '名称', width: 120, minWidth: 200 },
        { id: 'size', label: '大小', maxWidth: 96 },
        { id: 'fixed', label: '状态', width: 80, minWidth: 80, maxWidth: 80 },
        { id: 'free', label: '备注' },
      ],
      rows: [{ id: 'a' }],
    })
    const api = t.api()
    const style = (props: unknown): Dict => ((props as Dict).style ?? {}) as Dict
    expect(style(api.getColumnHeaderProps({ value: 'name' }))).toMatchObject({ inlineSize: '120px', minInlineSize: '200px' })
    expect(style(api.getCellProps({ row: 'a', value: 'name' }))).toMatchObject({ inlineSize: '120px', minInlineSize: '200px' })
    expect(style(api.getColumnHeaderProps({ value: 'size' }))).toMatchObject({ maxInlineSize: '96px' })
    expect(style(api.getColumnHeaderProps({ value: 'fixed' }))).toMatchObject({ inlineSize: '80px', minInlineSize: '80px', maxInlineSize: '80px' })
    // 没写上下限的列不带这两条，下限交给皮肤
    expect(style(api.getColumnHeaderProps({ value: 'free' })).minInlineSize).toBeUndefined()
    expect(style(api.getColumnHeaderProps({ value: 'free' })).maxInlineSize).toBeUndefined()
  })

  it('分组格的上下限按叶子列相加，有一列没写就不设', () => {
    const api = mount({
      columns: [
        { id: 'h1', label: '上半年', children: [{ id: 'q1', label: 'Q1', width: 80, minWidth: 64 }, { id: 'q2', label: 'Q2', width: 80, minWidth: 72, maxWidth: 120 }] },
      ],
      rows: [{ id: 'a' }],
    }).api()
    const group = (api.getColumnHeaderProps({ value: 'h1' }) as Dict).style as Dict
    expect(group.minInlineSize).toBe('136px')
    expect(group.maxInlineSize).toBeUndefined()
  })

  it('分组格报横跨的列数与起始列号，宽度按叶子列相加；较浅的叶子列报 aria-rowspan，下层给占位', () => {
    const api = mount({ columns: GROUPED, rows: [{ id: 'a' }] }).api()
    const group = api.getColumnHeaderProps({ value: 'h1' }) as Dict
    expect(group).toMatchObject({ 'role': 'columnheader', 'aria-colindex': 2, 'aria-colspan': 2, 'data-group': '' })
    expect((group.style as Dict).inlineSize).toBe('calc(80px + 80px)')
    expect((group.style as Dict).flexGrow).toBe(2)
    const team = api.getColumnHeaderProps({ value: 'team' }) as Dict
    expect(team).toMatchObject({ 'aria-rowspan': 2, 'data-row-span': '' })
    const spacer = api.getColumnHeaderProps({ value: 'team', level: 2 }) as Dict
    expect(spacer).toMatchObject({ 'aria-hidden': true, 'data-covered': '' })
    expect(spacer.role).toBeUndefined()
    expect((api.getColumnHeaderProps({ value: 'q3', level: 2 }) as Dict)['aria-colindex']).toBe(4)
  })

  it('隐藏一列叶子，分组的跨度跟着收窄；整组藏光就不出分组格', () => {
    const t = mount({ columns: GROUPED, rows: [], defaultColumnPreference: { hidden: ['q2'] } })
    expect((t.api().getColumnHeaderProps({ value: 'h1' }) as Dict)['aria-colspan']).toBeUndefined()
    t.api().setColumnHidden('q1', true)
    expect(t.api().headerRows[0]!.map(cell => cell.id)).toEqual(['team', 'h2'])
  })

  it('量到行位后，跨行的列头写上铺满两行的高度与让回去的外边距', () => {
    const t = mount({ columns: GROUPED, rows: [] })
    t.service.context.set('layout', { columnWidths: {}, rowBoxes: { 1: { top: 0, bottom: 40 }, 2: { top: 41, bottom: 80 } } })
    const style = (t.api().getColumnHeaderProps({ value: 'team' }) as Dict).style as Dict
    expect(style['--xh-_table-span-block']).toBe('80px')
    expect(style['--xh-_table-span-overhang']).toBe('40px')
  })
})

describe('单元格合并', () => {
  const COLUMNS: NonNullable<Props['columns']> = [
    { id: 'dept', width: 96 },
    { id: 'name', width: 96 },
    { id: 'q1', width: 64 },
    { id: 'q2', width: 64 },
  ]
  const ROWS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
  // 部门列前两行合并、后两行合并；c 行的两个季度横向合并
  const cellSpan: Props['cellSpan'] = ({ column, rowIndex, row }) => {
    if (column.id === 'dept')
      return rowIndex % 2 === 0 ? { rowSpan: 2 } : null
    if (row.id === 'c' && column.id === 'q1')
      return { colSpan: 2 }
    return null
  }

  it('起点报 aria-rowspan；下面行里被纵向跨过的格子是对读屏隐藏的占位，保住宽度', () => {
    const api = mount({ columns: COLUMNS, rows: ROWS, cellSpan }).api()
    expect(api.getCellProps({ value: 'dept', row: 'a' })).toMatchObject({ 'aria-rowspan': 2, 'data-row-span': '' })
    const covered = api.getCellProps({ value: 'dept', row: 'b' }) as Dict
    expect(covered).toMatchObject({ 'aria-hidden': true, 'data-covered': '' })
    expect(covered.hidden).toBeUndefined()
    expect(covered.role).toBeUndefined()
    expect((covered.style as Dict).inlineSize).toBe('96px')
    expect(api.cellSpanOf('b', 'dept')).toEqual({ rowSpan: 1, colSpan: 1, covered: true })
    expect(api.cellSpanOf('a', 'dept')).toEqual({ rowSpan: 2, colSpan: 1, covered: false })
  })

  it('横向合并：起点报 aria-colspan、宽度按跨过的列相加，同一行被跨过的格子不渲染', () => {
    const api = mount({ columns: COLUMNS, rows: ROWS, cellSpan }).api()
    const origin = api.getCellProps({ value: 'q1', row: 'c' }) as Dict
    expect(origin['aria-colspan']).toBe(2)
    expect((origin.style as Dict).inlineSize).toBe('calc(64px + 64px)')
    expect(api.getCellProps({ value: 'q2', row: 'c' })).toMatchObject({ 'hidden': true, 'aria-hidden': true })
  })

  it('跨度截在表体末尾，也截在展开的详情行前', () => {
    const tail = mount({ columns: COLUMNS, rows: ROWS, cellSpan: () => ({ rowSpan: 9 }) }).api()
    expect((tail.getCellProps({ value: 'dept', row: 'a' }) as Dict)['aria-rowspan']).toBe(4)
    const detail = mount({
      columns: COLUMNS,
      rows: [{ id: 'a', expandable: true }, { id: 'b' }],
      defaultExpandedValue: ['a'],
      cellSpan: ({ column }) => (column.id === 'dept' ? { rowSpan: 2 } : null),
    }).api()
    expect((detail.getCellProps({ value: 'dept', row: 'a' }) as Dict)['aria-rowspan']).toBeUndefined()
    expect(detail.cellSpanOf('b', 'dept').covered).toBe(false)
  })

  it('量到行位后，起点格铺满合并的几行', () => {
    const t = mount({ columns: COLUMNS, rows: ROWS, cellSpan })
    t.service.context.set('layout', { columnWidths: {}, rowBoxes: { 2: { top: 40, bottom: 80 }, 3: { top: 81, bottom: 120 } } })
    const style = (t.api().getCellProps({ value: 'dept', row: 'a' }) as Dict).style as Dict
    expect(style['--xh-_table-span-block']).toBe('80px')
    expect(style['--xh-_table-span-overhang']).toBe('40px')
  })
})

describe('表尾单元格合并', () => {
  const COLUMNS: NonNullable<Props['columns']> = [
    { id: 'region', width: 96 },
    { id: 'city', width: 96 },
    { id: 'q1', width: 64 },
    { id: 'q2', width: 64 },
  ]
  const ROWS = [{ id: 'a' }, { id: 'b' }]
  // 两行表尾：标题格从第一列横跨行维度两列；第二行表尾的 q1、q2 纵向不合并，q2 列第一行起纵跨两行
  const footerCellSpan: Props['footerCellSpan'] = ({ level, column }) => {
    if (column.id === 'region')
      return level === 1 ? { colSpan: 2, rowSpan: 2 } : null
    if (column.id === 'q2' && level === 1)
      return { rowSpan: 2 }
    return null
  }

  it('起点报 aria-colspan / aria-rowspan、宽度按跨过的列相加；同一行被横向跨过的不渲染，下面一行留占位', () => {
    const api = mount({ columns: COLUMNS, rows: ROWS, footerRows: 2, footerCellSpan }).api()
    const origin = api.getCellProps({ value: 'region', footer: 1 }) as Dict
    expect(origin).toMatchObject({ 'aria-colspan': 2, 'aria-rowspan': 2, 'data-row-span': '' })
    expect((origin.style as Dict).inlineSize).toBe('calc(96px + 96px)')
    expect(api.getCellProps({ value: 'city', footer: 1 })).toMatchObject({ 'hidden': true, 'aria-hidden': true })
    const spacer = api.getCellProps({ value: 'region', footer: 2 }) as Dict
    expect(spacer).toMatchObject({ 'aria-hidden': true, 'data-covered': '' })
    expect(spacer.hidden).toBeUndefined()
    expect((spacer.style as Dict).inlineSize).toBe('calc(96px + 96px)')
    expect(api.getCellProps({ value: 'city', footer: 2 })).toMatchObject({ hidden: true })
    expect((api.getCellProps({ value: 'q1', footer: 2 }) as Dict).role).toBe('gridcell')
    expect(api.getCellProps({ value: 'q2', footer: 1 })).toMatchObject({ 'aria-rowspan': 2 })
  })

  it('纵向截在最后一行表尾，横向截在最后一列；不写 footer 的格子不参与合并', () => {
    const api = mount({ columns: COLUMNS, rows: ROWS, footerRows: 1, footerCellSpan: () => ({ rowSpan: 3, colSpan: 9 }) }).api()
    const origin = api.getCellProps({ value: 'region', footer: 1 }) as Dict
    expect(origin['aria-colspan']).toBe(4)
    expect(origin['aria-rowspan']).toBeUndefined()
    expect((api.getCellProps({ value: 'q2', footer: 1 }) as Dict).hidden).toBe(true)
    expect((api.getCellProps({ value: 'q2' }) as Dict).hidden).toBeUndefined()
  })

  it('表体的合并不受影响；量到表尾行位后，纵跨的起点格铺满两行', () => {
    const t = mount({ columns: COLUMNS, rows: ROWS, footerRows: 2, footerCellSpan })
    expect(t.api().cellSpanOf('a', 'region')).toEqual({ rowSpan: 1, colSpan: 1, covered: false })
    // 表头第 1 行、两行数据第 2–3 行，表尾是第 4、5 行
    t.service.context.set('layout', { columnWidths: {}, rowBoxes: { 4: { top: 100, bottom: 130 }, 5: { top: 131, bottom: 160 } } })
    const style = (t.api().getCellProps({ value: 'q2', footer: 1 }) as Dict).style as Dict
    expect(style['--xh-_table-span-block']).toBe('60px')
    expect(style['--xh-_table-span-overhang']).toBe('30px')
  })
})

describe('冻结列按实测宽度累加偏移', () => {
  const COLUMNS: NonNullable<Props['columns']> = [
    { id: 'a', sticky: true },
    { id: 'b', sticky: true, width: '20%' },
    { id: 'c', sticky: true },
    { id: 'd' },
  ]

  it('没写数字宽度的冻结列才需要实测；有合并或分组才量行位', () => {
    expect(tableLayoutNeeds(COLUMNS, undefined, false)).toEqual({ columns: true, rows: false })
    expect(tableLayoutNeeds([{ id: 'a', sticky: true, width: 80 }], undefined, false)).toEqual({ columns: false, rows: false })
    expect(tableLayoutNeeds([{ id: 'a' }], undefined, true).rows).toBe(true)
    expect(tableLayoutNeeds(GROUPED, undefined, false).rows).toBe(true)
  })

  it('量到之前从第一列起退回贴边；量到之后按实测宽度累加', () => {
    const t = mount({ columns: COLUMNS, rows: [] })
    const inset = (id: string): unknown => ((t.api().getColumnHeaderProps({ value: id }) as Dict).style as Dict | undefined)?.['--xh-table-sticky-inset']
    expect(inset('b')).toBeUndefined()
    t.service.context.set('layout', { columnWidths: { a: 120, b: 200, c: 90 }, rowBoxes: {} })
    expect(inset('b')).toBe('120px')
    expect(inset('c')).toBe('320px')
  })
})

describe('纵向合并只渲了一段行时', () => {
  // 六行一组：group 列从第 0 行起纵向合并六行；行号从 2 起（第 1 行是表头）
  const columns: NonNullable<Props['columns']> = [{ id: 'group', width: 100 }, { id: 'name', width: 160 }]
  const rows = Array.from({ length: 6 }, (_, i) => ({ id: `r${i}` }))
  const cellSpan: Props['cellSpan'] = ({ rowIndex, column }) => (column.id === 'group' && rowIndex === 0 ? { rowSpan: 6 } : null)
  const boxes = (indexes: number[]) => Object.fromEntries(indexes.map(index => [index, { top: (index - 2) * 40, bottom: (index - 1) * 40 }]))

  it('起点行在场、末几行不在：高度铺到最后一条在场的行，跨度照旧报全区', () => {
    const t = mount({ columns, rows, cellSpan })
    t.service.context.set('layout', { columnWidths: {}, rowBoxes: boxes([2, 3, 4]) })
    const origin = t.api().getCellProps({ value: 'group', row: 'r0' }) as Dict
    expect(origin['aria-rowspan']).toBe(6)
    expect((origin.style as Dict)['--xh-_table-span-block']).toBe('120px')
  })

  it('起点行不在场：区里第一条在场的行接替起点，跨度是剩下的行数，cellSpanOf 不再报它被合并', () => {
    const t = mount({ columns, rows, cellSpan })
    t.service.context.set('layout', { columnWidths: {}, rowBoxes: boxes([4, 5, 6]) })
    const api = t.api()
    const relay = api.getCellProps({ value: 'group', row: 'r2' }) as Dict
    expect(relay['aria-hidden']).toBeUndefined()
    expect(relay['aria-rowspan']).toBe(4)
    expect(relay.role).toBe('gridcell')
    expect((relay.style as Dict)['--xh-_table-span-block']).toBe('120px')
    expect(api.cellSpanOf('r2', 'group')).toEqual({ rowSpan: 4, colSpan: 1, covered: false })
    expect((api.getCellProps({ value: 'group', row: 'r3' }) as Dict)['aria-hidden']).toBe(true)
  })

  it('还没量过行位或全部在场时不接替', () => {
    const t = mount({ columns, rows, cellSpan })
    expect(t.api().cellSpanOf('r2', 'group').covered).toBe(true)
    t.service.context.set('layout', { columnWidths: {}, rowBoxes: boxes([2, 3, 4, 5, 6, 7]) })
    expect(t.api().cellSpanOf('r2', 'group').covered).toBe(true)
    expect(t.api().cellSpanOf('r0', 'group').rowSpan).toBe(6)
  })
})
