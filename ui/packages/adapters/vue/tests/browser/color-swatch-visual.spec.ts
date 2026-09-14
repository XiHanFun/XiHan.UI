// ColorSwatch 的面由色块面家族画：颜色层铺在棋盘格上、尺寸三档、无效时描边换色。
// 背景分层、实际边长与高对比档只能在真实 Chromium 中验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhColorSwatch } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function mountSwatch(props: Record<string, unknown>): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhColorSwatch, props) })
  app.mount(host)
  await nextTick()
  const el = host.querySelector<HTMLElement>(`[data-scope='color-swatch'][data-part='root']`)
  if (!el)
    throw new Error('找不到色块')
  return el
}

/** 按顶层逗号拆开 background-image 的各层：渐变里的逗号在括号内，不算。 */
function layersOf(backgroundImage: string): string[] {
  const out: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < backgroundImage.length; i++) {
    const ch = backgroundImage[i]
    if (ch === '(') {
      depth++
    }
    else if (ch === ')') {
      depth--
    }
    else if (ch === ',' && depth === 0) {
      out.push(backgroundImage.slice(start, i).trim())
      start = i + 1
    }
  }
  out.push(backgroundImage.slice(start).trim())
  return out
}

function resolvedToken(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).color
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

describe('颜色色块的面', () => {
  it('颜色层铺在棋盘格上面：五层背景，头一层是颜色本身、后四层是格子', async () => {
    const el = await mountSwatch({ value: '#ff000080' })
    const layers = layersOf(getComputedStyle(el).backgroundImage)
    expect(layers).toHaveLength(5)
    expect(layers[0]).toContain('rgba(255, 0, 0, 0.5')
    expect(layers.slice(1).every(layer => layer.includes('45deg'))).toBe(true)
    // 格子铺在实体面上，半透明颜色透出的是格子而不是页面底色
    expect(getComputedStyle(el).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('三档边长跟着字形档走：16 / 20 / 24px，圆角恒是内嵌档', async () => {
    const sm = await mountSwatch({ value: '#3b82f6', size: 'sm' })
    expect(sm.getBoundingClientRect().width).toBe(16)
    app?.unmount()
    host?.remove()
    const md = await mountSwatch({ value: '#3b82f6' })
    expect(md.getBoundingClientRect().width).toBe(20)
    expect(getComputedStyle(md).borderTopLeftRadius).toBe('4px')
    app?.unmount()
    host?.remove()
    const lg = await mountSwatch({ value: '#3b82f6', size: 'lg' })
    expect(lg.getBoundingClientRect().width).toBe(24)
    expect(lg.getBoundingClientRect().height).toBe(24)
  })

  it('解析不出的串只剩棋盘格，描边换成无效色', async () => {
    const el = await mountSwatch({ value: 'tomato' })
    expect(el.hasAttribute('data-invalid')).toBe(true)
    const layers = layersOf(getComputedStyle(el).backgroundImage)
    // 颜色层写空串撤销了声明，家族兜底是 transparent
    expect(layers[0]).toContain('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(el).borderTopColor).toBe(resolvedToken('--xh-border-invalid'))
  })

  it('高对比档：退出强制着色保住原色，描边换成系统前景色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    const el = await mountSwatch({ value: '#3b82f6' })
    const style = getComputedStyle(el)
    expect(style.forcedColorAdjust).toBe('none')
    const canvasText = document.createElement('span')
    canvasText.style.cssText = 'color: CanvasText; forced-color-adjust: none'
    document.body.append(canvasText)
    expect(style.borderTopColor).toBe(getComputedStyle(canvasText).color)
    expect(layersOf(style.backgroundImage)[0]).toContain('rgb(59, 130, 246)')
    canvasText.remove()
  })
})
