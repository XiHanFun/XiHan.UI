// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { acquireFocusGuards } from '../src/focus-scope/focus-guards'
import { getTabbables, removeLinks } from '../src/focus-scope/tabbable'
import { acquireScrollLock } from '../src/scroll-lock'

function fakeConfig(): RuntimeConfig {
  const scope = createScope(document.body, createCounterIdGenerator())
  return { scope } as RuntimeConfig
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.cssText = ''
})

describe('acquireScrollLock（引用计数）', () => {
  it('第一次加锁、最后一次解锁，body 精确还原', () => {
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true })
    const a = acquireScrollLock({ config: fakeConfig() })
    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe('-120px')

    const b = acquireScrollLock({ config: fakeConfig() })
    a.dispose()
    // 还有一层持有，未解锁
    expect(document.body.style.position).toBe('fixed')

    b.dispose()
    // 最后一层释放，还原
    expect(document.body.style.position).toBe('')
    expect(document.body.style.top).toBe('')
  })

  it('dispose 幂等', () => {
    const h = acquireScrollLock({ config: fakeConfig() })
    h.dispose()
    h.dispose()
    expect(document.body.style.position).toBe('')
  })
})

describe('getTabbables', () => {
  it('按 DOM 顺序取可 tab 元素，跳过 disabled 与 tabindex=-1', () => {
    document.body.innerHTML = `
      <a href="#">link</a>
      <button>b1</button>
      <button disabled>disabled</button>
      <input />
      <div tabindex="-1">skip</div>
      <div tabindex="0">custom</div>
    `
    const els = getTabbables(document.body)
    const tags = els.map(e => e.tagName.toLowerCase())
    expect(tags).toEqual(['a', 'button', 'input', 'div'])
  })

  it('removeLinks 去掉 <a>', () => {
    document.body.innerHTML = '<a href="#">l</a><button>b</button>'
    expect(removeLinks(getTabbables(document.body)).map(e => e.tagName)).toEqual(['BUTTON'])
  })
})

describe('acquireFocusGuards', () => {
  it('共享一对哨兵 + 引用计数，全部释放后移除', () => {
    const c1 = acquireFocusGuards(document)
    const guards = document.querySelectorAll('[data-xh-focus-guard]')
    expect(guards.length).toBe(2)
    expect(guards[0]!.getAttribute('aria-hidden')).toBe('true')

    const c2 = acquireFocusGuards(document)
    expect(document.querySelectorAll('[data-xh-focus-guard]').length).toBe(2) // 仍是一对

    c1()
    expect(document.querySelectorAll('[data-xh-focus-guard]').length).toBe(2)
    c2()
    expect(document.querySelectorAll('[data-xh-focus-guard]').length).toBe(0)
  })
})
