// @vitest-environment jsdom
// 开关组的值类型泛型。模板里 Volar 照组件的构造签名推断值类型，这里用同一条路断言：按 value / collection 推断值类型、按 multiple 推断形状。
// `h()` 推断不了泛型，按 unknown 收，数字值照常选中、照常交出数字。类型断言由 typecheck 判。
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhToggleGroupRoot } from '../src'

describe('xhToggleGroupRoot 的值类型泛型', () => {
  it('multiple 决定形状：多选是数组，单选是一个值或 null；单选绑数组即报错', () => {
    const typed = (levels: number[], level: number | null): void => {
      void new XhToggleGroupRoot({ 'multiple': true, 'value': levels, 'onUpdate:value': value => expectTypeOf(value).toEqualTypeOf<number[]>() })
      void new XhToggleGroupRoot({ 'value': level, 'onUpdate:value': value => expectTypeOf(value).toEqualTypeOf<number | null>() })
      // @ts-expect-error 没写 multiple 是单选，值不能是数组
      void new XhToggleGroupRoot({ value: levels })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：单选点选交出数字', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const onValueChange = vi.fn()
    const app = createApp({ render: () => h(XhToggleGroupRoot, { collection: [{ value: 1, label: '一' }, { value: 2, label: '二' }], onValueChange }) })
    app.mount(host)
    await nextTick()
    const part = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="toggle-group"]${selector}`)!
    part('[data-part="item"][data-value="2"]').click()
    await nextTick()
    expect(onValueChange).toHaveBeenLastCalledWith({ value: 2 })
    app.unmount()
    host.remove()
  })
})
