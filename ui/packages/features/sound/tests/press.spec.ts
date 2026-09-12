import { describe, expect, it, vi } from 'vitest'
import { attachDocumentSoundUnlock, isSoundTargetDisabled, resolveSoundPressOptions } from '../src'

describe('按压音效接线原语', () => {
  it('归一字符串简写、对象声明和默认语义', () => {
    expect(resolveSoundPressOptions(undefined)).toEqual({ sound: 'click' })
    expect(resolveSoundPressOptions('send')).toEqual({ sound: 'send' })
    expect(resolveSoundPressOptions({ sound: 'toggle', volume: 0.5 })).toEqual({ sound: 'toggle', volume: 0.5 })
  })

  it.each([
    [{ disabled: '' }, true],
    [{ 'aria-disabled': 'true' }, true],
    [{ 'data-disabled': '' }, true],
    [{ 'aria-disabled': 'false' }, false],
    [{}, false],
  ])('统一识别禁用标记 %#', (attrs, expected) => {
    const target = {
      hasAttribute: (name: string) => name in attrs,
      getAttribute: (name: string) => (attrs as Record<string, string>)[name] ?? null,
    }
    expect(isSoundTargetDisabled(target)).toBe(expected)
  })

  it('首个手势只解锁一次，清理保持幂等', () => {
    const listeners = new Map<string, () => void>()
    const target = {
      addEventListener: (name: string, listener: EventListenerOrEventListenerObject) => listeners.set(name, listener as () => void),
      removeEventListener: (name: string) => listeners.delete(name),
    } as Pick<Document, 'addEventListener' | 'removeEventListener'>
    const unlock = vi.fn()
    const dispose = attachDocumentSoundUnlock(unlock, target)
    listeners.get('keydown')?.()
    expect(unlock).toHaveBeenCalledOnce()
    expect(listeners.size).toBe(0)
    dispose()
    expect(listeners.size).toBe(0)
  })
})
