import type { App, VNode } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhButton, XhButtonGroup, XhButtonIndicator, XhButtonLabel } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(render: () => VNode, density: 'comfortable' | 'compact' = 'comfortable', dir: 'ltr' | 'rtl' = 'ltr'): void {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  host.dir = dir
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function action(): HTMLButtonElement {
  const element = host?.querySelector<HTMLButtonElement>('[data-xh-action-control]')
  if (!element)
    throw new Error('找不到 Action Control')
  return element
}

function rawAction(profile: 'text' | 'icon' | 'field-inset' | 'floating', size: 'xs' | 'sm' | 'md' | 'lg'): HTMLButtonElement {
  const element = document.createElement('button')
  element.textContent = profile === 'text' ? 'Action' : ''
  element.setAttribute('data-xh-action-control', '')
  element.setAttribute('data-xh-action-profile', profile)
  element.setAttribute('data-xh-action-size', size)
  element.setAttribute('data-xh-action-display', 'always')
  host!.append(element)
  return element
}

afterEach(async () => {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.density
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('action Control 四 profile', () => {
  it.each([
    { density: 'comfortable' as const, expected: { 'text': [24, 32, 36, 40], 'icon': [24, 32, 36, 40], 'field-inset': [24, 24, 32, 36], 'floating': [32, 40, 48, 56] } },
    { density: 'compact' as const, expected: { 'text': [24, 28, 32, 36], 'icon': [24, 28, 32, 36], 'field-inset': [24, 24, 28, 32], 'floating': [28, 36, 44, 52] } },
  ])('$density：四 profile × xs/sm/md/lg 的视觉盒由同一配方解析', ({ density, expected }) => {
    mount(() => h('div'), density)
    const sizes = ['xs', 'sm', 'md', 'lg'] as const
    const profiles = ['text', 'icon', 'field-inset', 'floating'] as const
    for (const profile of profiles) {
      sizes.forEach((size, index) => {
        const element = rawAction(profile, size)
        const rect = element.getBoundingClientRect()
        expect(rect.height, `${profile}/${size}`).toBe(expected[profile][index])
        if (profile === 'text')
          expect(rect.width, `${profile}/${size} 文字动作不低于视觉尺寸`).toBeGreaterThanOrEqual(rect.height)
        else
          expect(rect.width, `${profile}/${size} 应为正方视觉盒`).toBe(rect.height)
      })
    }
  })

  it('rTL 沿逻辑行内轴排列，DOM 顺序和可访问顺序不倒置', () => {
    mount(() => h(XhButton, null, () => [
      h('span', { 'data-test-prefix': '' }, 'P'),
      h(XhButtonLabel, null, () => 'Label'),
    ]), 'comfortable', 'rtl')
    const prefix = host!.querySelector<HTMLElement>('[data-test-prefix]')!
    const label = host!.querySelector<HTMLElement>('[data-scope=\'button\'][data-part=\'label\']')!
    expect(prefix.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().left)
    expect(action().style.length).toBe(0)
  })
})

describe('action Control 状态与命中区', () => {
  it('未映射品牌、描边或海拔时保持平面中性底', async () => {
    mount(() => h('div'))
    const ready = rawAction('icon', 'sm')
    const rest = getComputedStyle(ready)
    const restBg = rest.backgroundColor

    expect(rest.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(rest.boxShadow).toBe('none')
    expect(rest.getPropertyValue('--xh-_action-current-highlight').trim()).toBe('transparent')

    await userEvent.hover(ready)
    const hovered = getComputedStyle(ready)
    expect(hovered.backgroundColor).not.toBe(restBg)
    expect(hovered.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(hovered.boxShadow).toBe('none')
  })

  it('rest/hover/pressed/focus-visible/disabled/loading 使用共享状态且 loading 不整体淡化', async () => {
    mount(() => h('div', null, [
      h(XhButton, { variant: 'subtle' }, () => h(XhButtonLabel, null, () => 'Ready')),
      h(XhButton, { disabled: true }, () => 'Disabled'),
      h(XhButton, { loading: true }, () => [h(XhButtonIndicator), h(XhButtonLabel, null, () => 'Loading')]),
    ]))
    const [ready, disabled, loading] = [...host!.querySelectorAll<HTMLButtonElement>('[data-xh-action-control]')]
    const restBg = getComputedStyle(ready!).backgroundColor
    await userEvent.hover(ready!)
    expect(getComputedStyle(ready!).backgroundColor).not.toBe(restBg)
    await userEvent.tab()
    expect(ready!.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(ready!).outlineStyle).toBe('solid')
    expect(getComputedStyle(disabled!).cursor).toBe('not-allowed')
    expect(Number(getComputedStyle(disabled!).opacity)).toBeLessThan(1)
    expect(getComputedStyle(loading!).cursor).toBe('progress')
    expect(getComputedStyle(loading!).opacity).toBe('1')
  })

  it('粗指针下 text 只扩块轴，icon 才扩双轴；短 ButtonGroup 不产生行内重叠', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    mount(() => h(XhButtonGroup, null, () => [
      h(XhButton, null, () => 'A'),
      h(XhButton, null, () => 'B'),
      h(XhButton, { 'iconOnly': true, 'aria-label': '更多' }),
    ]))
    await nextTick()
    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    const [first, second, icon] = [...host!.querySelectorAll<HTMLButtonElement>('[data-xh-action-control]')]
    const firstTarget = getComputedStyle(first!, '::after')
    const iconTarget = getComputedStyle(icon!, '::after')
    expect(Number.parseFloat(firstTarget.minBlockSize)).toBeGreaterThanOrEqual(44)
    expect(Number.parseFloat(firstTarget.minInlineSize) || 0).toBe(0)
    expect(Number.parseFloat(iconTarget.minBlockSize)).toBeGreaterThanOrEqual(44)
    expect(Number.parseFloat(iconTarget.minInlineSize)).toBeGreaterThanOrEqual(44)
    expect(first!.getBoundingClientRect().right).toBeCloseTo(second!.getBoundingClientRect().left + 1, 1)
  })

  it('未命名空间的业务 data-action-control 不会被家族皮肤命中', () => {
    mount(() => h('div'))
    const business = document.createElement('span')
    business.dataset.actionControl = 'business'
    host!.append(business)
    expect(getComputedStyle(business).display).not.toBe('inline-flex')
    expect(getComputedStyle(business).backgroundImage).toBe('none')
  })
})
