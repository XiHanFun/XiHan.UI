// @vitest-environment jsdom
import type { ExitLease, PresenceHandle } from '@xihan-ui/core/presence'
import type { VanillaRuntime } from '@xihan-ui/core/vanilla'
import type { CommandSchema } from '../src/command'
import type { TooltipSchema } from '../src/tooltip'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { commandMachine, connectCommand } from '../src/command'
import { connectTooltip, tooltipMachine } from '../src/tooltip'

const runtimes: VanillaRuntime[] = []

function commandHarness(onOpenChange = vi.fn()) {
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(null, idGenerator)
  const config = createRuntimeConfig({ scope, idGenerator })
  const trigger = document.createElement('button')
  trigger.id = scope.partId('command', 'trigger')
  const content = document.createElement('div')
  const input = document.createElement('input')
  content.append(input)
  document.body.append(trigger, content)
  const service = createService(commandMachine, {
    props: () => ({ defaultOpen: true, modal: true, onOpenChange }),
    runtime,
    scope,
  })
  const presence = createPresence({ config, open: true, onRenderedChange: () => {} })
  service.refs.set('config', config)
  service.refs.set('presence', presence)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    surfaces: () => [],
  }))
  service.refs.set('getContentEl', () => content)
  service.refs.set('getListEl', () => null)
  service.refs.set('getInputEl', () => input)
  runtime.start()
  return { service, presence, config, onOpenChange, api: () => connectCommand(service, normalizeProps) }
}

function tooltipHarness(onOpenChange = vi.fn()) {
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(null, idGenerator)
  const config = createRuntimeConfig({ scope, idGenerator })
  const trigger = document.createElement('button')
  const content = document.createElement('div')
  document.body.append(trigger, content)
  const service = createService(tooltipMachine, {
    props: () => ({ defaultOpen: true, onOpenChange }),
    runtime,
    scope,
  })
  const presence: PresenceHandle = createPresence({ config, open: true, onRenderedChange: () => {} })
  service.refs.set('config', config)
  service.refs.set('presence', presence)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'inline',
    node: () => content,
    branches: () => [trigger],
    isModal: () => false,
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => content)
  runtime.start()
  return { service, presence, config, onOpenChange, api: () => connectTooltip(service, normalizeProps) }
}

function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.stop()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('command 与 tooltip 真实退场资源', () => {
  it.each([
    ['command', commandHarness],
    ['tooltip', tooltipHarness],
  ] as const)('%s 关闭立即失活、退场禁重复消解、重开复用原 Layer', async (_name, mount) => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const h = mount()
    await tick()
    const original = h.config.layerRegistry.list()[0]
    expect(original).toBeDefined()
    const leases: ExitLease[] = []
    const stopExit = h.presence.onBeforeExit(() => {
      leases.push(h.presence.claimExit(`exit ${leases.length + 1}`))
    })

    h.service.send({ type: 'CLOSE' } as CommandSchema['event'] & TooltipSchema['event'])
    const closing = h.api().getContentProps() as Record<string, unknown>
    expect(closing.inert).toBe(true)
    expect(closing['aria-hidden']).toBe(true)
    h.presence.update(false)
    expect(leases).toHaveLength(1)
    expect(h.config.layerRegistry.list()).toEqual([original])

    h.onOpenChange.mockClear()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(h.onOpenChange).not.toHaveBeenCalled()

    h.service.send({ type: 'OPEN' } as CommandSchema['event'] & TooltipSchema['event'])
    expect(leases[0]!.settled).toBe(true)
    expect(h.config.layerRegistry.list()).toEqual([original])

    h.service.send({ type: 'CLOSE' } as CommandSchema['event'] & TooltipSchema['event'])
    h.presence.update(false)
    expect(leases).toHaveLength(2)
    leases[1]!.done()
    expect(h.config.layerRegistry.list()).toHaveLength(0)

    stopExit()
    h.presence.dispose()
  })
})

describe('tooltip delay 与 hover 语义', () => {
  it('进入/离开等待可取消，聚焦打开不被纯指针移出关闭，悬停返回撤销 closeDelay', () => {
    const runtime = createVanillaRuntime()
    runtimes.push(runtime)
    const service = createService(tooltipMachine, { props: () => ({}), runtime })
    runtime.start()

    service.send({ type: 'POINTER.ENTER' })
    expect(service.state.get()).toBe('opening')
    service.send({ type: 'POINTER.LEAVE' })
    expect(service.state.get()).toBe('closed')

    service.send({ type: 'FOCUS' })
    expect(service.state.get()).toBe('visible.open')
    service.send({ type: 'POINTER.LEAVE' })
    expect(service.state.get()).toBe('visible.open')
    service.send({ type: 'BLUR' })
    expect(service.state.get()).toBe('closed')

    service.send({ type: 'POINTER.ENTER' })
    service.send({ type: 'after.openDelay' })
    service.send({ type: 'POINTER.LEAVE' })
    expect(service.state.get()).toBe('visible.closing')
    service.send({ type: 'POINTER.ENTER' })
    expect(service.state.get()).toBe('visible.open')
  })
})
