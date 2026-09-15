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
      <span data-scope="resizable" data-part="handle" data-edge="e" tabindex="0"></span>
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

  it('角把手只圆对应的外侧拐角，并继承容器圆角', () => {
    const rounded = mount('12px')
    const rootRect = rounded.root.getBoundingClientRect()
    const cornerRect = rounded.corner.getBoundingClientRect()
    const roundedIndicator = getComputedStyle(rounded.corner, '::after')

    expect(cornerRect.right - Number.parseFloat(roundedIndicator.right)).toBeCloseTo(rootRect.right, 5)
    expect(cornerRect.bottom - Number.parseFloat(roundedIndicator.bottom)).toBeCloseTo(rootRect.bottom, 5)
    expect(Number.parseFloat(roundedIndicator.inlineSize)).toBe(8)
    expect(Number.parseFloat(roundedIndicator.blockSize)).toBe(8)
    expect(roundedIndicator.borderTopLeftRadius).toBe('0px')
    expect(roundedIndicator.borderBottomRightRadius).toBe('12px')

    const square = mount('0px')
    expect(getComputedStyle(square.corner, '::after').borderBottomRightRadius).toBe('0px')
  })

  it('聚焦时高亮指示器本身，不给透明命中盒或伪元素画外框', async () => {
    const resizable = mount('12px')
    const edgeIdle = getComputedStyle(resizable.east, '::after').backgroundColor
    const cornerIdle = getComputedStyle(resizable.corner, '::after').borderBottomColor

    await userEvent.tab()
    await new Promise(resolve => setTimeout(resolve, 150))
    const edgeIndicator = getComputedStyle(resizable.east, '::after')
    expect(document.activeElement).toBe(resizable.east)
    expect(getComputedStyle(resizable.east).outlineStyle).toBe('none')
    expect(edgeIndicator.outlineStyle).toBe('none')
    expect(edgeIndicator.backgroundColor).not.toBe(edgeIdle)

    await userEvent.tab()
    await new Promise(resolve => setTimeout(resolve, 150))
    const cornerIndicator = getComputedStyle(resizable.corner, '::after')
    expect(document.activeElement).toBe(resizable.corner)
    expect(getComputedStyle(resizable.corner).outlineStyle).toBe('none')
    expect(cornerIndicator.outlineStyle).toBe('none')
    expect(cornerIndicator.borderBottomColor).not.toBe(cornerIdle)
    expect(cornerIndicator.borderBottomRightRadius).toBe('12px')
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
