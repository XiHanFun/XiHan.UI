// 取色面板的几何：面板宽、贴顶通栏的取色区、两种拇指、色板区上方的通栏分隔、字段外壳的通道输入。
// 真实盒子与计算样式只有浏览器量得出来。
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

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function part(name: string, scope = 'color-picker'): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少 ${scope} 部件：${name}`)
  return element
}

function token(property: 'color' | 'backgroundColor' | 'borderTopColor', name: string): string {
  const probe = document.createElement('span')
  probe.style[property] = `var(${name})`
  probe.style.borderTopStyle = 'solid'
  part('positioner').append(probe)
  const value = getComputedStyle(probe)[property]
  probe.remove()
  return value
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhColorPickerRoot, {
    defaultOpen: true,
    defaultValue: '#ff0000',
    swatches: ['#00ff00', '#0000ff', '#ffff00'],
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
  part('content').getAnimations().forEach(animation => animation.finish())
}

describe('取色面板的几何', () => {
  it('面板宽 16rem（256px），限高取 viewport-h-lg（24rem）', async () => {
    await mount()
    const content = part('content')
    expect(content.getBoundingClientRect().width).toBe(256)
    content.style.setProperty('--xh-_color-picker-available-h', '2000px')
    expect(getComputedStyle(content).maxHeight).toBe('384px')
  })

  it('取色区高 11rem、贴着面板顶边通栏、不取圆角', async () => {
    await mount()
    const content = part('content')
    const area = part('saturation-area')
    const box = content.getBoundingClientRect()
    const rect = area.getBoundingClientRect()
    const border = Number.parseFloat(getComputedStyle(content).borderTopWidth)
    expect(rect.height).toBe(176)
    expect(rect.top - box.top).toBe(border)
    expect(rect.left - box.left).toBe(border)
    expect(box.right - rect.right).toBe(border)
    expect(getComputedStyle(area).borderTopLeftRadius).toBe('0px')
  })

  it('取色区拇指 16px；色相滑块拇指 16px 白盘 + 1px 描边，正中一颗 8px 当前色点', async () => {
    await mount()
    expect(part('area-thumb').getBoundingClientRect().width).toBe(16)
    const thumb = part('thumb', 'color-slider')
    const style = getComputedStyle(thumb)
    expect(thumb.getBoundingClientRect().width).toBe(16)
    expect(style.borderTopWidth).toBe('1px')
    expect(style.backgroundColor).toBe(token('backgroundColor', '--xh-bg-surface-raised'))
    expect(style.backgroundImage).toContain('radial-gradient')
    expect(style.backgroundImage).toContain('4px')
  })

  it('色条描边取 border-default', async () => {
    await mount()
    expect(getComputedStyle(part('track', 'color-slider')).boxShadow).toContain(token('color', '--xh-border-default'))
  })

  it('色板区上方一条通栏分隔（border-default 档），预设色块 16px、间距 8px', async () => {
    await mount()
    const content = part('content')
    const picker = part('swatch-picker')
    const style = getComputedStyle(picker)
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe(token('borderTopColor', '--xh-material-solid-border'))
    const box = content.getBoundingClientRect()
    const rect = picker.getBoundingClientRect()
    const border = Number.parseFloat(getComputedStyle(content).borderTopWidth)
    expect(rect.left - box.left).toBe(border)
    expect(box.right - rect.right).toBe(border)
    const [first, second] = [...picker.querySelectorAll<HTMLElement>('[data-scope="color-swatch-picker"][data-part="item"]')]
    expect([first!.getBoundingClientRect().width, first!.getBoundingClientRect().height]).toEqual([16, 16])
    expect(second!.getBoundingClientRect().left - first!.getBoundingClientRect().right).toBe(8)
  })

  it('通道输入照字段外壳：字段淡底、24px 高、12px 字；聚焦换承载面与品牌描边、不画环', async () => {
    await mount()
    const input = part('channel-input')
    let style = getComputedStyle(input)
    expect(style.backgroundColor).toBe(token('backgroundColor', '--xh-bg-field'))
    expect(input.getBoundingClientRect().height).toBe(24)
    expect(style.fontSize).toBe('12px')
    await userEvent.click(input)
    expect(document.activeElement).toBe(input)
    // 换色走 micro 过渡，等它落定再读
    await expect.poll(() => getComputedStyle(input).borderTopColor).toBe(token('borderTopColor', '--xh-border-control-focus'))
    await expect.poll(() => getComputedStyle(input).backgroundColor).toBe(token('backgroundColor', '--xh-bg-surface'))
    style = getComputedStyle(input)
    expect(style.outlineStyle).toBe('none')
  })
})
