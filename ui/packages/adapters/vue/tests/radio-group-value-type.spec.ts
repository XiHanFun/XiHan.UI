// @vitest-environment jsdom
// 单选组的值类型泛型。模板里 Volar 照组件的构造签名推断值类型，这里用同一条路断言：按 value / collection 推断，值是一个值或 null。
// `h()` 推断不了泛型，按 unknown 收，数字值照常选中、照常交出数字。类型断言由 typecheck 判。
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhRadioGroupRoot } from '../src'

describe('xhRadioGroupRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型：单选的值是一个数字或 null', () => {
    const typed = (size: number | null): void => {
      void new XhRadioGroupRoot({ 'value': size, 'collection': [{ value: 10 }], 'onUpdate:value': value => expectTypeOf(value).toEqualTypeOf<number | null>() })
      // @ts-expect-error 值是数字，collection 却给了字符串
      void new XhRadioGroupRoot({ value: size, collection: [{ value: 'a' }] })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：点选交出数字', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const onValueChange = vi.fn()
    const app = createApp({ render: () => h(XhRadioGroupRoot, { collection: [{ value: 10, label: '十' }, { value: 20, label: '二十' }], onValueChange }) })
    app.mount(host)
    await nextTick()
    const part = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="radio-group"]${selector}`)!
    part('[data-part="item"][data-value="20"]').click()
    await nextTick()
    expect(onValueChange).toHaveBeenLastCalledWith({ value: 20 })
    app.unmount()
    host.remove()
  })
})
