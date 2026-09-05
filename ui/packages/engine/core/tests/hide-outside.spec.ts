// @vitest-environment jsdom

import type { Cleanup } from '../src/kernel/types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hideOutside } from '../src/kernel/capability/a11y/hide-outside'
import { getInertRegistry } from '../src/kernel/capability/a11y/inert-registry'
import { DATA_INERT_EXEMPT } from '../src/kernel/constants'
import { setDiagnosticsConsoleOutput } from '../src/kernel/diagnostics/channel'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { createScope } from '../src/kernel/scope'
import { getLayerRegistry } from '../src/kernel/structure/layer-registry'

/** jsdom 不实现 inert，赋值落成 expando，读值统一按「是不是 true」判。 */
function inertOf(el: Element): boolean {
  return (el as HTMLElement).inert === true
}

function countOf(el: Element): number {
  return getInertRegistry(document).countOf(el as HTMLElement)
}

/** 等 MutationObserver 的微任务与一轮宏任务。 */
async function flush(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
}

interface Overlay {
  node: HTMLElement
  /** 只撤 inert，不退层。 */
  unhide: Cleanup
  /** 只退层，不撤 inert。 */
  unregister: Cleanup
  /** 照机器里的拆除顺序：先撤 inert 再退层。 */
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
    setModal: () => {},
    surfaces: () => [],
  })
  const unhide = hideOutside(() => [node, ...registry.elementsAbove(layer)], scope)
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
  const cleanup = hideOutside(() => targets, scope)
  cleanups.push(cleanup)
  return cleanup
}

beforeEach(() => {
  // 乱序拆层会投递 layerDisposeNotTop，是被测行为本身，别让它刷屏
  setDiagnosticsConsoleOutput(false)
})

afterEach(() => {
  for (const fn of cleanups.splice(0).reverse()) fn()
  document.body.innerHTML = ''
  setDiagnosticsConsoleOutput(true)
})

describe('hideOutside 单层', () => {
  it('开关一轮后背景回到原始值', async () => {
    const bg = appendBackground()
    const overlay = openOverlay()
    await flush()

    expect(inertOf(bg)).toBe(true)
    expect(inertOf(overlay.node)).toBe(false)

    overlay.close()
    await flush()
    expect(inertOf(bg)).toBe(false)
    expect(countOf(bg)).toBe(0)
  })

  it('豁免节点不被罩住', async () => {
    const exempt = appendBackground()
    exempt.setAttribute(DATA_INERT_EXEMPT, '')
    const overlay = openOverlay()
    await flush()

    expect(inertOf(exempt)).toBe(false)
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
    expect(inertOf(bg)).toBe(true)

    outer.unregister()
    inner.close()
    await flush()
    expect(inertOf(bg)).toBe(false)
    expect(countOf(bg)).toBe(0)
  })
})

describe('hideOutside 多层拆除', () => {
  it('两层顺序拆除（内层先关）后全部复位', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    const inner = openOverlay()
    await flush()

    expect(inertOf(bg)).toBe(true)
    expect(inertOf(outer.node)).toBe(true)
    expect(inertOf(inner.node)).toBe(false)
    expect(countOf(bg)).toBe(2)

    inner.close()
    await flush()
    expect(inertOf(bg)).toBe(true)
    expect(inertOf(outer.node)).toBe(false)

    outer.close()
    await flush()
    expect(inertOf(bg)).toBe(false)
    expect(inertOf(outer.node)).toBe(false)
    expect(inertOf(inner.node)).toBe(false)
  })

  it('两层乱序拆除（外层先关）后同样复位', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    const inner = openOverlay()
    await flush()
    expect(inertOf(bg)).toBe(true)

    outer.close()
    await flush()
    // 内层还开着，背景仍失活
    expect(inertOf(bg)).toBe(true)
    expect(countOf(bg)).toBe(1)

    inner.close()
    await flush()
    expect(inertOf(bg)).toBe(false)
    expect(inertOf(outer.node)).toBe(false)
    expect(inertOf(inner.node)).toBe(false)
    expect(countOf(bg)).toBe(0)
  })

  it('三层嵌套按由外向内的顺序拆除后全部复位', async () => {
    const bg = appendBackground()
    const first = openOverlay()
    const second = openOverlay()
    const third = openOverlay()
    await flush()
    expect(countOf(bg)).toBe(3)
    expect(inertOf(third.node)).toBe(false)

    first.close()
    await flush()
    expect(inertOf(bg)).toBe(true)
    expect(countOf(bg)).toBe(2)

    second.close()
    await flush()
    expect(inertOf(bg)).toBe(true)
    expect(countOf(bg)).toBe(1)

    third.close()
    await flush()
    expect(inertOf(bg)).toBe(false)
    expect(inertOf(first.node)).toBe(false)
    expect(inertOf(second.node)).toBe(false)
    expect(inertOf(third.node)).toBe(false)
    expect(countOf(bg)).toBe(0)
  })

  it('宿主自己设的 inert 在全部拆除后仍然保留', async () => {
    const bg = appendBackground()
    bg.inert = true

    const outer = openOverlay()
    const inner = openOverlay()
    await flush()
    expect(inertOf(bg)).toBe(true)

    outer.close()
    inner.close()
    await flush()
    expect(inertOf(bg)).toBe(true)
    expect(countOf(bg)).toBe(0)
  })
})

describe('hideOutside 跟随层栈重算', () => {
  it('后登记的层其节点被放开', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    await flush()

    // 先挂节点、后登记层：这一瞬它还是普通背景，会被外层罩住
    const late = document.createElement('div')
    document.body.appendChild(late)
    await flush()
    expect(inertOf(late)).toBe(true)

    const inner = openOverlay(late)
    await flush()
    expect(inertOf(late)).toBe(false)
    expect(countOf(late)).toBe(0)
    expect(inertOf(bg)).toBe(true)

    inner.close()
    outer.close()
    await flush()
    expect(inertOf(bg)).toBe(false)
    expect(inertOf(late)).toBe(false)
  })

  it('上层退场后其节点转由下层接管', async () => {
    const bg = appendBackground()
    const outer = openOverlay()
    const inner = openOverlay()
    await flush()
    expect(inertOf(inner.node)).toBe(false)

    // 内层只退层不撤 inert，节点仍留在 DOM 里：外层重算后该把它罩住
    inner.unregister()
    await flush()
    expect(inertOf(inner.node)).toBe(true)

    inner.unhide()
    outer.close()
    await flush()
    expect(inertOf(inner.node)).toBe(false)
    expect(inertOf(bg)).toBe(false)
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

    expect(inertOf(app)).toBe(false)
    expect(inertOf(content)).toBe(false)
    expect(inertOf(aside)).toBe(true)
    expect(inertOf(outside)).toBe(true)
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

    expect(inertOf(sidebar)).toBe(true)
    expect(inertOf(tools)).toBe(true)
    expect(inertOf(outside)).toBe(true)
    expect(inertOf(app)).toBe(false)
    expect(inertOf(layout)).toBe(false)
    expect(inertOf(main)).toBe(false)
    expect(inertOf(content)).toBe(false)
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

    expect(inertOf(app)).toBe(false)
    expect(inertOf(portal)).toBe(false)
    expect(inertOf(contentA)).toBe(false)
    expect(inertOf(contentB)).toBe(false)
    expect(inertOf(aside)).toBe(true)
    expect(inertOf(sibling)).toBe(true)
    expect(inertOf(outside)).toBe(true)
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

    expect(inertOf(toaster)).toBe(false)
    expect(countOf(toaster)).toBe(0)
    expect(inertOf(aside)).toBe(true)
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
    expect(inertOf(late)).toBe(true)
  })

  it('两层全部关闭后逐层复位，宿主自带的 inert 保留', async () => {
    const outside = appendBackground()
    const app = div('app')
    const aside = div('aside')
    aside.inert = true
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
    expect(inertOf(tools)).toBe(true)

    deep()
    await flush()
    expect(inertOf(outside)).toBe(true)
    expect(inertOf(aside)).toBe(true)
    expect(inertOf(tools)).toBe(false)

    shallow()
    await flush()
    expect(inertOf(outside)).toBe(false)
    expect(inertOf(app)).toBe(false)
    expect(inertOf(main)).toBe(false)
    expect(inertOf(aside)).toBe(true)
    expect(countOf(aside)).toBe(0)
  })
})

describe('hideOutside 豁免标记在任意深度都留出通路', () => {
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

    expect(inertOf(app)).toBe(false)
    expect(inertOf(toaster)).toBe(false)
    expect(inertOf(page)).toBe(true)
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

    expect(inertOf(action)).toBe(false)
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
    expect(inertOf(app)).toBe(false)

    toaster.remove()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(inertOf(app)).toBe(true)
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

    expect(inertOf(page)).toBe(false)
    expect(inertOf(app)).toBe(false)
    expect(countOf(page)).toBe(0)
  })
})
