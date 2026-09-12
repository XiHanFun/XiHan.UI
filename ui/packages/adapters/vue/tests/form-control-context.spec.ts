// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { formPathKey } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhCheckbox,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhFieldControl,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhNumberFieldInput,
  XhNumberFieldRoot,
  XhPasswordInputInput,
  XhPasswordInputRoot,
  XhPinInputInput,
  XhPinInputRoot,
  XhRadioGroupRoot,
  XhSwitch,
  XhTextFieldInput,
  XhTextFieldRoot,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
} from '../src'

type ControlState = Partial<Record<'disabled' | 'readOnly' | 'required' | 'invalid', boolean>>
type AtomicControl = 'Checkbox' | 'Switch' | 'RadioGroup' | 'NumberField' | 'PasswordInput' | 'PinInput' | 'DateField' | 'TimeField'

const ATOMIC_CONTROLS: AtomicControl[] = ['Checkbox', 'Switch', 'RadioGroup', 'NumberField', 'PasswordInput', 'PinInput', 'DateField', 'TimeField']

function atomicControl(kind: AtomicControl, props: ControlState) {
  if (kind === 'Checkbox')
    return h(XhCheckbox, props)
  if (kind === 'Switch')
    return h(XhSwitch, props)
  if (kind === 'RadioGroup')
    return h(XhRadioGroupRoot, { ...props, collection: [{ value: 'a', label: '甲' }] })
  if (kind === 'NumberField')
    return h(XhNumberFieldRoot, props, () => h(XhNumberFieldInput))
  if (kind === 'PasswordInput')
    return h(XhPasswordInputRoot, props, () => h(XhPasswordInputInput))
  if (kind === 'PinInput')
    return h(XhPinInputRoot, { ...props, length: 1 }, () => h(XhPinInputInput, { index: 0 }))
  if (kind === 'DateField')
    return h(XhDateFieldRoot, { ...props, segments: ['year'] }, () => h(XhDateFieldSegment, { segment: 'year' }))
  return h(XhTimeFieldRoot, { ...props, granularity: 'hour' }, () => h(XhTimeFieldSegment, { segment: 'hour' }))
}

function mountAtomicControl(kind: AtomicControl, instance: ControlState = {}, field?: ControlState) {
  return mount(defineComponent({
    setup: () => () => h(XhFormRoot, {
      disabled: true,
      readOnly: true,
      rules: { email: { required: true } },
      errors: { email: '格式不对' },
    }, () => h(XhFormFieldGroup, { name: 'email' }, () => {
      const control = atomicControl(kind, instance)
      return field ? h(XhFieldRoot, field, () => control) : control
    })),
  }), { attachTo: document.body })
}

function expectAtomicState(wrapper: ReturnType<typeof mount>, kind: AtomicControl, enabled: boolean): void {
  if (kind === 'NumberField' || kind === 'PasswordInput' || kind === 'PinInput') {
    const input = wrapper.find('input')
    expect(input.attributes('disabled') !== undefined).toBe(enabled)
    expect(input.attributes('readonly') !== undefined).toBe(enabled)
    expect(input.attributes('required') !== undefined).toBe(enabled)
    expect(input.attributes('aria-invalid')).toBe(String(enabled))
    return
  }
  if (kind === 'DateField' || kind === 'TimeField') {
    const segment = wrapper.find('[role="spinbutton"]')
    expect(segment.attributes('aria-disabled')).toBe(String(enabled))
    expect(segment.attributes('aria-readonly')).toBe(String(enabled))
    expect(segment.attributes('aria-required')).toBe(String(enabled))
    expect(segment.attributes('aria-invalid')).toBe(String(enabled))
    return
  }
  const root = wrapper.find(kind === 'RadioGroup' ? '[role="radiogroup"]' : `button[role="${kind === 'Checkbox' ? 'checkbox' : 'switch'}"]`)
  const disabled = kind === 'RadioGroup'
    ? wrapper.find('[role="radio"]').attributes('aria-disabled') === 'true'
    : root.attributes('disabled') !== undefined
  expect(disabled).toBe(enabled)
  expect(root.attributes('aria-readonly')).toBe(String(enabled))
  expect(root.attributes('aria-invalid')).toBe(String(enabled))
  expect(root.attributes('aria-required')).toBe(String(enabled))
}

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

  it.each(ATOMIC_CONTROLS)('%s 直接继承 Form 的四条状态轴', (kind) => {
    expectAtomicState(mountAtomicControl(kind), kind, true)
  })

  it.each(ATOMIC_CONTROLS)('%s 以最近 Field 的显式 false 顶掉 Form', (kind) => {
    expectAtomicState(mountAtomicControl(kind, {}, {
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    }), kind, false)
  })

  it.each(ATOMIC_CONTROLS)('%s 以实例显式 false 顶掉 Field 与 Form', (kind) => {
    expectAtomicState(mountAtomicControl(kind, {
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    }, {
      disabled: true,
      readOnly: true,
      required: true,
      invalid: true,
    }), kind, false)
  })
})
