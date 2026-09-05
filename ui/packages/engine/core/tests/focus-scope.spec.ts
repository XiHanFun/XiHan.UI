// @vitest-environment jsdom

// 焦点域是无障碍库最基本的那条承诺，此前只有 tabbable / focus-guards 两个辅助件被测过，
// createFocusScope 本体——陷阱装配、逃逸抢回、Tab 回绕、卸载归还——一条判据都没有。
import type { Layer, LayerRegistry, RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFocusScope } from '../src/behavior/focus-scope'
import { createCounterIdGenerator, createLayerRegistry, createRuntimeConfig, createScope, DATA_FOCUS_GUARD, EV_MOUNT_AUTO_FOCUS } from '../src/kernel'

interface Harness {
  config: RuntimeConfig
  registry: LayerRegistry
  layer: Layer
  container: HTMLElement
  outside: HTMLButtonElement
  buttons: HTMLButtonElement[]
  disposeLayer: () => void
}

const cleanups: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanups.splice(0)) fn()
  document.body.innerHTML = ''
})

/** 等 n 帧：挂载聚焦与卸载归还都排在 rAF 上。 */
async function frames(n = 1): Promise<void> {
  for (let i = 0; i < n; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function setup(buttonCount = 3): Harness {
  const outside = document.createElement('button')
  outside.textContent = '外面'
  document.body.appendChild(outside)

  const container = document.createElement('div')
  // 真实组件的 content 部件都带 tabindex=-1，无可聚焦子节点时才兜得住
  container.tabIndex = -1
  const buttons: HTMLButtonElement[] = []
  for (let i = 0; i < buttonCount; i++) {
    const b = document.createElement('button')
    b.textContent = `里面 ${i}`
    container.appendChild(b)
    buttons.push(b)
  }
  document.body.appendChild(container)

  const registry = createLayerRegistry(document)
  const { layer, dispose: disposeLayer } = registry.register({
    kind: 'modal',
    node: () => container,
    branches: () => [],
    isModal: () => true,
    setModal: () => {},
    surfaces: () => [],
  })
  const config = createRuntimeConfig({
    scope: createScope(null, createCounterIdGenerator()),
    layerRegistry: registry,
  })

  cleanups.push(disposeLayer)
  return { config, registry, layer, container, outside, buttons, disposeLayer }
}

function open(h: Harness, extra: Partial<Parameters<typeof createFocusScope>[0]> = {}) {
  const scope = createFocusScope({
    config: h.config,
    layer: h.layer,
    container: () => h.container,
    trapped: () => true,
    ...extra,
  })
  cleanups.push(() => scope.dispose())
  return scope
}

describe('挂载自动聚焦', () => {
  it('给了 initialFocus 就聚焦它', async () => {
    const h = setup()
    open(h, { initialFocus: () => h.buttons[2]! })
    await frames(2)
    expect(document.activeElement).toBe(h.buttons[2])
  })

  it('没给 initialFocus 时聚焦第一个可聚焦元素', async () => {
    const h = setup()
    open(h)
    await frames(2)
    expect(document.activeElement).toBe(h.buttons[0])
  })

  it('容器里没有可聚焦元素时兜底聚焦容器本身', async () => {
    const h = setup(0)
    open(h)
    await frames(5)
    expect(document.activeElement).toBe(h.container)
  })

  // 容器可能晚一拍才就位，不能因为首次取不到就放弃
  it('容器晚一帧出现也能聚焦到', async () => {
    const h = setup()
    let ready = false
    const scope = createFocusScope({
      config: h.config,
      layer: h.layer,
      container: () => (ready ? h.container : null),
      trapped: () => true,
    })
    cleanups.push(() => scope.dispose())
    await frames(1)
    ready = true
    await frames(3)
    expect(document.activeElement).toBe(h.buttons[0])
  })

  it('焦点已经在容器后代里就不再抢', async () => {
    const h = setup()
    h.buttons[1]!.focus()
    open(h)
    await frames(2)
    expect(document.activeElement).toBe(h.buttons[1])
  })

  it('容器上的监听器 preventDefault 后不自动聚焦', async () => {
    const h = setup()
    h.outside.focus()
    h.container.addEventListener(EV_MOUNT_AUTO_FOCUS, e => e.preventDefault())
    open(h)
    await frames(3)
    expect(document.activeElement).toBe(h.outside)
  })
})

describe('逃逸抢回', () => {
  it('焦点落到域外时被拉回来', async () => {
    const h = setup()
    open(h)
    await frames(2)
    h.outside.focus()
    expect(document.activeElement).toBe(h.buttons[0])
  })

  it('域内移动不受干扰', async () => {
    const h = setup()
    open(h)
    await frames(2)
    h.buttons[2]!.focus()
    expect(document.activeElement).toBe(h.buttons[2])
  })

  it('trapped 为假时不抢', async () => {
    const h = setup()
    open(h, { trapped: () => false })
    await frames(2)
    h.outside.focus()
    expect(document.activeElement).toBe(h.outside)
  })

  it('trapped 生命周期内可变：关掉之后就不再抢', async () => {
    const h = setup()
    let trapped = true
    open(h, { trapped: () => trapped })
    await frames(2)
    trapped = false
    h.outside.focus()
    expect(document.activeElement).toBe(h.outside)
  })

  // 不是栈顶的层要让位，否则上面那层的焦点会被下面这层抢走
  it('本层不在栈顶时暂停抢回', async () => {
    const h = setup()
    open(h)
    await frames(2)
    const upper = h.registry.register({
      kind: 'modal',
      node: () => h.outside,
      branches: () => [],
      isModal: () => true,
      setModal: () => {},
      surfaces: () => [],
    })
    cleanups.push(upper.dispose)
    h.outside.focus()
    expect(document.activeElement).toBe(h.outside)
  })

  it('branches 里的节点算域内，不被抢回', async () => {
    const h = setup()
    const branch = document.createElement('button')
    document.body.appendChild(branch)
    open(h, { branches: () => [branch] })
    await frames(2)
    branch.focus()
    expect(document.activeElement).toBe(branch)
  })
})

describe('tab 边界回绕', () => {
  function tab(shift = false): void {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true }))
  }

  it('末尾按 Tab 回到开头', async () => {
    const h = setup()
    open(h, { loop: true })
    await frames(2)
    h.buttons[2]!.focus()
    tab()
    expect(document.activeElement).toBe(h.buttons[0])
  })

  it('开头按 Shift+Tab 到末尾', async () => {
    const h = setup()
    open(h, { loop: true })
    await frames(2)
    h.buttons[0]!.focus()
    tab(true)
    expect(document.activeElement).toBe(h.buttons[2])
  })

  it('中间按 Tab 不接管，交给浏览器', async () => {
    const h = setup()
    open(h, { loop: true })
    await frames(2)
    h.buttons[1]!.focus()
    tab()
    expect(document.activeElement).toBe(h.buttons[1])
  })

  it('loop 未开时边界不回绕', async () => {
    const h = setup()
    open(h)
    await frames(2)
    h.buttons[2]!.focus()
    tab()
    expect(document.activeElement).toBe(h.buttons[2])
  })
})

describe('哨兵', () => {
  it('挂载时 body 首尾各插一个，卸载后清干净', async () => {
    const h = setup()
    const scope = open(h)
    await frames(2)
    expect(document.querySelectorAll(`[${DATA_FOCUS_GUARD}]`)).toHaveLength(2)
    scope.dispose()
    await frames(2)
    expect(document.querySelectorAll(`[${DATA_FOCUS_GUARD}]`)).toHaveLength(0)
  })

  // 引用计数：两层同时在场时只有一对，先关的那层不能把哨兵带走
  it('两层共用一对，先关一层不清掉', async () => {
    const h = setup()
    const a = open(h)
    const b = open(h)
    await frames(2)
    expect(document.querySelectorAll(`[${DATA_FOCUS_GUARD}]`)).toHaveLength(2)
    a.dispose()
    await frames(2)
    expect(document.querySelectorAll(`[${DATA_FOCUS_GUARD}]`)).toHaveLength(2)
    b.dispose()
    await frames(2)
    expect(document.querySelectorAll(`[${DATA_FOCUS_GUARD}]`)).toHaveLength(0)
  })
})

describe('卸载归还', () => {
  it('焦点回到创建前持有它的那个元素', async () => {
    const h = setup()
    h.outside.focus()
    const scope = open(h)
    await frames(2)
    expect(document.activeElement).toBe(h.buttons[0])
    scope.dispose()
    await frames(2)
    expect(document.activeElement).toBe(h.outside)
  })

  it('restoreFocus 为假时不归还', async () => {
    const h = setup()
    h.outside.focus()
    const scope = open(h, { restoreFocus: () => false })
    await frames(2)
    scope.dispose()
    await frames(2)
    expect(document.activeElement).toBe(h.buttons[0])
  })

  // 触发它的那个节点可能已经随着一次重渲染消失了，此时不能把焦点扔进虚空
  it('原持有者已离开文档时退回 body', async () => {
    const h = setup()
    h.outside.focus()
    const scope = open(h)
    await frames(2)
    h.outside.remove()
    scope.dispose()
    await frames(2)
    expect(document.activeElement).toBe(document.body)
  })

  // 指针入口下「创建前的持有者」取决于点按那一刻浏览器把焦点放在哪，各平台不一致；
  // 承诺焦点归还触发器的层把落点显式交进来，快照只当兜底
  it('给了 restoreTarget 就还给它，不认创建前的快照', async () => {
    const h = setup()
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    // 快照落在别处（指针入口下常是 body）
    h.outside.focus()
    const scope = open(h, { restoreTarget: () => trigger })
    await frames(2)
    scope.dispose()
    await frames(2)
    expect(document.activeElement).toBe(trigger)
  })

  it('restoreTarget 返回 null 或那个元素已离场时，退回创建前的快照', async () => {
    const h = setup()
    h.outside.focus()
    const scope = open(h, { restoreTarget: () => null })
    await frames(2)
    scope.dispose()
    await frames(2)
    expect(document.activeElement).toBe(h.outside)

    const gone = setup()
    const detached = document.createElement('button')
    gone.outside.focus()
    const second = open(gone, { restoreTarget: () => detached })
    await frames(2)
    second.dispose()
    await frames(2)
    expect(document.activeElement).toBe(gone.outside)
  })

  it('restoreFocus 为假时 restoreTarget 也不出面：交接式出口不抢焦点', async () => {
    const h = setup()
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    const scope = open(h, { restoreFocus: () => false, restoreTarget: () => trigger })
    await frames(2)
    scope.dispose()
    await frames(2)
    expect(document.activeElement).toBe(h.buttons[0])
  })

  it('卸载后不再抢回焦点', async () => {
    const h = setup()
    const scope = open(h)
    await frames(2)
    scope.dispose()
    await frames(2)
    const late = document.createElement('button')
    document.body.appendChild(late)
    late.focus()
    expect(document.activeElement).toBe(late)
  })

  it('重复 dispose 不出错也不重复归还', async () => {
    const h = setup()
    h.outside.focus()
    const scope = open(h)
    await frames(2)
    scope.dispose()
    scope.dispose()
    await frames(2)
    expect(document.activeElement).toBe(h.outside)
  })

  it('卸载时把三个监听器都摘干净', async () => {
    const h = setup()
    const remove = vi.spyOn(document, 'removeEventListener')
    const scope = open(h)
    await frames(2)
    scope.dispose()
    const types = remove.mock.calls.map(c => c[0])
    expect(types).toContain('focusin')
    expect(types).toContain('focusout')
    expect(types).toContain('keydown')
    remove.mockRestore()
  })
})
