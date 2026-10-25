// @vitest-environment jsdom
// 组合框的值类型泛型。模板里 Volar 照组件的构造签名推断值类型，这里用同一条路断言：按 value / collection 推断，自定义过滤拿到的条目也是那个类型。
// `h()` 推断不了泛型，按 unknown 收，数字值照常选中、照常交出数字。类型断言由 typecheck 判。
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhComboboxRoot } from '../src'

describe('xhComboboxRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型；filter 拿到的条目是那个类型', () => {
    const typed = (nums: number[]): void => {
      void new XhComboboxRoot({
        'value': nums,
        'collection': [{ value: 1, label: '一' }],
        'filter': (node) => {
          expectTypeOf(node.value).toEqualTypeOf<number>()
          return true
        },
        'onUpdate:value': value => expectTypeOf(value).toEqualTypeOf<number[]>(),
      })
      // @ts-expect-error 值是数字，collection 却给了字符串
      void new XhComboboxRoot({ value: nums, collection: [{ value: 'a' }] })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：展开后点选，onValueChange 交出数字', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const onValueChange = vi.fn()
    const app = createApp({ render: () => h(XhComboboxRoot, { collection: [{ value: 1, label: '一' }, { value: 2, label: '二' }], onValueChange }) })
    app.mount(host)
    await nextTick()
    const part = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="combobox"]${selector}`)!
    part('[data-part="trigger"]').click()
    await nextTick()
    part('[data-part="item"][data-value="2"]').click()
    await nextTick()
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [2] })
    app.unmount()
    host.remove()
  })
})
