import { normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it, vi } from 'vitest'
import { connectButton } from '../src'

/** 桩事件要把 connect 真正会调的方法都备齐，缺一个就变成"实现一改就崩"而不是"行为一变就红"。 */
function fakeEvent(): { preventDefault: ReturnType<typeof vi.fn>, stopPropagation: ReturnType<typeof vi.fn>, stopImmediatePropagation: ReturnType<typeof vi.fn> } {
  return { preventDefault: vi.fn(), stopPropagation: vi.fn(), stopImmediatePropagation: vi.fn() }
}

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
    expect(root['data-disabled']).toBe('')
  })

  it('loading 用 aria-disabled（保留焦点）+ data-loading', () => {
    const api = connectButton({ loading: true }, normalizeProps)
    const root = api.getRootProps() as Record<string, unknown>
    expect(root.disabled).toBeUndefined()
    expect(root['aria-disabled']).toBe('true')
    expect(root['data-loading']).toBe('')
    expect(api.loading).toBe(true)
  })

  it('loading/disabled 时 onClick 拦截默认行为，并挡掉同节点上的后续处理器', () => {
    const root = connectButton({ loading: true }, normalizeProps).getRootProps() as Record<string, unknown>
    const e = fakeEvent()
    ;(root.onClick as (e: unknown) => void)(e)
    expect(e.preventDefault).toHaveBeenCalled()
    // 挡的是同一个节点上作者自己的处理器，不是往祖先的冒泡：
    // 只 stopPropagation 的话，"提交中"的按钮还会被点第二次提交出去
    expect(e.stopImmediatePropagation).toHaveBeenCalled()
  })

  it('可交互时 onClick 不拦截', () => {
    const root = connectButton({}, normalizeProps).getRootProps() as Record<string, unknown>
    const e = fakeEvent()
    ;(root.onClick as (e: unknown) => void)(e)
    expect(e.preventDefault).not.toHaveBeenCalled()
    expect(e.stopImmediatePropagation).not.toHaveBeenCalled()
  })

  describe('图标按钮的可及名', () => {
    function collect(run: () => void): string[] {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      run()
      const messages = spy.mock.calls.map(call => String(call[0]))
      spy.mockRestore()
      return messages
    }

    it('iconOnly 且没给 aria-label / aria-labelledby：提醒一次，重复调用不再提醒', () => {
      const records = collect(() => {
        connectButton({ iconOnly: true }, normalizeProps).getRootProps()
        connectButton({ iconOnly: true }, normalizeProps).getRootProps()
      })
      expect(records.filter(m => m.includes('iconOnly'))).toHaveLength(1)
    })

    it('给了可及名或不是图标按钮：不提醒', () => {
      const records = collect(() => {
        connectButton({ iconOnly: true, ariaLabel: '关闭' }, normalizeProps).getRootProps()
        connectButton({ iconOnly: true, ariaLabelledby: 'x' }, normalizeProps).getRootProps()
        connectButton({}, normalizeProps).getRootProps()
      })
      expect(records.filter(m => m.includes('iconOnly'))).toHaveLength(0)
    })

    it('装饰性子部件对读屏隐藏：aria-hidden 写布尔', () => {
      const api = connectButton({}, normalizeProps)
      expect((api.getPrefixProps() as Record<string, unknown>)['aria-hidden']).toBe(true)
      expect((api.getIndicatorProps() as Record<string, unknown>)['aria-hidden']).toBe(true)
    })
  })
})
