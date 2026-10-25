// @vitest-environment jsdom
// 根组件的行类型泛型。模板里 Volar 照组件的构造签名 `new XhTableRoot({ ...props })` 推断 TRow，
// 这里用同一条路断言：按 data 推断，columns 的 id / field 写错即报错，cell 插槽的参数跟着收窄。
// `h()` 推断不了泛型，只按宽松的记录检查，接口类型的 data 照收。类型断言由 typecheck 判。
import type { TableCellSlotData } from '@xihan-ui/headless'
import type { VNode } from 'vue'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhTableRoot } from '../src'

interface User {
  id: string
  name: string
  age: number
}

const USERS: User[] = [{ id: 'u1', name: '赵一', age: 30 }, { id: 'u2', name: '钱二', age: 25 }]

describe('xhTableRoot 的行类型泛型', () => {
  it('按 data 推断行类型：字段名写错的列编译即报错，format 与 cell 插槽的参数是那一行的类型', () => {
    const typed = (): void => {
      const table = new XhTableRoot({
        data: USERS,
        columns: [
          { id: 'name', format: value => value.toUpperCase() },
          {
            id: 'age',
            format: (value) => {
              expectTypeOf(value).toEqualTypeOf<number>()
              return `${value} 岁`
            },
          },
          { id: 'actions', field: null },
        ],
        rowKey: 'id',
      })
      expectTypeOf(table.$slots.cell).toEqualTypeOf<((props: TableCellSlotData<User>) => VNode[]) | undefined>()
      // @ts-expect-error 字段名拼错
      void new XhTableRoot({ data: USERS, columns: [{ id: 'nmae' }] })
      // @ts-expect-error rowKey 也只能写字段
      void new XhTableRoot({ data: USERS, rowKey: 'nmae' })
      // 没给 data 时是宽松的记录，什么列名都收
      void new XhTableRoot({ columns: [{ id: 'whatever' }] })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('h() 里按宽松的记录检查：接口类型的 data 照收，格子文字取 format', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(XhTableRoot, { data: USERS, columns: [{ id: 'name' }, { id: 'age', format: value => `${String(value)} 岁` }] }),
    })
    app.mount(host)
    const cells = [...host.querySelectorAll('[data-scope="table"][data-part="body"] [data-part="cell"]')].map(cell => cell.textContent)
    expect(cells).toEqual(['赵一', '30 岁', '钱二', '25 岁'])
    app.unmount()
    host.remove()
  })
})
