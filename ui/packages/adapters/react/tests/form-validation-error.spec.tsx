// @vitest-environment jsdom
import type { FormRootSlotProps } from '../src/components/form/form'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { XhFormRoot } from '../src'

describe('表单校验异常的函数式组件适配', () => {
  it('回调与函数式 children 都能读取异常，显式重试成功后清除', async () => {
    const cause = new Error('校验服务失败')
    const validate = vi.fn().mockRejectedValueOnce(cause).mockResolvedValue({})
    const onValidationError = vi.fn()
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    let api!: FormRootSlotProps
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    try {
      await act(async () => {
        root.render(
          <XhFormRoot
            defaultValues={{ user: '甲' }}
            validate={validate}
            onValidationError={onValidationError}
            onSubmit={onSubmit}
            onInvalid={onInvalid}
          >
            {(state) => {
              api = state
              return <span>{state.validationError ? '执行失败' : '就绪'}</span>
            }}
          </XhFormRoot>,
        )
      })
      await act(async () => api.submit())
      expect(onValidationError).toHaveBeenCalledWith({ cause, values: { user: '甲' }, field: null })
      expect(api.validationError?.cause).toBe(cause)
      expect(api.validating).toBe(false)
      expect(api.errors).toEqual({})
      expect(host.textContent).toBe('执行失败')
      expect(onSubmit).not.toHaveBeenCalled()
      expect(onInvalid).not.toHaveBeenCalled()

      await act(async () => api.submit())
      expect(api.validationError).toBeNull()
      expect(host.textContent).toBe('就绪')
      expect(onSubmit).toHaveBeenCalledTimes(1)
    }
    finally {
      await act(async () => root.unmount())
      host.remove()
    }
  })
})
