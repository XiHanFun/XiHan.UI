// @vitest-environment jsdom
// 列表框的值类型泛型。模板里 Volar 照组件的构造签名推断值类型，这里用同一条路断言：按 value / collection 推断，对象值的 valueKey 只能写字段。
// `h()` 推断不了泛型，按 unknown 收，数字值照常选中、照常交出数字。类型断言由 typecheck 判。
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhListboxRoot } from '../src'

interface User {
  id: string
  name: string
}

describe('xhListboxRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型；对象值的 valueKey 只能写字段', () => {
    const typed = (users: User[]): void => {
      void new XhListboxRoot({ 'value': users, 'valueKey': 'id', 'onUpdate:value': value => expectTypeOf(value).toEqualTypeOf<User[]>() })
      // @ts-expect-error valueKey 只能写对象的字段
      void new XhListboxRoot({ value: users, valueKey: 'idd' })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：点选交出数字', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const onValueChange = vi.fn()
    const app = createApp({ render: () => h(XhListboxRoot, { collection: [{ value: 1, label: '一' }, { value: 2, label: '二' }], onValueChange }) })
    app.mount(host)
    await nextTick()
    const part = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="listbox"]${selector}`)!
    part('[data-part="item"][data-value="2"]').click()
    await nextTick()
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [2] })
    app.unmount()
    host.remove()
  })
})
