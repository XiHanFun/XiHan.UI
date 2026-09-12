// @vitest-environment jsdom
import type { TextFieldAutoSize, TextFieldSchema } from '../src/text-field'
import { createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { autoSizeTextarea, textFieldMachine } from '../src/text-field'

interface MirrorMeasurement {
  readonly contentPaddingBox: number
  readonly rowPaddingBox: number
  readonly error?: unknown
}

function computedStyle(overrides: Record<string, string> = {}): CSSStyleDeclaration {
  const values: Record<string, string> = {
    'border-bottom-width': '0px',
    'border-left-width': '0px',
    'border-right-width': '0px',
    'border-top-width': '1px',
    'box-sizing': 'border-box',
    'font-family': 'sans-serif',
    'font-size': '10px',
    'line-height': '10px',
    'padding-bottom': '3px',
    'padding-left': '4px',
    'padding-right': '4px',
    'padding-top': '2px',
    'white-space': 'pre-wrap',
    'width': '180px',
    'writing-mode': 'horizontal-tb',
    ...overrides,
  }
  return {
    getPropertyValue: (property: string) => values[property] ?? '',
  } as CSSStyleDeclaration
}

function textarea(): HTMLTextAreaElement {
  const el = document.createElement('textarea')
  el.value = '一行真实内容'
  document.body.append(el)
  return el
}

function mockMirrorMeasurements(
  doc: Document,
  measurements: readonly MirrorMeasurement[],
): HTMLTextAreaElement[] {
  const queue = [...measurements]
  const mirrors: HTMLTextAreaElement[] = []
  const nativeCreate = doc.createElement.bind(doc)
  vi.spyOn(doc, 'createElement').mockImplementation(((name: string, options?: ElementCreationOptions) => {
    const node = nativeCreate(name, options)
    if (name.toLowerCase() !== 'textarea')
      return node
    const measurement = queue.shift()
    if (!measurement)
      throw new Error('测试没有提供下一次 textarea 镜像测量值')
    const textareaNode = node as HTMLTextAreaElement
    let reads = 0
    Object.defineProperty(textareaNode, 'scrollHeight', {
      configurable: true,
      get: () => {
        if (measurement.error !== undefined)
          throw measurement.error
        return reads++ === 0 ? measurement.contentPaddingBox : measurement.rowPaddingBox
      },
    })
    mirrors.push(textareaNode)
    return node
  }) as typeof doc.createElement)
  return mirrors
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('autoSizeTextarea 所有权与配置', () => {
  it('配置变化按当前行数边界重量，关闭后逐字恢复作者的值与 priority', () => {
    const el = textarea()
    const mirrors = mockMirrorMeasurements(document, [
      { contentPaddingBox: 100, rowPaddingBox: 15 },
      { contentPaddingBox: 100, rowPaddingBox: 15 },
    ])
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
    expect(mirrors).toHaveLength(2)
    expect(mirrors.every(mirror => !mirror.isConnected)).toBe(true)
    expect(mirrors[0]!.style.lineHeight).toBe('10px')
    expect(mirrors[0]!.style.width).toBe('180px')
  })

  it('作者原本没写内联尺寸时，关闭只移除 helper 自己取得的两项', () => {
    const el = textarea()
    mockMirrorMeasurements(document, [{ contentPaddingBox: 30, rowPaddingBox: 15 }])
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
    const el = textarea()
    mockMirrorMeasurements(document, [{ contentPaddingBox: 30, rowPaddingBox: 15 }])
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
    el.value = 'frame content'
    frame.contentDocument!.body.append(el)
    const mirrors = mockMirrorMeasurements(frame.contentDocument!, [
      { contentPaddingBox: 20, rowPaddingBox: 15 },
    ])
    const scoped = vi.fn((_element: Element) => computedStyle())
    win.getComputedStyle = scoped as typeof win.getComputedStyle
    const ambient = vi.spyOn(window, 'getComputedStyle')

    autoSizeTextarea(el, true)

    expect(scoped.mock.calls).toHaveLength(1)
    expect(scoped.mock.calls[0]![0] === el).toBe(true)
    expect(ambient).not.toHaveBeenCalled()
    expect(mirrors[0]!.ownerDocument).toBe(frame.contentDocument)
    expect(mirrors[0]!.isConnected).toBe(false)
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

  it('line-height 为 normal 时从真实单行镜像取值，不用字号倍率估算', () => {
    const el = textarea()
    mockMirrorMeasurements(document, [{ contentPaddingBox: 10, rowPaddingBox: 22 }])
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle({
      'border-bottom-width': '2px',
      'font-size': '200px',
      'line-height': 'normal',
    }))

    autoSizeTextarea(el, { minRows: 2, maxRows: 3 })

    // 单行 content-box 为 22 - (2 + 3) = 17；两行 border-box 为 17*2 + 5 + 3。
    expect(el.style.blockSize).toBe('42px')
    expect(el.style.overflowY).toBe('hidden')
  })

  it.each([
    { boxSizing: 'border-box', expected: '71px' },
    { boxSizing: 'content-box', expected: '56px' },
  ])('$boxSizing 下按同一盒口径处理内容、内距、边框与行数上限', ({ boxSizing, expected }) => {
    const el = textarea()
    mockMirrorMeasurements(document, [{ contentPaddingBox: 80, rowPaddingBox: 24 }])
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle({
      'border-bottom-width': '3px',
      'border-top-width': '2px',
      'box-sizing': boxSizing,
      'padding-bottom': '6px',
      'padding-top': '4px',
    }))

    autoSizeTextarea(el, { minRows: 2, maxRows: 4 })

    expect(el.style.blockSize).toBe(expected)
    expect(el.style.overflowY).toBe('auto')
  })

  it('非横向书写模式明确失败，并归还启用前的作者声明', () => {
    const el = textarea()
    el.style.setProperty('block-size', '41px', 'important')
    el.style.setProperty('overflow-y', 'scroll', 'important')
    const createElement = vi.spyOn(document, 'createElement')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle({ 'writing-mode': 'vertical-rl' }))

    expect(() => autoSizeTextarea(el, true)).toThrow(/只支持 writing-mode: horizontal-tb/)
    expect(createElement).not.toHaveBeenCalled()
    expect(el.style.getPropertyValue('block-size')).toBe('41px')
    expect(el.style.getPropertyValue('overflow-y')).toBe('scroll')
  })

  it('镜像读取失败时同步移除镜像并归还作者声明，下一次仍可重新启用', () => {
    const el = textarea()
    el.style.setProperty('block-size', '28px')
    el.style.setProperty('overflow-y', 'scroll')
    const failure = new Error('measure failed')
    const mirrors = mockMirrorMeasurements(document, [
      { contentPaddingBox: 0, rowPaddingBox: 0, error: failure },
      { contentPaddingBox: 40, rowPaddingBox: 15 },
    ])
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())

    expect(() => autoSizeTextarea(el, true)).toThrow(failure)
    expect(mirrors[0]!.isConnected).toBe(false)
    expect(el.style.blockSize).toBe('28px')
    expect(el.style.overflowY).toBe('scroll')

    autoSizeTextarea(el, true)
    expect(el.style.blockSize).toBe('41px')
    expect(el.style.overflowY).toBe('hidden')
    expect(mirrors[1]!.isConnected).toBe(false)
  })
})
