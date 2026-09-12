// @vitest-environment jsdom

import type { RuntimeConfig } from '@xihan-ui/core'
import { createRuntimeConfig } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PortalLeaseController } from '../src/runtime/portal-lease-controller'

interface Fixture {
  controller: PortalLeaseController
  configured: HTMLElement
  instance: HTMLElement
  root: HTMLElement
  setResolver: (resolver: (() => Element | null) | undefined) => void
}

function fixture(): Fixture {
  const stage = document.createElement('section')
  const source = document.createElement('button')
  const root = document.createElement('div')
  const configured = document.createElement('div')
  const instance = document.createElement('div')
  stage.append(source, root)
  document.body.append(stage, configured, instance)
  const config: RuntimeConfig = createRuntimeConfig({ portalContainer: () => configured })
  let resolver: (() => Element | null) | undefined
  const controller = new PortalLeaseController({
    name: 'Probe',
    config: () => config,
    portalContainer: () => resolver,
    source: () => source,
    roots: () => [root],
    onChange: vi.fn(),
  })
  return {
    controller,
    configured,
    instance,
    root,
    setResolver: next => void (resolver = next),
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('portalLeaseController 实例容器', () => {
  it('仅在实例解析器缺席时使用 RuntimeConfig，并可原子迁移到实例目标', () => {
    const f = fixture()
    f.controller.sync(true)
    expect(f.root.parentElement?.parentElement).toBe(f.configured)

    f.setResolver(() => f.instance)
    f.controller.sync(true)
    expect(f.root.parentElement?.parentElement).toBe(f.instance)
    expect(f.configured.querySelector('[data-xh-portal-shell]')).toBeNull()
  })

  it('实例解析器返回 null 时明确失败、释放旧租约且不回退配置目标', () => {
    const f = fixture()
    f.controller.sync(true)
    f.setResolver(() => null)

    expect(() => f.controller.sync(true)).toThrow(/portalContainer/)
    expect(f.root.closest('[data-xh-portal-shell]')).toBeNull()
    expect(f.configured.querySelector('[data-xh-portal-shell]')).toBeNull()
  })

  it('实例目标跨 Document 或未连接时沿用 Core 严格校验', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const foreign = frame.contentDocument!.createElement('div')
    frame.contentDocument!.body.append(foreign)
    const crossRealm = fixture()
    crossRealm.setResolver(() => foreign)
    expect(() => crossRealm.controller.sync(true)).toThrow(/同一 Document/)

    const detached = fixture()
    detached.setResolver(() => document.createElement('div'))
    expect(() => detached.controller.sync(true)).toThrow(/必须连接/)
    frame.remove()
  })
})
