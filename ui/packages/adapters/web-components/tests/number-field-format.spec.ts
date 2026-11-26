// @vitest-environment jsdom
// NumberField 的 formatOptions 在 Web Components 上的接线：格式化显示下表单提交的是原值。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Host extends HTMLElement {
  updateComplete: Promise<unknown>
  [key: string]: unknown
}

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: Host): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

async function mountInForm(tag: string, props: Record<string, unknown>): Promise<{ form: HTMLFormElement, el: Host }> {
  const form = document.createElement('form')
  const el = document.createElement(tag) as Host
  Object.assign(el, props)
  form.append(el)
  document.body.append(form)
  await settle(el)
  return { form, el }
}

describe('number-field formatOptions', () => {
  it('失焦显示格式化文字，表单提交的是原值', async () => {
    const { form } = await mountInForm('xh-number-field', { name: 'price', defaultValue: '1234.5', locale: 'en-US', formatOptions: { style: 'currency', currency: 'USD' } })
    expect(form.querySelector<HTMLInputElement>('[role="spinbutton"]')!.value).toBe('$1,234.50')
    expect([...new FormData(form).entries()]).toEqual([['price', '1234.5']])
  })

  it('没给 formatOptions 时提交照旧走输入框，precision 补齐位数', async () => {
    const { form } = await mountInForm('xh-number-field', { name: 'qty', defaultValue: '3', precision: 2 })
    expect([...new FormData(form).entries()]).toEqual([['qty', '3.00']])
  })
})
