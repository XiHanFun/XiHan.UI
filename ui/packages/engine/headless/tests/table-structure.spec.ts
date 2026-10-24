// @vitest-environment jsdom
import type { StructureChild, StructureInstanceNode, StructureNode } from '../src/shared/structure'
import type { TableColumnDef, TableRecord, TableSchema } from '../src/table'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectTable, tableMachine, tablePaginationStructure, tableStructure } from '../src/table'

type Props = TableSchema['props']

// 结构按 api 铺：这里核铺出来的部件、次序、key、身份属性与文字，以及数据驱动模式下的筛选钮与分页。
function api(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(tableMachine, { props: () => props, runtime })
  runtime.start()
  return connectTable(service, normalizeProps)
}

function parts(nodes: readonly StructureChild[]): string[] {
  return nodes.map(node => ('part' in node ? node.part : 'instance' in node ? `<${node.instance}>` : 'other'))
}

const COLUMNS: TableColumnDef[] = [
  { id: 'name', label: '姓名', sortable: true },
  { id: 'dept', label: '部门', filterOptions: [{ value: 'fe', label: '前端' }, { value: 'pf' }] },
  { id: 'age', label: '年龄', format: value => `${String(value)} 岁` },
]

const DATA: TableRecord[] = [
  { id: 'u1', name: '赵一', dept: 'pf', age: 30 },
  { id: 'u2', name: '钱二', dept: 'fe', age: 25 },
]

describe('tableStructure', () => {
  it('root 里依次是表头、表体、在途占位与空态；文字取 translations', () => {
    const nodes = tableStructure(api({ columns: COLUMNS, data: DATA }))
    expect(parts(nodes)).toEqual(['header', 'body', 'loading', 'empty'])
    expect((nodes[2] as StructureNode).text).toBe('Loading')
    expect((nodes[3] as StructureNode).text).toBe('No data')
  })

  it('表头一层一行；列头里是列名、排序钮与筛选菜单，身份写在 value 上，单层表头不写 level', () => {
    const header = tableStructure(api({ columns: COLUMNS, data: DATA }))[0] as StructureNode
    const [row] = header.children as StructureNode[]
    expect(row).toMatchObject({ part: 'row', key: 'header-row:1' })
    expect(row!.attrs).toBeUndefined()
    const [name, dept, age] = row!.children as StructureNode[]
    expect(name).toMatchObject({ part: 'column-header', attrs: { value: 'name' } })
    expect(parts(name!.children!)).toEqual(['column-label', 'sort-trigger'])
    expect((name!.children![0] as StructureNode).text).toBe('姓名')
    expect(parts(dept!.children!)).toEqual(['column-label', '<menu>'])
    expect(parts(age!.children!)).toEqual(['column-label'])
  })

  it('筛选菜单：勾选项按 filterOptions 铺，勾选值取 filterValue，改动写回表格；名字取 translations.filter', () => {
    const onFilterValueChange = vi.fn()
    const model = api({ columns: COLUMNS, data: DATA, defaultFilterValue: { dept: ['fe'] }, onFilterValueChange })
    const header = tableStructure(model)[0] as StructureNode
    const dept = ((header.children as StructureNode[])[0]!.children as StructureNode[])[1]!
    const menu = dept.children![1] as StructureInstanceNode
    expect(menu.instance).toBe('menu')
    expect(menu.props).toMatchObject({
      collection: [{ value: 'fe', label: '前端', kind: 'checkbox' }, { value: 'pf', label: 'pf', kind: 'checkbox' }],
      checkboxValue: ['fe'],
      translations: { trigger: 'Filter 部门' },
    })
    ;(menu.props!.onCheckboxValueChange as (details: { value: string[] }) => void)({ value: ['fe', 'pf'] })
    expect(onFilterValueChange).toHaveBeenLastCalledWith({ value: { dept: ['fe', 'pf'] } })
  })

  it('手写结构（没给 data）时列头不铺筛选菜单：筛选只在数据驱动模式下由表格自己算', () => {
    const header = tableStructure(api({ columns: COLUMNS, rows: [{ id: 'a' }] }))[0] as StructureNode
    const dept = ((header.children as StructureNode[])[0]!.children as StructureNode[])[1]!
    expect(parts(dept.children!)).toEqual(['column-label'])
  })

  it('表体逐行逐格：行写 value，格子写列 id，文字取 format 或字段值', () => {
    const body = tableStructure(api({ columns: COLUMNS, data: DATA }))[1] as StructureNode
    const rows = body.children as StructureNode[]
    expect(rows.map(row => [row.key, row.attrs?.value])).toEqual([['row:u1', 'u1'], ['row:u2', 'u2']])
    expect((rows[0]!.children as StructureNode[]).map(cell => [cell.attrs?.value, cell.text])).toEqual([['name', '赵一'], ['dept', 'pf'], ['age', '30 岁']])
  })

  it('作者给了 cell 插槽的格子交给作者，参数里带记录、字段值与本来要显示的文字；empty 插槽接管空态', () => {
    const nodes = tableStructure(api({ columns: COLUMNS, data: DATA }), { slotted: (name, key) => name === 'empty' || (name === 'cell' && key === 'u2:age') })
    const cell = (((nodes[1] as StructureNode).children as StructureNode[])[1]!.children as StructureNode[])[2]!
    expect(cell).toMatchObject({ part: 'cell', slot: { name: 'cell', key: 'u2:age' } })
    expect(cell.text).toBeUndefined()
    expect(cell.data).toMatchObject({ row: 'u2', value: 25, text: '25 岁', record: DATA[1] })
    expect(nodes[3]).toMatchObject({ part: 'empty', slot: { name: 'empty' } })
  })

  it('前缀列：多选的列头是全选把手、格子是行选把手，序号列的格子是序号', () => {
    const model = api({ columns: COLUMNS, data: DATA, prefixColumns: ['index', 'select'], selectionMode: 'multiple' })
    const [header, body] = tableStructure(model) as StructureNode[]
    const heads = (header!.children as StructureNode[])[0]!.children as StructureNode[]
    expect(parts(heads[0]!.children!)).toEqual(['column-label'])
    expect((heads[0]!.children![0] as StructureNode).text).toBe('#')
    expect(parts(heads[1]!.children!)).toEqual(['select-all-trigger'])
    const cells = (body!.children as StructureNode[])[1]!.children as StructureNode[]
    expect(cells[0]!.text).toBe('2')
    expect(parts(cells[1]!.children!)).toEqual(['row-select-trigger'])
  })

  it('多级表头：每层一行写 level，列头也写 level；被纵向跨过的那一层是不铺内容的占位', () => {
    const columns: TableColumnDef[] = [{ id: 'name', label: '姓名' }, { id: 'score', label: '成绩', children: [{ id: 'math', label: '数学' }, { id: 'art', label: '美术' }] }]
    const header = tableStructure(api({ columns, data: [] }))[0] as StructureNode
    const [first, second] = header.children as StructureNode[]
    expect([first!.attrs, second!.attrs]).toEqual([{ level: '1' }, { level: '2' }])
    expect((first!.children as StructureNode[]).map(cell => [cell.attrs?.value, cell.attrs?.level, parts(cell.children ?? [])])).toEqual([
      ['name', '1', ['column-label']],
      ['score', '1', ['column-label']],
    ])
    expect((second!.children as StructureNode[]).map(cell => [cell.attrs?.value, cell.children])).toEqual([
      ['name', undefined],
      ['math', expect.any(Array)],
      ['art', expect.any(Array)],
    ])
  })

  it('开了虚拟化：表体里是 Virtualizer 的视口与窗口里那几行，外壳写下标；越界的下标不铺', () => {
    const body = tableStructure(api({ columns: COLUMNS, data: DATA }), { virtualItems: [{ index: 1, key: 1 }, { index: 5, key: 5 }] })[1] as StructureNode
    const [viewport] = body.children as StructureNode[]
    expect(viewport).toMatchObject({ component: 'virtualizer', part: 'virtual-viewport' })
    const [content] = viewport!.children as StructureNode[]
    const shells = content!.children as StructureNode[]
    expect(shells.map(shell => [shell.part, shell.attrs?.value])).toEqual([['virtual-item', '1']])
    expect((shells[0]!.children as StructureNode[])[0]).toMatchObject({ part: 'row', attrs: { value: 'u2' } })
  })
})

describe('tablePaginationStructure', () => {
  it('开了 pagination 才铺一组分页：总条数是筛过的，页码与每页条数跟着表格，翻页写回表格', () => {
    expect(tablePaginationStructure(api({ columns: COLUMNS, data: DATA }))).toEqual([])
    const onPageChange = vi.fn()
    const data = Array.from({ length: 25 }, (_, i) => ({ id: `r${i}`, dept: i % 2 ? 'fe' : 'pf' }))
    const [node] = tablePaginationStructure(api({ columns: COLUMNS, data, pagination: true, defaultFilterValue: { dept: ['fe'] }, onPageChange }))
    expect(node).toMatchObject({ instance: 'pagination', props: { count: 12, page: 1, pageSize: 10 } })
    ;(node!.props!.onPageChange as (details: { page: number, pageSize: number }) => void)({ page: 2, pageSize: 10 })
    expect(onPageChange).toHaveBeenLastCalledWith({ value: 2 })
  })
})
