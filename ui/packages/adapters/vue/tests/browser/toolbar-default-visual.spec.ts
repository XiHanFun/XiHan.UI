/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 toolbar default visual 相关行为。

import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
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
        <button data-scope="toolbar" data-part="item">撤销</button>
        <span data-scope="toolbar" data-part="separator" data-orientation="vertical"></span>
        <button data-scope="toolbar" data-part="item"${options.pressed ? ' aria-pressed="true"' : ''}>加粗</button>
        <span data-scope="toolbar" data-part="separator" data-orientation="vertical"></span>
        <button data-scope="toolbar" data-part="item">复制</button>
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

  it('surface 提供无描边的附着工具面', () => {
    const surface = mount({ variant: 'surface' })
    const style = getComputedStyle(surface.root)

    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.borderTopWidth)).toBe(0)
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
    expect(style.boxShadow).not.toBe('none')
    expect(Number.parseFloat(style.borderRadius)).toBeGreaterThanOrEqual(surface.root.offsetHeight / 2)
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

  it('分段悬停与选中只改变当前操作面', async () => {
    const idle = mount()
    const idleStyle = getComputedStyle(idle.items[1]!)
    const idleBackground = idleStyle.backgroundColor
    const idleHeight = Number.parseFloat(idleStyle.minBlockSize)

    await userEvent.hover(idle.items[1]!)
    expect(getComputedStyle(idle.items[1]!).backgroundColor).not.toBe(idleBackground)
    expect(Number.parseFloat(getComputedStyle(idle.items[1]!).borderRadius)).toBe(0)

    const pressed = mount({ pressed: true })
    expect(getComputedStyle(pressed.items[1]!).backgroundColor).not.toBe(idleBackground)

    const large = mount({ size: 'lg' })
    expect(Number.parseFloat(getComputedStyle(large.items[1]!).minBlockSize)).toBeGreaterThan(idleHeight)
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
