// @vitest-environment jsdom
// NumberField 的 formatOptions 在 Vue 上的接线：格式化显示下表单提交的是原值。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { XhNumberFieldRoot } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

function formOf(render: () => ReturnType<typeof h>): HTMLFormElement {
  const form = document.createElement('form')
  document.body.append(form)
  mount(render, { attachTo: form })
  return form
}

describe('number-field formatOptions', () => {
  it('失焦显示格式化文字，表单提交的是原值', async () => {
    const form = formOf(() => h(XhNumberFieldRoot, { name: 'price', defaultValue: '1234.5', locale: 'en-US', formatOptions: { style: 'currency', currency: 'USD' } }))
    await nextTick()
    expect(form.querySelector<HTMLInputElement>('[role="spinbutton"]')!.value).toBe('$1,234.50')
    expect([...new FormData(form).entries()]).toEqual([['price', '1234.5']])
  })

  it('没给 formatOptions 时提交照旧走输入框，precision 补齐位数', async () => {
    const form = formOf(() => h(XhNumberFieldRoot, { name: 'qty', defaultValue: '3', precision: 2 }))
    await nextTick()
    expect([...new FormData(form).entries()]).toEqual([['qty', '3.00']])
  })
})
