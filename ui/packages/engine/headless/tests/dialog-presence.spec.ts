// @vitest-environment jsdom
import type { ExitLease } from '@xihan-ui/core/presence'
import type { DialogSchema } from '../src'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectDialog, dialogMachine } from '../src'

const cleanup: Array<() => void> = []
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

function fixture(options: { animated?: boolean, reducedMotion?: boolean } = {}) {
  const content = document.createElement('div')
  content.tabIndex = -1
  content.append(document.createElement('button'))
  const outside = document.createElement('button')
  document.body.append(outside, content)
  const config = createRuntimeConfig({ reducedMotion: () => options.reducedMotion ?? false })
  const presence = createPresence({ config, open: false, onRenderedChange: () => {} })
  const leases: ExitLease[] = []
  if (options.animated ?? true)
    presence.onBeforeExit(() => leases.push(presence.claimExit('本次动画')))
  const completed: number[] = []
  const props: DialogSchema['props'] = { onExitComplete: () => completed.push(config.layerRegistry.list().length) }
  const runtime = createVanillaRuntime()
  const service = createService(dialogMachine, { runtime, props: () => props })
  const register = vi.fn(() => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    surfaces: () => [],
    isModal: () => true,
  }))
  service.refs.set('config', config)
  service.refs.set('registerLayer', register)
  service.refs.set('presence', presence)
  service.refs.set('getContentEl', () => content)
  runtime.start()
  cleanup.push(() => presence.dispose(), () => runtime.stop())
  return { content, outside, config, presence, leases, completed, service, runtime, register }
}

async function flush(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('对话框行为与 Presence 共用退出生命周期', () => {
  it('关闭立即失活内容，但保留模态资源至真实退出完成', async () => {
    const f = fixture()
    f.service.send({ type: 'OPEN' })
    await flush()
    expect(f.outside.inert).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    f.service.send({ type: 'CLOSE' })
    const content = connectDialog(f.service, normalizeProps).getContentProps()
    expect(content.inert).toBe(true)
    expect(content['aria-hidden']).toBe(true)
    f.presence.update(false)
    expect(f.presence.rendered).toBe(true)
    expect(f.config.layerRegistry.list()).toHaveLength(1)
    expect(f.outside.inert).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    f.leases[0]!.done()
    expect(f.config.layerRegistry.list()).toHaveLength(0)
    expect(f.outside.inert).toBeFalsy()
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(f.completed).toEqual([0])
  })

  it('退场中重开立即废弃旧完成且沿用原登记', async () => {
    const f = fixture()
    f.service.send({ type: 'OPEN' })
    await flush()
    f.service.send({ type: 'CLOSE' })
    f.presence.update(false)
    f.service.send({ type: 'OPEN' })
    // 不等待适配器下一次 DOM 提交，逻辑重开这一刻旧退出就已经失效。
    expect(f.leases[0]!.settled).toBe(true)
    f.leases[0]!.done()
    expect(f.presence.rendered).toBe(true)
    expect(f.register).toHaveBeenCalledTimes(1)
    expect(f.config.layerRegistry.list()).toHaveLength(1)
    expect(f.completed).toEqual([])
    expect(connectDialog(f.service, normalizeProps).getContentProps().inert).toBeUndefined()
    f.service.send({ type: 'CLOSE' })
    f.presence.update(false)
    f.leases[1]!.done()
    expect(f.completed).toEqual([0])
  })

  it('卸载不等待退出租约，也不发送用户退出完成事件', async () => {
    const f = fixture()
    f.service.send({ type: 'OPEN' })
    await flush()
    f.service.send({ type: 'CLOSE' })
    f.presence.update(false)
    f.runtime.stop()
    expect(f.config.layerRegistry.list()).toHaveLength(0)
    expect(f.outside.inert).toBeFalsy()
    f.leases[0]!.done()
    expect(f.completed).toEqual([])
  })

  it.each([{ animated: false }, { reducedMotion: true }])('无有效动画的关闭即时释放：%o', async (options) => {
    const f = fixture(options)
    f.service.send({ type: 'OPEN' })
    await flush()
    f.service.send({ type: 'CLOSE' })
    f.presence.update(false)
    expect(f.presence.rendered).toBe(false)
    expect(f.config.layerRegistry.list()).toHaveLength(0)
    expect(f.completed).toEqual([0])
  })

  it('两个表面租约全部完成前保持模态屏障', async () => {
    const f = fixture()
    let backdrop!: ExitLease
    f.presence.onBeforeExit(() => {
      backdrop = f.presence.claimExit('遮罩')
    })
    f.service.send({ type: 'OPEN' })
    await flush()
    f.service.send({ type: 'CLOSE' })
    f.presence.update(false)
    f.leases[0]!.done()
    expect(f.config.layerRegistry.list()).toHaveLength(1)
    expect(f.completed).toEqual([])
    backdrop.done()
    expect(f.completed).toEqual([0])
  })
})
