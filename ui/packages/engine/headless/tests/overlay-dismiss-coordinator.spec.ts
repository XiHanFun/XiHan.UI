// @vitest-environment jsdom
import type { MachineSchema, RuntimeConfig, Service } from '@xihan-ui/core'
import type { DialogOpenChangeDetails, DialogSchema } from '../src/dialog'
import type { PaginationSchema } from '../src/pagination'
import type { PopoverSchema } from '../src/popover'
import type { TourSchema } from '../src/tour'
import { createRuntimeConfig, createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { dialogMachine } from '../src/dialog'
import { paginationMachine } from '../src/pagination'
import { popoverMachine } from '../src/popover'
import { tourMachine } from '../src/tour'

interface MachineHarness<T extends MachineSchema> {
  readonly service: Service<T>
  readonly stop: () => void
}

const cleanups: Array<() => void> = []

function element(tag: keyof HTMLElementTagNameMap = 'div'): HTMLElement {
  const node = document.createElement(tag)
  document.body.append(node)
  cleanups.push(() => node.remove())
  return node
}

function mountPopover(config: RuntimeConfig, initial: PopoverSchema['props'] = {}): MachineHarness<PopoverSchema> {
  const anchor = element('button')
  const floating = element()
  const content = element()
  floating.append(content)
  const runtime = createVanillaRuntime()
  const service = createService(popoverMachine, {
    props: () => ({ defaultOpen: true, ...initial }),
    runtime,
    scope: config.scope,
  })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    branches: () => [anchor, floating],
    isModal: () => false,
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => anchor)
  service.refs.set('getFloatingEl', () => floating)
  service.refs.set('getContentEl', () => content)
  runtime.start()
  const stop = (): void => runtime.stop()
  cleanups.push(stop)
  return { service, stop }
}

function mountControlledDialog(
  config: RuntimeConfig,
  changes: DialogOpenChangeDetails[],
): MachineHarness<DialogSchema> {
  const content = element()
  content.tabIndex = -1
  const backdrop = element()
  const runtime = createVanillaRuntime()
  const props: DialogSchema['props'] = {
    open: true,
    modal: false,
    closeOnInteractOutside: true,
    onOpenChange: details => changes.push(details),
  }
  const service = createService(dialogMachine, { props: () => props, runtime, scope: config.scope })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => false,
    surfaces: () => [backdrop],
  }))
  service.refs.set('getContentEl', () => content)
  service.refs.set('getTriggerEl', () => null)
  service.refs.set('branches', () => [])
  runtime.start()
  const stop = (): void => runtime.stop()
  cleanups.push(stop)
  return { service, stop }
}

function mountTour(config: RuntimeConfig): { service: Service<TourSchema>, backdrop: HTMLElement } {
  const content = element()
  content.tabIndex = -1
  const floating = element()
  floating.append(content)
  const backdrop = element()
  const runtime = createVanillaRuntime()
  const service = createService(tourMachine, {
    props: () => ({
      defaultOpen: true,
      steps: [{ id: 'intro', target: null, title: '介绍' }],
    }),
    runtime,
    scope: config.scope,
  })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    surfaces: () => [backdrop],
  }))
  service.refs.set('getContentEl', () => content)
  service.refs.set('getFloatingEl', () => floating)
  runtime.start()
  cleanups.push(() => runtime.stop())
  return { service, backdrop }
}

function mountPagination(config: RuntimeConfig): MachineHarness<PaginationSchema> {
  const anchor = element('button')
  const floating = element()
  const content = element()
  floating.append(content)
  const runtime = createVanillaRuntime()
  const service = createService(paginationMachine, {
    props: () => ({ count: 200 }),
    runtime,
    scope: config.scope,
  })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    branches: () => [anchor, floating],
    isModal: () => false,
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => anchor)
  service.refs.set('getFloatingEl', () => floating)
  service.refs.set('getContentEl', () => content)
  runtime.start()
  service.send({ type: 'ELLIPSIS.TOGGLE', side: 'start' })
  const stop = (): void => runtime.stop()
  cleanups.push(stop)
  return { service, stop }
}

async function arm(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function pointerDown(target: Element): void {
  target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, cancelable: true }))
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  document.body.innerHTML = ''
})

describe('headless 浮层的统一消解协调', () => {
  it('受控 Dialog 顶层只发关闭意图但未退栈，阻断下层 Popover', async () => {
    const config = createRuntimeConfig()
    const lower = mountPopover(config)
    const changes: DialogOpenChangeDetails[] = []
    const top = mountControlledDialog(config, changes)
    const target = element('button')
    await arm()

    pointerDown(target)

    expect(top.service.state.get()).toBe('open')
    expect(changes).toEqual([{ open: false, reason: 'interact-outside' }])
    expect(lower.service.state.get()).toBe('open')
  })

  it('禁止 Popover 层外交互关闭时未 preventDefault 也以未退栈形成屏障', async () => {
    const config = createRuntimeConfig()
    const lower = mountPopover(config)
    const top = mountPopover(config, { closeOnInteractOutside: false })
    const target = element('button')
    await arm()

    pointerDown(target)

    expect(top.service.state.get()).toBe('open')
    expect(lower.service.state.get()).toBe('open')
  })

  it('默认 Tour surface 交互不关闭，遮罩层与未退栈共同阻断下层', async () => {
    const config = createRuntimeConfig()
    const lower = mountPopover(config)
    const top = mountTour(config)
    await arm()

    pointerDown(top.backdrop)

    expect(top.service.state.get()).toBe('open')
    expect(lower.service.state.get()).toBe('open')
  })

  it('分页省略层同步退栈后协调器继续关闭下层 Popover', async () => {
    const config = createRuntimeConfig()
    const lower = mountPopover(config)
    const top = mountPagination(config)
    const target = element('button')
    await arm()

    pointerDown(target)

    expect(top.service.state.get()).toBe('closed')
    expect(lower.service.state.get()).toBe('closed')
    expect(config.layerRegistry.list()).toEqual([])
  })
})
