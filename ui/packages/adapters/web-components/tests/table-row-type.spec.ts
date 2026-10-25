// xh-table 的行类型泛型：`querySelector<XhTableElement<User>>('xh-table')` 拿到的元素上，
// columns 的 id / field 与 rowKey 只能写 User 的字段，format 这些回调的参数也是 User。
// 只有类型断言，由 typecheck 判；元素在 jsdom 里不必挂起来。
import type { XhTableElement } from '../src/elements/table'
import { describe, expectTypeOf, it } from 'vitest'

interface User {
  id: string
  name: string
  age: number
}

describe('xh-table 的行类型泛型', () => {
  it('元素按行类型收窄 columns / data / rowKey，写错字段名即报错', () => {
    const assign = (table: XhTableElement<User>): void => {
      table.data = [{ id: 'u1', name: '赵一', age: 30 }]
      table.columns = [
        { id: 'name', format: value => value.toUpperCase() },
        {
          id: 'age',
          format: (value) => {
            expectTypeOf(value).toEqualTypeOf<number>()
            return `${value} 岁`
          },
        },
        { id: 'actions', field: null },
      ]
      table.rowKey = 'id'
      // @ts-expect-error 字段名拼错
      table.columns = [{ id: 'nmae' }]
      // @ts-expect-error rowKey 也只能写字段
      table.rowKey = 'nmae'
    }
    // 不写行类型时是宽松的记录，什么列名都收
    const loose = (table: XhTableElement): void => {
      table.columns = [{ id: 'whatever' }]
    }
    expectTypeOf(assign).toBeFunction()
    expectTypeOf(loose).toBeFunction()
  })
})
