/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 scrollbar default visual 相关行为。

import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

afterEach(() => {
  host?.remove()
  host = null
})

function mount() {
  host = document.createElement('div')
  host.style.cssText = 'position: relative; block-size: 160px; inline-size: 120px;'
  host.innerHTML = `
    <div data-scope="scrollbar" data-part="root" data-orientation="vertical" data-state="visible">
      <div data-scope="scrollbar" data-part="track">
        <div data-scope="scrollbar" data-part="thumb" data-orientation="vertical" style="inset-block-start: 0; block-size: 64px"></div>
      </div>
    </div>`
  document.body.append(host)

  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    track: host.querySelector<HTMLElement>('[data-part="track"]')!,
    thumb: host.querySelector<HTMLElement>('[data-part="thumb"]')!,
  }
}

describe('scrollbar 默认视觉', () => {
  it('透明轨道只显示内收的细滑块', () => {
    const scrollbar = mount()
    const rootStyle = getComputedStyle(scrollbar.root)
    const trackStyle = getComputedStyle(scrollbar.track)
    const thumbStyle = getComputedStyle(scrollbar.thumb)

    expect(rootStyle.inlineSize).toBe('6px')
    expect(alpha(trackStyle.backgroundColor)).toBe(0)
    expect(alpha(thumbStyle.backgroundColor)).toBeGreaterThan(0)
    expect(Number.parseFloat(thumbStyle.inlineSize)).toBeLessThan(Number.parseFloat(rootStyle.inlineSize))
    expect(Number.parseFloat(thumbStyle.borderRadius)).toBeGreaterThanOrEqual(scrollbar.thumb.offsetWidth / 2)
  })

  it('组件内部原生滚动面复用同一套窄轨道与低对比色阶', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="time-picker" data-part="column" style="block-size: 80px; overflow-y: auto">
        <div style="block-size: 240px"></div>
      </div>`
    document.body.append(host)
    const column = host.querySelector<HTMLElement>('[data-part="column"]')!
    const style = getComputedStyle(column)
    expect(style.scrollbarWidth).toBe('thin')
    expect(style.scrollbarColor).not.toBe('auto')
    expect(style.getPropertyValue('--xh-scrollbar-thickness-md').trim()).toBe('6px')
  })

  it('快速选年使用三列可滚动网格并继承内部滚动条', () => {
    host = document.createElement('div')
    const grid = document.createElement('div')
    grid.dataset.scope = 'calendar'
    grid.dataset.part = 'grid'
    grid.dataset.view = 'year'
    grid.style.inlineSize = '240px'

    for (let year = 1900; year <= 2099; year += 1) {
      const cell = document.createElement('button')
      cell.dataset.scope = 'calendar'
      cell.dataset.part = 'cell-trigger'
      cell.textContent = `${year}年`
      grid.append(cell)
    }

    host.append(grid)
    document.body.append(host)

    const style = getComputedStyle(grid)
    expect(style.gridTemplateColumns.split(' ').length).toBe(3)
    expect(grid.scrollHeight).toBeGreaterThan(grid.clientHeight)
    expect(style.scrollbarWidth).toBe('thin')
    expect(style.scrollbarColor).not.toBe('auto')
  })

  it('悬停只增强滑块对比，不显形轨道', async () => {
    const scrollbar = mount()
    const idle = getComputedStyle(scrollbar.thumb).backgroundColor

    await userEvent.hover(scrollbar.thumb)
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(getComputedStyle(scrollbar.thumb).backgroundColor).not.toBe(idle)
    expect(alpha(getComputedStyle(scrollbar.track).backgroundColor)).toBe(0)
  })
})
