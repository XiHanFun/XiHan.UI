// @vitest-environment jsdom
// 字段组里没给值的录入控件按字段名读写表单的值：不必监听 value-change 再回写 setFieldValue。
import type { FormValues } from '@xihan-ui/headless'
import type { XhFormElement } from '../src/elements/form'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

const TEXT_FIELD = `
  <xh-text-field>
    <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div>
  </xh-text-field>`

const SWITCH = `<xh-switch><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>`

function mountForm(defaultValues: FormValues, content: string): XhFormElement {
  const form = document.createElement('xh-form') as XhFormElement
  form.defaultValues = defaultValues
  form.innerHTML = `<form data-xh-part="root">${content}</form>`
  document.body.append(form)
  return form
}

const textInput = (): HTMLInputElement => document.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')!

function type(input: HTMLInputElement, text: string): void {
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('字段组按字段名绑定控件的值', () => {
  it('文本框：初值取表单 defaultValues，输入写回表单', async () => {
    const form = mountForm({ title: '旧标题' }, `<div data-xh-part="field-group" name="title">${TEXT_FIELD}</div>`)
    await vi.waitFor(() => expect(textInput().value).toBe('旧标题'))

    type(textInput(), '新标题')
    await vi.waitFor(() => expect(form.getFieldValue('title')).toBe('新标题'))
    expect(textInput().value).toBe('新标题')
  })

  it('字段 xh-field 里的控件同样直接从字段组接值', async () => {
    const form = mountForm({ title: '旧标题' }, `
      <div data-xh-part="field-group" name="title">
        <xh-field><div data-xh-part="root"><label data-xh-part="label">标题</label>${TEXT_FIELD}</div></xh-field>
      </div>`)
    await vi.waitFor(() => expect(textInput().value).toBe('旧标题'))
    type(textInput(), '新标题')
    await vi.waitFor(() => expect(form.getFieldValue('title')).toBe('新标题'))
  })

  it('开关走 checked 通道；表单重置后控件跟着回到初值', async () => {
    const form = mountForm({ notify: true }, `<div data-xh-part="field-group" name="notify">${SWITCH}</div>`)
    const control = (): HTMLElement => document.querySelector<HTMLElement>('[data-scope="switch"][role="switch"]')!
    await vi.waitFor(() => expect(control().getAttribute('aria-checked')).toBe('true'))

    control().click()
    await vi.waitFor(() => expect(form.getFieldValue('notify')).toBe(false))
    await vi.waitFor(() => expect(control().getAttribute('aria-checked')).toBe('false'))

    form.reset()
    await vi.waitFor(() => expect(control().getAttribute('aria-checked')).toBe('true'))
  })

  it('实例自己给了 value 时不读也不写表单', async () => {
    const form = mountForm({ title: '表单里的' }, `<div data-xh-part="field-group" name="title">${TEXT_FIELD.replace('<xh-text-field>', '<xh-text-field value="实例的">')}</div>`)
    await vi.waitFor(() => expect(textInput().value).toBe('实例的'))
    type(textInput(), '改一下')
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(form.getFieldValue('title')).toBe('表单里的')
  })

  it('不在字段组里的控件不接表单的值', async () => {
    const form = mountForm({ title: '表单里的' }, TEXT_FIELD)
    await vi.waitFor(() => expect(textInput().getAttribute('data-scope')).toBe('text-field'))
    expect(textInput().value).toBe('')
    type(textInput(), '随便写')
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(form.getFieldValue('title')).toBe('表单里的')
  })
})
