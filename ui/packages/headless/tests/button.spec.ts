import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it, vi } from 'vitest'
import { connectButton } from '../src'

describe('connectButton', () => {
  it('getRootProps 带 anatomy 属性与类型', () => {
    const root = connectButton({ type: 'submit', variant: 'solid', size: 'md' }, normalizeProps).getRootProps() as Record<string, unknown>
    expect(root['data-scope']).toBe('button')
    expect(root['data-part']).toBe('root')
    expect(root.type).toBe('submit')
    expect(root['data-variant']).toBe('solid')
    expect(root['data-size']).toBe('md')
  })

  it('disabled 用原生 disabled（不加 aria-disabled）', () => {
    const root = connectButton({ disabled: true }, normalizeProps).getRootProps() as Record<string, unknown>
    expect(root.disabled).toBe(true)
    expect(root['aria-disabled']).toBeUndefined()
    expect(root['data-state']).toBe('disabled')
  })

  it('loading 用 aria-disabled（保留焦点）+ data-state', () => {
    const api = connectButton({ loading: true }, normalizeProps)
    const root = api.getRootProps() as Record<string, unknown>
    expect(root.disabled).toBeUndefined()
    expect(root['aria-disabled']).toBe('true')
    expect(root['data-state']).toBe('loading')
    expect(api.loading).toBe(true)
  })

  it('loading/disabled 时 onClick 拦截默认行为', () => {
    const root = connectButton({ loading: true }, normalizeProps).getRootProps() as Record<string, unknown>
    const preventDefault = vi.fn()
    const e = { preventDefault, stopPropagation: vi.fn() }
    ;(root.onClick as (e: unknown) => void)(e)
    expect(preventDefault).toHaveBeenCalled()
  })

  it('可交互时 onClick 不拦截', () => {
    const root = connectButton({}, normalizeProps).getRootProps() as Record<string, unknown>
    const preventDefault = vi.fn()
    const e = { preventDefault, stopPropagation: vi.fn() }
    ;(root.onClick as (e: unknown) => void)(e)
    expect(preventDefault).not.toHaveBeenCalled()
  })
})
