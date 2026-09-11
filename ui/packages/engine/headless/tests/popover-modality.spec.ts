// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import type { ExitLease } from '@xihan-ui/core/presence'
import type { PopoverSchema } from '../src'
import { createLayerRegistry, createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectPopover, popoverMachine } from '../src'

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

function fixture(initial: PopoverSchema['props'] = { defaultOpen: true, modal: true }) {
  const outside = document.createElement('button')
  const trigger = document.createElement('button')
  const positioner = document.createElement('div')
  const content = document.createElement('div')
  content.tabIndex = -1
  content.append(document.createElement('button'))
  positioner.append(content)
  document.body.append(outside, trigger, positioner)

  const config = createRuntimeConfig()
  const presence = createPresence({ config, open: true, onRenderedChange: () => {} })
  const leases: ExitLease[] = []
  presence.onBeforeExit(() => leases.push(presence.claimExit('popover exit')))
  const runtime = createVanillaRuntime()
  const props = runtime.signal<PopoverSchema['props']>(initial)
  const service = createService(popoverMachine, { runtime, props: props.get })
  const register = vi.fn(() => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    branches: () => [trigger, positioner],
    isModal: () => service.prop('modal') ?? false,
    surfaces: () => [],
  }))
  service.refs.set('config', config)
  service.refs.set('registerLayer', register)
  service.refs.set('presence', presence)
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)
  runtime.start()
  cleanup.push(() => presence.dispose(), () => runtime.stop())
  return { config, content, leases, outside, presence, props, register, runtime, service }
}

describe('popover 完整模态资源', () => {
  it('展开期间动态切换锁页与背景失活，并保留后开的 portal 层', async () => {
    const f = fixture()
    await flush()
    expect(f.outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(f.config.layerRegistry.top()?.isModal()).toBe(true)

    const nested = document.createElement('button')
    document.body.append(nested)
    const nestedLayer = f.config.layerRegistry.register({
      kind: 'popover',
      node: () => nested,
      branches: () => [],
      isModal: () => false,
      surfaces: () => [],
    })
    expect(nested.inert).not.toBe(true)
    nestedLayer.dispose()

    f.props.set({ ...f.props.get(), modal: false })
    expect(f.outside.inert).not.toBe(true)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(f.config.layerRegistry.top()?.isModal()).toBe(false)

    f.props.set({ ...f.props.get(), modal: true })
    await flush()
    expect(f.outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('逻辑关闭立即失活内容，但行为资源保留到 Presence 完成', async () => {
    const f = fixture()
    await flush()
    f.service.send({ type: 'CLOSE' })
    const contentProps = connectPopover(f.service, normalizeProps).getContentProps()
    expect(contentProps.inert).toBe(true)
    expect(contentProps['aria-hidden']).toBe(true)
    f.presence.update(false)
    expect(f.presence.rendered).toBe(true)
    expect(f.config.layerRegistry.list()).toHaveLength(1)
    expect(f.outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')

    f.leases[0]!.done()
    expect(f.config.layerRegistry.list()).toHaveLength(0)
    expect(f.outside.inert).not.toBe(true)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('退场重开沿用原登记，卸载立即释放且迟到完成无副作用', async () => {
    const f = fixture()
    await flush()
    f.service.send({ type: 'CLOSE' })
    f.presence.update(false)
    f.service.send({ type: 'OPEN' })
    expect(f.leases[0]!.settled).toBe(true)
    expect(f.register).toHaveBeenCalledTimes(1)
    expect(f.config.layerRegistry.list()).toHaveLength(1)

    f.service.send({ type: 'CLOSE' })
    f.presence.update(false)
    f.runtime.stop()
    expect(f.config.layerRegistry.list()).toHaveLength(0)
    expect(f.outside.inert).not.toBe(true)
    f.leases[1]!.done()
    expect(f.config.layerRegistry.list()).toHaveLength(0)
  })

  it('消解层同步初始化失败时回滚已经登记的层', () => {
    const registry = createLayerRegistry(document)
    const runtime = createVanillaRuntime()
    const service = createService(popoverMachine, { runtime, props: () => ({ defaultOpen: true }) })
    const disposeLayer = vi.fn()
    service.refs.set('config', {
      scope: { getDoc: () => { throw new Error('scope failed') } },
      layerRegistry: registry,
    } as unknown as RuntimeConfig)
    service.refs.set('registerLayer', () => {
      const registration = registry.register({
        kind: 'popover',
        node: () => document.createElement('div'),
        branches: () => [],
        isModal: () => false,
        surfaces: () => [],
      })
      return {
        layer: registration.layer,
        dispose: () => {
          disposeLayer()
          registration.dispose()
        },
      }
    })

    expect(() => runtime.start()).toThrow('scope failed')
    expect(disposeLayer).toHaveBeenCalledTimes(1)
    expect(registry.list()).toEqual([])
  })
})
