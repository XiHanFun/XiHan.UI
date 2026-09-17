// 验证 Kbd 键盘按键的真实浏览器材质。

import type { App, VNode } from 'vue'
import { cdp } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhKbd } from '../../src'
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

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

describe('kbd 键盘按键', () => {
  it('单键和组合键都使用一个原生 kbd 表面，RTL 中仍保持物理键位顺序', () => {
    const root = mount(() => h('div', { dir: 'rtl' }, [
      h(XhKbd, { keys: ['Mod', 'S'], platform: 'other' }),
    ]))
    const kbd = root.querySelector<HTMLElement>('[data-scope="kbd"][data-part="root"]')!
    const keys = [...kbd.querySelectorAll<HTMLElement>('[data-part="key"]')]

    expect(kbd.localName).toBe('kbd')
    expect(kbd.getAttribute('aria-label')).toBe('Control + S')
    expect(keys.every(key => key.localName === 'span' && key.getAttribute('aria-hidden') === 'true')).toBe(true)
    expect(keys[0]!.getBoundingClientRect().left).toBeLessThan(keys[1]!.getBoundingClientRect().left)
  })

  it('组合键只绘制一个 Hero 风格表面，逐键不重复边框或背景', () => {
    const root = mount(() => h(XhKbd, { keys: ['Mod', 'Shift', 'P'], platform: 'other' }))
    const kbd = root.querySelector<HTMLElement>('[data-scope="kbd"][data-part="root"]')!
    const keys = [...kbd.querySelectorAll<HTMLElement>('[data-part="key"]')]
    expect(getComputedStyle(kbd).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(keys.every(key => getComputedStyle(key).backgroundColor === 'rgba(0, 0, 0, 0)')).toBe(true)
    expect(keys.every(key => getComputedStyle(key).borderTopWidth === '0px')).toBe(true)
    expect(getComputedStyle(kbd).columnGap).toBe('4px')
    expect(kbd.textContent).toBe('CtrlShiftP')
    expect(kbd.querySelector('[data-part="separator"]')).toBeNull()
  })

  it('default 使用中性底，light 保持透明且尺寸一致', () => {
    const root = mount(() => h('div', null, [
      h(XhKbd, { 'keys': ['S'], 'data-test-default': '' }),
      h(XhKbd, { 'keys': ['S'], 'variant': 'light', 'data-test-light': '' }),
    ]))
    const standard = root.querySelector<HTMLElement>('[data-test-default]')!
    const light = root.querySelector<HTMLElement>('[data-test-light]')!
    expect(getComputedStyle(standard).height).toBe(getComputedStyle(light).height)
    expect(getComputedStyle(standard).boxShadow).toBe('none')
    expect(getComputedStyle(standard).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(light).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('键帽是 subtle 材质的 control 形状：透明边位 + 淡底 + 无影，字号取次级标注档 12px，键帽高 24px', () => {
    const root = mount(() => h(XhKbd, { keys: ['Mod', 'K'], platform: 'other' }))
    const kbd = root.querySelector<HTMLElement>('[data-scope="kbd"][data-part="root"]')!
    const style = getComputedStyle(kbd)
    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(style.boxShadow).toBe('none')
    expect(style.borderTopLeftRadius).toBe('4px')
    expect(Number.parseFloat(style.fontSize)).toBe(12)
    expect(kbd.getBoundingClientRect().height).toBe(24)
  })

  it('forced-colors 下由根键帽提供系统边界', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    const root = mount(() => h(XhKbd, { keys: ['Mod', 'S'], platform: 'other' }))
    const kbd = root.querySelector<HTMLElement>('[data-scope="kbd"][data-part="root"]')!
    const reference = document.createElement('span')
    reference.style.color = 'ButtonText'
    document.body.append(reference)
    expect(getComputedStyle(kbd).borderTopColor).toBe(getComputedStyle(reference).color)
    reference.remove()
  })
})
