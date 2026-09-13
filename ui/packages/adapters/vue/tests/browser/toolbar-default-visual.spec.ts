import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(options: { pressed?: boolean, size?: 'lg' | 'md' | 'sm', variant?: 'plain' | 'surface' } = {}) {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="toolbar" data-part="root" data-orientation="horizontal"${options.variant ? ` data-variant="${options.variant}"` : ''}${options.size ? ` data-size="${options.size}"` : ''}>
      <div data-scope="toolbar" data-part="group" data-orientation="horizontal">
        <button data-scope="toolbar" data-part="item"${options.pressed ? ' aria-pressed="true"' : ''}>加粗</button>
      </div>
    </div>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    group: host.querySelector<HTMLElement>('[data-part="group"]')!,
    item: host.querySelector<HTMLElement>('[data-part="item"]')!,
  }
}

describe('toolbar 默认视觉', () => {
  it('不写变体与显式 plain 都不画外框', () => {
    const plain = mount()
    const plainStyle = getComputedStyle(plain.root)
    const paint = {
      background: plainStyle.backgroundColor,
      border: plainStyle.borderTopColor,
      padding: plainStyle.paddingInlineStart,
    }

    const explicit = mount({ variant: 'plain' })
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

  it('surface 提供完整工具面', () => {
    const surface = mount({ variant: 'surface' })
    const style = getComputedStyle(surface.root)

    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
  })

  it('默认分组使用浅色胶囊工具面', () => {
    const toolbar = mount()
    const style = getComputedStyle(toolbar.group)

    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.columnGap)).toBe(0)
    expect(Number.parseFloat(style.borderRadius)).toBeGreaterThanOrEqual(toolbar.group.offsetHeight / 2)
  })

  it('默认条目有控件尺寸，选中态使用强调面', () => {
    const idle = mount()
    const idleStyle = getComputedStyle(idle.item)
    const idleBackground = idleStyle.backgroundColor
    const idleHeight = Number.parseFloat(idleStyle.minBlockSize)

    const pressed = mount({ pressed: true })
    expect(getComputedStyle(pressed.item).backgroundColor).not.toBe(idleBackground)

    const large = mount({ size: 'lg' })
    expect(Number.parseFloat(getComputedStyle(large.item).minBlockSize)).toBeGreaterThan(idleHeight)
  })
})
