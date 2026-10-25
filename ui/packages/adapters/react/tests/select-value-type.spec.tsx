// @vitest-environment jsdom
// 选择器的值类型泛型：按 value / collection 推断 V，数字、对象值不写断言即可受控；
// onValueChange 交出原值，条目的 data-value 与随表单提交的是它的键。类型断言由 typecheck 判。
import type { ReactNode } from 'react'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { XhSelectContent, XhSelectControl, XhSelectItem, XhSelectItemText, XhSelectList, XhSelectPositioner, XhSelectRoot, XhSelectTrigger, XhSelectValueText } from '../src'

interface User {
  id: string
  name: string
}

const USERS: User[] = [{ id: 'u1', name: '赵一' }, { id: 'u2', name: '钱二' }]

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function mount(node: ReactNode): Promise<void> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
}

const q = (selector: string): HTMLElement => document.querySelector<HTMLElement>(selector)!

describe('xhSelectRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型：数字、对象都不写断言；两处类型对不上即报错', () => {
    const typed = (): ReactNode => {
      const [nums, setNums] = useState<number[]>([])
      const [users, setUsers] = useState<User[]>([])
      return (
        <>
          <XhSelectRoot
            value={nums}
            collection={[{ value: 1, label: '一' }, { value: 2, label: '二' }]}
            onValueChange={({ value }) => setNums(value)}
            renderItem={(node) => {
              expectTypeOf(node.value).toEqualTypeOf<number>()
              return node.label
            }}
          />
          <XhSelectRoot
            multiple
            value={users}
            valueKey="id"
            collection={USERS.map(user => ({ value: user, label: user.name }))}
            onValueChange={({ value }) => setUsers(value)}
          />
          {/* @ts-expect-error 值是数字，collection 却给了字符串 */}
          <XhSelectRoot value={nums} collection={[{ value: 'a' }]} />
          {/* @ts-expect-error valueKey 只能写对象的字段 */}
          <XhSelectRoot value={users} valueKey="idd" />
          {/* 不给值也不给 collection 时缺省是字符串，旧写法照旧 */}
          <XhSelectRoot defaultValue="a" onValueChange={({ value }) => expectTypeOf(value).toEqualTypeOf<string[]>()} />
        </>
      )
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：标准结构选中第一条，onValueChange 交出数字，条目与表单提交的是键', async () => {
    const onValueChange = vi.fn()
    await mount(
      <XhSelectRoot collection={[{ value: 1, label: '一' }, { value: 2, label: '二' }]} defaultValue={2} name="n" onValueChange={onValueChange} />,
    )
    expect(q('[data-scope="select"][data-part="value-text"]').textContent).toBe('二')
    expect([...document.querySelectorAll('[data-scope="select"][data-part="item"]')].map(item => item.getAttribute('data-value'))).toEqual(['1', '2'])
    await act(async () => q('[data-scope="select"][data-part="trigger"]').click())
    await act(async () => q('[data-scope="select"][data-part="item"][data-value="1"]').click())
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [1] })
    expect([...document.querySelectorAll<HTMLOptionElement>('select option')].filter(option => option.selected && option.value).map(option => option.value)).toEqual(['1'])
  })

  it('对象值给了 valueKey：手写条目按字段认，受控值换成内容相同的新对象也选得中', async () => {
    const onValueChange = vi.fn()
    await mount(
      <XhSelectRoot value={{ id: 'u2', name: '钱二' }} valueKey="id" onValueChange={onValueChange}>
        <XhSelectControl><XhSelectTrigger><XhSelectValueText /></XhSelectTrigger></XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {USERS.map(user => <XhSelectItem key={user.id} value={user}><XhSelectItemText>{user.name}</XhSelectItemText></XhSelectItem>)}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>,
    )
    expect(q('[data-scope="select"][data-part="item"][data-value="u2"]').getAttribute('data-state')).toBe('checked')
    await act(async () => q('[data-scope="select"][data-part="trigger"]').click())
    await act(async () => q('[data-scope="select"][data-part="item"][data-value="u1"]').click())
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [USERS[0]] })
  })
})
