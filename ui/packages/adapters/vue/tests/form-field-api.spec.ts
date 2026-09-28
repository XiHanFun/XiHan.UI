// @vitest-environment jsdom
// 字段级接口：插槽读得到改动、触碰与提交在途，命令里有字段级校验与单字段重置；
// @submit 落在 onSubmit prop 上，返回 thenable 即进入提交在途。
import type { FormRootSlotProps } from '../src/components/form/form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFormRoot, XhFormSubmitTrigger } from '../src'

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

describe('表单字段级接口的 Vue 适配', () => {
  it('插槽读得到改动与字段级校验；@submit 返回 thenable 时提交在途、再提交不发生，拒绝派发 submit-error', async () => {
    const cause = new Error('服务端拒绝')
    let fail!: (reason: unknown) => void
    const onSubmit = vi.fn(() => new Promise<void>((_, reject) => {
      fail = reject
    }))
    const onSubmitError = vi.fn()
    let api!: FormRootSlotProps
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(XhFormRoot, {
        defaultValues: { user: '' },
        rules: { user: { required: true, message: '请填写用户名' } },
        onSubmit,
        onSubmitError,
      }, {
        default: (state: FormRootSlotProps) => {
          api = state
          return [h(XhFormSubmitTrigger, null, () => '提交')]
        },
      }),
    })
    app.mount(host)
    cleanup.push(() => app.unmount())
    await nextTick()

    expect(await api.validateField('user')).toEqual({ valid: false, errors: { user: '请填写用户名' }, stale: false })
    await nextTick()
    expect(api.errors).toEqual({ user: '请填写用户名' })
    expect(api.submitFailed).toBe(false)

    api.setFieldValue('user', '甲')
    await nextTick()
    expect(api.dirty).toBe(true)
    expect(api.isFieldDirty('user')).toBe(true)

    api.submit()
    await nextTick()
    expect(api.submitting).toBe(true)
    const trigger = host.querySelector<HTMLButtonElement>('[data-part="submit-trigger"]')!
    expect(trigger.getAttribute('aria-disabled')).toBe('true')
    expect(trigger.hasAttribute('data-loading')).toBe(true)
    api.submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    fail(cause)
    await vi.waitFor(() => expect(onSubmitError).toHaveBeenCalledWith({ cause, values: { user: '甲' } }))
    await nextTick()
    expect(api.submitting).toBe(false)

    api.resetField('user')
    await nextTick()
    expect(api.dirty).toBe(false)
  })
})
