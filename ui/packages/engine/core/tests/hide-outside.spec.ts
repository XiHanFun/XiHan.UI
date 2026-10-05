// @vitest-environment jsdom

import type { Cleanup } from '../src/kernel/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAriaHiddenRegistry } from '../src/kernel/capability/a11y/aria-hidden-registry'
import { hideOutside } from '../src/kernel/capability/a11y/hide-outside'
import { DATA_INERT_EXEMPT } from '../src/kernel/constants'
import { setDiagnosticsConsoleOutput } from '../src/kernel/diagnostics/channel'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { createScope } from '../src/kernel/scope'
import { createLayerRegistry, getLayerRegistry } from '../src/kernel/structure/layer-registry'

/** 是否被藏起：aria-hidden 写成 "true" 才算。 */
function hiddenOf(el: Element): boolean {
  return el.getAttribute('aria-hidden') === 'true'
}

function countOf(el: Element): number {
  return getAriaHiddenRegistry(document).countOf(el as HTMLElement)
}

/** 等 MutationObserver 的微任务与一轮宏任务。 */
async function flush(win: Window = window): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => win.setTimeout(resolve, 0))
}

interface Overlay {
  node: HTMLElement
  /** 只撤藏起，不退层。 */
  unhide: Cleanup
  /** 只退层，不撤藏起。 */
  unregister: Cleanup
  /** 照机器里的拆除顺序：先撤藏起再退层。 */
  close: Cleanup
}

const cleanups: Cleanup[] = []
const scope = createScope(null, createCounterIdGenerator())

/** 开一层模态浮层：游离节点挂到 body、登记进层栈，再照 dialog 机器的口径罩住背景。 */
function openOverlay(node: HTMLElement = document.createElement('div')): Overlay {
  const registry = getLayerRegistry(document)
  if (!node.isConnected)
    document.body.appendChild(node)

  const { layer, dispose } = registry.register({
    kind: 'modal',
    node: () => node,
    branches: () => [],
    isModal: () => true,
    surfaces: () => [],
  })
  const unhide = hideOutside(
    () => [node, ...registry.elementsAbove(layer)],
    { scope, layerRegistry: registry },
  )
  const overlay: Overlay = {
    node,
    unhide,
    unregister: dispose,
    close: () => {
      unhide()
      dispose()
    },
  }
  cleanups.push(overlay.close)
  return overlay
}

function appendBackground(): HTMLElement {
  const el = document.createElement('div')
  el.textContent = '背景'
  document.body.appendChild(el)
  return el
}

function div(id: string): HTMLElement {
  const el = document.createElement('div')
  el.id = id
  return el
}

/** 不登记层，直接对给定 target 施加一次背景失活。 */
function hide(...targets: Element[]): Cleanup {
  const cleanup = hideOutside(
    () => targets,
    { scope, layerRegistry: getLayerRegistry(document) },
  )
  cleanups.push(cleanup)
  return cleanup
}

beforeEach(() => {
  // 乱序拆层会投递 layerDisposeNotTop，是被测行为本身，别让它刷屏
  setDiagnosticsConsoleOutput(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
  for (const fn of cleanups.splice(0).reverse()) fn()
  document.body.innerHTML = ''
  setDiagnosticsConsoleOutput(true)
})

describe('hideOutside 单层', () => {
  it('开关一轮后背景回到原始值', async () => {
    const bg = appendBackground()
    const overlay = openOverlay()
    await flush()

    expect(hiddenOf(bg)).toBe(true)
    expect(hiddenOf(overlay.node)).toBe(false)

    overlay.close()
    await flush()
    expect(hiddenOf(bg)).toBe(false)
    expect(countOf(bg)).toBe(0)
  })

  it('豁免节点不被罩住', async () => {
    const exempt = appendBackground()
    exempt.setAttribute(DATA_INERT_EXEMPT, '')
    const overlay = openOverlay()
    await flush()

    expect(hiddenOf(exempt)).toBe(false)
    overlay.close()
  })

  it('重复 dispose 只减一次计数', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    const inner = openOverlay()
    await flush()
    expect(countOf(bg)).toBe(2)

    outer.unhide()
    outer.unhide()
    expect(countOf(bg)).toBe(1)
    expect(hiddenOf(bg)).toBe(true)

    outer.unregister()
    inner.close()
    await flush()
    expect(hiddenOf(bg)).toBe(false)
    expect(countOf(bg)).toBe(0)
  })
})

describe('hideOutside 多层拆除', () => {
  it('两层顺序拆除（内层先关）后全部复位', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    const inner = openOverlay()
    await flush()

    expect(hiddenOf(bg)).toBe(true)
    expect(hiddenOf(outer.node)).toBe(true)
    expect(hiddenOf(inner.node)).toBe(false)
    expect(countOf(bg)).toBe(2)

    inner.close()
    await flush()
    expect(hiddenOf(bg)).toBe(true)
    expect(hiddenOf(outer.node)).toBe(false)

    outer.close()
    await flush()
    expect(hiddenOf(bg)).toBe(false)
    expect(hiddenOf(outer.node)).toBe(false)
    expect(hiddenOf(inner.node)).toBe(false)
  })

  it('两层乱序拆除（外层先关）后同样复位', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    const inner = openOverlay()
    await flush()
    expect(hiddenOf(bg)).toBe(true)

    outer.close()
    await flush()
    // 内层还开着，背景仍失活
    expect(hiddenOf(bg)).toBe(true)
    expect(countOf(bg)).toBe(1)

    inner.close()
    await flush()
    expect(hiddenOf(bg)).toBe(false)
    expect(hiddenOf(outer.node)).toBe(false)
    expect(hiddenOf(inner.node)).toBe(false)
    expect(countOf(bg)).toBe(0)
  })

  it('三层嵌套按由外向内的顺序拆除后全部复位', async () => {
    const bg = appendBackground()
    const first = openOverlay()
    const second = openOverlay()
    const third = openOverlay()
    await flush()
    expect(countOf(bg)).toBe(3)
    expect(hiddenOf(third.node)).toBe(false)

    first.close()
    await flush()
    expect(hiddenOf(bg)).toBe(true)
    expect(countOf(bg)).toBe(2)

    second.close()
    await flush()
    expect(hiddenOf(bg)).toBe(true)
    expect(countOf(bg)).toBe(1)

    third.close()
    await flush()
    expect(hiddenOf(bg)).toBe(false)
    expect(hiddenOf(first.node)).toBe(false)
    expect(hiddenOf(second.node)).toBe(false)
    expect(hiddenOf(third.node)).toBe(false)
    expect(countOf(bg)).toBe(0)
  })

  it('宿主自己写的 aria-hidden 在全部拆除后仍然保留', async () => {
    const bg = appendBackground()
    bg.setAttribute('aria-hidden', 'true')

    const outer = openOverlay()
    const inner = openOverlay()
    await flush()
    expect(hiddenOf(bg)).toBe(true)

    outer.close()
    inner.close()
    await flush()
    expect(hiddenOf(bg)).toBe(true)
    expect(countOf(bg)).toBe(0)
  })
})

describe('hideOutside 跟随层栈重算', () => {
  it('只跟随 targets 使用的自定义层栈重算', async () => {
    const bg = appendBackground()
    const lowerNode = document.createElement('div')
    const upperNode = document.createElement('div')
    document.body.append(lowerNode, upperNode)
    const customRegistry = createLayerRegistry(document)
    const ambientRegistry = getLayerRegistry(document)
    const lower = customRegistry.register({
      kind: 'modal',
      node: () => lowerNode,
      branches: () => [],
      isModal: () => true,
      surfaces: () => [],
    })
    cleanups.push(lower.dispose)
    const cleanup = hideOutside(
      () => [lowerNode, ...customRegistry.elementsAbove(lower.layer)],
      { scope, layerRegistry: customRegistry },
    )
    cleanups.push(cleanup)
    expect(hiddenOf(upperNode)).toBe(true)

    const unrelated = ambientRegistry.register({
      kind: 'modal',
      node: () => upperNode,
      branches: () => [],
      isModal: () => true,
      surfaces: () => [],
    })
    cleanups.push(unrelated.dispose)
    expect(hiddenOf(upperNode)).toBe(true)

    const upper = customRegistry.register({
      kind: 'modal',
      node: () => upperNode,
      branches: () => [],
      isModal: () => true,
      surfaces: () => [],
    })
    cleanups.push(upper.dispose)
    expect(hiddenOf(upperNode)).toBe(false)
    expect(hiddenOf(bg)).toBe(true)

    upper.dispose()
    expect(hiddenOf(upperNode)).toBe(true)
    await flush()
  })

  it('后登记的层其节点被放开', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    await flush()

    // 先挂节点、后登记层：这一瞬它还是普通背景，会被外层罩住
    const late = document.createElement('div')
    document.body.appendChild(late)
    await flush()
    expect(hiddenOf(late)).toBe(true)

    const inner = openOverlay(late)
    await flush()
    expect(hiddenOf(late)).toBe(false)
    expect(countOf(late)).toBe(0)
    expect(hiddenOf(bg)).toBe(true)

    inner.close()
    outer.close()
    await flush()
    expect(hiddenOf(bg)).toBe(false)
    expect(hiddenOf(late)).toBe(false)
  })

  it('上层退场后其节点转由下层接管', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    const inner = openOverlay()
    await flush()
    expect(hiddenOf(inner.node)).toBe(false)

    // 内层只退层不撤藏起，节点仍留在 DOM 里：外层重算后该把它罩住
    inner.unregister()
    await flush()
    expect(hiddenOf(inner.node)).toBe(true)

    inner.unhide()
    outer.close()
    await flush()
    expect(hiddenOf(inner.node)).toBe(false)
    expect(hiddenOf(bg)).toBe(false)
  })
})

describe('hideOutside 内容嵌在应用容器里', () => {
  it('容器自身放行，容器内的兄弟与 body 的其它子元素都被罩住', async () => {
    const outside = appendBackground()
    const app = div('app')
    const aside = div('aside')
    const content = div('content')
    app.append(aside, content)
    document.body.appendChild(app)

    hide(content)
    await flush()

    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(content)).toBe(false)
    expect(hiddenOf(aside)).toBe(true)
    expect(hiddenOf(outside)).toBe(true)
  })

  it('三层嵌套时链外的每一层兄弟都被罩住', async () => {
    const outside = appendBackground()
    const app = div('app')
    const layout = div('layout')
    const sidebar = div('sidebar')
    const main = div('main')
    const tools = div('tools')
    const content = div('content')
    main.append(tools, content)
    layout.append(sidebar, main)
    app.appendChild(layout)
    document.body.appendChild(app)

    hide(content)
    await flush()

    expect(hiddenOf(sidebar)).toBe(true)
    expect(hiddenOf(tools)).toBe(true)
    expect(hiddenOf(outside)).toBe(true)
    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(layout)).toBe(false)
    expect(hiddenOf(main)).toBe(false)
    expect(hiddenOf(content)).toBe(false)
  })

  it('多个 target 时两条祖先链上的节点都不被罩住', async () => {
    const outside = appendBackground()
    const app = div('app')
    const aside = div('aside')
    const contentA = div('content-a')
    app.append(aside, contentA)

    const portal = div('portal')
    const sibling = div('sibling')
    const contentB = div('content-b')
    portal.append(sibling, contentB)
    document.body.append(app, portal)

    hide(contentA, contentB)
    await flush()

    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(portal)).toBe(false)
    expect(hiddenOf(contentA)).toBe(false)
    expect(hiddenOf(contentB)).toBe(false)
    expect(hiddenOf(aside)).toBe(true)
    expect(hiddenOf(sibling)).toBe(true)
    expect(hiddenOf(outside)).toBe(true)
  })

  it('深层的豁免节点不被罩住', async () => {
    const app = div('app')
    const toaster = div('toaster')
    toaster.setAttribute(DATA_INERT_EXEMPT, '')
    const aside = div('aside')
    const content = div('content')
    app.append(toaster, aside, content)
    document.body.appendChild(app)

    hide(content)
    await flush()

    expect(hiddenOf(toaster)).toBe(false)
    expect(countOf(toaster)).toBe(0)
    expect(hiddenOf(aside)).toBe(true)
  })

  it('链上深层后来新增的兄弟也被罩住', async () => {
    const app = div('app')
    const main = div('main')
    const content = div('content')
    main.appendChild(content)
    app.appendChild(main)
    document.body.appendChild(app)

    hide(content)
    await flush()

    const late = div('late')
    main.appendChild(late)
    await flush()
    expect(hiddenOf(late)).toBe(true)
  })

  it('两层全部关闭后逐层复位，宿主自带的 aria-hidden 保留', async () => {
    const outside = appendBackground()
    const app = div('app')
    const aside = div('aside')
    aside.setAttribute('aria-hidden', 'true')
    const main = div('main')
    const tools = div('tools')
    const content = div('content')
    main.append(tools, content)
    app.append(aside, main)
    document.body.appendChild(app)

    const deep = hide(content)
    const shallow = hide(main)
    await flush()
    expect(countOf(outside)).toBe(2)
    expect(countOf(aside)).toBe(2)
    expect(countOf(tools)).toBe(1)
    expect(hiddenOf(tools)).toBe(true)

    deep()
    await flush()
    expect(hiddenOf(outside)).toBe(true)
    expect(hiddenOf(aside)).toBe(true)
    expect(hiddenOf(tools)).toBe(false)

    shallow()
    await flush()
    expect(hiddenOf(outside)).toBe(false)
    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(main)).toBe(false)
    expect(hiddenOf(aside)).toBe(true)
    expect(countOf(aside)).toBe(0)
  })
})

describe('hideOutside 豁免标记在任意深度都留出通路', () => {
  it('从 config 之后的第三参数读取自定义豁免选择器', () => {
    const app = div('app')
    const exempt = div('exempt')
    exempt.className = 'custom-exempt'
    const page = div('page')
    app.append(page, exempt)
    document.body.append(app)
    const content = div('content')
    document.body.append(content)
    const cleanup = hideOutside(
      () => [content],
      { scope, layerRegistry: getLayerRegistry(document) },
      { exemptSelectors: ['.custom-exempt'] },
    )
    cleanups.push(cleanup)

    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(page)).toBe(true)
    expect(hiddenOf(exempt)).toBe(false)
  })

  it('豁免节点嵌在应用容器里时，容器只递归不整块罩住', () => {
    const app = div('app')
    const toaster = div('toaster')
    toaster.setAttribute(DATA_INERT_EXEMPT, '')
    const page = div('page')
    app.append(page, toaster)
    document.body.append(app)
    const content = div('content')
    document.body.append(content)

    hide(content)

    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(toaster)).toBe(false)
    expect(hiddenOf(page)).toBe(true)
  })

  it('豁免节点的后代不被罩住', () => {
    const app = div('app')
    const toaster = div('toaster')
    toaster.setAttribute(DATA_INERT_EXEMPT, '')
    const action = div('action')
    toaster.append(action)
    app.append(toaster)
    document.body.append(app)
    const content = div('content')
    document.body.append(content)

    hide(content)

    expect(hiddenOf(action)).toBe(false)
    expect(countOf(action)).toBe(0)
  })

  it('豁免节点撤走后，原本让路的容器整块罩住', async () => {
    const app = div('app')
    const toaster = div('toaster')
    toaster.setAttribute(DATA_INERT_EXEMPT, '')
    const page = div('page')
    app.append(page, toaster)
    document.body.append(app)
    const content = div('content')
    document.body.append(content)

    hide(content)
    expect(hiddenOf(app)).toBe(false)

    toaster.remove()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(hiddenOf(app)).toBe(true)
    expect(countOf(page)).toBe(0)
  })

  it('全部撤销后逐层复位', () => {
    const app = div('app')
    const toaster = div('toaster')
    toaster.setAttribute(DATA_INERT_EXEMPT, '')
    const page = div('page')
    app.append(page, toaster)
    document.body.append(app)
    const content = div('content')
    document.body.append(content)

    const cleanup = hide(content)
    cleanup()

    expect(hiddenOf(page)).toBe(false)
    expect(hiddenOf(app)).toBe(false)
    expect(countOf(page)).toBe(0)
  })
})

describe('hideOutside 的所属 realm', () => {
  function setupForeignDocument(): {
    frame: HTMLIFrameElement
    doc: Document
    win: Window & typeof globalThis
    app: HTMLElement
    page: HTMLElement
    content: HTMLElement
  } {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const doc = frame.contentDocument!
    const win = frame.contentWindow! as Window & typeof globalThis
    const app = doc.createElement('main')
    const page = doc.createElement('div')
    app.appendChild(page)
    const content = doc.createElement('div')
    doc.body.append(app, content)
    return { frame, doc, win, app, page, content }
  }

  it('iframe 的已藏起背景深处后挂豁免节点时重新留出通路', async () => {
    const { frame, doc, win, app, page, content } = setupForeignDocument()
    const scope = createScope(content, createCounterIdGenerator())
    const registry = createLayerRegistry(doc)
    const cleanup = hideOutside(
      () => [content],
      { scope, layerRegistry: registry },
    )
    expect(hiddenOf(app)).toBe(true)
    const exempt = doc.createElement('div')
    exempt.setAttribute(DATA_INERT_EXEMPT, '')
    app.appendChild(exempt)

    await flush(win)
    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(page)).toBe(true)
    expect(hiddenOf(exempt)).toBe(false)
    cleanup()
    frame.remove()
  })

  it('从另一 Window adopt 的后挂豁免节点同样触发重算', async () => {
    const { frame, doc, win, app, page, content } = setupForeignDocument()
    const sourceFrame = document.createElement('iframe')
    document.body.appendChild(sourceFrame)
    const source = sourceFrame.contentDocument!.createElement('div')
    source.setAttribute(DATA_INERT_EXEMPT, '')
    const exempt = app.ownerDocument.adoptNode(source)
    const scope = createScope(content, createCounterIdGenerator())
    const cleanup = hideOutside(
      () => [content],
      { scope, layerRegistry: getLayerRegistry(doc) },
    )
    expect(hiddenOf(app)).toBe(true)
    app.appendChild(exempt)

    await flush(win)
    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(page)).toBe(true)
    expect(hiddenOf(exempt)).toBe(false)
    cleanup()
    sourceFrame.remove()
    frame.remove()
  })

  it('顶层 DOM globals 缺失时仍使用显式 Scope 的所属 realm', async () => {
    const { frame, doc, win, app, content } = setupForeignDocument()
    const scope = createScope(content, createCounterIdGenerator())
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('Node', undefined)
    vi.stubGlobal('Element', undefined)
    vi.stubGlobal('HTMLElement', undefined)
    const cleanup = hideOutside(
      () => [content],
      { scope, layerRegistry: getLayerRegistry(doc) },
    )
    const exempt = doc.createElement('div')
    exempt.setAttribute(DATA_INERT_EXEMPT, '')
    app.appendChild(exempt)

    await flush(win)
    expect(hiddenOf(app)).toBe(false)
    expect(hiddenOf(exempt)).toBe(false)
    cleanup()
    vi.unstubAllGlobals()
    frame.remove()
  })

  it('离线 Document 与缺少 MutationObserver 的 Window 明确失败', () => {
    const offline = document.implementation.createHTMLDocument('offline')
    const offlineContent = offline.createElement('div')
    offline.body.appendChild(offlineContent)
    const offlineScope = createScope(offlineContent, createCounterIdGenerator())
    expect(() => hideOutside(
      () => [offlineContent],
      { scope: offlineScope, layerRegistry: getLayerRegistry(offline) },
    )).toThrow(/没有活动 Window/)

    const { frame, doc, win, content } = setupForeignDocument()
    const scope = createScope(content, createCounterIdGenerator())
    Object.defineProperty(win, 'MutationObserver', { configurable: true, value: undefined })
    expect(() => hideOutside(
      () => [content],
      { scope, layerRegistry: getLayerRegistry(doc) },
    )).toThrow(/MutationObserver/)
    frame.remove()
  })

  it('拒绝归属其他 Document 的 layerRegistry', () => {
    const { frame, app, content } = setupForeignDocument()
    const scope = createScope(content, createCounterIdGenerator())
    const getTargets = vi.fn(() => [content])

    expect(() => hideOutside(
      getTargets,
      { scope, layerRegistry: getLayerRegistry(document) },
    )).toThrow(/layerRegistry 必须属于 Scope 的 Document/)
    expect(getTargets).not.toHaveBeenCalled()
    expect(hiddenOf(app)).toBe(false)
    frame.remove()
  })

  it('观察器启动失败时不留下 aria-hidden 或层栈订阅', () => {
    const { frame, win, app, content } = setupForeignDocument()
    const scope = createScope(content, createCounterIdGenerator())
    const registry = getLayerRegistry(content.ownerDocument)
    class FailingMutationObserver {
      disconnect(): void {}
      observe(): void {
        throw new Error('observe failed')
      }

      takeRecords(): MutationRecord[] {
        return []
      }
    }
    Object.defineProperty(win, 'MutationObserver', {
      configurable: true,
      value: FailingMutationObserver,
    })

    expect(() => hideOutside(
      () => [content],
      { scope, layerRegistry: registry },
    )).toThrow('observe failed')
    expect(hiddenOf(app)).toBe(false)
    const node = content.ownerDocument.createElement('div')
    const registration = registry.register({
      kind: 'modal',
      node: () => node,
      branches: () => [],
      isModal: () => true,
      surfaces: () => [],
    })
    expect(hiddenOf(app)).toBe(false)
    registration.dispose()
    frame.remove()
  })

  it('拒绝来自其他 Document 的 target 且不留下 aria-hidden', () => {
    const { frame, app, content } = setupForeignDocument()
    const otherFrame = document.createElement('iframe')
    document.body.appendChild(otherFrame)
    const foreignTarget = otherFrame.contentDocument!.createElement('div')
    otherFrame.contentDocument!.body.appendChild(foreignTarget)
    const scope = createScope(content, createCounterIdGenerator())

    const registry = getLayerRegistry(content.ownerDocument)
    expect(() => hideOutside(
      () => [foreignTarget],
      { scope, layerRegistry: registry },
    )).toThrow(/必须属于 Scope 的 Document/)
    expect(hiddenOf(app)).toBe(false)
    const registration = registry.register({
      kind: 'modal',
      node: () => content,
      branches: () => [],
      isModal: () => true,
      surfaces: () => [],
    })
    registration.dispose()
    otherFrame.remove()
    frame.remove()
  })

  it('document 没有 body 时明确失败', () => {
    const { frame, doc, content } = setupForeignDocument()
    const scope = createScope(content, createCounterIdGenerator())
    doc.body.remove()

    expect(() => hideOutside(
      () => [content],
      { scope, layerRegistry: getLayerRegistry(doc) },
    )).toThrow(/Document 没有 body/)
    frame.remove()
  })
})

describe('hideOutside 只藏不失活', () => {
  it('背景只写 aria-hidden，不打 inert', () => {
    const bg = appendBackground()
    const content = div('content')
    document.body.appendChild(content)
    hide(content)
    expect(hiddenOf(bg)).toBe(true)
    expect((bg as HTMLElement & { inert?: boolean }).inert === true).toBe(false)
    expect(bg.hasAttribute('inert')).toBe(false)
  })

  it('实时区域、脚本与样式不藏：模态开着时播报照旧', () => {
    const content = div('content')
    const polite = div('polite')
    polite.setAttribute('aria-live', 'polite')
    const status = div('status')
    status.setAttribute('role', 'status')
    const alert = div('alert')
    alert.setAttribute('role', 'alert')
    const script = document.createElement('script')
    const style = document.createElement('style')
    const bg = appendBackground()
    document.body.append(content, polite, status, alert, script, style)
    hide(content)
    expect(hiddenOf(bg)).toBe(true)
    for (const el of [polite, status, alert, script, style])
      expect(el.hasAttribute('aria-hidden')).toBe(false)
  })

  it('宿主原本写的 aria-hidden="false" 在撤销后写回原值', () => {
    const bg = appendBackground()
    bg.setAttribute('aria-hidden', 'false')
    const content = div('content')
    document.body.appendChild(content)
    const cleanup = hide(content)
    expect(hiddenOf(bg)).toBe(true)
    cleanup()
    expect(bg.getAttribute('aria-hidden')).toBe('false')
  })
})

describe('hideOutside 放掉背景里的焦点', () => {
  it('焦点还留在被藏起的背景里时放掉，像 inert 一样不让它停在读屏读不到的地方', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)
    const content = div('content')
    const inside = document.createElement('button')
    content.appendChild(inside)
    document.body.appendChild(content)
    button.focus()
    expect(document.activeElement).toBe(button)
    hide(content)
    expect(document.activeElement).not.toBe(button)
  })

  it('焦点在目标或豁免节点里时不动', () => {
    const content = div('content')
    const inside = document.createElement('button')
    content.appendChild(inside)
    const exempt = div('exempt')
    exempt.setAttribute(DATA_INERT_EXEMPT, '')
    const toast = document.createElement('button')
    exempt.appendChild(toast)
    document.body.append(content, exempt)
    inside.focus()
    hide(content)
    expect(document.activeElement).toBe(inside)
    toast.focus()
    hide(content)
    expect(document.activeElement).toBe(toast)
  })
})
