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
    'max-block-size': 'none',
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
  // 一次量高先后建两只镜像：第一只放内容、第二只放一个字；返回的是放内容的那几只
  let pairing: MirrorMeasurement | undefined
  vi.spyOn(doc, 'createElement').mockImplementation(((name: string, options?: ElementCreationOptions) => {
    const node = nativeCreate(name, options)
    if (name.toLowerCase() !== 'textarea')
      return node
    const textareaNode = node as HTMLTextAreaElement
    const isRow = pairing !== undefined
    const measurement = pairing ?? queue.shift()
    if (!measurement)
      throw new Error('测试没有提供下一次 textarea 镜像测量值')
    pairing = isRow ? undefined : measurement
    Object.defineProperty(textareaNode, 'scrollHeight', {
      configurable: true,
      get: () => {
        if (measurement.error !== undefined)
          throw measurement.error
        return isRow ? measurement.rowPaddingBox : measurement.contentPaddingBox
      },
    })
    if (!isRow)
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
    el.style.setProperty('max-block-size', '33px', 'important')
    el.style.setProperty('overflow-y', 'scroll', 'important')
    const nativePriority = el.style.getPropertyPriority.bind(el.style)
    vi.spyOn(el.style, 'getPropertyPriority').mockImplementation(name =>
      name === 'block-size' || name === 'max-block-size' || name === 'overflow-y' ? 'important' : nativePriority(name))
    const setProperty = vi.spyOn(el.style, 'setProperty')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())

    autoSizeTextarea(el, { minRows: 2, maxRows: 4 })
    expect(el.style.getPropertyValue('block-size')).toBe('46px')
    expect(el.style.getPropertyValue('max-block-size')).toBe('none')
    expect(el.style.getPropertyValue('overflow-y')).toBe('auto')
    expect(setProperty).toHaveBeenCalledWith('block-size', 'auto', 'important')
    expect(setProperty).toHaveBeenCalledWith('block-size', '46px', 'important')
    expect(setProperty).toHaveBeenCalledWith('max-block-size', 'none', 'important')
    expect(setProperty).toHaveBeenCalledWith('overflow-y', 'auto', 'important')

    autoSizeTextarea(el, { minRows: 2, maxRows: 8 })
    expect(el.style.getPropertyValue('block-size')).toBe('86px')

    autoSizeTextarea(el, false)
    expect(el.style.getPropertyValue('block-size')).toBe('37px')
    expect(el.style.getPropertyValue('max-block-size')).toBe('33px')
    expect(el.style.getPropertyValue('overflow-y')).toBe('scroll')
    expect(setProperty).toHaveBeenCalledWith('block-size', '37px', 'important')
    expect(setProperty).toHaveBeenCalledWith('max-block-size', '33px', 'important')
    expect(setProperty).toHaveBeenCalledWith('overflow-y', 'scroll', 'important')
    expect(mirrors).toHaveLength(2)
    expect(mirrors.every(mirror => !mirror.isConnected)).toBe(true)
    expect(mirrors[0]!.style.lineHeight).toBe('10px')
    expect(mirrors[0]!.style.width).toBe('180px')
  })

  it('作者原本没写内联尺寸时，关闭只移除 helper 自己取得的三项', () => {
    const el = textarea()
    mockMirrorMeasurements(document, [{ contentPaddingBox: 30, rowPaddingBox: 15 }])
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())

    autoSizeTextarea(el, true)
    expect(el.style.blockSize).toBe('31px')
    expect(el.style.maxBlockSize).toBe('none')
    expect(el.style.overflowY).toBe('hidden')

    autoSizeTextarea(el, undefined)
    expect(el.style.getPropertyValue('block-size')).toBe('')
    expect(el.style.getPropertyValue('max-block-size')).toBe('')
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

// 默认盒：border-box，上下内距 2 + 3、上边框 1；内容 padding-box 100 即声明盒 101，镜像单行 15 即一行 10。
describe('autoSizeTextarea 上限只有一处、滚动只在 textarea', () => {
  it('没给 maxRows 时按 textarea 自己的 max-block-size 封顶，超出后内部滚动', () => {
    const el = textarea()
    mockMirrorMeasurements(document, [{ contentPaddingBox: 100, rowPaddingBox: 15 }])
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle({ 'max-block-size': '50px' }))

    autoSizeTextarea(el, true)

    expect(el.style.blockSize).toBe('50px')
    expect(el.style.overflowY).toBe('auto')
  })

  it('给了 maxRows 时行数说了算：样式表的上限更低也不截，取值也不再读', () => {
    const el = textarea()
    mockMirrorMeasurements(document, [
      { contentPaddingBox: 100, rowPaddingBox: 15 },
      { contentPaddingBox: 100, rowPaddingBox: 15 },
    ])
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle({ 'max-block-size': '20px' }))

    autoSizeTextarea(el, { maxRows: 4 })
    // 4 行 = 4 × 10 + 内距 5 + 边框 1；样式表的 20px 由接管的 none 盖掉
    expect(el.style.blockSize).toBe('46px')
    expect(el.style.maxBlockSize).toBe('none')
    expect(el.style.overflowY).toBe('auto')

    getComputedStyle.mockReturnValue(computedStyle({ 'max-block-size': '50%' }))
    autoSizeTextarea(el, { maxRows: 4 })
    expect(el.style.blockSize).toBe('46px')
  })

  it('minRows 换算得比样式表上限高时以 minRows 为准', () => {
    const el = textarea()
    mockMirrorMeasurements(document, [
      { contentPaddingBox: 100, rowPaddingBox: 15 },
      { contentPaddingBox: 20, rowPaddingBox: 15 },
    ])
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle({ 'max-block-size': '30px' }))

    autoSizeTextarea(el, { minRows: 6 })
    expect(el.style.blockSize).toBe('66px')
    expect(el.style.maxBlockSize).toBe('none')
    expect(el.style.overflowY).toBe('auto')

    el.value = '短'
    autoSizeTextarea(el, { minRows: 6 })
    expect(el.style.blockSize).toBe('66px')
    expect(el.style.overflowY).toBe('hidden')
  })

  it('每次量高先归还作者的内联上限再读计算值，读不到上一次接管写下的 none', () => {
    const el = textarea()
    mockMirrorMeasurements(document, [
      { contentPaddingBox: 100, rowPaddingBox: 15 },
      { contentPaddingBox: 100, rowPaddingBox: 15 },
      { contentPaddingBox: 100, rowPaddingBox: 15 },
    ])
    const cascade = computedStyle()
    // 计算值按层叠走：内联声明在就取内联，否则取样式表给的 50px
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (property: string) => property === 'max-block-size'
        ? el.style.getPropertyValue('max-block-size') || '50px'
        : cascade.getPropertyValue(property),
    } as CSSStyleDeclaration)

    autoSizeTextarea(el, true)
    el.value = '换了一段内容'
    autoSizeTextarea(el, true)
    expect(el.style.blockSize).toBe('50px')

    autoSizeTextarea(el, false)
    el.style.setProperty('max-block-size', '40px')
    autoSizeTextarea(el, true)
    expect(el.style.blockSize).toBe('40px')
    expect(el.style.maxBlockSize).toBe('none')

    autoSizeTextarea(el, false)
    expect(el.style.maxBlockSize).toBe('40px')
  })

  it('max-block-size 不是 none 或 px 时明确失败，不猜布局后的高度，并归还作者声明', () => {
    const el = textarea()
    el.style.setProperty('block-size', '25px')
    el.style.setProperty('overflow-y', 'scroll')
    const createElement = vi.spyOn(document, 'createElement')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle({ 'max-block-size': '50%' }))

    expect(() => autoSizeTextarea(el, true)).toThrow(/只接受 none 或 px 的 max-block-size 计算值，当前为 50%/)
    expect(createElement).not.toHaveBeenCalled()
    expect(el.style.blockSize).toBe('25px')
    expect(el.style.getPropertyValue('max-block-size')).toBe('')
    expect(el.style.overflowY).toBe('scroll')
  })
})

class FakeResizeObserver {
  readonly targets = new Set<Element>()
  constructor(readonly callback: ResizeObserverCallback) {}
  observe(target: Element): void {
    this.targets.add(target)
  }

  unobserve(target: Element): void {
    this.targets.delete(target)
  }

  disconnect(): void {
    this.targets.clear()
  }

  resize(target: Element, inlineSize?: number): void {
    const entry = {
      target,
      borderBoxSize: inlineSize === undefined ? undefined : [{ inlineSize, blockSize: 0 }],
      contentRect: { width: inlineSize ?? 0 },
    }
    this.callback([entry as unknown as ResizeObserverEntry], this as unknown as ResizeObserver)
  }
}

/** 放进独立 iframe 的 textarea：自带一个 Window，观察器、字体与计算样式都只替换这一份。 */
function frameTextarea(): { frame: HTMLIFrameElement, win: Window & typeof globalThis, doc: Document, el: HTMLTextAreaElement } {
  const frame = document.createElement('iframe')
  document.body.append(frame)
  const win = frame.contentWindow! as Window & typeof globalThis
  const doc = frame.contentDocument!
  const el = doc.createElement('textarea')
  el.value = '一行真实内容'
  doc.body.append(el)
  return { frame, win, doc, el }
}

describe('autoSizeTextarea 量高的输入没变就不重量', () => {
  it('值、配置、排字样式与接管的内联声明都没变：不建镜像、不写内联声明', () => {
    const el = textarea()
    const mirrors = mockMirrorMeasurements(document, [{ contentPaddingBox: 30, rowPaddingBox: 15 }])
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())
    autoSizeTextarea(el, { maxRows: 4 })
    expect(el.style.blockSize).toBe('31px')

    const setProperty = vi.spyOn(el.style, 'setProperty')
    const removeProperty = vi.spyOn(el.style, 'removeProperty')
    autoSizeTextarea(el, { maxRows: 4 })
    expect(mirrors).toHaveLength(1)
    expect(setProperty).not.toHaveBeenCalled()
    expect(removeProperty).not.toHaveBeenCalled()
    expect(el.style.blockSize).toBe('31px')
  })

  it('两只镜像一起挂上再读高度：一次量高只排版一次，读完一起摘掉', () => {
    const el = textarea()
    const nativeCreate = document.createElement.bind(document)
    const created: HTMLTextAreaElement[] = []
    const connectedAtRead: boolean[][] = []
    vi.spyOn(document, 'createElement').mockImplementation(((name: string, options?: ElementCreationOptions) => {
      const node = nativeCreate(name, options)
      if (name.toLowerCase() !== 'textarea')
        return node
      const index = created.length
      created.push(node as HTMLTextAreaElement)
      Object.defineProperty(node, 'scrollHeight', {
        configurable: true,
        get: () => {
          connectedAtRead.push(created.map(mirror => mirror.isConnected))
          return index === 0 ? 30 : 15
        },
      })
      return node
    }) as typeof document.createElement)
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())

    autoSizeTextarea(el, true)

    expect(created).toHaveLength(2)
    expect(connectedAtRead).toEqual([[true, true], [true, true]])
    expect(created[0]!.value).toBe('一行真实内容')
    expect(created[1]!.value).toBe('x')
    expect(created.every(mirror => !mirror.isConnected)).toBe(true)
    expect(el.style.blockSize).toBe('31px')
  })

  it('没给 maxRows 时暂还作者的上限读样式表上限来比对，没变就原样放回', () => {
    const el = textarea()
    const mirrors = mockMirrorMeasurements(document, [
      { contentPaddingBox: 100, rowPaddingBox: 15 },
      { contentPaddingBox: 100, rowPaddingBox: 15 },
    ])
    let sheetCeiling = '50px'
    const cascade = computedStyle()
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (property: string) => property === 'max-block-size'
        ? el.style.getPropertyValue('max-block-size') || sheetCeiling
        : cascade.getPropertyValue(property),
    } as CSSStyleDeclaration)

    autoSizeTextarea(el, true)
    expect(el.style.blockSize).toBe('50px')
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(1)
    expect(el.style.maxBlockSize).toBe('none')

    sheetCeiling = '40px'
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(2)
    expect(el.style.blockSize).toBe('40px')
    expect(el.style.maxBlockSize).toBe('none')
  })

  it('排字样式变了照样重量', () => {
    const el = textarea()
    const mirrors = mockMirrorMeasurements(document, [
      { contentPaddingBox: 30, rowPaddingBox: 15 },
      { contentPaddingBox: 40, rowPaddingBox: 17 },
    ])
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())
    autoSizeTextarea(el, true)
    expect(el.style.blockSize).toBe('31px')

    getComputedStyle.mockReturnValue(computedStyle({ 'font-size': '12px' }))
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(2)
    expect(el.style.blockSize).toBe('41px')
  })

  it('接管的内联声明被别处改了照样重量、重写', () => {
    const el = textarea()
    const mirrors = mockMirrorMeasurements(document, [
      { contentPaddingBox: 30, rowPaddingBox: 15 },
      { contentPaddingBox: 30, rowPaddingBox: 15 },
    ])
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())
    autoSizeTextarea(el, true)

    el.style.setProperty('block-size', '10px')
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(2)
    expect(el.style.blockSize).toBe('31px')
  })

  it('书写方向改成竖排照旧明确失败，并归还作者声明', () => {
    const el = textarea()
    el.style.setProperty('block-size', '25px')
    mockMirrorMeasurements(document, [{ contentPaddingBox: 30, rowPaddingBox: 15 }])
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())
    autoSizeTextarea(el, true)

    getComputedStyle.mockReturnValue(computedStyle({ 'writing-mode': 'vertical-rl' }))
    expect(() => autoSizeTextarea(el, true)).toThrow(/只支持 writing-mode: horizontal-tb/)
    expect(el.style.blockSize).toBe('25px')
    expect(el.style.maxBlockSize).toBe('')
  })

  it('网页字体加载完，下一次更新即便输入没变也重量', () => {
    const { frame, win, doc, el } = frameTextarea()
    const fonts = new EventTarget()
    Object.defineProperty(doc, 'fonts', { configurable: true, value: fonts })
    win.getComputedStyle = (() => computedStyle()) as typeof win.getComputedStyle
    const mirrors = mockMirrorMeasurements(doc, [
      { contentPaddingBox: 30, rowPaddingBox: 15 },
      { contentPaddingBox: 40, rowPaddingBox: 15 },
    ])

    autoSizeTextarea(el, true)
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(1)

    fonts.dispatchEvent(new Event('loadingdone'))
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(2)
    expect(el.style.blockSize).toBe('41px')
    autoSizeTextarea(el, false)
    frame.remove()
  })

  it('宽度由 ResizeObserver 盯着：观察到的宽度与量高时一样不重量，变了按新宽度重量', () => {
    const { frame, win, doc, el } = frameTextarea()
    const observers: FakeResizeObserver[] = []
    win.ResizeObserver = class extends FakeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super(callback)
        observers.push(this)
      }
    } as unknown as typeof ResizeObserver
    let style = computedStyle()
    win.getComputedStyle = (() => style) as typeof win.getComputedStyle
    const mirrors = mockMirrorMeasurements(doc, [
      { contentPaddingBox: 30, rowPaddingBox: 15 },
      { contentPaddingBox: 60, rowPaddingBox: 15 },
    ])

    autoSizeTextarea(el, true)
    expect(observers).toHaveLength(1)
    expect(observers[0]!.targets.has(el)).toBe(true)

    // 首次观察到的宽度就是量高时的计算宽度；自己写 block-size 引起的观察宽度也不变
    observers[0]!.resize(el, 180)
    expect(mirrors).toHaveLength(1)

    observers[0]!.resize(el, 120)
    expect(mirrors).toHaveLength(2)
    expect(mirrors[1]!.style.width).toBe('120px')
    expect(mirrors[1]!.style.boxSizing).toBe('border-box')
    expect(el.style.blockSize).toBe('61px')
    observers[0]!.resize(el, 120)
    expect(mirrors).toHaveLength(2)

    // 有观察器时计算宽度不进比对
    style = computedStyle({ width: '999px' })
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(2)

    autoSizeTextarea(el, false)
    expect(observers[0]!.targets.has(el)).toBe(false)
    frame.remove()
  })

  it('观察器给不出边框盒尺寸：不再观察，重量一次，之后按计算宽度比对', () => {
    const { frame, win, doc, el } = frameTextarea()
    const observers: FakeResizeObserver[] = []
    win.ResizeObserver = class extends FakeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super(callback)
        observers.push(this)
      }
    } as unknown as typeof ResizeObserver
    let style = computedStyle()
    win.getComputedStyle = (() => style) as typeof win.getComputedStyle
    const mirrors = mockMirrorMeasurements(doc, [
      { contentPaddingBox: 30, rowPaddingBox: 15 },
      { contentPaddingBox: 30, rowPaddingBox: 15 },
      { contentPaddingBox: 60, rowPaddingBox: 15 },
    ])

    autoSizeTextarea(el, true)
    observers[0]!.resize(el)
    expect(observers[0]!.targets.has(el)).toBe(false)
    expect(mirrors).toHaveLength(2)

    style = computedStyle({ width: '120px' })
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(3)
    expect(mirrors[2]!.style.width).toBe('120px')
    autoSizeTextarea(el, false)
    frame.remove()
  })

  it('没有观察器的 Window 里宽度进比对：计算宽度变了照样重量', () => {
    const el = textarea()
    const mirrors = mockMirrorMeasurements(document, [
      { contentPaddingBox: 30, rowPaddingBox: 15 },
      { contentPaddingBox: 60, rowPaddingBox: 15 },
    ])
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())
    autoSizeTextarea(el, true)

    getComputedStyle.mockReturnValue(computedStyle({ width: '120px' }))
    autoSizeTextarea(el, true)
    expect(mirrors).toHaveLength(2)
    expect(mirrors[1]!.style.width).toBe('120px')
    expect(el.style.blockSize).toBe('61px')
  })
})

describe('没有排版的环境里安静跳过', () => {
  it('jsdom 的计算样式取不到写入方向、盒模型与行高：不抛错，不写任何内联声明', () => {
    const el = textarea()
    el.style.setProperty('block-size', '50px')
    expect(() => autoSizeTextarea(el, true)).not.toThrow()
    expect(() => autoSizeTextarea(el, { minRows: 2, maxRows: 4 })).not.toThrow()
    expect(el.style.blockSize).toBe('50px')
    expect(el.style.maxBlockSize).toBe('')
    expect(el.style.overflowY).toBe('')
    expect(document.querySelectorAll('textarea')).toHaveLength(1)
  })

  it.each(['writing-mode', 'box-sizing', 'line-height'])('只有 %s 取不到时同样跳过', (property) => {
    const el = textarea()
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle({ [property]: '' }))
    expect(() => autoSizeTextarea(el, true)).not.toThrow()
    expect(el.style.blockSize).toBe('')
  })

  it('镜像量出的 scrollHeight 两次都是 0：不抛错、不改高度，上限放回动手之前的样子，镜像照样摘掉', () => {
    const el = textarea()
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(computedStyle())
    mockMirrorMeasurements(document, [{ contentPaddingBox: 80, rowPaddingBox: 13 }, { contentPaddingBox: 0, rowPaddingBox: 0 }])
    autoSizeTextarea(el, true)
    const measured = { blockSize: el.style.blockSize, maxBlockSize: el.style.maxBlockSize, overflowY: el.style.overflowY }
    el.value = '换了一段内容'
    expect(() => autoSizeTextarea(el, true)).not.toThrow()
    expect({ blockSize: el.style.blockSize, maxBlockSize: el.style.maxBlockSize, overflowY: el.style.overflowY }).toEqual(measured)
    expect(document.querySelectorAll('textarea')).toHaveLength(1)
  })

  it('行数配置非法时照旧明确失败：没有排版也不吞掉配置错误', () => {
    const el = textarea()
    expect(() => autoSizeTextarea(el, { minRows: 0 })).toThrow(/TextField autoSize/)
  })
})
