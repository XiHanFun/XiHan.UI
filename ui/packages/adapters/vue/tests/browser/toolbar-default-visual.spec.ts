import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function mount(options: { pressed?: boolean, size?: 'lg' | 'md' | 'sm', variant?: 'ghost' | 'outline' | 'subtle', loose?: boolean } = {}) {
  host = document.createElement('div')
  // 静态夹具带上 connect 投影的家族属性：条目的盒型与三态面由 Action Control 配方按它们画
  const size = options.size ?? 'md'
  const item = (text: string, extra = '') => `<button data-scope="toolbar" data-part="item" data-xh-action-control data-xh-action-profile="text" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="${size}"${extra}>${text}</button>`
  host.innerHTML = `
    <div data-scope="toolbar" data-part="root" data-orientation="horizontal"${options.variant ? ` data-variant="${options.variant}"` : ''}${options.size ? ` data-size="${options.size}"` : ''}>
      ${options.loose ? item('散落') : ''}
      <div data-scope="toolbar" data-part="group" data-orientation="horizontal">
        ${item('撤销')}
        <span data-scope="toolbar" data-part="separator" data-orientation="vertical"></span>
        ${item('加粗', options.pressed ? ' aria-pressed="true"' : '')}
        <span data-scope="toolbar" data-part="separator" data-orientation="vertical"></span>
        ${item('复制')}
      </div>
    </div>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    group: host.querySelector<HTMLElement>('[data-part="group"]')!,
    items: [...host.querySelectorAll<HTMLElement>('[data-part="item"]')],
    separator: host.querySelector<HTMLElement>('[data-part="separator"]')!,
  }
}

/** 语义形状令牌在该元素上解到的像素值。 */
function shapePx(element: HTMLElement, token: string): number {
  const probe = document.createElement('div')
  probe.style.borderTopLeftRadius = `var(${token})`
  element.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).borderTopLeftRadius)
  probe.remove()
  return value
}

describe('toolbar 默认视觉', () => {
  it('不写变体与显式 ghost 都不画外框', () => {
    const plain = mount()
    const plainStyle = getComputedStyle(plain.root)
    const paint = {
      background: plainStyle.backgroundColor,
      border: plainStyle.borderTopColor,
      padding: plainStyle.paddingInlineStart,
    }

    const explicit = mount({ variant: 'ghost' })
    const explicitStyle = getComputedStyle(explicit.root)
    expect({
      background: explicitStyle.backgroundColor,
      border: explicitStyle.borderTopColor,
      padding: explicitStyle.paddingInlineStart,
    }).toEqual(paint)
    expect(paint.background).toBe('rgba(0, 0, 0, 0)')
    expect(paint.border).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(plainStyle.borderTopWidth)).toBe(0)
    expect(Number.parseFloat(paint.padding)).toBe(0)
  })

  it('outline 是 border-default 描边 + surface 底 + 无影的附着工具面', () => {
    const surface = mount({ variant: 'outline' })
    const style = getComputedStyle(surface.root)

    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-surface'))
    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
    expect(style.boxShadow).toBe('none')
    expect(Number.parseFloat(style.borderRadius)).toBe(shapePx(surface.root, '--xh-shape-surface'))
  })

  it('subtle 是淡底 + 透明边位 + 无影，与 outline 同一几何', () => {
    const surface = mount({ variant: 'subtle' })
    const style = getComputedStyle(surface.root)

    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toBe('none')
  })

  it('默认分组由连续操作段组成', () => {
    const toolbar = mount()
    const groupStyle = getComputedStyle(toolbar.group)
    const [first, middle, last] = toolbar.items
    const firstStyle = getComputedStyle(first!)
    const middleStyle = getComputedStyle(middle!)
    const lastStyle = getComputedStyle(last!)

    expect(groupStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(groupStyle.paddingInlineStart)).toBe(0)
    expect(Number.parseFloat(groupStyle.columnGap)).toBe(0)
    expect(firstStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(firstStyle.borderTopLeftRadius)).toBeGreaterThan(0)
    expect(Number.parseFloat(firstStyle.borderTopRightRadius)).toBe(0)
    expect(Number.parseFloat(middleStyle.borderRadius)).toBe(0)
    expect(Number.parseFloat(lastStyle.borderTopLeftRadius)).toBe(0)
    expect(Number.parseFloat(lastStyle.borderTopRightRadius)).toBeGreaterThan(0)
  })

  it('分段悬停与选中只改变当前操作面：组内淡底承载 hover 200，选中为品牌淡底 + 淡底前景', async () => {
    const idle = mount()
    const idleStyle = getComputedStyle(idle.items[1]!)
    const idleBackground = idleStyle.backgroundColor
    const idleHeight = Number.parseFloat(idleStyle.blockSize)

    await userEvent.hover(idle.items[1]!)
    await expect.poll(() => getComputedStyle(idle.items[1]!).backgroundColor).toBe(tokenColor('--xh-bg-subtle-hover'))
    expect(getComputedStyle(idle.items[1]!).backgroundColor).not.toBe(idleBackground)
    expect(Number.parseFloat(getComputedStyle(idle.items[1]!).borderRadius)).toBe(0)

    const pressed = mount({ pressed: true })
    expect(getComputedStyle(pressed.items[1]!).backgroundColor).toBe(tokenColor('--xh-bg-brand-subtle'))
    expect(getComputedStyle(pressed.items[1]!).color).toBe(tokenColor('--xh-fg-on-brand-subtle'))

    const large = mount({ size: 'lg' })
    expect(Number.parseFloat(getComputedStyle(large.items[1]!).blockSize)).toBeGreaterThan(idleHeight)
  })

  it('ghost 根上散落的条目按画布承载走：hover 100，按下缩放走令牌', async () => {
    const toolbar = mount({ loose: true })
    const loose = toolbar.items[0]!
    expect(getComputedStyle(loose).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(loose)
    await expect.poll(() => getComputedStyle(loose).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(loose).transitionProperty).toContain('scale')
  })

  it('组内分隔线为半高低对比线且不占额外间距', () => {
    const toolbar = mount()
    const style = getComputedStyle(toolbar.separator)

    expect(Number.parseFloat(style.inlineSize)).toBe(1)
    expect(Number.parseFloat(style.blockSize)).toBe(toolbar.items[0]!.offsetHeight / 2)
    expect(Number.parseFloat(style.opacity)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.opacity)).toBeLessThan(0.5)
    expect(Number.parseFloat(style.marginInlineStart)).toBe(-1)
  })
})
