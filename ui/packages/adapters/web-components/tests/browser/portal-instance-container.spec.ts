import type { RuntimeConfig } from '@xihan-ui/core'
import { createRuntimeConfig, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import { PortalLeaseController } from '../../src/runtime/portal-lease-controller'

interface PortalHost extends HTMLElement {
  open?: boolean
  portalContainer?: () => Element | null
  updateComplete: Promise<unknown>
}

defineXhElements()

function fixture(): { element: PortalHost, positioner: HTMLElement, stage: HTMLElement } {
  const stage = document.createElement('section')
  stage.dataset.theme = 'dark'
  stage.dataset.density = 'compact'
  stage.innerHTML = `<xh-popover><button data-xh-part="trigger"></button><div data-xh-part="positioner"><div data-xh-part="content"></div></div></xh-popover>`
  const element = stage.firstElementChild as PortalHost
  const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
  document.body.append(stage)
  return { element, positioner, stage }
}

async function settle(element: PortalHost): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function strictFixture(resolver: () => Element | null): {
  controller: PortalLeaseController
  configured: HTMLElement
  root: HTMLElement
} {
  const stage = document.createElement('section')
  const source = document.createElement('button')
  const root = document.createElement('div')
  const configured = document.createElement('div')
  stage.append(source, root)
  document.body.append(stage, configured)
  const config: RuntimeConfig = createRuntimeConfig({ portalContainer: () => configured })
  return {
    controller: new PortalLeaseController({
      name: 'Browser probe',
      config: () => config,
      portalContainer: () => resolver,
      source: () => source,
      roots: () => [root],
      onChange: () => {},
    }),
    configured,
    root,
  }
}

beforeEach(() => setDiagnosticsLevel('silent'))
afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

describe('wC 实例 Portal 容器严格合同', () => {
  it('实例目标优先并继续由 Core 壳桥接视觉环境', async () => {
    const target = document.createElement('div')
    document.body.append(target)
    const { element, positioner, stage } = fixture()
    element.portalContainer = () => target
    element.open = true
    await settle(element)

    const shell = positioner.parentElement!
    expect(shell.parentElement).toBe(target)
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.dataset.theme).toBe('dark')
    expect(shell.dataset.density).toBe('compact')
    expect(stage.contains(positioner)).toBe(false)
  })

  it('实例解析器返回 null 时不回退默认 Portal 根', () => {
    const f = strictFixture(() => null)

    expect(() => f.controller.sync(true)).toThrow(/portalContainer/)
    expect(f.root.closest('[data-xh-portal-shell]')).toBeNull()
    expect(f.configured.querySelector('[data-xh-portal-shell]')).toBeNull()
    expect(document.getElementById('xh-portal-root')).toBeNull()
  })

  it('跨 Document 与未连接实例目标沿用 Core 严格拒绝', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const foreign = frame.contentDocument!.createElement('div')
    frame.contentDocument!.body.append(foreign)
    const crossRealm = strictFixture(() => foreign)
    expect(() => crossRealm.controller.sync(true)).toThrow(/同一 Document/)

    const detached = strictFixture(() => document.createElement('div'))
    expect(() => detached.controller.sync(true)).toThrow(/必须连接/)
    frame.remove()
  })
})
