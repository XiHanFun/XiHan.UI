import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatchPicker,
  XhColorPickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string, scope = 'color-picker'): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少 ${scope} 部件：${name}`)
  return element
}

/** 内嵌色板的格子的色块面：颜色层压在棋盘格上，头一层渐变就是那个颜色 */
function swatchFaceColor(): string {
  const face = getComputedStyle(part('swatch', 'color-swatch-picker')).backgroundImage
  const match = /linear-gradient\((rgb\([^)]*\)), /.exec(face)
  return match?.[1] ?? face
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
    swatches: ['#00ff00'],
  }, () => [
    h(XhColorPickerControl, null, () => h(XhColorPickerTrigger, null, () => '选择颜色')),
    h(XhColorPickerPositioner, null, () => h(XhColorPickerContent, null, () => [
      h(XhColorPickerSaturationArea, null, () => h(XhColorPickerAreaThumb)),
      h(XhColorPickerHueSlider),
      h(XhColorPickerChannelInput, { channel: 'hex' }),
      h(XhColorPickerSwatchPicker),
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

/** 同一棵子树里某个语义令牌解算出来的颜色：探针挂在面板旁边，主题与对比度轴一起继承 */
function tokenColor(token: string): string {
  const probe = document.createElement('div')
  probe.style.setProperty('color', `var(${token})`)
  part('positioner').append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('颜色选择器浮层：floating 实体面', () => {
  it.each(['light', 'dark'] as const)('%s：局部主题跨 Portal 生效，面板是不透景的 floating 面（多列面板）', async (theme) => {
    await mount(theme)
    part('content').getAnimations().forEach(animation => animation.finish())
    const control = getComputedStyle(part('control'))
    const content = getComputedStyle(part('content'))
    expect(alpha(control.backgroundColor)).toBe(0)
    expect(control.backdropFilter).toBe('none')
    expect(part('positioner').closest<HTMLElement>('[data-theme]')?.dataset.theme).toBe(theme)
    // floating：实体底 + --xh-border-default 描边 + --xh-elevation-floating 落影，不透景、不画顶部边界光
    expect(content.backdropFilter).toBe('none')
    expect(alpha(content.backgroundColor)).toBe(255)
    expect(content.backgroundColor).toBe(tokenColor('--xh-bg-surface'))
    expect(content.borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(content.boxShadow).not.toBe('none')
    expect(content.opacity).toBe('1')
    expect(content.overscrollBehaviorY).toBe('contain')
    expect(getComputedStyle(part('content'), '::before').content).toBe('none')
    expect(getComputedStyle(part('saturation-area')).backgroundColor).toBe('rgb(255, 0, 0)')
    expect(swatchFaceColor()).toBe('rgb(0, 255, 0)')
    expect(getComputedStyle(part('saturation-area')).backdropFilter).toBe('none')
    // 色相带归内嵌的 color-slider：轨道渐变由连接层内联给，挂载点把滑块 root 上的两个私有槽接上
    expect(getComputedStyle(part('track', 'color-slider')).backgroundImage).toContain('linear-gradient')
    expect(part('thumb', 'color-slider').getBoundingClientRect().width).toBeGreaterThan(0)
    expect(alpha(getComputedStyle(part('channel-input')).backgroundColor)).toBe(0)
  })

  it.each(['light', 'dark'] as const)('%s：增强对比度时壳仍是实体表面，色板仍保留原色', async (theme) => {
    await mount(theme)
    part('positioner').dataset.contrast = 'more'
    const content = getComputedStyle(part('content'))
    expect(content.backdropFilter).toBe('none')
    expect(alpha(content.backgroundColor)).toBe(255)
    expect(content.borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(swatchFaceColor()).toBe('rgb(0, 255, 0)')
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

  it('减弱动效进出场只剩 120ms 淡变，没有空间位移', async () => {
    await mount('light')
    part('positioner').dataset.motion = 'reduce'
    for (const state of ['open', 'closed']) {
      part('content').dataset.state = state
      const style = getComputedStyle(part('content'))
      expect(style.animationDuration).toBe('0.12s')
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
