// @vitest-environment jsdom
// tree-select 必填：没选值时表单出口补一份空值占位、带原生 required；选了值就只剩值的影子。
import type { XhTreeSelectElement } from '../src/elements/tree-select'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

function mount(attrs: string): XhTreeSelectElement {
  document.body.innerHTML = `
    <xh-tree-select name="dir" ${attrs}>
      <div data-xh-part="root">
        <div data-xh-part="control"><button data-xh-part="trigger"><span data-xh-part="value-text"></span></button></div>
        <input data-xh-part="hidden-input">
        <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div>
      </div>
    </xh-tree-select>`
  const el = document.querySelector<XhTreeSelectElement>('xh-tree-select')!
  el.collection = [{ value: 'src', label: 'src' }]
  return el
}

function formInputs(): Array<[string, string, boolean]> {
  return [...document.querySelectorAll<HTMLInputElement>('xh-tree-select input[name="dir"]')].map(input => [input.type, input.value, input.required])
}

describe('tree-select 必填的占位影子（Web Components）', () => {
  it('必填且没选值：一份空值的文本输入带 required', async () => {
    mount('required')
    await vi.waitFor(() => expect(formInputs()).toEqual([['text', '', true]]))
  })

  it('选了值：只剩值的影子，不带 required', async () => {
    mount('required default-value="src"')
    await vi.waitFor(() => expect(formInputs()).toEqual([['hidden', 'src', false]]))
  })
})
