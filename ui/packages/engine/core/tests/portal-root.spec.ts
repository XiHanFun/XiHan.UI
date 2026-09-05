// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { PORTAL_ROOT_ID } from '../src/kernel/constants'
import { createRuntimeConfig } from '../src/kernel/runtime-config'
import { ensurePortalRoot } from '../src/kernel/structure/portal-root'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('portal 落点', () => {
  it('重复调用返回同一个节点', () => {
    const first = ensurePortalRoot(document)
    expect(ensurePortalRoot(document)).toBe(first)
    expect(document.querySelectorAll(`#${PORTAL_ROOT_ID}`)).toHaveLength(1)
  })

  it('id 走常量', () => {
    expect(ensurePortalRoot(document).id).toBe(PORTAL_ROOT_ID)
  })

  it('挂成 body 的最后一个子元素', () => {
    document.body.append(document.createElement('main'))
    const root = ensurePortalRoot(document)
    expect(root.parentElement).toBe(document.body)
    expect(document.body.lastElementChild).toBe(root)
  })

  // 浮层子元素都是 position: fixed，落点自身不占布局高度，任何样式都只会平白建出层叠上下文或包含块
  it('只带一个 id 属性，不写任何样式', () => {
    const root = ensurePortalRoot(document)
    expect(root.getAttribute('style')).toBeNull()
    expect(root.getAttribute('class')).toBeNull()
    expect(root.attributes).toHaveLength(1)
  })

  it('节点被外部摘掉后重建', () => {
    const first = ensurePortalRoot(document)
    first.remove()
    const next = ensurePortalRoot(document)
    expect(next).not.toBe(first)
    expect(next.isConnected).toBe(true)
    expect(document.body.lastElementChild).toBe(next)
  })

  it('文档里已有同 id 节点时直接复用', () => {
    const manual = document.createElement('div')
    manual.id = PORTAL_ROOT_ID
    document.body.append(manual)
    expect(ensurePortalRoot(document)).toBe(manual)
  })

  it('多个 document 各有各的落点', () => {
    const other = document.implementation.createHTMLDocument('other')
    const root = ensurePortalRoot(document)
    const otherRoot = ensurePortalRoot(other)

    expect(otherRoot).not.toBe(root)
    expect(otherRoot.ownerDocument).toBe(other)
    expect(other.body.lastElementChild).toBe(otherRoot)
    expect(document.body.contains(otherRoot)).toBe(false)
    expect(ensurePortalRoot(other)).toBe(otherRoot)
    expect(ensurePortalRoot(document)).toBe(root)
  })
})

describe('runtimeConfig 的 portalContainer 默认值', () => {
  it('默认解析到 portal 落点', () => {
    expect(createRuntimeConfig().portalContainer()).toBe(ensurePortalRoot(document))
  })

  it('构造时不建落点，调用解析器才建', () => {
    const config = createRuntimeConfig()
    expect(document.getElementById(PORTAL_ROOT_ID)).toBeNull()
    expect(config.portalContainer()).toBe(document.getElementById(PORTAL_ROOT_ID))
  })

  it('显式传入的解析器优先', () => {
    const custom = document.createElement('div')
    expect(createRuntimeConfig({ portalContainer: () => custom }).portalContainer()).toBe(custom)
  })
})
