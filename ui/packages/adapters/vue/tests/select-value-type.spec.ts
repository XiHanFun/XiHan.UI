// @vitest-environment jsdom
// 选择器的值类型泛型。模板里 Volar 照组件的构造签名 `new XhSelectRoot({ ...props })` 推断 V，
// 这里用同一条路断言：按 value / collection 推断，v-model 绑数字或对象的数组不必断言，两处类型对不上即报错。
// `h()` 推断不了泛型，只按 unknown 收，数字值照常选中、照常交出数字。类型断言由 typecheck 判。
import type { SelectNodeMeta } from '@xihan-ui/headless'
import type { VNode } from 'vue'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSelectRoot } from '../src'

interface User {
  id: string
  name: string
}

describe('xhSelectRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型；对象值的 valueKey 只能写字段', () => {
    const typed = (nums: number[], users: User[]): void => {
      const select = new XhSelectRoot({
        'value': nums,
        'collection': [{ value: 1, label: '一' }],
        'onUpdate:value': (value) => {
          expectTypeOf(value).toEqualTypeOf<number[]>()
        },
      })
      expectTypeOf(select.$slots.item).toEqualTypeOf<((node: SelectNodeMeta<number>) => VNode[]) | undefined>()
      void new XhSelectRoot({ value: users, valueKey: 'id', multiple: true })
      // @ts-expect-error 值是数字，collection 却给了字符串
      void new XhSelectRoot({ value: nums, collection: [{ value: 'a' }] })
      // @ts-expect-error valueKey 只能写对象的字段
      void new XhSelectRoot({ value: users, valueKey: 'idd' })
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('h() 里按 unknown 收：数字值的标准结构照常选中，点选交出数字', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const onValueChange = vi.fn()
    const app = createApp({ render: () => h(XhSelectRoot, { collection: [{ value: 1, label: '一' }, { value: 2, label: '二' }], defaultValue: 2, onValueChange }) })
    app.mount(host)
    await nextTick()
    const part = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="select"]${selector}`)!
    expect(part('[data-part="value-text"]').textContent).toBe('二')
    part('[data-part="trigger"]').click()
    await nextTick()
    part('[data-part="item"][data-value="1"]').click()
    await nextTick()
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [1] })
    app.unmount()
    host.remove()
  })
})
