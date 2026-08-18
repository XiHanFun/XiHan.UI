// @vitest-environment jsdom

import type { Cleanup } from '../src/types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hideOutside } from '../src/capability/a11y/hide-outside'
import { getInertRegistry } from '../src/capability/a11y/inert-registry'
import { DATA_INERT_EXEMPT } from '../src/constants'
import { setDiagnosticsConsoleOutput } from '../src/diagnostics/channel'
import { createCounterIdGenerator } from '../src/id-generator'
import { createScope } from '../src/scope'
import { getLayerRegistry } from '../src/structure/layer-registry'

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

/** 开一层模态浮层：节点挂到 body、登记进层栈，再照 dialog 机器的口径罩住背景。 */
function openOverlay(node: HTMLElement = document.createElement('div')): Overlay {
  const registry = getLayerRegistry(document)
  if (node.parentNode !== document.body)
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
