// 回退内容的画面：自带不透明淡底（不透出页底），图标与说明竖排居中，说明取次要标注档；
// 占位层同样取不透明淡底。计算样式只有真实浏览器读得到。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).backgroundColor
  probe.remove()
  return color
}

function tokenFg(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

/** 把计算出的颜色画到白底上读回 sRGB 三分量（不透明色与底色无关）。 */
function rgb(color: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 1, 1)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0]!, d[1]!, d[2]!]
}

function luminance([r, g, b]: readonly [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

function mount(theme?: 'dark'): { fallback: HTMLElement, placeholder: HTMLElement } {
  host = document.createElement('div')
  host.style.inlineSize = '240px'
  if (theme)
    host.dataset.theme = theme
  host.innerHTML = `
    <div data-scope="image" class="xh-scope-image" data-part="root" data-state="error">
      <div data-scope="image" class="xh-scope-image" data-part="placeholder" data-state="loading">载入中</div>
      <div data-scope="image" class="xh-scope-image" data-part="fallback" data-state="error">
        <svg width="16" height="16" aria-hidden="true"></svg>
        <span>图片加载失败</span>
      </div>
    </div>`
  document.body.append(host)
  return {
    fallback: host.querySelector<HTMLElement>('[data-part="fallback"]')!,
    placeholder: host.querySelector<HTMLElement>('[data-part="placeholder"]')!,
  }
}

describe('image 回退与占位的画面', () => {
  it('回退内容自带不透明淡底，竖排居中，说明 12px、次要字色、宽松行高，内距 8 / 16', () => {
    const { fallback } = mount()
    const style = getComputedStyle(fallback)

    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle-opaque'))
    expect(style.flexDirection).toBe('column')
    expect(style.alignItems).toBe('center')
    expect(style.justifyContent).toBe('center')
    expect(style.color).toBe(tokenFg('--xh-fg-subtle'))
    expect(style.fontSize).toBe('12px')
    expect(Number.parseFloat(style.lineHeight)).toBeCloseTo(12 * 1.625, 1)
    expect(style.paddingBlockStart).toBe('8px')
    expect(style.paddingBlockEnd).toBe('8px')
    expect(style.paddingInlineStart).toBe('16px')
    expect(style.paddingInlineEnd).toBe('16px')
  })

  it('说明字在自己的不透明淡底上亮暗两档都过 4.5:1', () => {
    for (const theme of [undefined, 'dark'] as const) {
      const { fallback } = mount(theme)
      const style = getComputedStyle(fallback)
      expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5)
      host!.remove()
    }
  })

  it('占位层取不透明淡底，不与图位自己的淡底叠深', () => {
    const { placeholder } = mount()
    expect(getComputedStyle(placeholder).backgroundColor).toBe(tokenColor('--xh-bg-subtle-opaque'))
  })
})
