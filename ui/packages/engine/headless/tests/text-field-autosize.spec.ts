// @vitest-environment jsdom
import type { TextFieldAutoSize, TextFieldSchema } from '../src/text-field'
import { createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { autoSizeTextarea, textFieldMachine } from '../src/text-field'

function computedStyle(overrides: Partial<CSSStyleDeclaration> = {}): CSSStyleDeclaration {
  return {
    lineHeight: '10px',
    fontSize: '10px',
    paddingBlockStart: '2px',
    paddingBlockEnd: '3px',
    borderBlockStartWidth: '1px',
    borderBlockEndWidth: '0px',
    ...overrides,
  } as CSSStyleDeclaration
}

function textarea(scrollHeight = 100): HTMLTextAreaElement {
  const el = document.createElement('textarea')
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollHeight })
  document.body.append(el)
  return el
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('autoSizeTextarea 所有权与配置', () => {
  it('配置变化按当前行数边界重量，关闭后逐字恢复作者的值与 priority', () => {
    const el = textarea()
    el.style.setProperty('block-size', '37px', 'important')
    el.style.setProperty('overflow-y', 'scroll', 'important')
    const nativePriority = el.style.getPropertyPriority.bind(el.style)
    vi.spyOn(el.style, 'getPropertyPriority').mockImplementation(name =>
      name === 'block-size' || name === 'overflow-y' ? 'important' : nativePriority(name))
    const setProperty = vi.spyOn(el.style, 'setProperty')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())

    autoSizeTextarea(el, { minRows: 2, maxRows: 4 })
    expect(el.style.getPropertyValue('block-size')).toBe('46px')
    expect(el.style.getPropertyValue('overflow-y')).toBe('auto')
    expect(setProperty).toHaveBeenCalledWith('block-size', 'auto', 'important')
    expect(setProperty).toHaveBeenCalledWith('block-size', '46px', 'important')
    expect(setProperty).toHaveBeenCalledWith('overflow-y', 'auto', 'important')

    autoSizeTextarea(el, { minRows: 2, maxRows: 8 })
    expect(el.style.getPropertyValue('block-size')).toBe('86px')

    autoSizeTextarea(el, false)
    expect(el.style.getPropertyValue('block-size')).toBe('37px')
    expect(el.style.getPropertyValue('overflow-y')).toBe('scroll')
    expect(setProperty).toHaveBeenCalledWith('block-size', '37px', 'important')
    expect(setProperty).toHaveBeenCalledWith('overflow-y', 'scroll', 'important')
  })

  it('作者原本没写内联尺寸时，关闭只移除 helper 自己取得的两项', () => {
    const el = textarea(30)
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())

    autoSizeTextarea(el, true)
    expect(el.style.blockSize).toBe('31px')
    expect(el.style.overflowY).toBe('hidden')

    autoSizeTextarea(el, undefined)
    expect(el.style.getPropertyValue('block-size')).toBe('')
    expect(el.style.getPropertyValue('overflow-y')).toBe('')
  })

  it.each([
    { minRows: 0 },
    { minRows: -1 },
    { minRows: 1.5 },
    { minRows: Number.NaN },
    { maxRows: Number.POSITIVE_INFINITY },
    { maxRows: 0 },
    { minRows: 4, maxRows: 3 },
  ] satisfies TextFieldAutoSize[])('无效配置 $minRows/$maxRows 明确失败，不沿用旧量高结果', (autoSize) => {
    const el = textarea(30)
    el.style.setProperty('block-size', '25px')
    el.style.setProperty('overflow-y', 'scroll')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())
    autoSizeTextarea(el, true)

    expect(() => autoSizeTextarea(el, autoSize)).toThrow(/TextField autoSize/)
    expect(el.style.blockSize).toBe('25px')
    expect(el.style.overflowY).toBe('scroll')

    const runtime = createVanillaRuntime()
    expect(() => createService(textFieldMachine, {
      props: () => ({ autoSize }) as TextFieldSchema['props'],
      runtime,
    })).toThrow(/TextField autoSize/)
  })

  it('测量严格使用 textarea 所属 Window，主窗口同名能力不参与', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const win = frame.contentWindow!
    const el = frame.contentDocument!.createElement('textarea')
    frame.contentDocument!.body.append(el)
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 20 })
    const scoped = vi.fn((_element: Element) => computedStyle())
    win.getComputedStyle = scoped as typeof win.getComputedStyle
    const ambient = vi.spyOn(window, 'getComputedStyle')

    autoSizeTextarea(el, true)

    expect(scoped.mock.calls).toHaveLength(1)
    expect(scoped.mock.calls[0]![0] === el).toBe(true)
    expect(ambient).not.toHaveBeenCalled()
    autoSizeTextarea(el, false)
    frame.remove()
  })

  it('所属 Document 没有 Window 时明确失败并归还原内联声明', () => {
    const offline = document.implementation.createHTMLDocument('offline')
    const el = offline.createElement('textarea')
    el.style.setProperty('block-size', '12px', 'important')
    el.style.setProperty('overflow-y', 'scroll', 'important')

    expect(() => autoSizeTextarea(el, true)).toThrow(/所属 Document 的 Window/)
    expect(el.style.getPropertyValue('block-size')).toBe('12px')
    expect(el.style.getPropertyValue('overflow-y')).toBe('scroll')
  })
})
