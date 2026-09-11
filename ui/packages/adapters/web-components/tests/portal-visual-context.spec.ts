// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

function popover(): HTMLElement {
  const host = document.createElement('xh-popover')
  host.innerHTML = `
    <button data-xh-part="trigger">打开</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">内容</div>
    </div>
  `
  return host
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('web Components 浮层的局部视觉环境', () => {
  it('声明式浮层保持 Light DOM 原位结构，六轴沿真实祖先链自然继承', async () => {
    const region = document.createElement('section')
    region.setAttribute('data-theme', 'dark')
    region.setAttribute('data-brand', 'acme')
    region.setAttribute('data-density', 'compact')
    region.setAttribute('data-contrast', 'more')
    region.setAttribute('data-motion', 'reduce')
    region.setAttribute('dir', 'rtl')
    const host = popover()
    region.append(host)
    document.body.append(region)
    await (host as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete

    const positioner = host.querySelector<HTMLElement>('[data-part="positioner"]')!
    expect(positioner.closest('xh-popover')).toBe(host)
    expect(positioner.closest('[data-theme]')).toBe(region)
    expect(positioner.closest('[data-brand]')).toBe(region)
    expect(positioner.closest('[data-density]')).toBe(region)
    expect(positioner.closest('[data-contrast]')).toBe(region)
    expect(positioner.closest('[data-motion]')).toBe(region)
    expect(positioner.closest('[dir]')).toBe(region)
    expect(document.querySelector('[data-xh-portal-shell]')).toBeNull()
  })

  it('同页两棵局部主题保持各自祖先，运行期换轴无需复制属性', async () => {
    const dark = document.createElement('section')
    const light = document.createElement('section')
    dark.setAttribute('data-theme', 'dark')
    light.setAttribute('data-theme', 'light')
    const first = popover()
    const second = popover()
    dark.append(first)
    light.append(second)
    document.body.append(dark, light)
    await Promise.all([
      (first as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete,
      (second as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete,
    ])

    expect(first.querySelector('[data-part="positioner"]')?.closest('[data-theme]')).toBe(dark)
    expect(second.querySelector('[data-part="positioner"]')?.closest('[data-theme]')).toBe(light)
    dark.setAttribute('data-theme', 'light')
    expect(first.querySelector('[data-part="positioner"]')?.closest('[data-theme]')?.getAttribute('data-theme')).toBe('light')
    expect(second.querySelector('[data-part="positioner"]')?.closest('[data-theme]')?.getAttribute('data-theme')).toBe('light')
  })
})
