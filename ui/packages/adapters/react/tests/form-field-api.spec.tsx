// @vitest-environment jsdom
import type { FormRootSlotProps } from '../src/components/form/form'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { XhFormRoot, XhFormSubmitTrigger } from '../src'

describe('表单字段级接口的函数式组件适配', () => {
  it('函数式 children 读得到改动、触碰与字段级校验；onSubmit 返回 thenable 时提交在途', async () => {
    let settle!: () => void
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => {
      settle = resolve
    }))
    let api!: FormRootSlotProps
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    try {
      await act(async () => {
        root.render(
          <XhFormRoot
            defaultValues={{ user: '' }}
            rules={{ user: { required: true, message: '请填写用户名' } }}
            onSubmit={onSubmit}
          >
            {(state) => {
              api = state
              return <XhFormSubmitTrigger>提交</XhFormSubmitTrigger>
            }}
          </XhFormRoot>,
        )
      })
      expect(api.dirty).toBe(false)
      let result!: Awaited<ReturnType<FormRootSlotProps['validateField']>>
      await act(async () => {
        result = await api.validateField('user')
      })
      expect(result).toEqual({ valid: false, errors: { user: '请填写用户名' }, stale: false })
      expect(api.errors).toEqual({ user: '请填写用户名' })
      expect(api.submitFailed).toBe(false)

      await act(async () => api.setFieldValue('user', '甲'))
      expect(api.dirty).toBe(true)
      expect(api.isFieldDirty('user')).toBe(true)

      await act(async () => api.submit())
      expect(api.submitting).toBe(true)
      const trigger = host.querySelector<HTMLButtonElement>('[data-part="submit-trigger"]')!
      expect(trigger.getAttribute('aria-disabled')).toBe('true')
      expect(trigger.hasAttribute('data-loading')).toBe(true)
      await act(async () => api.submit())
      expect(onSubmit).toHaveBeenCalledTimes(1)
      await act(async () => settle())
      expect(api.submitting).toBe(false)

      await act(async () => api.resetField('user'))
      expect(api.dirty).toBe(false)
    }
    finally {
      await act(async () => root.unmount())
      host.remove()
    }
  })
})
