// Spinner 的三档直径走字形尺寸那把尺，与控件内图标同档：sm 16 / md 20 / lg 24。
// 环档与加载环家族配方是同一副画法：环粗、270° 的弧与起始边的缺口、圆角、转一圈的节拍逐项对得上，
// 别处的加载环（按钮在途、占位、图表取数）才与独立的 Spinner 看起来是同一枚。
// 弧色：Spinner 与占位里的环取品牌色，压在动作钮上的环随钮的字色。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSpinner, XhSpinnerLabel } from '../../src'
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

async function mount(size?: 'sm' | 'md' | 'lg', variant?: 'ring' | 'arc' | 'dots', extra: Record<string, unknown> = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhSpinner, { ...(size ? { size } : {}), ...(variant ? { variant } : {}), ...extra }) })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>(`[data-scope='spinner'][data-part='root']`)!
}

function color(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  host!.append(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  return resolved
}

function glyph(size: string): string {
  const probe = document.createElement('span')
  probe.style.inlineSize = `var(--xh-glyph-size-${size})`
  document.body.append(probe)
  const value = getComputedStyle(probe).inlineSize
  probe.remove()
  return value
}

describe('spinner 三档直径', () => {
  it.each([['sm', 'sm'], ['md', 'md'], ['lg', 'lg']] as const)('%s 档取 --xh-glyph-size-%s', async (size, token) => {
    const root = await mount(size)
    expect(getComputedStyle(root, '::before').inlineSize).toBe(glyph(token))
  })

  it('不传 size 时是 md 档', async () => {
    const root = await mount()
    expect(getComputedStyle(root, '::before').inlineSize).toBe(glyph('md'))
  })
})

describe('spinner 环档与加载环配方同一副画法', () => {
  it('环粗、缺口、圆角与转圈节拍逐项相同', async () => {
    const root = await mount('md', 'ring')
    // 配方只在承载者写了 content 时才有伪元素：取压在动作钮上的那一档，它自带 content
    const probe = document.createElement('span')
    probe.setAttribute('data-xh-loading-ring', 'overlay')
    probe.setAttribute('data-loading', '')
    probe.style.cssText = 'position: relative; display: inline-block; inline-size: 40px; block-size: 40px'
    host!.append(probe)
    const spinner = getComputedStyle(root, '::before')
    const family = getComputedStyle(probe, '::before')
    for (const property of [
      'border-top-width',
      'border-top-style',
      'border-top-color',
      'border-top-left-radius',
      'box-sizing',
      'animation-name',
      'animation-duration',
      'animation-timing-function',
      'animation-iteration-count',
    ])
      expect(spinner.getPropertyValue(property), property).toBe(family.getPropertyValue(property))
  })

  it('环档是一段 270° 的品牌色弧：三段取品牌色，起始边透明、不画轨道', async () => {
    const root = await mount('md', 'ring')
    const ring = getComputedStyle(root, '::before')
    const brand = color('var(--xh-fg-brand)')
    expect(ring.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect([ring.borderRightColor, ring.borderBottomColor, ring.borderLeftColor]).toEqual([brand, brand, brand])
  })

  it('配文取品牌色、正文字号、中等字重；竖排时转圈在上、配文在下，间距 6px', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => h(XhSpinner, { orientation: 'vertical' }, () => h(XhSpinnerLabel)) })
    app.mount(host)
    await nextTick()
    const root = host.querySelector<HTMLElement>('[data-scope="spinner"][data-part="root"]')!
    const label = getComputedStyle(host.querySelector('[data-scope="spinner"][data-part="label"]')!)
    expect(root.dataset.orientation).toBe('vertical')
    expect(label.color).toBe(color('var(--xh-fg-brand)'))
    expect(label.fontSize).toBe('14px')
    expect(label.fontWeight).toBe('500')
    expect(getComputedStyle(root).flexDirection).toBe('column')
    expect(getComputedStyle(root).rowGap).toBe('6px')
  })

  it('不写排布时并排：data-orientation 显式落 horizontal', async () => {
    const root = await mount()
    expect(root.dataset.orientation).toBe('horizontal')
    expect(getComputedStyle(root).flexDirection).toBe('row')
  })
})
