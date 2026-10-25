// 行类型泛型：列定义、记录与格子插槽的参数都按 data 的元素类型收窄。这里只有类型断言，
// 由 typecheck（tsc -p tsconfig.test.json）判对错；写错的那几行靠 @ts-expect-error 证明确实报错。
import type { TableCellSlotData, TableColumnDef, TableField, TableSchema } from '../src/table'
import { describe, expectTypeOf, it } from 'vitest'

interface User {
  id: string
  name: string
  age: number
  tags: string[]
}

describe('表格的行类型泛型', () => {
  it('数据列的 id 只能写行类型的字段，写错即报错；另起 id 时 field 也只能写字段', () => {
    const columns: TableColumnDef<User>[] = [
      { id: 'name', label: '姓名', sortable: true },
      { id: 'years', field: 'age' },
      { id: 'actions', field: null, label: '操作' },
      { id: 'profile', label: '资料', children: [{ id: 'age' }, { id: 'tags' }] },
    ]
    expectTypeOf(columns).toBeArray()
    // @ts-expect-error 字段名拼错
    const typo: TableColumnDef<User> = { id: 'nmae' }
    // @ts-expect-error 分组里的叶子列一样查
    const nested: TableColumnDef<User> = { id: 'g', children: [{ id: 'agee' }] }
    // @ts-expect-error field 也只能写字段
    const alias: TableColumnDef<User> = { id: 'x', field: 'nmae' }
    expectTypeOf([typo, nested, alias]).toBeArray()
  })

  it('format、compare 与 filter 的参数按行类型推断，数据列的 value 是那个字段的类型', () => {
    const columns: TableColumnDef<User>[] = [
      {
        id: 'age',
        format: (value, record) => {
          expectTypeOf(value).toEqualTypeOf<number>()
          return `${value} ${record.name}`
        },
      },
      {
        id: 'tags',
        format: (value) => {
          expectTypeOf(value).toEqualTypeOf<string[]>()
          return value.join()
        },
      },
      { id: 'name', compare: (a, b) => a.age - b.age, filter: (record, values) => values.includes(record.name) },
      // @ts-expect-error age 是数字，没有 toUpperCase
      { id: 'age', format: value => value.toUpperCase() },
    ]
    expectTypeOf(columns).toBeArray()
  })

  it('格子插槽的参数：record 是行类型，按 field 判出字段后 value 跟着收窄', () => {
    const read = (cell: TableCellSlotData<User>): string => {
      expectTypeOf(cell.record).toEqualTypeOf<User | undefined>()
      if (cell.field === 'age')
        expectTypeOf(cell.value).toEqualTypeOf<number | undefined>()
      if (cell.field === null)
        expectTypeOf(cell.value).toEqualTypeOf<undefined>()
      return cell.text
    }
    expectTypeOf(read).toBeFunction()
  })

  it('没给行类型时什么名字都收；rowKey 只能写字段或取值函数', () => {
    const loose: TableColumnDef[] = [{ id: 'anything', format: (value, record) => `${String(value)}${String(record.whatever)}` }]
    expectTypeOf(loose).toBeArray()
    expectTypeOf<TableField<User>>().toEqualTypeOf<'id' | 'name' | 'age' | 'tags'>()
    expectTypeOf<TableField<Record<string, unknown>>>().toEqualTypeOf<string>()
    expectTypeOf<TableField<object>>().toEqualTypeOf<string>()
    const keyed: TableSchema<User>['props'] = { data: [], rowKey: 'name' }
    // @ts-expect-error 行 id 的字段名拼错
    const wrong: TableSchema<User>['props'] = { data: [], rowKey: 'nmae' }
    expectTypeOf([keyed, wrong]).toBeArray()
  })
})
