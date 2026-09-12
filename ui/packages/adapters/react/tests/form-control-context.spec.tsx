import { render } from '@testing-library/react'
import { formPathKey } from '@xihan-ui/headless'
import { describe, expect, it } from 'vitest'
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
    return <XhCheckbox {...props} />
  if (kind === 'Switch')
    return <XhSwitch {...props} />
  if (kind === 'RadioGroup')
    return <XhRadioGroupRoot {...props} collection={[{ value: 'a', label: '甲' }]} />
  if (kind === 'NumberField')
    return <XhNumberFieldRoot {...props}><XhNumberFieldInput /></XhNumberFieldRoot>
  if (kind === 'PasswordInput')
    return <XhPasswordInputRoot {...props}><XhPasswordInputInput /></XhPasswordInputRoot>
  if (kind === 'PinInput')
    return <XhPinInputRoot {...props} length={1}><XhPinInputInput index={0} /></XhPinInputRoot>
  if (kind === 'DateField')
    return <XhDateFieldRoot {...props} segments={['year']}><XhDateFieldSegment segment="year" /></XhDateFieldRoot>
  return <XhTimeFieldRoot {...props} granularity="hour"><XhTimeFieldSegment segment="hour" /></XhTimeFieldRoot>
}

function renderAtomicControl(kind: AtomicControl, instance: ControlState = {}, field?: ControlState) {
  const control = atomicControl(kind, instance)
  return render(
    <XhFormRoot disabled readOnly rules={{ email: { required: true } }} errors={{ email: '格式不对' }}>
      <XhFormFieldGroup name="email">
        {field ? <XhFieldRoot {...field}>{control}</XhFieldRoot> : control}
      </XhFormFieldGroup>
    </XhFormRoot>,
  )
}

function expectAtomicState(container: HTMLElement, kind: AtomicControl, enabled: boolean): void {
  if (kind === 'NumberField' || kind === 'PasswordInput' || kind === 'PinInput') {
    const input = container.querySelector('input')!
    expect(input.disabled).toBe(enabled)
    expect(input.readOnly).toBe(enabled)
    expect(input.required).toBe(enabled)
    expect(input.getAttribute('aria-invalid')).toBe(String(enabled))
    return
  }
  if (kind === 'DateField' || kind === 'TimeField') {
    const segment = container.querySelector<HTMLElement>('[role="spinbutton"]')!
    expect(segment.getAttribute('aria-disabled')).toBe(String(enabled))
    expect(segment.getAttribute('aria-readonly')).toBe(String(enabled))
    expect(segment.getAttribute('aria-required')).toBe(String(enabled))
    expect(segment.getAttribute('aria-invalid')).toBe(String(enabled))
    return
  }
  const root = container.querySelector<HTMLElement>(kind === 'RadioGroup' ? '[role="radiogroup"]' : `button[role="${kind === 'Checkbox' ? 'checkbox' : 'switch'}"]`)!
  const disabled = kind === 'RadioGroup'
    ? container.querySelector('[role="radio"]')?.getAttribute('aria-disabled') === 'true'
    : (root as HTMLButtonElement).disabled
  expect(disabled).toBe(enabled)
  expect(root.getAttribute('aria-readonly')).toBe(String(enabled))
  expect(root.getAttribute('aria-invalid')).toBe(String(enabled))
  expect(root.getAttribute('aria-required')).toBe(String(enabled))
}

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
  it('fieldGroup 用 name 接收数组路径，并把它稳定写成路径身份', () => {
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

  it.each(ATOMIC_CONTROLS)('%s 直接继承 Form 的四条状态轴', (kind) => {
    expectAtomicState(renderAtomicControl(kind).container, kind, true)
  })

  it.each(ATOMIC_CONTROLS)('%s 以最近 Field 的显式 false 顶掉 Form', (kind) => {
    expectAtomicState(renderAtomicControl(kind, {}, {
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    }).container, kind, false)
  })

  it.each(ATOMIC_CONTROLS)('%s 以实例显式 false 顶掉 Field 与 Form', (kind) => {
    expectAtomicState(renderAtomicControl(kind, {
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    }, {
      disabled: true,
      readOnly: true,
      required: true,
      invalid: true,
    }).container, kind, false)
  })
})
