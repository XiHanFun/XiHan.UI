// @vitest-environment jsdom
// xh-checkbox-group 的值类型：经 property 交进数字、对象都行，生成的条目 data-value 是它的键，value-change 的 detail 交出原值；
// `querySelector<XhCheckboxGroupElement<V>>` 拿到的元素按 V 收窄。
import type { XhCheckboxGroupElement } from '../src/elements/checkbox-group'
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: { updateComplete: Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

// 展开后浮层可能挂到文档根上，条目按整份文档找
const q = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="checkbox-group"]${selector}`)!

describe('xh-checkbox-group 的值类型', () => {
  it('元素按值类型收窄 value / collection', () => {
    const assign = (el: XhCheckboxGroupElement<number>): void => {
      el.collection = [{ value: 1 }]
      el.value = [1]
      el.itemValues = [1, 2]
      // @ts-expect-error 值是数字
      el.itemValues = ['a']
    }
    expectTypeOf(assign).toBeFunction()
  })

  it('数字值：生成的条目 data-value 是键，点选后 value-change 交出数字', async () => {
    const el = document.createElement('xh-checkbox-group') as XhCheckboxGroupElement<number>
    el.collection = [{ value: 1, label: '一' }, { value: 2, label: '二' }]
    el.defaultValue = [1]
    const details: unknown[] = []
    el.addEventListener('value-change', event => details.push((event as CustomEvent).detail))
    document.body.append(el)
    await settle(el)
    expect([...document.querySelectorAll('[data-scope="checkbox-group"][data-part="item"]')].map(item => item.getAttribute('data-value'))).toEqual(['1', '2'])
    q('[data-part="item"][data-value="2"]').click()
    await settle(el)
    expect(details.at(-1)).toEqual({ value: [1, 2] })
  })
})
