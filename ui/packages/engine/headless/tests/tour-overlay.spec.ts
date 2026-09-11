// @vitest-environment jsdom
// Tour 的视觉节点由适配器留在 DOM，Headless 只负责把 Layer、消解与焦点域留到 Presence 真正退出。
import type { Service } from '@xihan-ui/core'
import type { ExitLease, PresenceHandle } from '@xihan-ui/core/presence'
import type { TourOpenChangeDetails, TourSchema } from '../src/tour'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectTour, tourMachine } from '../src/tour'

interface Harness {
  service: Service<TourSchema>
  config: ReturnType<typeof createRuntimeConfig>
  presence: PresenceHandle
  content: HTMLElement
  outside: HTMLButtonElement
  changes: TourOpenChangeDetails[]
  stop: () => void
}

const live: Harness[] = []

function makeHarness(initial: TourSchema['props'] = {}): Harness {
  const outside = document.createElement('button')
  const backdrop = document.createElement('div')
  const content = document.createElement('div')
  content.tabIndex = -1
  document.body.append(outside, backdrop, content)

  const config = createRuntimeConfig()
  const changes: TourOpenChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const service = createService(tourMachine, {
    props: () => ({ ...initial, onOpenChange: details => changes.push(details) }),
    runtime,
  })
  const presence = createPresence({
    config,
    open: service.state.get() === 'open',
    onRenderedChange: () => {},
  })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    surfaces: () => [backdrop],
  }))
  service.refs.set('presence', presence)
  service.refs.set('getContentEl', () => content)
  runtime.start()

  const harness: Harness = {
    service,
    config,
    presence,
    content,
    outside,
    changes,
    stop: () => {
      runtime.stop()
      presence.dispose()
    },
  }
  live.push(harness)
  return harness
}

afterEach(() => {
  for (const harness of live.splice(0)) harness.stop()
  document.body.innerHTML = ''
})

async function open(harness: Harness): Promise<void> {
  harness.service.send({ type: 'OPEN' })
  // 适配器会在 data-state 提交后做同一次同步；逻辑 harness 明确模拟该时机。
  harness.presence.update(true)
  await new Promise(resolve => setTimeout(resolve, 0))
}

function pressEscape(element: HTMLElement): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
}

describe('Tour 与 Presence 共用退出生命周期', () => {
  it('逻辑关闭立即失活内容，Layer、消解与焦点域留到退出租约完成', async () => {
    const h = makeHarness()
    await open(h)
    expect(h.config.layerRegistry.list()).toHaveLength(1)
    // Tour 只持有自身原有资源，不趁这次生命周期接入滚动锁或背景失活。
    expect(h.outside.inert).not.toBeTruthy()
    expect(document.body.style.overflow).not.toBe('hidden')

    let lease: ExitLease | null = null
    const offBeforeExit = h.presence.onBeforeExit(() => {
      lease = h.presence.claimExit('tour-animation')
    })
    h.service.send({ type: 'CLOSE', src: 'close-trigger' })

    const content = connectTour(h.service, normalizeProps).getContentProps()
    expect(content.inert).toBe(true)
    expect(content['aria-hidden']).toBe(true)
    expect(h.config.layerRegistry.list()).toHaveLength(1)

    h.presence.update(false)
    expect(lease).not.toBeNull()
    expect(h.config.layerRegistry.list()).toHaveLength(1)
    pressEscape(h.content)
    expect(h.changes).toEqual([{ open: true }, { open: false }])

    lease!.done()
    offBeforeExit()
    expect(h.config.layerRegistry.list()).toHaveLength(0)
  })

  it('退场中重开结清旧租约并复用同一 Layer；停机立即释放', async () => {
    const h = makeHarness()
    await open(h)
    const original = h.config.layerRegistry.list()[0]
    let lease: ExitLease | null = null
    const offBeforeExit = h.presence.onBeforeExit(() => {
      lease = h.presence.claimExit('tour-animation')
    })

    h.service.send({ type: 'CLOSE' })
    h.presence.update(false)
    expect(h.config.layerRegistry.list()).toEqual([original])

    h.service.send({ type: 'OPEN' })
    // Headless 在逻辑重开同拍撤销旧租约，不等待适配器的下一轮视觉提交。
    expect(lease!.settled).toBe(true)
    expect(h.config.layerRegistry.list()).toEqual([original])

    h.stop()
    offBeforeExit()
    expect(h.config.layerRegistry.list()).toHaveLength(0)
  })
})
