// @vitest-environment jsdom
import type { XhFormElement } from '../src/elements/form'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

describe('自定义元素表单字段级接口', () => {
  it('字段级校验、改动与重置走命令式接口；submitAction 返回 thenable 时提交在途，拒绝派发 submit-error', async () => {
    const element = document.createElement('xh-form') as XhFormElement
    element.innerHTML = '<form data-xh-part="root"><button data-xh-part="submit-trigger">提交</button></form>'
    element.defaultValues = { user: '' }
    element.rules = { user: { required: true, message: '请填写用户名' } }
    const cause = new Error('服务端拒绝')
    let fail!: (reason: unknown) => void
    element.submitAction = vi.fn(() => new Promise<void>((_, reject) => {
      fail = reject
    }))
    const onSubmit = vi.fn()
    const onSubmitError = vi.fn()
    element.addEventListener('submit', onSubmit)
    element.addEventListener('submit-error', onSubmitError)
    document.body.append(element)
    await vi.waitFor(() => expect(element.querySelector('[data-part=root]')).not.toBeNull())

    expect(await element.validateField('user')).toEqual({ valid: false, errors: { user: '请填写用户名' }, stale: false })
    expect(element.submitFailed).toBe(false)
    element.setFieldValue('user', '甲')
    expect(element.dirty).toBe(true)
    expect(element.isFieldDirty('user')).toBe(true)

    element.submit()
    await vi.waitFor(() => expect(element.submitting).toBe(true))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await element.updateComplete
    const trigger = element.querySelector<HTMLButtonElement>('[data-part="submit-trigger"]')!
    expect(trigger.getAttribute('aria-disabled')).toBe('true')
    expect(trigger.hasAttribute('data-loading')).toBe(true)
    element.submit()
    expect(element.submitAction).toHaveBeenCalledTimes(1)

    fail(cause)
    await vi.waitFor(() => expect(onSubmitError).toHaveBeenCalledTimes(1))
    expect((onSubmitError.mock.calls[0]![0] as CustomEvent).detail).toEqual({ cause, values: { user: '甲' } })
    expect(element.submitting).toBe(false)

    element.resetField('user')
    expect(element.dirty).toBe(false)
    expect(await element.validateAll()).toEqual({ valid: false, errors: { user: '请填写用户名' }, stale: false })
  })
})
