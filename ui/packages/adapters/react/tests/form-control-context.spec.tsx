import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  XhFieldControl,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../src'
import { formPathKey } from '@xihan-ui/headless'

function renderTextField(props: Record<string, boolean> = {}, wrapped = false) {
  const text = <XhTextFieldRoot {...props}><XhTextFieldInput /></XhTextFieldRoot>
  return render(
    <XhFormRoot
      disabled
      readOnly
      rules={{ email: { required: true } }}
      errors={{ email: '格式不对' }}
    >
      <XhFormFieldGroup name="email">
        {wrapped ? <XhFieldRoot><XhFieldControl>{text}</XhFieldControl></XhFieldRoot> : text}
      </XhFormFieldGroup>
    </XhFormRoot>,
  )
}

describe('form control context 接线', () => {
  it('FieldGroup 用 name 接收数组路径，并把它稳定写成路径身份', () => {
    const path = ['users', 0, 'email'] as const
    const view = render(<XhFormRoot><XhFormFieldGroup name={path} /></XhFormRoot>)
    expect(view.container.querySelector('[data-part="field-group"]')?.getAttribute('data-form-path')).toBe(formPathKey(path))
  })

  it.each([
    ['直接控件', false],
    ['Field 包装控件', true],
  ])('%s 继承 Form 的禁用、只读、必填与无效态', (_name, wrapped) => {
    const { container } = renderTextField({}, wrapped)
    const input = container.querySelector('input')!
    expect(input.disabled).toBe(true)
    expect(input.readOnly).toBe(true)
    expect(input.required).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-readonly')).toBe('true')
    expect(input.getAttribute('aria-required')).toBe('true')
  })

  it('text field 实例显式 false 顶掉最近 Field 的四条继承状态', () => {
    const { container } = renderTextField({ disabled: false, readOnly: false, required: false, invalid: false }, true)
    const input = container.querySelector('input')!
    expect(input.disabled).toBe(false)
    expect(input.readOnly).toBe(false)
    expect(input.required).toBe(false)
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(input.getAttribute('aria-readonly')).toBe('false')
    expect(input.getAttribute('aria-required')).toBe('false')
  })
})
