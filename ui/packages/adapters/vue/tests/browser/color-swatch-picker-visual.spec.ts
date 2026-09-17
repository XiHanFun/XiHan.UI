// ColorSwatchPicker 的格子是正方形命中区、色块面铺满格子、选中的格子换品牌描边并压一枚圆徽标。
// 边长、描边、徽标显隐与叠放只能在真实 Chromium 中验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhColorSwatchPickerRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const SWATCHES = [
  { value: '#e11d48', label: '玫红' },
  { value: '#3b82f680', label: '半透明天蓝' },
  { value: '#10b981', label: '翠绿' },
]

function part(name: string, index = 0): HTMLElement {
  const el = document.querySelectorAll<HTMLElement>(`[data-scope='color-swatch-picker'][data-part='${name}']`)[index]
  if (!el)
    throw new Error(`找不到部件 ${name}[${index}]`)
  return el
}

async function mountPicker(props: Record<string, unknown> = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhColorSwatchPickerRoot, { swatches: SWATCHES, label: '主题色', ...props }) })
  app.mount(host)
  await nextTick()
  return part('root')
}

function resolvedToken(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

function resolvedLength(name: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position: absolute; inline-size: var(${name})`
  document.body.append(probe)
  const value = probe.getBoundingClientRect().width
  probe.remove()
  return value
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('颜色色块选择器的格子', () => {
  it('格子是正方形，边长跟着控件行高走；色块面铺满格子、圆角随格子', async () => {
    await mountPicker()
    const item = part('item')
    const swatch = part('swatch')
    const cell = resolvedLength('--xh-control-h-md')
    const box = item.getBoundingClientRect()
    expect(box.width).toBe(cell)
    expect(box.height).toBe(cell)
    const face = swatch.getBoundingClientRect()
    expect(face.width).toBe(cell)
    expect(face.height).toBe(cell)
    expect(getComputedStyle(swatch).borderTopLeftRadius).toBe(getComputedStyle(item).borderTopLeftRadius)
    // 色块 item 的身份是 inset（§6.3）
    expect(getComputedStyle(item).borderTopLeftRadius).toBe(`${resolvedLength('--xh-shape-inset')}px`)
  })

  it('三档边长各取 sm / md / lg 的控件行高，色块面跟着格子一起换档', async () => {
    await mountPicker({ size: 'sm' })
    expect(part('item').getBoundingClientRect().width).toBe(resolvedLength('--xh-control-h-sm'))
    expect(part('swatch').getBoundingClientRect().width).toBe(resolvedLength('--xh-control-h-sm'))
    app?.unmount()
    host?.remove()
    await mountPicker({ size: 'lg' })
    expect(part('item').getBoundingClientRect().width).toBe(resolvedLength('--xh-control-h-lg'))
    expect(part('swatch').getBoundingClientRect().width).toBe(resolvedLength('--xh-control-h-lg'))
  })

  it('选中的格子：外圈不再画环（outline 留给焦点环），色块描边换品牌色、徽标压在色块正中且可见；未选中的格子描边默认、徽标透明', async () => {
    await mountPicker({ defaultValue: '#e11d48' })
    const checked = part('item', 0)
    const unchecked = part('item', 2)
    expect(getComputedStyle(checked).outlineStyle).toBe('none')
    expect(getComputedStyle(unchecked).outlineStyle).toBe('none')
    expect(getComputedStyle(part('swatch', 0)).borderTopColor).toBe(resolvedToken('--xh-fg-brand'))
    expect(getComputedStyle(part('swatch', 2)).borderTopColor).toBe(resolvedToken('--xh-border-default'))
    const badge = getComputedStyle(part('indicator', 0), '::before')
    expect(badge.opacity).toBe('1')
    expect(badge.backgroundColor).toBe(resolvedToken('--xh-bg-brand'))
    expect(badge.borderTopColor).toBe(resolvedToken('--xh-bg-canvas'))
    // 徽标直径取指示器档，居中压在格子上；正方盒取 circle
    const size = resolvedLength('--xh-control-indicator-md')
    expect(Number.parseFloat(badge.width)).toBe(size)
    expect(badge.borderTopLeftRadius).toBe('50%')
    expect(getComputedStyle(part('indicator', 2), '::before').opacity).toBe('0')
    expect(getComputedStyle(part('indicator', 0), '::after').opacity).toBe('1')
    expect(getComputedStyle(part('indicator', 2), '::after').opacity).toBe('0')
  })

  it('语气换的是选中描边与徽标的颜色，不动色块本身', async () => {
    await mountPicker({ defaultValue: '#e11d48', tone: 'success' })
    expect(getComputedStyle(part('swatch', 0)).borderTopColor).toBe(resolvedToken('--xh-color-success-600'))
    expect(getComputedStyle(part('indicator', 0), '::before').backgroundColor).toBe(resolvedToken('--xh-color-success-600'))
    const layers = getComputedStyle(part('swatch', 0)).backgroundImage
    expect(layers).toContain('rgb(225, 29, 72)')
  })

  it('半透明颜色铺在棋盘格上；无效态把描边换成无效色', async () => {
    await mountPicker({ invalid: true })
    const swatch = part('swatch', 1)
    const style = getComputedStyle(swatch)
    expect(style.backgroundImage).toContain('rgba(59, 130, 246, 0.5')
    expect(style.backgroundImage).toContain('45deg')
    expect(style.borderTopColor).toBe(resolvedToken('--xh-border-invalid'))
  })

  it('按下：格子缩放，底是展示物不换，描边换到品牌色作第二通道', async () => {
    await mountPicker()
    const root = part('root')
    root.style.setProperty('--xh-motion-duration-micro', '0ms')
    root.style.setProperty('--xh-motion-duration-press', '0ms')
    root.style.setProperty('--xh-motion-duration-release', '0ms')
    const item = part('item', 2)
    const face = getComputedStyle(part('swatch', 2)).backgroundImage
    item.setAttribute('data-pressed', '')
    expect(getComputedStyle(item).scale).toBe('0.97')
    expect(getComputedStyle(part('swatch', 2)).backgroundImage).toBe(face)
    expect(getComputedStyle(part('swatch', 2)).borderTopColor).toBe(resolvedToken('--xh-fg-brand'))
  })

  it('高对比档：色块保住原色，选中描边换成系统高亮色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mountPicker({ defaultValue: '#e11d48' })
    const swatch = getComputedStyle(part('swatch', 0))
    expect(swatch.forcedColorAdjust).toBe('none')
    expect(swatch.backgroundImage).toContain('rgb(225, 29, 72)')
    const highlight = document.createElement('span')
    highlight.style.cssText = 'color: Highlight; forced-color-adjust: none'
    document.body.append(highlight)
    expect(getComputedStyle(part('swatch', 0)).borderTopColor).toBe(getComputedStyle(highlight).color)
    highlight.remove()
  })
})
