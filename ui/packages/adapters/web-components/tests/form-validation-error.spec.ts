// @vitest-environment jsdom
import type { XhFormElement } from '../src/elements/form'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

describe('自定义元素表单校验异常', () => {
  it('事件与只读属性保持原始异常，显式重试成功后清除', async () => {
    const cause = new Error('校验服务失败')
    const element = document.createElement('xh-form') as XhFormElement
    element.innerHTML = '<form data-xh-part="root"><button data-xh-part="submit-trigger">提交</button></form>'
    element.defaultValues = { user: '甲' }
    element.validate = vi.fn().mockRejectedValueOnce(cause).mockResolvedValue({})
    const onValidationError = vi.fn()
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    element.addEventListener('validation-error', onValidationError)
    element.addEventListener('submit', onSubmit)
    element.addEventListener('invalid', onInvalid)
    document.body.append(element)
    await vi.waitFor(() => expect(element.querySelector('[data-part=root]')).not.toBeNull())

    element.submit()
    await vi.waitFor(() => expect(onValidationError).toHaveBeenCalledTimes(1))
    const event = onValidationError.mock.calls[0]![0] as CustomEvent
    expect(event.detail).toEqual({ cause, values: { user: '甲' }, field: null })
    expect(event.bubbles).toBe(true)
    expect(event.composed).toBe(true)
    expect(element.validationError?.cause).toBe(cause)
    expect(element.invalid).toBe(false)
    expect(onInvalid).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    element.submit()
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(element.validationError).toBeNull()
  })
})
