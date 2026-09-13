/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 kbd material 相关行为。

import type { App, VNode } from 'vue'
import { cdp } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhKbd, XhKbdGroup } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(render: () => VNode): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  return host
}

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

describe('kbd / KbdGroup 键帽', () => {
  it('使用原生 kbd，组合在 RTL 文本里仍保持物理键位顺序且整组只命名一次', () => {
    const root = mount(() => h('div', { dir: 'rtl' }, [
      h(XhKbdGroup, { keys: ['Mod', 'S'], platform: 'other' }),
    ]))
    const group = root.querySelector<HTMLElement>('[data-scope="kbd-group"][data-part="root"]')!
    const keys = [...group.querySelectorAll<HTMLElement>('[data-part="key"]')]

    expect(group.getAttribute('role')).toBe('img')
    expect(group.getAttribute('aria-label')).toBe('Control + S')
    expect(keys.every(key => key.localName === 'kbd' && key.getAttribute('aria-hidden') === 'true')).toBe(true)
    expect(keys[0]!.getBoundingClientRect().left).toBeLessThan(keys[1]!.getBoundingClientRect().left)
  })

  it('组合根承载唯一键帽表面，各枚键名不再各画一层框', () => {
    const root = mount(() => h(XhKbdGroup, { keys: ['Mod', 'Shift', 'P'], platform: 'other' }))
    const group = root.querySelector<HTMLElement>('[data-scope="kbd-group"][data-part="root"]')!
    const keys = [...group.querySelectorAll<HTMLElement>('[data-part="key"]')]
    expect(getComputedStyle(group).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(keys.every(key => getComputedStyle(key).backgroundColor === 'rgba(0, 0, 0, 0)')).toBe(true)
    expect(keys.every(key => getComputedStyle(key).borderTopWidth === '0px')).toBe(true)
    expect(getComputedStyle(group).whiteSpace).toBe('nowrap')
  })

  it('单枚 Kbd 固定一档尺寸，default 有中性底、light 保持透明', () => {
    const root = mount(() => h('div', null, [
      h(XhKbd, { 'value': 'S', 'data-test-default': '' }),
      h(XhKbd, { 'value': 'S', 'variant': 'light', 'data-test-light': '' }),
    ]))
    const standard = root.querySelector<HTMLElement>('[data-test-default]')!
    const light = root.querySelector<HTMLElement>('[data-test-light]')!
    expect(standard.dataset.variant).toBe('default')
    expect(light.dataset.variant).toBe('light')
    expect(getComputedStyle(standard).height).toBe(getComputedStyle(light).height)
    expect(getComputedStyle(standard).boxShadow).toBe('none')
    expect(getComputedStyle(standard).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(light).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('组合键不生成可见加号或 separator 节点', () => {
    const root = mount(() => h(XhKbdGroup, { keys: ['Mod', 'S'], platform: 'other' }))
    const group = root.querySelector<HTMLElement>('[data-scope="kbd-group"][data-part="root"]')!
    expect(group.querySelector('[data-part="separator"]')).toBeNull()
    expect(group.textContent).toBe('CtrlS')
  })

  it('forced-colors 下由组合根提供系统边界', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    const root = mount(() => h(XhKbdGroup, { keys: ['Mod', 'S'], platform: 'other' }))
    const group = root.querySelector<HTMLElement>('[data-scope="kbd-group"][data-part="root"]')!
    const reference = document.createElement('span')
    reference.style.color = 'ButtonText'
    document.body.append(reference)
    expect(getComputedStyle(group).borderTopColor).toBe(getComputedStyle(reference).color)
    reference.remove()
  })
})
