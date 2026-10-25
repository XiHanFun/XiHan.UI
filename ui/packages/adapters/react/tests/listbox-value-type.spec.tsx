// @vitest-environment jsdom
// 列表框的值类型泛型：按 value / collection 推断 V，数字、对象值不写断言即可受控；onValueChange 交出原值。
import type { ReactNode } from 'react'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { XhListboxRoot } from '../src'

interface User {
  id: string
  name: string
}

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

describe('xhListboxRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型；对象值的 valueKey 只能写字段', () => {
    const typed = (): ReactNode => {
      const [users, setUsers] = useState<User[]>([])
      return (
        <>
          <XhListboxRoot value={users} valueKey="id" collection={[{ value: { id: 'u1', name: '赵一' }, label: '赵一' }]} onValueChange={({ value }) => setUsers(value)} />
          {/* @ts-expect-error valueKey 只能写对象的字段 */}
          <XhListboxRoot value={users} valueKey="idd" />
        </>
      )
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('对象值给了 valueKey：受控值换成内容相同的新对象也选得中，点选交出 collection 里的那个对象', async () => {
    const users: User[] = [{ id: 'u1', name: '赵一' }, { id: 'u2', name: '钱二' }]
    const onValueChange = vi.fn()
    root = createRoot(document.body.appendChild(document.createElement('div')))
    await act(async () => {
      root!.render(<XhListboxRoot value={[{ id: 'u2', name: '钱二' }]} valueKey="id" collection={users.map(user => ({ value: user, label: user.name }))} onValueChange={onValueChange} />)
    })
    const item = (key: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="listbox"][data-part="item"][data-value="${key}"]`)!
    expect(item('u2').getAttribute('aria-selected')).toBe('true')
    await act(async () => item('u1').click())
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [users[0]] })
  })
})
