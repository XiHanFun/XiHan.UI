// @vitest-environment jsdom
import type { ExitLease, PresenceHandle } from '@xihan-ui/core/presence'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectSideNav, sideNavMachine } from '../src/side-nav'

const COLLECTION = [
  { value: 'products', children: [{ value: 'product-a' }] },
  { value: 'docs', children: [{ value: 'doc-a' }] },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function presenceWithExit(config: ReturnType<typeof createRuntimeConfig>): {
  presence: PresenceHandle
  lease: () => ExitLease | null
} {
  let current: ExitLease | null = null
  const presence = createPresence({ config, open: false, onRenderedChange: () => {} })
  presence.onBeforeExit(() => {
    current = presence.claimExit('side-nav test exit')
  })
  return { presence, lease: () => current }
}

describe('sideNav 弹出面板真实退场资源', () => {
  it('按分支 Presence 配对退出，新分支接管 Layer 后不受旧完成信号影响', async () => {
    const runtime = createVanillaRuntime()
    const service = createService(sideNavMachine, {
      props: () => ({ collection: COLLECTION, collapsed: true }),
      runtime,
    })
    const config = createRuntimeConfig()
    const nodes = new Map<string, { trigger: HTMLElement, content: HTMLElement, positioner: HTMLElement }>()
    for (const value of ['products', 'docs']) {
      const trigger = document.createElement('button')
      const content = document.createElement('ul')
      const link = document.createElement('a')
      link.dataset.scope = 'side-nav'
      link.dataset.part = 'link'
      link.dataset.value = `${value}-child`
      content.append(link)
      const positioner = document.createElement('div')
      positioner.append(content)
      document.body.append(trigger, positioner)
      nodes.set(value, { trigger, content, positioner })
    }
    service.refs.set('config', config)
    service.refs.set('registerLayer', value => config.layerRegistry.register({
      kind: 'popover',
      node: () => nodes.get(value)?.content ?? null,
      branches: () => [nodes.get(value)?.trigger].filter(Boolean) as Element[],
      isModal: () => false,
      surfaces: () => [],
    }))
    service.refs.set('getPopoutAnchorEl', value => nodes.get(value)?.trigger ?? null)
    service.refs.set('getPopoutContentEl', value => nodes.get(value)?.content ?? null)
    service.refs.set('getPopoutPositionerEl', value => nodes.get(value)?.positioner ?? null)
    runtime.start()

    const products = presenceWithExit(config)
    const docs = presenceWithExit(config)
    service.send({ type: 'PRESENCE.SET', value: 'products', presence: products.presence, connected: true })
    service.send({ type: 'PRESENCE.SET', value: 'docs', presence: docs.presence, connected: true })

    service.send({ type: 'POPOUT.OPEN', value: 'products', focus: 'none' })
    products.presence.update(true)
    expect(config.layerRegistry.list()).toHaveLength(1)

    service.send({ type: 'POPOUT.CLOSE', src: 'hover' })
    service.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    docs.presence.update(true)
    products.presence.update(false)
    await Promise.resolve()
    expect(config.layerRegistry.list()).toHaveLength(2)

    products.lease()?.done()
    expect(config.layerRegistry.list()).toHaveLength(2)
    expect(service.state.get()).toBe('popout')
    expect(service.context.get('popoutValue')).toBe('docs')

    service.send({ type: 'POPOUT.CLOSE', src: 'hover' })
    docs.presence.update(false)
    await Promise.resolve()
    const closed = connectSideNav(service, normalizeProps).getBranchContentProps({ value: 'docs' }) as Record<string, unknown>
    expect(closed.inert).toBe(true)
    expect(closed['aria-hidden']).toBe(true)
    docs.lease()?.done()
    await Promise.resolve()
    expect(config.layerRegistry.list()).toHaveLength(0)

    products.presence.dispose()
    docs.presence.dispose()
    runtime.stop()
  })

  it('退场面板卸载时立即释放对应 Layer', async () => {
    const runtime = createVanillaRuntime()
    const service = createService(sideNavMachine, {
      props: () => ({ collection: COLLECTION, collapsed: true }),
      runtime,
    })
    const config = createRuntimeConfig()
    const content = document.createElement('ul')
    const trigger = document.createElement('button')
    document.body.append(trigger, content)
    service.refs.set('config', config)
    service.refs.set('registerLayer', () => config.layerRegistry.register({
      kind: 'popover',
      node: () => content,
      branches: () => [trigger],
      isModal: () => false,
      surfaces: () => [],
    }))
    service.refs.set('getPopoutAnchorEl', () => trigger)
    service.refs.set('getPopoutContentEl', () => content)
    service.refs.set('getPopoutPositionerEl', () => content)
    runtime.start()
    const gate = presenceWithExit(config)
    service.send({ type: 'PRESENCE.SET', value: 'products', presence: gate.presence, connected: true })
    service.send({ type: 'POPOUT.OPEN', value: 'products', focus: 'none' })
    gate.presence.update(true)
    service.send({ type: 'POPOUT.CLOSE', src: 'hover' })
    gate.presence.update(false)
    await Promise.resolve()
    expect(config.layerRegistry.list()).toHaveLength(1)

    service.send({ type: 'PRESENCE.SET', value: 'products', presence: gate.presence, connected: false })
    expect(config.layerRegistry.list()).toHaveLength(0)
    gate.presence.dispose()
    runtime.stop()
  })
})
