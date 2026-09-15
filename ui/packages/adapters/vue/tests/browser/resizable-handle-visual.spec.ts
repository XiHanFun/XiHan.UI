import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(radius: string) {
  host?.remove()
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="resizable" data-part="root" style="inline-size: 200px; block-size: 120px; border-radius: ${radius}">
      <span data-scope="resizable" data-part="handle" data-edge="e"></span>
      <span data-scope="resizable" data-part="handle" data-edge="s"></span>
      <span data-scope="resizable" data-part="handle" data-edge="se" tabindex="0"></span>
    </div>`
  document.body.append(host)

  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    east: host.querySelector<HTMLElement>('[data-edge="e"]')!,
    south: host.querySelector<HTMLElement>('[data-edge="s"]')!,
    corner: host.querySelector<HTMLElement>('[data-edge="se"]')!,
  }
}

describe('resizable 把手视觉', () => {
  it('边缘命中区留在容器内部，短条贴住边框并略微加粗', () => {
    const resizable = mount('12px')
    const rootRect = resizable.root.getBoundingClientRect()
    const eastRect = resizable.east.getBoundingClientRect()
    const southRect = resizable.south.getBoundingClientRect()
    const eastIndicator = getComputedStyle(resizable.east, '::after')
    const southIndicator = getComputedStyle(resizable.south, '::after')

    expect(eastRect.right).toBe(rootRect.right)
    expect(eastRect.left).toBeGreaterThanOrEqual(rootRect.left)
    expect(southRect.bottom).toBe(rootRect.bottom)
    expect(southRect.top).toBeGreaterThanOrEqual(rootRect.top)
    expect(eastRect.right - Number.parseFloat(eastIndicator.right)).toBeCloseTo(rootRect.right, 5)
    expect(southRect.bottom - Number.parseFloat(southIndicator.bottom)).toBeCloseTo(rootRect.bottom, 5)
    expect(Number.parseFloat(eastIndicator.inlineSize)).toBe(3)
    expect(Number.parseFloat(eastIndicator.blockSize)).toBe(32)
    expect(Number.parseFloat(southIndicator.inlineSize)).toBe(32)
    expect(Number.parseFloat(southIndicator.blockSize)).toBe(3)
    expect(eastIndicator.borderRadius).toBe('9999px')
    expect(southIndicator.borderRadius).toBe('9999px')
  })

  it('角把手始终使用圆弧，不跟随容器退化成直角', () => {
    const rounded = mount('12px')
    const rootRect = rounded.root.getBoundingClientRect()
    const cornerRect = rounded.corner.getBoundingClientRect()
    const roundedIndicator = getComputedStyle(rounded.corner, '::after')

    expect(cornerRect.right - Number.parseFloat(roundedIndicator.right)).toBeCloseTo(rootRect.right, 5)
    expect(cornerRect.bottom - Number.parseFloat(roundedIndicator.bottom)).toBeCloseTo(rootRect.bottom, 5)
    expect(Number.parseFloat(roundedIndicator.inlineSize)).toBe(8)
    expect(Number.parseFloat(roundedIndicator.blockSize)).toBe(8)
    expect(roundedIndicator.borderRadius).toBe('50%')

    const square = mount('0px')
    expect(getComputedStyle(square.corner, '::after').borderRadius).toBe('50%')
  })

  it('角把手聚焦环围住圆弧指示器，不围透明命中盒', () => {
    const resizable = mount('0px')
    resizable.corner.focus()

    const handle = getComputedStyle(resizable.corner)
    const indicator = getComputedStyle(resizable.corner, '::after')
    expect(document.activeElement).toBe(resizable.corner)
    expect(handle.outlineStyle).toBe('none')
    expect(indicator.outlineStyle).toBe('solid')
    expect(indicator.outlineWidth).toBe('2px')
    expect(indicator.borderRadius).toBe('50%')
  })

  it('悬停只增强边框指示条', async () => {
    const resizable = mount('12px')
    const idle = getComputedStyle(resizable.east, '::after').backgroundColor

    await userEvent.hover(resizable.east)
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(getComputedStyle(resizable.east).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(resizable.east, '::after').backgroundColor).not.toBe(idle)
  })
})
