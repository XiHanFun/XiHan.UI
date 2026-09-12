// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { formPathKey } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhFieldControl,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

function mountTextField(props: Record<string, boolean> = {}, wrapped = false) {
  return mount(defineComponent({
    setup: () => () => h(XhFormRoot, {
      disabled: true,
      readOnly: true,
      rules: { email: { required: true } },
      errors: { email: '格式不对' },
    }, () => h(XhFormFieldGroup, { name: 'email' }, () => {
      const text = h(XhTextFieldRoot, props, () => h(XhTextFieldInput))
      return wrapped ? h(XhFieldRoot, null, () => h(XhFieldControl, null, () => text)) : text
    })),
  }), { attachTo: document.body })
}

describe('form control context 接线', () => {
  it('fieldGroup 用 name 接收数组路径，并把它稳定写成路径身份', () => {
    const path = ['users', 0, 'email'] as const
    const view = mount(defineComponent({
      setup: () => () => h(XhFormRoot, null, () => h(XhFormFieldGroup, { name: path })),
    }))
    expect(view.find('[data-part="field-group"]').attributes('data-form-path')).toBe(formPathKey(path))
  })

  it.each([
    ['直接控件', false],
    ['Field 包装控件', true],
  ])('%s 继承 Form 的禁用、只读、必填与无效态', (_name, wrapped) => {
    const wrapper = mountTextField({}, wrapped)
    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('readonly')).toBeDefined()
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-readonly')).toBe('true')
    expect(input.attributes('aria-required')).toBe('true')
  })

  it('text field 实例显式 false 顶掉最近 Field 的四条继承状态', () => {
    const wrapper = mountTextField({ disabled: false, readOnly: false, required: false, invalid: false }, true)
    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeUndefined()
    expect(input.attributes('readonly')).toBeUndefined()
    expect(input.attributes('required')).toBeUndefined()
    expect(input.attributes('aria-invalid')).toBe('false')
    expect(input.attributes('aria-readonly')).toBe('false')
    expect(input.attributes('aria-required')).toBe('false')
  })
})
