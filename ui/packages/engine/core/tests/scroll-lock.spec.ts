// @vitest-environment jsdom
import type { RuntimeConfig } from '../src/kernel'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { acquireScrollLock } from '../src/behavior/scroll-lock'
import {
  createCounterIdGenerator,
  createRuntimeConfig,
  createScope,
} from '../src/kernel'

const GUTTER_VAR = '--xh-scroll-lock-gutter'
const cleanups: Array<() => void> = []

function configFor(
  scrollRoot: () => HTMLElement | null = () => null,
  doc: Document = document,
): RuntimeConfig {
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(doc.body, idGenerator)
  return createRuntimeConfig({ scope, idGenerator, scrollRoot })
}

function lock(config: RuntimeConfig) {
  const handle = acquireScrollLock({ config })
  cleanups.push(() => handle.dispose())
  return handle
}

/** jsdom 不排版，几何值直接盖在实例上。 */
function fakeGeometry(el: Element, geometry: Record<string, number>): void {
  for (const [key, value] of Object.entries(geometry))
    Object.defineProperty(el, key, { value, configurable: true })
}

function scrollableBox(doc: Document = document): HTMLElement {
  const el = doc.createElement('div')
  el.style.overflowY = 'auto'
  doc.body.append(el)
  fakeGeometry(el, { scrollHeight: 2000, clientHeight: 600, clientWidth: 785, offsetWidth: 800 })
  cleanups.push(() => el.remove())
  return el
}

function captureThrown(action: () => void): { threw: boolean, error: unknown } {
  try {
    action()
    return { threw: false, error: null }
  }
  catch (error) {
    return { threw: true, error }
  }
}

/** jsdom 丢弃 CSS priority；这层只补齐 CSSStyleDeclaration 的标准行为供合同测试。 */
function emulatePriorities(style: CSSStyleDeclaration): void {
  const priorities = new Map<string, string>()
  const nativeSet = style.setProperty.bind(style)
  const nativePriority = style.getPropertyPriority.bind(style)
  vi.spyOn(style, 'setProperty').mockImplementation((property, value, priority) => {
    nativeSet(property, value, priority)
    if (value === '')
      priorities.delete(property)
    else
      priorities.set(property, priority ?? '')
  })
  vi.spyOn(style, 'getPropertyPriority').mockImplementation(property => (
    priorities.get(property) ?? nativePriority(property)
  ))
}

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) {
    try {
      cleanup()
    }
    catch {}
  }
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  document.body.style.cssText = ''
  document.documentElement.style.cssText = ''
  for (const key of ['scrollHeight', 'clientHeight', 'clientWidth'])
    Reflect.deleteProperty(document.documentElement, key)
  Object.defineProperty(window, 'scrollX', { value: 0, configurable: true })
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})

describe('acquireScrollLock 目标合同', () => {
  it('scrollRoot 返回 null 时明确锁页面，不扫描看似可滚的后代', () => {
    const child = scrollableBox()
    const add = vi.spyOn(window, 'addEventListener')

    const handle = lock(configFor())

    expect(document.body.style.position).toBe('fixed')
    expect(child.style.overflow).toBe('')
    expect(child.style.overflowY).toBe('auto')
    expect(add).not.toHaveBeenCalled()
    handle.dispose()
  })

  it('null、body、documentElement 与 scrollingElement 归一为同一页面目标', () => {
    const handles = [
      lock(configFor(() => null)),
      lock(configFor(() => document.body)),
      lock(configFor(() => document.documentElement)),
      lock(configFor(() => document.scrollingElement as HTMLElement | null)),
    ]

    expect(document.body.style.position).toBe('fixed')
    for (const handle of handles.slice(0, -1))
      handle.dispose()
    expect(document.body.style.position).toBe('fixed')
    handles.at(-1)!.dispose()
    expect(document.body.style.position).toBe('')
  })

  it('显式容器只锁自身，body 保持不动', () => {
    const el = scrollableBox()
    const handle = lock(configFor(() => el))

    expect(el.style.overflow).toBe('hidden')
    expect(document.body.style.position).toBe('')
    handle.dispose()
    expect(el.style.overflow).toBe('')
  })

  it('同一 Document 已锁一个目标时，第二个不同目标明确失败且不改变首锁', () => {
    const first = scrollableBox()
    const second = scrollableBox()
    const handle = lock(configFor(() => first))

    expect(() => acquireScrollLock({ config: configFor(() => second) }))
      .toThrow(/同一 Document.*不能同时锁定不同目标/)
    expect(first.style.overflow).toBe('hidden')
    expect(second.style.overflow).toBe('')

    handle.dispose()
    expect(first.style.overflow).toBe('')
  })

  it('scrollRoot getter 的 acquire/dispose 重入均被拒绝，既有句柄仍可正常释放', () => {
    const el = scrollableBox()
    const stableConfig = configFor(() => el)
    const first = lock(stableConfig)
    let acquireError: unknown
    let disposeError: unknown
    const reentrantConfig = configFor(() => {
      try {
        acquireScrollLock({ config: stableConfig })
      }
      catch (error) {
        acquireError = error
      }
      try {
        first.dispose()
      }
      catch (error) {
        disposeError = error
      }
      return el
    })

    const second = lock(reentrantConfig)

    expect(acquireError).toBeInstanceOf(Error)
    expect((acquireError as Error).message).toMatch(/正在切换.*epoch/)
    expect(disposeError).toBeInstanceOf(Error)
    expect((disposeError as Error).message).toMatch(/正在切换.*epoch/)
    second.dispose()
    expect(el.style.overflow).toBe('hidden')
    first.dispose()
    expect(el.style.overflow).toBe('')

    const retry = lock(stableConfig)
    expect(el.style.overflow).toBe('hidden')
    retry.dispose()
  })

  it('跨 Document、未连接与非 HTMLElement 根均在写样式前失败', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    cleanups.push(() => frame.remove())
    const foreign = frame.contentDocument!.createElement('div')
    frame.contentDocument!.body.append(foreign)
    const detached = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    expect(() => acquireScrollLock({ config: configFor(() => foreign) }))
      .toThrow(/scrollRoot 必须属于 Scope Document/)
    expect(() => acquireScrollLock({ config: configFor(() => detached) }))
      .toThrow(/scrollRoot 必须已连接/)
    expect(() => acquireScrollLock({ config: configFor(() => svg as unknown as HTMLElement) }))
      .toThrow(/原生 HTMLElement 或 null/)
    expect(document.body.style.cssText).toBe('')
  })

  it('缺少 scrollRoot 与 Scope Window 混接都明确失败', () => {
    const valid = configFor()
    const missing = { ...valid, scrollRoot: undefined } as unknown as RuntimeConfig
    expect(() => acquireScrollLock({ config: missing })).toThrow(/scrollRoot 必须是函数/)

    const frame = document.createElement('iframe')
    document.body.append(frame)
    cleanups.push(() => frame.remove())
    const mixed = {
      ...valid,
      scope: { ...valid.scope, getWin: () => frame.contentWindow! },
    } as unknown as RuntimeConfig
    expect(() => acquireScrollLock({ config: mixed })).toThrow(/Document 与 Window 不一致/)
    expect(document.body.style.cssText).toBe('')
  })

  it('iframe 页面只使用所属 Window、Document 与 scrollTo', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    cleanups.push(() => frame.remove())
    const doc = frame.contentDocument!
    const win = frame.contentWindow!
    Object.defineProperty(win, 'scrollX', { value: 12, configurable: true })
    Object.defineProperty(win, 'scrollY', { value: 34, configurable: true })
    const frameScrollTo = vi.spyOn(win, 'scrollTo').mockImplementation(() => {})
    const mainScrollTo = vi.mocked(window.scrollTo)

    const handle = lock(configFor(() => null, doc))

    expect(doc.body.style.position).toBe('fixed')
    expect(doc.body.style.left).toBe('-12px')
    expect(doc.body.style.top).toBe('-34px')
    expect(document.body.style.position).toBe('')
    handle.dispose()
    expect(frameScrollTo).toHaveBeenCalledWith({ left: 12, top: 34, behavior: 'instant' })
    expect(mainScrollTo).not.toHaveBeenCalled()
  })
})

describe('acquireScrollLock epoch 与恢复', () => {
  it('相同目标引用计数只应用一次，最后一个句柄释放后才复原', () => {
    const el = scrollableBox()
    const config = configFor(() => el)
    const first = lock(config)
    const second = lock(config)

    expect(el.style.paddingInlineEnd).toBe('15px')
    first.dispose()
    expect(el.style.overflow).toBe('hidden')
    second.dispose()
    expect(el.style.overflow).toBe('')
    expect(el.style.paddingInlineEnd).toBe('')
  })

  it('页面保存双轴位置并以 instant 行为恢复，避免继承 smooth', () => {
    Object.defineProperty(window, 'scrollX', { value: 45, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true })
    const scrollTo = vi.mocked(window.scrollTo)
    const handle = lock(configFor())

    expect(document.body.style.left).toBe('-45px')
    expect(document.body.style.top).toBe('-120px')
    handle.dispose()

    expect(scrollTo).toHaveBeenCalledWith({ left: 45, top: 120, behavior: 'instant' })
  })

  it('容器保存并恢复 scrollLeft 与 scrollTop', () => {
    const el = scrollableBox()
    el.scrollLeft = 17
    el.scrollTop = 33
    const handle = lock(configFor(() => el))
    el.scrollLeft = 91
    el.scrollTop = 92

    handle.dispose()

    expect(el.scrollLeft).toBe(17)
    expect(el.scrollTop).toBe(33)
  })

  it('精确恢复样式值、important 优先级与既有 gutter 变量', () => {
    const el = scrollableBox()
    emulatePriorities(el.style)
    emulatePriorities(document.documentElement.style)
    el.style.setProperty('overflow', 'scroll', 'important')
    el.style.setProperty('padding-inline-end', '8px', 'important')
    document.documentElement.style.setProperty(GUTTER_VAR, '7px', 'important')
    const handle = lock(configFor(() => el))

    expect(el.style.getPropertyValue('overflow')).toBe('hidden')
    expect(el.style.getPropertyPriority('overflow')).toBe('important')
    expect(el.style.getPropertyValue('padding-inline-end')).toBe('23px')
    expect(el.style.getPropertyPriority('padding-inline-end')).toBe('important')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('15px')
    expect(document.documentElement.style.getPropertyPriority(GUTTER_VAR)).toBe('important')

    handle.dispose()
    expect(el.style.getPropertyValue('overflow')).toBe('scroll')
    expect(el.style.getPropertyPriority('overflow')).toBe('important')
    expect(el.style.getPropertyValue('padding-inline-end')).toBe('8px')
    expect(el.style.getPropertyPriority('padding-inline-end')).toBe('important')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('7px')
    expect(document.documentElement.style.getPropertyPriority(GUTTER_VAR)).toBe('important')
  })

  it('业务在锁期间改过的样式与 gutter 不被旧 epoch 覆盖', () => {
    emulatePriorities(document.body.style)
    emulatePriorities(document.documentElement.style)
    const handle = lock(configFor())
    document.body.style.setProperty('position', 'absolute', 'important')
    document.body.style.setProperty('overflow', 'clip', 'important')
    document.documentElement.style.setProperty(GUTTER_VAR, '99px', 'important')

    handle.dispose()

    expect(document.body.style.getPropertyValue('position')).toBe('absolute')
    expect(document.body.style.getPropertyPriority('position')).toBe('important')
    expect(document.body.style.getPropertyValue('overflow')).toBe('clip')
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('99px')
    expect(document.documentElement.style.getPropertyPriority(GUTTER_VAR)).toBe('important')
    expect(document.body.style.top).toBe('')
    expect(document.body.style.left).toBe('')
    expect(document.body.style.width).toBe('')
  })

  it('几何差值为零时不触碰原 padding，只临时写 0px gutter', () => {
    const el = scrollableBox()
    emulatePriorities(el.style)
    fakeGeometry(el, { scrollHeight: 600, clientHeight: 600, clientWidth: 785, offsetWidth: 785 })
    el.style.setProperty('padding-inline-end', '8px', 'important')
    const handle = lock(configFor(() => el))

    expect(el.style.getPropertyValue('padding-inline-end')).toBe('8px')
    expect(el.style.getPropertyPriority('padding-inline-end')).toBe('important')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('0px')
    handle.dispose()
    expect(el.style.getPropertyValue('padding-inline-end')).toBe('8px')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('')
  })

  it('强制滚动条即使内容未溢出也按页面与容器几何差值补偿', () => {
    fakeGeometry(document.documentElement, { scrollHeight: 600, clientHeight: 600, clientWidth: 1009 })
    const page = lock(configFor())
    expect(document.body.style.paddingInlineEnd).toBe('15px')
    page.dispose()

    const el = scrollableBox()
    fakeGeometry(el, { scrollHeight: 600, clientHeight: 600, clientWidth: 785, offsetWidth: 800 })
    const custom = lock(configFor(() => el))
    expect(el.style.paddingInlineEnd).toBe('15px')
    custom.dispose()
  })

  it('scrollbar-gutter stable 已预留空间时补偿为零，避免重复留白', () => {
    document.documentElement.style.setProperty('scrollbar-gutter', 'stable')
    fakeGeometry(document.documentElement, { clientWidth: 1009 })
    const page = lock(configFor())
    expect(document.body.style.paddingInlineEnd).toBe('')
    page.dispose()
    document.documentElement.style.removeProperty('scrollbar-gutter')

    const el = scrollableBox()
    el.style.setProperty('scrollbar-gutter', 'stable')
    el.style.paddingInlineEnd = '8px'

    const handle = lock(configFor(() => el))

    expect(el.style.paddingInlineEnd).toBe('8px')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('0px')
    handle.dispose()
  })

  it('样式写入完成后抛错会逆序回滚，状态可立即重新获取', () => {
    const setupError = new Error('overflow set failed')
    const nativeSet = document.body.style.setProperty.bind(document.body.style)
    let fail = true
    const set = vi.spyOn(document.body.style, 'setProperty').mockImplementation((property, value, priority) => {
      nativeSet(property, value, priority)
      if (property === 'overflow' && fail) {
        fail = false
        throw setupError
      }
    })

    expect(() => acquireScrollLock({ config: configFor() })).toThrow(setupError)
    expect(document.body.style.cssText).toBe('')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('')

    set.mockRestore()
    const retry = lock(configFor())
    expect(document.body.style.position).toBe('fixed')
    retry.dispose()
  })

  it('初始化主异常与回滚异常一起报告，并以主异常为 cause', () => {
    const setupError = new Error('gutter set failed')
    const rollbackError = new Error('overflow rollback failed')
    document.body.style.setProperty('overflow', 'auto')
    const nativeBodySet = document.body.style.setProperty.bind(document.body.style)
    vi.spyOn(document.body.style, 'setProperty').mockImplementation((property, value, priority) => {
      nativeBodySet(property, value, priority)
      if (property === 'overflow' && value === 'auto')
        throw rollbackError
    })
    const nativeRootSet = document.documentElement.style.setProperty.bind(document.documentElement.style)
    let failGutter = true
    vi.spyOn(document.documentElement.style, 'setProperty').mockImplementation((property, value, priority) => {
      nativeRootSet(property, value, priority)
      if (property === GUTTER_VAR && failGutter) {
        failGutter = false
        throw setupError
      }
    })

    const caught = captureThrown(() => acquireScrollLock({ config: configFor() }))
    const aggregate = caught.error as AggregateError

    expect(caught.threw).toBe(true)
    expect(aggregate).toBeInstanceOf(AggregateError)
    expect(aggregate.errors).toEqual([setupError, rollbackError])
    expect(aggregate.cause).toBe(setupError)
    expect(document.body.style.position).toBe('')
  })

  it('最终释放先进入终态，再完整聚合样式与滚动恢复错误', () => {
    const overflowError = new Error('overflow restore failed')
    const positionError = new Error('position restore failed')
    const scrollError = new Error('scroll restore failed')
    const handle = lock(configFor())
    const nativeSet = document.body.style.setProperty.bind(document.body.style)
    vi.spyOn(document.body.style, 'setProperty').mockImplementation((property, value, priority) => {
      nativeSet(property, value, priority)
      if (property === 'overflow' && value === '')
        throw overflowError
      if (property === 'position' && value === '')
        throw positionError
    })
    vi.mocked(window.scrollTo).mockImplementation(() => {
      throw scrollError
    })

    const caught = captureThrown(handle.dispose)
    const aggregate = caught.error as AggregateError

    expect(aggregate).toBeInstanceOf(AggregateError)
    expect(aggregate.errors).toEqual([overflowError, positionError, scrollError])
    expect(aggregate.cause).toBe(overflowError)
    expect(document.body.style.position).toBe('')
    expect(document.body.style.overflow).toBe('')

    vi.restoreAllMocks()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const retry = lock(configFor())
    expect(document.body.style.position).toBe('fixed')
    retry.dispose()
  })

  it.each([undefined, null])('最终释放唯一 cleanup 抛出 %s 时原样上抛且句柄保持幂等', (failure) => {
    const handle = lock(configFor())
    vi.mocked(window.scrollTo).mockImplementation(() => {
      throw failure
    })

    const caught = captureThrown(handle.dispose)

    expect(caught.threw).toBe(true)
    expect(Object.is(caught.error, failure)).toBe(true)
    expect(() => handle.dispose()).not.toThrow()
  })
})
