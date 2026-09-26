// ColorSlider 的轨道画的是颜色本身：渐变由连接层内联给，透明度那一路皮肤垫棋盘格，拇指填当前色。
// 实际几何（拇指圆心落在比例点上、竖排换轴）与高对比档只能在真实 Chromium 中验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhColorSliderControl,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='color-slider'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到部件 ${name}`)
  return element
}

function resolvedToken(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

async function mountSlider(props: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 300px; padding: 24px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhColorSliderRoot, { defaultValue: '#3b82f6', ...props }, () => [
      h(XhColorSliderLabel, null, () => '色相'),
      h(XhColorSliderControl, null, () => [
        h(XhColorSliderTrack),
        h(XhColorSliderThumb),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('颜色滑块的轨道与拇指', () => {
  it('色相带铺满轨道宽，拇指圆心落在色相所在的比例点上，面填当前色', async () => {
    await mountSlider()
    const track = part('track')
    const thumb = part('thumb')
    expect(getComputedStyle(track).backgroundImage).toContain('linear-gradient(to right')
    expect(track.getBoundingClientRect().height).toBe(12)
    // #3b82f6 的色相约 217°，拇指圆心落在轨道 217/360 处
    const trackRect = track.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const center = thumbRect.left + thumbRect.width / 2
    expect(center - trackRect.left).toBeCloseTo(trackRect.width * (217.3 / 360), -1)
    expect(thumbRect.width).toBe(18)
    expect(getComputedStyle(thumb).backgroundColor).toBe('rgb(59, 130, 246)')
  })

  it('透明度那一路：渐变从全透明走到实色，棋盘格垫在轨道底下', async () => {
    await mountSlider({ channel: 'alpha', defaultValue: '#3b82f680' })
    const track = part('track')
    expect(getComputedStyle(track).backgroundImage).toContain('rgba(59, 130, 246, 0)')
    const before = getComputedStyle(track, '::before')
    expect(before.backgroundImage).toContain('45deg')
    expect(before.backgroundSize.startsWith('8px 8px')).toBe(true)
    // 拇指填的是带透明度的当前色
    // 浏览器把 0.502 收成 0.5
    expect(getComputedStyle(part('thumb')).backgroundColor).toBe('rgba(59, 130, 246, 0.5)')
  })

  it('竖排：渐变自下而上，控件收成一根、拇指按 block-end 定位', async () => {
    await mountSlider({ channel: 'brightness', orientation: 'vertical' })
    const track = part('track')
    const control = part('control')
    expect(getComputedStyle(track).backgroundImage).toContain('to top')
    expect(track.getBoundingClientRect().width).toBe(12)
    expect(control.getBoundingClientRect().height).toBe(160)
    // 明度 96%：拇指圆心在离底 96% 处
    const thumbRect = part('thumb').getBoundingClientRect()
    const trackRect = track.getBoundingClientRect()
    const center = thumbRect.top + thumbRect.height / 2
    expect(trackRect.bottom - center).toBeCloseTo(trackRect.height * 0.965, -1)
  })

  it('三档尺寸换的是拇指直径与颜色带厚度；拖动时拇指放大并抬高海拔', async () => {
    await mountSlider({ size: 'lg' })
    expect(part('thumb').getBoundingClientRect().width).toBe(24)
    expect(part('track').getBoundingClientRect().height).toBe(16)
    const before = getComputedStyle(part('thumb')).boxShadow
    const control = part('control')
    const rect = control.getBoundingClientRect()
    await userEvent.click(control, { position: { x: rect.width / 2, y: rect.height / 2 } })
    // 点轨道即跳：色相落到中点附近
    expect(Number(part('thumb').getAttribute('aria-valuenow'))).toBeGreaterThan(150)
    expect(Number(part('thumb').getAttribute('aria-valuenow'))).toBeLessThan(210)
    expect(getComputedStyle(part('thumb')).boxShadow).toBe(before)
  })

  it('字段标签 14 / 500 / fg-default 贴控件 space-1；拇指是 raised 面，描边 border-default', async () => {
    await mountSlider()
    const label = getComputedStyle(part('label'))
    expect(label.fontSize).toBe('14px')
    expect(label.fontWeight).toBe('500')
    expect(label.color).toBe(resolvedToken('--xh-fg-default'))
    expect(getComputedStyle(part('root')).rowGap).toBe('4px')
    const thumb = getComputedStyle(part('thumb'))
    expect(thumb.borderTopColor).toBe(resolvedToken('--xh-border-default-opaque'))
    expect(thumb.borderTopWidth).toBe('2px')
    expect(thumb.boxShadow).not.toBe('none')
  })

  it('禁用：不整体压暗，标签换 fg-subtle，颜色带与拇指压暗一次、拇指不再抬起且面仍是当前色', async () => {
    await mountSlider({ disabled: true })
    expect(getComputedStyle(part('root')).opacity).toBe('1')
    expect(getComputedStyle(part('label')).color).toBe(resolvedToken('--xh-fg-subtle'))
    expect(getComputedStyle(part('control')).opacity).toBe('0.5')
    expect(getComputedStyle(part('control')).cursor).toBe('not-allowed')
    const thumb = getComputedStyle(part('thumb'))
    expect(thumb.boxShadow).toBe('none')
    expect(thumb.backgroundColor).toBe('rgb(59, 130, 246)')
    expect(thumb.borderTopColor).toBe(resolvedToken('--xh-border-default-opaque'))
  })

  it('高对比档：轨道与拇指退出强制着色保住原色，描边换成系统色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mountSlider()
    const track = getComputedStyle(part('track'))
    const thumb = getComputedStyle(part('thumb'))
    expect(track.forcedColorAdjust).toBe('none')
    expect(track.backgroundImage).toContain('linear-gradient')
    expect(thumb.forcedColorAdjust).toBe('none')
    expect(thumb.backgroundColor).toBe('rgb(59, 130, 246)')
    const canvasText = document.createElement('span')
    canvasText.style.cssText = 'color: CanvasText; forced-color-adjust: none'
    document.body.append(canvasText)
    expect(thumb.borderTopColor).toBe(getComputedStyle(canvasText).color)
    canvasText.remove()
  })
})
