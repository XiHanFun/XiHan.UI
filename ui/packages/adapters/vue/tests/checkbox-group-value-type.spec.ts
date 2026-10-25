// @vitest-environment jsdom
// 复选组的值类型泛型。模板里 Volar 照组件的构造签名推断值类型，这里用同一条路断言：按 value / collection 推断，itemValues 也是那个类型。
// `h()` 推断不了泛型，按 unknown 收，数字值照常选中、照常交出数字。类型断言由 typecheck 判。
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCheckboxGroupRoot } from '../src'

describe('xhCheckboxGroupRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型；itemValues 也是那个类型', () => {
    const typed = (days: number[]): void => {
      void new XhCheckboxGroupRoot({ 'value': days, 'itemValues': [1, 2], 'onUpdate:value': value => expectTypeOf(value).toEqualTypeOf<number[]>() })
      // @ts-expect-error itemValues 与值不是一个类型
      void new XhCheckboxGroupRoot({ value: days, itemValues: ['a'] })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：点选交出数字数组', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const onValueChange = vi.fn()
    const app = createApp({ render: () => h(XhCheckboxGroupRoot, { collection: [{ value: 1, label: '周一' }, { value: 2, label: '周二' }], defaultValue: [1], onValueChange }) })
    app.mount(host)
    await nextTick()
    const part = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="checkbox-group"]${selector}`)!
    part('[data-part="item"][data-value="2"]').click()
    await nextTick()
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [1, 2] })
    app.unmount()
    host.remove()
  })
})
