// 文件上传的面：拖放区是淡底 + 1px 虚线的放置面，文件行是无描边的淡底行，失败行只把文件名标红。
// 计算样式与叠色后的对比度只有真实浏览器量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

const DELETE = 'data-xh-action-control data-xh-action-profile="icon" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="xs"'

function mount(theme?: 'dark'): Record<string, HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  if (theme)
    host.dataset.theme = theme
  const row = (state: string, name: string) => `
    <div data-scope="file-upload" class="xh-scope-file-upload" data-part="item" data-state="${state}" data-instant>
      <div data-scope="file-upload" class="xh-scope-file-upload" data-part="item-preview" data-file-type="text/plain"></div>
      <span data-scope="file-upload" class="xh-scope-file-upload" data-part="item-name">${name}</span>
      <button type="button" aria-label="删除" data-scope="file-upload" class="xh-scope-file-upload" data-part="item-delete-trigger" ${DELETE}></button>
    </div>`
  host.innerHTML = `
    <div data-scope="file-upload" class="xh-scope-file-upload" data-part="root">
      <div data-scope="file-upload" class="xh-scope-file-upload" data-part="dropzone" role="button" tabindex="0">拖入文件</div>
      <div data-scope="file-upload" class="xh-scope-file-upload" data-part="list" data-instant>
        ${row('idle', '报告.txt')}
        ${row('error', '传失败.txt')}
      </div>
    </div>`
  document.body.append(host)
  const items = host.querySelectorAll<HTMLElement>('[data-part="item"]')
  return {
    dropzone: host.querySelector<HTMLElement>('[data-part="dropzone"]')!,
    list: host.querySelector<HTMLElement>('[data-part="list"]')!,
    item: items[0]!,
    error: items[1]!,
  }
}

function token(property: 'color' | 'backgroundColor' | 'borderTopColor', name: string): string {
  const probe = document.createElement('span')
  probe.style[property] = `var(${name})`
  probe.style.borderTopStyle = 'solid'
  host!.append(probe)
  const value = getComputedStyle(probe)[property]
  probe.remove()
  return value
}

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

/** 把一串颜色按从下到上叠在底色上，返回叠完的 sRGB 三分量。 */
function composite(base: string, ...layers: string[]): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 1, 1)
  for (const layer of layers) {
    ctx.fillStyle = 'transparent'
    ctx.fillStyle = layer
    ctx.fillRect(0, 0, 1, 1)
  }
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

function contrast(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

describe('file-upload 拖放区', () => {
  it('淡底 + 1px 虚线、control 圆角、正文色，最小高 10rem', () => {
    const { dropzone } = mount()
    const style = getComputedStyle(dropzone)
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopStyle).toBe('dashed')
    expect(style.borderTopColor).toBe(token('borderTopColor', '--xh-border-control'))
    expect(style.borderTopLeftRadius).toBe('2px')
    expect(style.backgroundColor).toBe(token('backgroundColor', '--xh-bg-subtle'))
    expect(style.color).toBe(token('color', '--xh-fg-default'))
    expect(style.minHeight).toBe('160px')
  })

  it('悬停描边升 border-strong、底升一档；拖入态底仍是中性淡底一档，不用品牌淡底', async () => {
    const { dropzone } = mount()
    await userEvent.hover(dropzone)
    expect(getComputedStyle(dropzone).borderTopColor).toBe(token('borderTopColor', '--xh-border-strong'))
    expect(getComputedStyle(dropzone).backgroundColor).toBe(token('backgroundColor', '--xh-bg-subtle-hover'))
    await userEvent.unhover(dropzone)
    dropzone.setAttribute('data-dragging', '')
    expect(getComputedStyle(dropzone).backgroundColor).toBe(token('backgroundColor', '--xh-bg-subtle-hover'))
    expect(getComputedStyle(dropzone).backgroundColor).not.toBe(token('backgroundColor', '--xh-bg-brand-subtle'))
    expect(getComputedStyle(dropzone).borderTopColor).toBe(token('borderTopColor', '--xh-bg-brand'))
  })
})

describe('file-upload 文件行', () => {
  it('无描边的淡底行（透明边位留着），行内与行间距 12px', () => {
    const { list, item } = mount()
    const style = getComputedStyle(item)
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.backgroundColor).toBe(token('backgroundColor', '--xh-bg-subtle'))
    expect(style.columnGap).toBe('12px')
    expect(getComputedStyle(list).rowGap).toBe('12px')
  })

  it('缩略图槽是 16px 的品牌色无底图标位，空着时画一枚文件字形', () => {
    const { item } = mount()
    const preview = item.querySelector<HTMLElement>('[data-part="item-preview"]')!
    const style = getComputedStyle(preview)
    expect([preview.getBoundingClientRect().width, preview.getBoundingClientRect().height]).toEqual([16, 16])
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.color).toBe(token('color', '--xh-fg-brand'))
    const glyph = getComputedStyle(preview, '::before')
    expect(glyph.maskImage).toContain('data:image/svg+xml')
    expect(glyph.width).toBe('16px')
  })

  it('删除钮的兜底叉取指示符小档；悬停按淡底承载阶梯换面', async () => {
    const { item } = mount()
    const remove = item.querySelector<HTMLElement>('[data-part="item-delete-trigger"]')!
    const indicator = Number.parseFloat(getComputedStyle(host!).getPropertyValue('--xh-control-indicator-sm'))
    expect(Number.parseFloat(getComputedStyle(remove, '::before').width)).toBe(indicator)
    await userEvent.hover(remove)
    expect(getComputedStyle(remove).backgroundColor).toBe(token('backgroundColor', '--xh-bg-subtle-hover'))
  })

  it.each([undefined, 'dark'] as const)('失败行（%s）：只有文件名标红、描边透明，名字在行底上过 4.5:1', (theme) => {
    const { error } = mount(theme)
    const row = getComputedStyle(error)
    expect(row.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    const name = getComputedStyle(error.querySelector('[data-part="item-name"]')!)
    expect(name.color).toBe(token('color', '--xh-fg-danger'))
    expect(row.color).not.toBe(name.color)
    const page = getComputedStyle(host!).backgroundColor === 'rgba(0, 0, 0, 0)'
      ? token('backgroundColor', '--xh-bg-surface')
      : getComputedStyle(host!).backgroundColor
    const face = composite(page, row.backgroundColor)
    expect(contrast(composite(page, row.backgroundColor, name.color), face)).toBeGreaterThanOrEqual(4.5)
  })
})
