// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface ConfigScope extends HTMLElement {
  mode?: 'light' | 'dark'
  updateComplete: Promise<unknown>
}

function select(): HTMLElement {
  const host = document.createElement('xh-select')
  host.setAttribute('open', '')
  host.innerHTML = `
    <button data-xh-part="trigger">打开</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content"><div data-xh-part="list"></div></div>
    </div>
  `
  return host
}

async function settle(hosts: HTMLElement[]): Promise<void> {
  for (let round = 0; round < 7; round++) {
    await Promise.resolve()
    for (const host of hosts)
      await (host as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('web Components 浮层的局部视觉环境', () => {
  it('<xh-config> 的单一七轴设置经来源 scope 桥接到物理 Portal 实例壳', async () => {
    const region = document.createElement('xh-config') as ConfigScope
    region.setAttribute('mode', 'dark')
    region.setAttribute('brand', 'acme')
    region.setAttribute('density', 'compact')
    region.setAttribute('contrast', 'more')
    region.setAttribute('motion', 'reduce')
    region.setAttribute('transparency', 'reduce')
    region.setAttribute('direction', 'rtl')
    region.style.setProperty('--business-color', 'rebeccapurple')
    const host = select()
    const positioner = host.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    region.append(host)
    document.body.append(region)
    await settle([region, host])

    const shell = positioner.closest<HTMLElement>('[data-xh-portal-shell]')!
    expect(shell).not.toBeNull()
    expect(shell.getAttribute('data-theme')).toBe('dark')
    expect(shell.getAttribute('data-brand')).toBe('acme')
    expect(shell.getAttribute('data-density')).toBe('compact')
    expect(shell.getAttribute('data-contrast')).toBe('more')
    expect(shell.getAttribute('data-motion')).toBe('reduce')
    expect(shell.getAttribute('data-transparency')).toBe('reduce')
    expect(shell.getAttribute('dir')).toBe('rtl')
    expect(shell.style.getPropertyValue('--business-color')).toBe('rebeccapurple')

    region.mode = 'light'
    await region.updateComplete
    await Promise.resolve()
    expect(shell.getAttribute('data-theme')).toBe('light')
  })

  it('同页两棵 <xh-config> 的局部 scope 与 Portal 壳互不串值', async () => {
    const dark = document.createElement('xh-config')
    const light = document.createElement('xh-config')
    dark.setAttribute('mode', 'dark')
    light.setAttribute('mode', 'light')
    const first = select()
    const second = select()
    const firstPositioner = first.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const secondPositioner = second.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    dark.append(first)
    light.append(second)
    document.body.append(dark, light)
    await settle([dark, light, first, second])

    const firstShell = firstPositioner.closest<HTMLElement>('[data-xh-portal-shell]')!
    const secondShell = secondPositioner.closest<HTMLElement>('[data-xh-portal-shell]')!
    expect(firstShell).not.toBe(secondShell)
    expect(firstShell.getAttribute('data-theme')).toBe('dark')
    expect(secondShell.getAttribute('data-theme')).toBe('light')
  })
})
