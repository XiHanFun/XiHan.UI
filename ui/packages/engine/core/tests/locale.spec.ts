// @vitest-environment jsdom
// locale 是纯格式化输入；读不到宿主语言时必须回到公开的 en-US，而不是要求 SSR 伪造 DOM。
import type { Scope } from '../src/kernel/scope'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { hostLocale, resolveLocale, XH_FALLBACK_LOCALE } from '../src/kernel/locale'
import { createScope } from '../src/kernel/scope'

function unavailableScope(): Scope {
  return {
    getWin: () => {
      throw new Error('没有活动 Window')
    },
  } as unknown as Scope
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('locale 的宿主读取边界', () => {
  it('显式 locale 不读取 Scope', () => {
    expect(resolveLocale('zh-CN', unavailableScope())).toBe('zh-CN')
  })

  it('scope 没有活动 Window 时不借 ambient Window', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('zh-CN')
    expect(hostLocale(unavailableScope())).toBeUndefined()
    expect(resolveLocale(undefined, unavailableScope())).toBe(XH_FALLBACK_LOCALE)
  })

  it('navigator 读取失败时按不可用处理', () => {
    const scope = {
      getWin: () => ({
        get navigator() {
          throw new Error('navigator blocked')
        },
      }),
    } as unknown as Scope
    expect(hostLocale(scope)).toBeUndefined()
    expect(resolveLocale(undefined, scope)).toBe('en-US')
  })

  it('顶层 DOM globals 缺失时仍读取显式外部 Scope 的语言', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const doc = frame.contentDocument!
    const win = frame.contentWindow!
    const node = doc.createElement('div')
    doc.body.appendChild(node)
    Object.defineProperty(win.navigator, 'language', { configurable: true, value: 'fr-FR' })
    const scope = createScope(node, createCounterIdGenerator())
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)

    expect(hostLocale(scope)).toBe('fr-FR')
    expect(resolveLocale(undefined, scope)).toBe('fr-FR')
    vi.unstubAllGlobals()
    frame.remove()
  })

  it('没有 Scope 的 SSR 使用公开默认语言', () => {
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    expect(hostLocale()).toBeUndefined()
    expect(resolveLocale(undefined)).toBe('en-US')
  })

  it('空锚点 Scope 在 SSR 中同样使用公开默认语言', () => {
    const scope = createScope(null, createCounterIdGenerator())
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    expect(hostLocale(scope)).toBeUndefined()
    expect(resolveLocale(undefined, scope)).toBe('en-US')
  })
})
