// @vitest-environment jsdom
// 观察器的构造器必须从被观测节点自己的文档取。跨 iframe 时全局的那个来自另一个 window，
// 拿它去观测别的文档里的节点，回调一次都不会来——而且不报错，是静默失效。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let startSkinCheck: (typeof import('../src/kernel/diagnostics/skin-check'))['startSkinCheck']

// 「每个 scope 只探一次」的记账挂在模块上，逐条用例重取一份模块拿出厂状态
beforeEach(async () => {
  vi.resetModules()
  startSkinCheck = (await import('../src/kernel/diagnostics/skin-check')).startSkinCheck
})

/** 造一个独立文档，并记下它自己的 MutationObserver 被构造了几次。 */
function foreignDocument() {
  const frame = document.createElement('iframe')
  document.body.append(frame)
  const doc = frame.contentDocument!
  const view = frame.contentWindow! as Window & typeof globalThis
  const spy = vi.fn()
  const Native = view.MutationObserver
  class Counted extends Native {
    constructor(cb: MutationCallback) {
      spy()
      super(cb)
    }
  }
  view.MutationObserver = Counted as unknown as typeof MutationObserver
  return { doc, spy, cleanup: () => frame.remove() }
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

async function flush(win: Window): Promise<void> {
  await new Promise<void>(resolve => win.setTimeout(resolve, 0))
}

describe('跨文档的观察器', () => {
  it('观测另一个文档里的节点时，用的是那个文档的构造器', () => {
    const { doc, spy, cleanup } = foreignDocument()
    const host = doc.createElement('div')
    doc.body.append(host)

    const stop = startSkinCheck({ root: host })
    expect(spy).toHaveBeenCalled()
    stop()
    cleanup()
  })

  it('root 传 Document 本身也认得出文档——它自己的 ownerDocument 是 null', () => {
    const { doc, spy, cleanup } = foreignDocument()
    const stop = startSkinCheck({ root: doc })
    expect(spy).toHaveBeenCalled()
    stop()
    cleanup()
  })

  it('同名 scope 在主文档与 iframe 中分别探测', () => {
    const style = document.createElement('style')
    style.textContent = `[data-scope='shared-realm'] { --xh-shared-realm-skin: 1; }`
    document.head.appendChild(style)
    const main = document.createElement('div')
    main.dataset.scope = 'shared-realm'
    document.body.appendChild(main)
    const mainStyle = vi.spyOn(window, 'getComputedStyle')
    const stopMain = startSkinCheck({ root: document })

    const { doc, cleanup } = foreignDocument()
    const foreign = doc.createElement('div')
    foreign.dataset.scope = 'shared-realm'
    doc.body.appendChild(foreign)
    const foreignStyle = vi.spyOn(doc.defaultView!, 'getComputedStyle')
    const stopForeign = startSkinCheck({ root: doc })

    expect(mainStyle).toHaveBeenCalledWith(main)
    expect(foreignStyle).toHaveBeenCalledWith(foreign)
    stopMain()
    stopForeign()
    mainStyle.mockRestore()
    foreignStyle.mockRestore()
    style.remove()
    cleanup()
  })

  it('iframe 后续加入的 scope 用所属 realm 识别元素并读取计算样式', async () => {
    const { doc, cleanup } = foreignDocument()
    const view = doc.defaultView!
    const getStyle = vi.spyOn(view, 'getComputedStyle')
    const host = doc.createElement('div')
    doc.body.append(host)
    const stop = startSkinCheck({ root: host })
    const component = doc.createElement('div')
    component.dataset.scope = 'foreign-late'
    host.appendChild(component)

    await flush(view)
    expect(getStyle).toHaveBeenCalledWith(component)
    stop()
    cleanup()
  })

  it('顶层 DOM globals 缺失时仍可观测显式外部 root', async () => {
    const { doc, cleanup } = foreignDocument()
    const view = doc.defaultView!
    const getStyle = vi.spyOn(view, 'getComputedStyle')
    const host = doc.createElement('div')
    doc.body.append(host)
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('Element', undefined)

    const stop = startSkinCheck({ root: host })
    const component = doc.createElement('div')
    component.dataset.scope = 'foreign-without-globals'
    host.appendChild(component)
    await flush(view)
    expect(getStyle).toHaveBeenCalledWith(component)
    stop()
    vi.unstubAllGlobals()
    cleanup()
  })

  it('显式 root 没有活动 Window 或 MutationObserver 时明确失败', () => {
    const offline = document.implementation.createHTMLDocument('offline')
    expect(() => startSkinCheck({ root: offline })).toThrow(/活动 Window/)

    const { doc, cleanup } = foreignDocument()
    const view = doc.defaultView!
    Object.defineProperty(view, 'MutationObserver', { configurable: true, value: undefined })
    expect(() => startSkinCheck({ root: doc })).toThrow(/MutationObserver/)
    cleanup()
  })
})
