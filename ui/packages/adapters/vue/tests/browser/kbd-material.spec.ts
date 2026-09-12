import type { App, VNode } from 'vue'
import { cdp } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhKbd, XhKbdGroup } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(render: () => VNode, density: 'comfortable' | 'compact' = 'comfortable'): HTMLElement {
  document.documentElement.dataset.density = density
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
  delete document.documentElement.dataset.density
})

describe('kbd / KbdGroup 实体键帽', () => {
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

  it('compact 收紧缺省键帽，200% CSS zoom 下组合仍是不拆分单元', () => {
    const comfortable = mount(() => h(XhKbdGroup, { keys: ['Mod', 'Shift', 'P'], platform: 'other' }))
    const comfortableKey = comfortable.querySelector<HTMLElement>('[data-part="key"]')!
    const comfortableWidth = comfortableKey.getBoundingClientRect().width
    app?.unmount()
    comfortable.remove()
    app = null
    host = null

    const compact = mount(() => h('div', { style: { inlineSize: '160px', zoom: '2' } }, [
      h(XhKbdGroup, { keys: ['Mod', 'Shift', 'P'], platform: 'other' }),
    ]), 'compact')
    const group = compact.querySelector<HTMLElement>('[data-scope="kbd-group"][data-part="root"]')!
    const compactKey = group.querySelector<HTMLElement>('[data-part="key"]')!
    expect(compactKey.getBoundingClientRect().width).toBeLessThan(comfortableWidth * 2)
    expect(getComputedStyle(group).whiteSpace).toBe('nowrap')
  })

  it('只有显式 pressed 才减弱底缘压感并轻压', () => {
    const root = mount(() => h('div', null, [
      h(XhKbd, { 'value': 'S', 'data-test-rest': '' }),
      h(XhKbd, { 'value': 'S', 'pressed': true, 'data-test-pressed': '' }),
    ]))
    const rest = root.querySelector<HTMLElement>('[data-test-rest]')!
    const pressed = root.querySelector<HTMLElement>('[data-test-pressed]')!
    expect(getComputedStyle(rest).boxShadow).not.toBe('none')
    expect(getComputedStyle(pressed).boxShadow).not.toBe(getComputedStyle(rest).boxShadow)
    expect(getComputedStyle(pressed).translate).not.toBe('none')
  })

  it('禁用后代只命中 kbd-group 自己的 key，其他 scope 的同名 part 不被污染', () => {
    const root = mount(() => h(XhKbdGroup, { keys: ['S'], disabled: true }))
    const group = root.querySelector<HTMLElement>('[data-scope="kbd-group"][data-part="root"]')!
    const foreign = document.createElement('span')
    foreign.dataset.scope = 'foreign'
    foreign.dataset.part = 'key'
    group.append(foreign)
    expect(getComputedStyle(foreign).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('forced-colors 下禁用键帽和分隔符使用系统 GrayText', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    const root = mount(() => h(XhKbdGroup, { keys: ['Mod', 'S'], disabled: true, platform: 'other' }))
    const key = root.querySelector<HTMLElement>('[data-part="key"]')!
    const separator = root.querySelector<HTMLElement>('[data-part="separator"]')!
    const reference = document.createElement('span')
    reference.style.color = 'GrayText'
    document.body.append(reference)
    expect(getComputedStyle(key).color).toBe(getComputedStyle(reference).color)
    expect(getComputedStyle(separator).color).toBe(getComputedStyle(reference).color)
    reference.remove()
  })
})
