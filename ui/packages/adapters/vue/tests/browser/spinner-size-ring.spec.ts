// Spinner 的三档直径走字形尺寸那把尺，与控件内图标同档：sm 16 / md 20 / lg 24。
// 环档与加载环家族配方是同一副画法：环粗、轨道色、圆角、转一圈的节拍逐项对得上，
// 别处的加载环（按钮在途、占位、图表取数）才与独立的 Spinner 看起来是同一枚。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSpinner } from '../../src'
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

async function mount(size?: 'sm' | 'md' | 'lg', variant?: 'ring' | 'arc' | 'dots'): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhSpinner, { ...(size ? { size } : {}), ...(variant ? { variant } : {}) }) })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>(`[data-scope='spinner'][data-part='root']`)!
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
  it('环粗、轨道、起始边、圆角与转圈节拍逐项相同', async () => {
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
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'border-top-left-radius',
      'box-sizing',
      'animation-name',
      'animation-duration',
      'animation-timing-function',
      'animation-iteration-count',
    ])
      expect(spinner.getPropertyValue(property), property).toBe(family.getPropertyValue(property))
  })
})
