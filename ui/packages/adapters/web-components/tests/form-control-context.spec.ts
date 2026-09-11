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
})
