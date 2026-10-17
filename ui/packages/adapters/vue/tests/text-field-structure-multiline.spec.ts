// @vitest-environment jsdom
// 不写默认插槽时，multiline 让标准结构的输入框铺成 textarea；标题的 for 照样指向它。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhTextFieldRoot } from '../src'

describe('text-field 标准结构的 multiline', () => {
  it('开了 multiline 铺 textarea，不带 type；不开时是单行 input', () => {
    const multi = mount(() => h(XhTextFieldRoot, { label: '备注', multiline: true }), { attachTo: document.body })
    const textarea = (multi.element as HTMLElement).querySelector<HTMLElement>('[data-scope="text-field"][data-part="input"]')!
    expect([textarea.localName, textarea.hasAttribute('type')]).toEqual(['textarea', false])
    expect((multi.element as HTMLElement).querySelector('[data-part="label"]')!.getAttribute('for')).toBe(textarea.id)
    multi.unmount()

    const single = mount(() => h(XhTextFieldRoot, { label: '昵称' }), { attachTo: document.body })
    expect((single.element as HTMLElement).querySelector('[data-scope="text-field"][data-part="input"]')!.localName).toBe('input')
    single.unmount()
  })
})
