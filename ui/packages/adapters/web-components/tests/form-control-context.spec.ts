// @vitest-environment jsdom
import type { XhFormElement } from '../src/elements/form'
import { formPathKey } from '@xihan-ui/headless'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

function textField(markup = ''): string {
  return `
    <xh-text-field ${markup}>
      <div data-xh-part="root">
        <label data-xh-part="label">邮箱</label>
        <div data-xh-part="control"><input data-xh-part="input"></div>
      </div>
    </xh-text-field>`
}

type AtomicControl = 'checkbox' | 'switch' | 'radio-group' | 'number-field'

const ATOMIC_CONTROLS: AtomicControl[] = ['checkbox', 'switch', 'radio-group', 'number-field']

function atomicControl(kind: AtomicControl, markup = ''): string {
  if (kind === 'checkbox') {
    return `<xh-checkbox ${markup}><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>`
  }
  if (kind === 'switch') {
    return `<xh-switch ${markup}><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>`
  }
  if (kind === 'radio-group') {
    return `<xh-radio-group ${markup}><div data-xh-part="root">
      <div data-xh-part="item" value="a"><input data-xh-part="hidden-input"><span data-xh-part="indicator"></span><span data-xh-part="item-text">甲</span></div>
    </div></xh-radio-group>`
  }
  return `<xh-number-field ${markup}><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div></xh-number-field>`
}

async function expectAtomicState(form: XhFormElement, kind: AtomicControl, enabled: boolean): Promise<void> {
  if (kind === 'number-field') {
    const input = form.querySelector('xh-number-field input') as HTMLInputElement
    await vi.waitFor(() => expect(input.disabled).toBe(enabled))
    expect(input.readOnly).toBe(enabled)
    expect(input.required).toBe(enabled)
    expect(input.getAttribute('aria-invalid')).toBe(String(enabled))
    return
  }
  let root: HTMLElement | null = null
  await vi.waitFor(() => {
    root = form.querySelector<HTMLElement>(kind === 'radio-group' ? '[role="radiogroup"]' : `button[role="${kind}"]`)
    expect(root?.getAttribute('aria-readonly')).toBe(String(enabled))
  })
  const disabled = kind === 'radio-group'
    ? form.querySelector('[role="radio"]')?.getAttribute('aria-disabled') === 'true'
    : (root! as HTMLButtonElement).disabled
  expect(disabled).toBe(enabled)
  expect(root!.getAttribute('aria-invalid')).toBe(String(enabled))
  expect(root!.getAttribute('aria-required')).toBe(String(enabled))
}

function formMarkup(content: string): string {
  return `<form data-xh-part="root"><div data-xh-part="field-group" name="email">${content}</div></form>`
}

function makeForm(content: string): XhFormElement {
  const form = document.createElement('xh-form') as XhFormElement
  form.innerHTML = formMarkup(content)
  form.disabled = true
  form.readOnly = true
  form.rules = { email: { required: true } }
  form.errors = { email: '格式不对' }
  document.body.append(form)
  return form
}

describe('form control context 接线', () => {
  it('数组路径严格取 data-path，运行期改写后由观察器重新接线', async () => {
    const form = document.createElement('xh-form') as XhFormElement
    const first = ['users', 0, 'email']
    form.innerHTML = `<form data-xh-part="root"><div data-xh-part="field-group" data-path='${JSON.stringify(first)}'></div></form>`
    document.body.append(form)
    await vi.waitFor(() => expect(form.querySelector('[data-part="field-group"]')?.getAttribute('data-form-path')).toBe(formPathKey(first)))

    const second = ['users', 1, 'email']
    form.querySelector('[data-part="field-group"]')!.setAttribute('data-path', JSON.stringify(second))
    await vi.waitFor(() => expect(form.querySelector('[data-part="field-group"]')?.getAttribute('data-form-path')).toBe(formPathKey(second)))
  })

  it('直接 xh-text-field 继承 Form 的禁用、只读、必填与无效态', async () => {
    const form = makeForm(textField())
    const input = form.querySelector('xh-text-field input') as HTMLInputElement
    await vi.waitFor(() => expect(input.disabled).toBe(true))
    expect(input.readOnly).toBe(true)
    expect(input.required).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-readonly')).toBe('true')
    expect(input.getAttribute('aria-required')).toBe('true')
  })

  it('field 包装的 xh-text-field 把最近状态交给内层控件机器', async () => {
    const field = `
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          ${textField('data-xh-part="control"')}
          <p data-xh-part="description">工作邮箱</p>
          <p data-xh-part="error-text">格式不对</p>
        </div>
      </xh-field>`
    const form = makeForm(field)
    const input = form.querySelector('xh-field xh-text-field input') as HTMLInputElement
    await vi.waitFor(() => expect(input.disabled).toBe(true))
    expect(input.readOnly).toBe(true)
    expect(input.required).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('text field 实例显式 false 顶掉最近 Field 的四条继承状态', async () => {
    const field = `
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          ${textField('data-xh-part="control" disabled="false" read-only="false" required="false" invalid="false"')}
          <p data-xh-part="description">工作邮箱</p>
          <p data-xh-part="error-text">格式不对</p>
        </div>
      </xh-field>`
    const form = makeForm(field)
    const input = form.querySelector('xh-field xh-text-field input') as HTMLInputElement
    await vi.waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('false'))
    expect(input.disabled).toBe(false)
    expect(input.readOnly).toBe(false)
    expect(input.required).toBe(false)
    expect(input.getAttribute('aria-readonly')).toBe('false')
    expect(input.getAttribute('aria-required')).toBe('false')
  })

  it.each(ATOMIC_CONTROLS)('%s 直接继承 Form 的四条状态轴', async (kind) => {
    await expectAtomicState(makeForm(atomicControl(kind)), kind, true)
  })

  it.each(ATOMIC_CONTROLS)('%s 以最近 Field 的显式 false 顶掉 Form', async (kind) => {
    const field = `<xh-field disabled="false" read-only="false" required="false" invalid="false">
      <div data-xh-part="root"><div data-xh-part="control">${atomicControl(kind)}</div></div>
    </xh-field>`
    await expectAtomicState(makeForm(field), kind, false)
  })

  it.each(ATOMIC_CONTROLS)('%s 以实例显式 false 顶掉 Field 与 Form', async (kind) => {
    const field = `<xh-field disabled read-only required invalid>
      <div data-xh-part="root"><div data-xh-part="control">${atomicControl(kind, 'disabled="false" read-only="false" required="false" invalid="false"')}</div></div>
    </xh-field>`
    await expectAtomicState(makeForm(field), kind, false)
  })
})
