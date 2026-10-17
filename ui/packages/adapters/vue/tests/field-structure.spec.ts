// @vitest-environment jsdom
// 不写默认插槽时照 fieldStructure 铺：control 插槽的控件原样放在标题之后，标题、说明、错误文案取文字或同名插槽。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhFieldRoot, XhTextFieldRoot } from '../src'

function childrenOf(el: Element): string[] {
  return Array.from(el.children).map(node => node.getAttribute('data-part') ?? node.localName)
}

describe('field 的标准结构', () => {
  it('control 插槽的库内控件放在标题之后，不包部件；字段把标签与说明接到控件的输入框上', () => {
    const field = mount(() => h(XhFieldRoot, { label: '申请人', description: '填写全名' }, {
      control: () => h(XhTextFieldRoot),
    }), { attachTo: document.body })
    const root = field.element as HTMLElement
    expect(childrenOf(root)).toEqual(['label', 'root', 'description'])
    const input = root.querySelector<HTMLElement>('[data-scope="text-field"][data-part="input"]')!
    expect(input.getAttribute('aria-labelledby')).toContain(root.querySelector('[data-scope="field"][data-part="label"]')!.id)
    expect(input.getAttribute('aria-describedby')).toContain(root.querySelector('[data-scope="field"][data-part="description"]')!.id)
    field.unmount()
  })

  it('错误文案给了才铺，同名插槽接管文字；标题插槽接管标题', () => {
    const field = mount(() => h(XhFieldRoot, { errorText: '不用这段', invalid: true }, {
      label: () => '邮箱',
      errorText: () => '格式不对',
    }))
    const root = field.element as HTMLElement
    expect(childrenOf(root)).toEqual(['label', 'error-text'])
    expect(root.querySelector('[data-part="label"]')!.textContent).toBe('邮箱')
    expect(root.querySelector('[data-part="error-text"]')!.textContent).toBe('格式不对')
  })
})
