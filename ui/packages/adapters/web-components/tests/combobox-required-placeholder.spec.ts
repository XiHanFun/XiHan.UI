// @vitest-environment jsdom
// combobox 必填：没选值时表单出口补一份空值占位、带原生 required；选了值就只剩值的影子。
import type { XhComboboxElement } from '../src/elements/combobox'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

function mount(attrs: string): XhComboboxElement {
  document.body.innerHTML = `
    <xh-combobox name="fruit" ${attrs}>
      <div data-xh-part="root">
        <div data-xh-part="control"><input data-xh-part="input"></div>
        <input data-xh-part="hidden-input">
        <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
      </div>
    </xh-combobox>`
  const el = document.querySelector<XhComboboxElement>('xh-combobox')!
  el.collection = [{ value: 'apple', label: '苹果' }]
  return el
}

function formInputs(): Array<[string, string, boolean]> {
  return [...document.querySelectorAll<HTMLInputElement>('xh-combobox input[name="fruit"]')].map(input => [input.type, input.value, input.required])
}

describe('combobox 必填的占位影子（Web Components）', () => {
  it('必填且没选值：一份空值的文本输入带 required', async () => {
    mount('required')
    await vi.waitFor(() => expect(formInputs()).toEqual([['text', '', true]]))
  })

  it('选了值：只剩值的影子，不带 required', async () => {
    mount('required default-value="apple"')
    await vi.waitFor(() => expect(formInputs()).toEqual([['hidden', 'apple', false]]))
  })
})
