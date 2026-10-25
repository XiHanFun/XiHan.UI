// 根组件的行类型泛型：按 data 的元素类型推断，columns 的 id / field 写错即报错，
// format 与 renderCell 的参数跟着收窄。类型断言由 typecheck 判；运行时只确认带类型的写法照常渲染。
import type { TableCellSlotData } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { XhTableRoot } from '../src'

interface User {
  id: string
  name: string
  age: number
}

const USERS: User[] = [{ id: 'u1', name: '赵一', age: 30 }, { id: 'u2', name: '钱二', age: 25 }]

describe('xhTableRoot 的行类型泛型', () => {
  it('按 data 推断行类型：字段名写错的列编译即报错，format 与 renderCell 的参数是那一行的类型', () => {
    const typed = (): ReactNode => (
      <>
        <XhTableRoot
          data={USERS}
          columns={[
            { id: 'name', label: '姓名', format: value => value.toUpperCase() },
            {
              id: 'age',
              label: '年龄',
              format: (value) => {
                expectTypeOf(value).toEqualTypeOf<number>()
                return `${value} 岁`
              },
            },
            { id: 'actions', field: null, label: '操作' },
          ]}
          rowKey="id"
          renderCell={(cell) => {
            expectTypeOf(cell).toEqualTypeOf<TableCellSlotData<User>>()
            return cell.record?.name
          }}
        />
        {/* @ts-expect-error 字段名拼错 */}
        <XhTableRoot data={USERS} columns={[{ id: 'nmae' }]} />
        {/* @ts-expect-error rowKey 也只能写字段 */}
        <XhTableRoot data={USERS} columns={[{ id: 'name' }]} rowKey="nmae" />
        {/* 没给 data 时是宽松的记录，什么列名都收 */}
        <XhTableRoot columns={[{ id: 'whatever' }]} rows={[{ id: 'r1' }]} />
      </>
    )
    expectTypeOf(typed).toBeFunction()
  })

  it('带类型的写法照常渲染：格子文字取 format', () => {
    const { container } = render(
      <XhTableRoot data={USERS} columns={[{ id: 'name' }, { id: 'age', format: value => `${value} 岁` }]} />,
    )
    const cells = [...container.querySelectorAll('[data-scope="table"][data-part="body"] [data-part="cell"]')].map(cell => cell.textContent)
    expect(cells).toEqual(['赵一', '30 岁', '钱二', '25 岁'])
  })
})
