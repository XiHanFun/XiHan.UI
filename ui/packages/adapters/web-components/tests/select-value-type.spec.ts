// @vitest-environment jsdom
// xh-select 的值类型：经 property 交进数字、对象都行，生成的条目 data-value 是它的键，
// value-change 的 detail 交出原值；`querySelector<XhSelectElement<V>>` 拿到的元素按 V 收窄。
import type { XhSelectElement } from '../src/elements/select'
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface User {
  id: string
  name: string
}

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: { updateComplete: Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

// 展开后浮层挂到文档根上，条目按整份文档找
const q = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="select"]${selector}`)!

describe('xh-select 的值类型', () => {
  it('元素按值类型收窄 value / collection；对象值的 valueKey 只能写字段', () => {
    const assign = (select: XhSelectElement<number>, users: XhSelectElement<User>): void => {
      select.collection = [{ value: 1, label: '一' }]
      select.value = [1]
      expectTypeOf(select.tags[0]!.value).toEqualTypeOf<number>()
      users.valueKey = 'id'
      // @ts-expect-error valueKey 只能写对象的字段
      users.valueKey = 'idd'
      // @ts-expect-error 值是数字
      select.value = ['a']
    }
    expectTypeOf(assign).toBeFunction()
  })

  it('数字值：生成的条目 data-value 是键，选中后 value-change 交出数字，表单影子提交键', async () => {
    const el = document.createElement('xh-select') as XhSelectElement<number>
    el.collection = [{ value: 1, label: '一' }, { value: 2, label: '二' }]
    el.defaultValue = 2
    el.setAttribute('name', 'n')
    const details: unknown[] = []
    el.addEventListener('value-change', event => details.push((event as CustomEvent).detail))
    document.body.append(el)
    await settle(el)
    expect(q('[data-part="value-text"]').textContent).toBe('二')
    expect([...document.querySelectorAll('[data-scope="select"][data-part="item"]')].map(item => item.getAttribute('data-value'))).toEqual(['1', '2'])
    q('[data-part="trigger"]').click()
    await settle(el)
    q('[data-part="item"][data-value="1"]').click()
    await settle(el)
    expect(details.at(-1)).toEqual({ value: [1] })
    expect([...document.querySelectorAll<HTMLOptionElement>('select option')].filter(option => option.selected && option.value).map(option => option.value)).toEqual(['1'])
  })

  it('对象值给了 valueKey：受控值换成内容相同的新对象也认得，事件交出 collection 里的那个对象', async () => {
    const users: User[] = [{ id: 'u1', name: '赵一' }, { id: 'u2', name: '钱二' }]
    const el = document.createElement('xh-select') as XhSelectElement<User>
    el.collection = users.map(user => ({ value: user, label: user.name }))
    el.valueKey = 'id'
    el.value = [{ id: 'u2', name: '钱二' }]
    const details: unknown[] = []
    el.addEventListener('value-change', event => details.push((event as CustomEvent).detail))
    document.body.append(el)
    await settle(el)
    expect(q('[data-part="item"][data-value="u2"]').getAttribute('data-state')).toBe('checked')
    q('[data-part="trigger"]').click()
    await settle(el)
    q('[data-part="item"][data-value="u1"]').click()
    await settle(el)
    expect(details.at(-1)).toEqual({ value: [users[0]] })
  })
})
