import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatchItem,
  XhColorPickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='color-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少颜色选择器部件：${name}`)
  return element
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

async function mount(theme: 'light' | 'dark'): Promise<void> {
  host = document.createElement('div')
  host.dataset.theme = theme
  document.body.append(host)
  app = createApp({ render: () => h(XhColorPickerRoot, {
    defaultOpen: true,
    defaultValue: '#ff0000',
  }, () => [
    h(XhColorPickerControl, null, () => h(XhColorPickerTrigger, null, () => '选择颜色')),
    h(XhColorPickerPositioner, null, () => h(XhColorPickerContent, null, () => [
      h(XhColorPickerSaturationArea, null, () => h(XhColorPickerAreaThumb)),
      h(XhColorPickerChannelSlider, { channel: 'hue' }, () => [
        h(XhColorPickerChannelSliderTrack),
        h(XhColorPickerChannelSliderThumb),
      ]),
      h(XhColorPickerChannelInput, { channel: 'hex' }),
      h(XhColorPickerSwatchItem, { value: '#00ff00' }),
    ])),
  ]) })
  app.mount(host)
  await nextTick()
  await nextTick()
  await expect.poll(() => part('content').getBoundingClientRect().width).toBeGreaterThan(0)
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('颜色选择器 M2 浮层', () => {
  it.each(['light', 'dark'] as const)('%s：局部主题跨 Portal 生效，磨砂仅由浮层壳提供', async (theme) => {
    await mount(theme)
    part('content').getAnimations().forEach(animation => animation.finish())
    const control = getComputedStyle(part('control'))
    const content = getComputedStyle(part('content'))
    expect(alpha(control.backgroundColor)).toBe(255)
    expect(control.backdropFilter).toBe('none')
    expect(part('positioner').closest<HTMLElement>('[data-theme]')?.dataset.theme).toBe(theme)
    expect(content.backdropFilter).toContain('blur(16px)')
    expect(alpha(content.backgroundColor)).toBeLessThan(255)
    expect(alpha(content.backgroundColor)).toBeGreaterThan(220)
    expect(content.opacity).toBe('1')
    const highlight = getComputedStyle(part('content'), '::before')
    expect(alpha(highlight.backgroundColor)).toBeGreaterThan(0)
    expect(highlight.pointerEvents).toBe('none')
    expect(getComputedStyle(part('saturation-area')).backgroundColor).toBe('rgb(255, 0, 0)')
    expect(getComputedStyle(part('swatch-item')).backgroundColor).toBe('rgb(0, 255, 0)')
    expect(getComputedStyle(part('saturation-area')).backdropFilter).toBe('none')
    expect(getComputedStyle(part('channel-slider-track')).backgroundImage).toContain('linear-gradient')
    expect(alpha(getComputedStyle(part('channel-input')).backgroundColor)).toBe(255)
  })

  it.each(['light', 'dark'] as const)('%s：增强对比度时壳使用实体表面，色板仍保留原色', async (theme) => {
    await mount(theme)
    part('positioner').dataset.contrast = 'more'
    const content = getComputedStyle(part('content'))
    expect(content.backdropFilter).toBe('none')
    expect(alpha(content.backgroundColor)).toBe(255)
    expect(alpha(getComputedStyle(part('content'), '::before').backgroundColor)).toBe(0)
    expect(getComputedStyle(part('swatch-item')).backgroundColor).toBe('rgb(0, 255, 0)')
  })

  it('四向短位移不缩放，嵌套面板不继承祖先方向', async () => {
    await mount('light')
    const outer = part('positioner')
    const inner = document.createElement('div')
    inner.dataset.scope = 'color-picker'
    inner.dataset.part = 'positioner'
    outer.dataset.placement = 'bottom-start'
    outer.append(inner)
    const sides = ['up', 'down', 'left', 'right']
    for (const [placement, expected] of [
      ['top-start', ['0', '1', '0', '0']],
      ['bottom-start', ['1', '0', '0', '0']],
      ['left-start', ['0', '0', '0', '1']],
      ['right-start', ['0', '0', '1', '0']],
    ] as const) {
      inner.dataset.placement = placement
      const style = getComputedStyle(inner)
      expect(sides.map(side => style.getPropertyValue(`--xh-_overlay-enter-${side}`).trim())).toEqual(expected)
    }
    expect(getComputedStyle(part('content')).animationName).toBe('xh-overlay-slide-in')
    expect(getComputedStyle(part('content')).scale).toBe('none')
  })

  it('减弱动效进出场为 1ms 且无空间位移', async () => {
    await mount('light')
    part('positioner').dataset.motion = 'reduce'
    for (const state of ['open', 'closed']) {
      part('content').dataset.state = state
      const style = getComputedStyle(part('content'))
      expect(style.animationDuration).toBe('0.001s')
      expect(style.getPropertyValue('--xh-motion-distance-sm').trim()).toBe('0px')
      expect(style.scale).toBe('none')
    }
  })

  it('窄空间限制面板宽度，内部保持单一滚动区域', async () => {
    await mount('light')
    const content = part('content')
    content.style.setProperty('--xh-_color-picker-available-w', '160px')
    content.style.setProperty('--xh-color-picker-max-h', '100px')
    content.style.animation = 'none'
    part('saturation-area').style.minBlockSize = '240px'
    expect(content.getBoundingClientRect().width).toBeLessThanOrEqual(160)
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight)
    content.scrollTop = 50
    expect(content.scrollTop).toBe(50)
  })

  it('按 Escape 播放完整退场后隐藏，并归还触发器焦点', async () => {
    await mount('light')
    const content = part('content')
    content.getAnimations().forEach(animation => animation.finish())
    content.style.setProperty('--xh-motion-duration-exit', '2s')
    part('channel-input').focus()
    await userEvent.keyboard('{Escape}')
    expect(content.dataset.state).toBe('closed')
    expect(content.hidden).toBe(true)
    expect(getComputedStyle(content).display).not.toBe('none')
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-out')
    expect(content.getBoundingClientRect().height).toBeGreaterThan(0)
    content.getAnimations().forEach(animation => animation.finish())
    await expect.poll(() => content.getBoundingClientRect().height).toBe(0)
    expect(document.activeElement).toBe(part('trigger'))
  })
})
