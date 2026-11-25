// @vitest-environment jsdom
import type { FocusTrapSchema } from '../src'
import { createDismissLayer, createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectFocusTrap, focusTrapMachine } from '../src'

const cleanup: Array<() => void> = []

afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

async function flush(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

/** 焦点域的归还与挂载补试都排在下一帧。 */
async function frame(): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await flush()
}

function button(label: string): HTMLButtonElement {
  const el = document.createElement('button')
  el.textContent = label
  return el
}

/** 机器之外的纯逻辑：不给 config，只看状态与 DOM 投影。 */
function logic(initial: FocusTrapSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<FocusTrapSchema['props']>(initial)
  const service = createService(focusTrapMachine, { runtime, props: props.get })
  runtime.start()
  cleanup.push(() => runtime.stop())
  return {
    service,
    set: (next: FocusTrapSchema['props']) => props.set({ ...props.get(), ...next }),
    api: () => connectFocusTrap(service, normalizeProps),
  }
}

/** 接上层栈与根节点的完整夹具：激活前焦点在 outside 上。 */
function fixture(initial: FocusTrapSchema['props'] = {}, options: { children?: number } = {}) {
  const outside = button('outside')
  const root = document.createElement('div')
  const inner = Array.from({ length: options.children ?? 2 }, (_, i) => button(`inner-${i}`))
  root.append(...inner)
  document.body.append(outside, root)
  outside.focus()

  const config = createRuntimeConfig()
  const runtime = createVanillaRuntime()
  const props = runtime.signal<FocusTrapSchema['props']>(initial)
  const service = createService(focusTrapMachine, { runtime, props: props.get })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'inline',
    node: () => root,
    branches: () => [],
    isModal: () => false,
    surfaces: () => [],
    passesEscape: true,
  }))
  service.refs.set('getRootEl', () => root)
  const sync = (): void => {
    const rootProps = connectFocusTrap(service, normalizeProps).getRootProps() as Record<string, unknown>
    if (rootProps.tabindex === undefined)
      root.removeAttribute('tabindex')
    else
      root.setAttribute('tabindex', String(rootProps.tabindex))
  }
  sync()
  runtime.start()
  cleanup.push(() => runtime.stop())
  return {
    config,
    inner,
    outside,
    root,
    service,
    set: (next: FocusTrapSchema['props']) => {
      props.set({ ...props.get(), ...next })
      sync()
    },
  }
}

describe('focus-trap 状态与投影', () => {
  it('缺省激活，根带 tabindex=-1 与 data-state=active，不写 role', () => {
    const t = logic()
    expect(t.service.state.get()).toBe('active')
    const root = t.api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject({ 'data-scope': 'focus-trap', 'data-part': 'root', 'tabindex': -1, 'data-state': 'active' })
    expect(root.role).toBeUndefined()
  })

  it('active=false 起步停用，跟着 prop 切换', () => {
    const t = logic({ active: false })
    expect(t.service.state.get()).toBe('inactive')
    expect(t.api().getRootProps()).toMatchObject({ 'data-state': 'inactive' })
    expect((t.api().getRootProps() as Record<string, unknown>).tabindex).toBeUndefined()
    t.set({ active: true })
    expect(t.api().active).toBe(true)
    t.set({ active: false })
    expect(t.api().active).toBe(false)
  })

  it('没有 config 时状态照常转移，不登记层', () => {
    const t = logic()
    t.set({ active: false })
    t.set({ active: true })
    expect(t.service.state.get()).toBe('active')
  })
})

describe('focus-trap 焦点', () => {
  it('激活时焦点移到第一个可聚焦元素，停用时还给激活前的持有者', async () => {
    const f = fixture()
    await flush()
    expect(document.activeElement).toBe(f.inner[0])
    expect(f.config.layerRegistry.list()).toHaveLength(1)
    f.set({ active: false })
    await frame()
    expect(document.activeElement).toBe(f.outside)
    expect(f.config.layerRegistry.list()).toHaveLength(0)
  })

  it('里面没有可聚焦元素时焦点落到根上', async () => {
    const f = fixture({}, { children: 0 })
    // 一个可聚焦元素都没有时，焦点域等到最后一次补试才落到容器上
    for (let i = 0; i < 3; i++)
      await frame()
    expect(document.activeElement).toBe(f.root)
  })

  it('autoFocus=false 时激活不挪焦点', async () => {
    const f = fixture({ autoFocus: false })
    await flush()
    expect(document.activeElement).toBe(f.outside)
  })

  it('restoreFocus=false 时停用不归还', async () => {
    const f = fixture({ restoreFocus: false })
    await flush()
    f.set({ active: false })
    await frame()
    expect(document.activeElement).toBe(f.inner[0])
  })

  it('tab 在最后一个上回到第一个；loop=false 时不回绕', async () => {
    const f = fixture()
    await flush()
    f.inner[1]!.focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    f.inner[1]!.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(f.inner[0])

    f.set({ loop: false })
    f.inner[1]!.focus()
    const again = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    f.inner[1]!.dispatchEvent(again)
    expect(again.defaultPrevented).toBe(false)
  })

  it('焦点被拉到外面时拉回里面', async () => {
    const f = fixture()
    await flush()
    f.inner[1]!.focus()
    f.outside.focus()
    expect(document.activeElement).toBe(f.inner[1])
  })

  it('不收 Escape：压在可消解的层上时 Escape 交给下面那一层', async () => {
    const f = fixture({ active: false })
    const below = f.config.layerRegistry.register({
      kind: 'popover',
      node: () => document.body,
      branches: () => [],
      isModal: () => false,
      surfaces: () => [],
    })
    cleanup.push(below.dispose)
    const onDismiss = vi.fn()
    const dismiss = createDismissLayer({ config: f.config, layer: below.layer, onDismiss })
    cleanup.push(dismiss.dispose)
    f.set({ active: true })
    await flush()
    expect(f.config.layerRegistry.top()).not.toBe(below.layer)
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
