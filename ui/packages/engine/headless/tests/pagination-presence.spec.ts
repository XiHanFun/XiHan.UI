// @vitest-environment jsdom
import type { ExitLease } from '@xihan-ui/core/presence'
import type { SelectSchema } from '../src/select'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectPagination, paginationMachine, paginationPageSizeSelectProps } from '../src/pagination'
import { selectMachine } from '../src/select'

describe('pagination 省略位真实退场资源', () => {
  it('逻辑关闭后等待 Presence 才释放 Layer，且立即退出交互树', () => {
    const runtime = createVanillaRuntime()
    const service = createService(paginationMachine, { props: () => ({ count: 2000 }), runtime })
    const select = createService<SelectSchema>(selectMachine, {
      props: () => paginationPageSizeSelectProps(service),
      runtime,
    })
    const config = createRuntimeConfig()
    const content = document.createElement('div')
    const trigger = document.createElement('button')
    document.body.append(trigger, content)
    const presence = createPresence({ config, open: false, onRenderedChange: () => {} })
    service.refs.set('config', config)
    service.refs.set('presence', presence)
    service.refs.set('registerLayer', () => config.layerRegistry.register({
      kind: 'popover',
      node: () => content,
      branches: () => [trigger],
      isModal: () => false,
      surfaces: () => [],
    }))
    runtime.start()

    service.send({ type: 'ELLIPSIS.TOGGLE', side: 'start' })
    presence.update(true)
    expect(config.layerRegistry.list()).toHaveLength(1)

    let currentLease: ExitLease | null = null
    const lease = (): ExitLease | null => currentLease
    const offBeforeExit = presence.onBeforeExit(() => {
      currentLease = presence.claimExit('pagination test exit')
    })
    service.send({ type: 'ELLIPSIS.CLOSE' })
    const closed = connectPagination({ root: service, pageSizeSelect: select }, normalizeProps).getContentProps() as Record<string, unknown>
    expect(closed.inert).toBe(true)
    expect(closed['aria-hidden']).toBe(true)
    expect(config.layerRegistry.list()).toHaveLength(1)

    presence.update(false)
    expect(lease()?.settled).toBe(false)
    lease()?.done()
    expect(config.layerRegistry.list()).toHaveLength(0)

    offBeforeExit()
    presence.dispose()
    runtime.stop()
  })
})
