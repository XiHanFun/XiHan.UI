// 头像回退字的画面：字号随直径取一半，底取加深一档的不透明淡底、字取正文色；
// 头像组叠放量各档同为 8px，「+N」与头像同一副面。计算样式只有真实浏览器读得到。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function token(name: string, property: 'color' | 'backgroundColor'): string {
  const probe = document.createElement('span')
  probe.style[property] = `var(${name})`
  host!.append(probe)
  const value = getComputedStyle(probe)[property]
  probe.remove()
  return value
}

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

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

function avatar(size?: 'sm' | 'lg'): string {
  return `<span data-scope="avatar" class="xh-scope-avatar" data-part="root"${size ? ` data-size="${size}"` : ''}>
    <span data-scope="avatar" class="xh-scope-avatar" data-part="fallback" data-state="error">XH</span>
  </span>`
}

function mount(html: string, theme?: 'dark'): HTMLElement {
  host = document.createElement('div')
  if (theme)
    host.dataset.theme = theme
  host.innerHTML = html
  document.body.append(host)
  return host
}

describe('avatar 回退字', () => {
  it.each([
    ['sm', 28, '14px'],
    [undefined, 32, '16px'],
    ['lg', 36, '18px'],
  ] as const)('%s 档：%ipx 的圆，回退字号取直径一半 %s', (size, px, font) => {
    const root = mount(avatar(size)).querySelector<HTMLElement>('[data-part="root"]')!
    expect(root.getBoundingClientRect().width).toBe(px)
    expect(getComputedStyle(root).fontSize).toBe(font)
  })

  it('底取加深一档的不透明淡底、字取正文色，亮暗两档都过 4.5:1', () => {
    for (const theme of [undefined, 'dark'] as const) {
      const root = mount(avatar(), theme).querySelector<HTMLElement>('[data-part="root"]')!
      const style = getComputedStyle(root)
      expect(style.backgroundColor).toBe(token('--xh-bg-subtle-active-opaque', 'backgroundColor'))
      expect(style.color).toBe(token('--xh-fg-default', 'color'))
      expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5)
      host!.remove()
    }
  })
})

describe('avatar-group 叠放', () => {
  function group(size?: 'sm' | 'lg'): HTMLElement {
    return mount(`<div data-scope="avatar-group" class="xh-scope-avatar-group" data-part="root"${size ? ` data-size="${size}"` : ''}>
      ${avatar()}${avatar()}
      <span data-scope="avatar-group" class="xh-scope-avatar-group" data-part="overflow-item">+3</span>
    </div>`)
  }

  it.each([['sm'], [undefined], ['lg']] as const)('%s 档：后一枚压前一枚 8px', (size) => {
    const root = group(size)
    const [first, second] = [...root.querySelectorAll<HTMLElement>('[data-scope="avatar"][data-part="root"]')]
    expect(first!.getBoundingClientRect().right - second!.getBoundingClientRect().left).toBe(8)
  })

  it('「+N」与组里的头像同一副面与字号', () => {
    const root = group()
    const item = getComputedStyle(root.querySelector('[data-part="overflow-item"]')!)
    const face = getComputedStyle(root.querySelector('[data-scope="avatar"][data-part="root"]')!)
    expect(item.backgroundColor).toBe(face.backgroundColor)
    expect(item.color).toBe(face.color)
    expect(item.fontSize).toBe('16px')
    expect(face.fontSize).toBe('16px')
  })
})
