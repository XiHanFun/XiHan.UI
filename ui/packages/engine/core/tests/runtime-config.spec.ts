// @vitest-environment jsdom
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PORTAL_ROOT_ID } from '../src/kernel/constants'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { createRuntimeConfig } from '../src/kernel/runtime-config'
import { createScope } from '../src/kernel/scope'
import { getLayerRegistry } from '../src/kernel/structure/layer-registry'

const originalMatchMedia = window.matchMedia

function mockMatchMedia(win: Window, matches: boolean): void {
  Object.defineProperty(win, 'matchMedia', {
    configurable: true,
    value: (media: string): MediaQueryList => ({
      matches,
      media,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  })
}

function mockLanguage(win: Window, language: string): void {
  Object.defineProperty(win.navigator, 'language', { configurable: true, value: language })
}

afterEach(() => {
  setMotionOverride(null)
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
  if (originalMatchMedia)
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: originalMatchMedia })
  else Reflect.deleteProperty(window, 'matchMedia')
})

describe('createRuntimeConfig · reducedMotion', () => {
  it('无 matchMedia 的宿主不抛、按不降级返回 false', () => {
    expect(typeof window.matchMedia).not.toBe('function')
    expect(createRuntimeConfig().reducedMotion()).toBe(false)
  })

  it('应用级 override 压过系统偏好', () => {
    const config = createRuntimeConfig()
    setMotionOverride('reduce')
    expect(config.reducedMotion()).toBe(true)
    setMotionOverride('no-preference')
    expect(config.reducedMotion()).toBe(false)
  })

  it('显式传入的 reducedMotion 原样保留', () => {
    const config = createRuntimeConfig({ reducedMotion: () => true })
    expect(config.reducedMotion()).toBe(true)
  })
})

describe('createRuntimeConfig · 显式 scope 的所属窗口', () => {
  function iframeScope(): { frame: HTMLIFrameElement, win: Window, doc: Document, scope: ReturnType<typeof createScope> } {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const win = frame.contentWindow!
    const doc = frame.contentDocument!
    const node = doc.createElement('div')
    doc.body.appendChild(node)
    return { frame, win, doc, scope: createScope(node, createCounterIdGenerator()) }
  }

  it('默认 layerRegistry 来自 scope 的 document', () => {
    const { doc, scope } = iframeScope()
    const config = createRuntimeConfig({ scope })

    expect(config.layerRegistry).toBe(getLayerRegistry(doc))
    expect(config.layerRegistry).not.toBe(getLayerRegistry(document))
  })

  it('默认 portalContainer 只在 scope 的 document 建根', () => {
    const { doc, scope } = iframeScope()
    const config = createRuntimeConfig({ scope })
    expect(doc.getElementById(PORTAL_ROOT_ID)).toBeNull()
    const portal = config.portalContainer()

    expect(portal?.ownerDocument).toBe(doc)
    expect(doc.getElementById(PORTAL_ROOT_ID)).toBe(portal)
    expect(document.getElementById(PORTAL_ROOT_ID)).toBeNull()
  })

  it('默认 reducedMotion 读取 scope 的 window', () => {
    const { win, scope } = iframeScope()
    mockMatchMedia(window, false)
    mockMatchMedia(win, true)

    expect(createRuntimeConfig({ scope }).reducedMotion()).toBe(true)
  })

  it('显式结构与动效配置压过 scope 派生默认', () => {
    const { scope } = iframeScope()
    const overrideRegistry = getLayerRegistry(document.implementation.createHTMLDocument('override'))
    const overridePortal = document.createElement('div')
    const config = createRuntimeConfig({
      scope,
      layerRegistry: overrideRegistry,
      portalContainer: () => overridePortal,
      reducedMotion: () => false,
    })

    expect(config.layerRegistry).toBe(overrideRegistry)
    expect(config.portalContainer()).toBe(overridePortal)
    expect(config.reducedMotion()).toBe(false)
  })

  it('全局 motion override 仍压过 scope 窗口的媒体查询', () => {
    const { win, scope } = iframeScope()
    mockMatchMedia(win, false)
    const config = createRuntimeConfig({ scope })
    setMotionOverride('reduce')
    expect(config.reducedMotion()).toBe(true)
  })

  it('无全局 DOM 时必须提供完整 scope，单独 registry 不再制造空 scope', () => {
    const { win, doc, scope } = iframeScope()
    mockLanguage(win, 'zh-CN')
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('Node', undefined)
    vi.stubGlobal('Document', undefined)
    vi.stubGlobal('Window', undefined)
    vi.stubGlobal('Element', undefined)
    vi.stubGlobal('HTMLElement', undefined)
    vi.stubGlobal('ShadowRoot', undefined)

    try {
      expect(() => createRuntimeConfig()).toThrow(/必须显式提供 scope/)
      expect(() => createRuntimeConfig({ layerRegistry: getLayerRegistry(doc) })).toThrow(/必须显式提供 scope/)

      const scoped = createRuntimeConfig({ scope })
      expect(scoped.layerRegistry).toBe(getLayerRegistry(doc))
      expect(scoped.portalContainer()?.ownerDocument).toBe(doc)
      expect(scoped.locale).toBe('zh-CN')
      mockMatchMedia(win, true)
      expect(scoped.reducedMotion()).toBe(true)
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('scope getter 异常保留 cause 并统一错误前缀', () => {
    const { scope } = iframeScope()
    const cause = new Error('读取失败')
    const invalid = {
      ...scope,
      getDoc: (): Document => {
        throw cause
      },
    }

    try {
      createRuntimeConfig({ scope: invalid })
      throw new Error('预期 createRuntimeConfig 抛错')
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('无法从 scope 解析有效')
      expect((error as Error).cause).toBe(cause)
    }
  })

  it('拒绝伪 Document/Window 与 root、document、window 不配对', () => {
    const { win, doc, scope } = iframeScope()
    expect(() => createRuntimeConfig({
      scope: { ...scope, getDoc: () => ({}) as Document },
    })).toThrow(/无法从 scope 解析有效/)
    expect(() => createRuntimeConfig({
      scope: { ...scope, getWin: () => window },
    })).toThrow(/不一致/)
    expect(() => createRuntimeConfig({
      scope: { ...scope, getRootNode: () => document },
    })).toThrow(/不一致/)
    expect(doc.defaultView).toBe(win)
  })

  it('拒绝没有活动 Window 的离线 Document scope', () => {
    const detached = document.implementation.createHTMLDocument('detached')
    const node = detached.createElement('div')
    const scope = createScope(node, createCounterIdGenerator())

    expect(detached.defaultView).toBeNull()
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('Node', undefined)
    vi.stubGlobal('Document', undefined)
    vi.stubGlobal('Window', undefined)
    vi.stubGlobal('Element', undefined)
    vi.stubGlobal('HTMLElement', undefined)
    vi.stubGlobal('ShadowRoot', undefined)
    try {
      try {
        createRuntimeConfig({ scope })
        throw new Error('预期 createRuntimeConfig 拒绝离线 Document')
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('无法从 scope 解析有效')
        expect((error as Error).cause).toBeInstanceOf(Error)
        expect(((error as Error).cause as Error).message).toContain('没有活动 Window')
      }
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('默认 portal 缺少 body 时给出稳定错误，显式容器仍优先', () => {
    const { doc, scope } = iframeScope()
    doc.body.remove()
    const config = createRuntimeConfig({ scope })
    expect(() => config.portalContainer()).toThrow(/Document\.body/)

    const custom = document.createElement('div')
    expect(createRuntimeConfig({ scope, portalContainer: () => custom }).portalContainer()).toBe(custom)
  })
})
