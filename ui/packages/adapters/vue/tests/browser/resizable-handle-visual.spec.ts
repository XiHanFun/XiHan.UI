/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 resizable handle visual 相关行为。

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
      <span data-scope="resizable" data-part="handle" data-edge="se"></span>
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
  it('边缘命中区和短条都落在容器内部', () => {
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
    expect(Number.parseFloat(eastIndicator.inlineSize)).toBe(2)
    expect(Number.parseFloat(eastIndicator.blockSize)).toBe(32)
    expect(Number.parseFloat(southIndicator.inlineSize)).toBe(32)
    expect(Number.parseFloat(southIndicator.blockSize)).toBe(2)
  })

  it('角把手继承容器对应拐角', () => {
    const rounded = mount('12px')
    const roundedCorner = getComputedStyle(rounded.corner)
    const roundedIndicator = getComputedStyle(rounded.corner, '::after')

    expect(roundedCorner.borderBottomRightRadius).toBe('12px')
    expect(roundedIndicator.borderBottomRightRadius).toBe('12px')

    const square = mount('0px')
    expect(getComputedStyle(square.corner).borderBottomRightRadius).toBe('0px')
    expect(getComputedStyle(square.corner, '::after').borderBottomRightRadius).toBe('0px')
  })

  it('悬停只增强内部指示条', async () => {
    const resizable = mount('12px')
    const idle = getComputedStyle(resizable.east, '::after').backgroundColor

    await userEvent.hover(resizable.east)
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(getComputedStyle(resizable.east).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(resizable.east, '::after').backgroundColor).not.toBe(idle)
  })
})
