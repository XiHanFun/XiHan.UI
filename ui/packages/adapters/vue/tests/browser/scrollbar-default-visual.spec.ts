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
    grid.dataset.scope = 'calendar-picker'
    grid.dataset.part = 'grid'
    grid.dataset.view = 'year'
    grid.style.inlineSize = '240px'

    for (let year = 1900; year <= 2099; year += 1) {
      const cell = document.createElement('button')
      cell.dataset.scope = 'calendar-picker'
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

  it('作者容器打 data-xh-scroll 即得 reset 层的细条与令牌色阶', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <div data-xh-scroll style="block-size: 80px; overflow: auto">
        <div style="block-size: 240px"></div>
      </div>
      <div data-probe style="color: var(--xh-fg-scrollbar-thumb); background-color: var(--xh-bg-scrollbar-track)"></div>`
    document.body.append(host)
    const box = host.querySelector<HTMLElement>('[data-xh-scroll]')!
    const probe = getComputedStyle(host.querySelector<HTMLElement>('[data-probe]')!)
    const style = getComputedStyle(box)
    expect(style.scrollbarWidth).toBe('thin')
    // 两支令牌各解出一个颜色：滑块用 fg-scrollbar-thumb，轨道用 bg-scrollbar-track
    expect(style.scrollbarColor).toBe(`${probe.color} ${probe.backgroundColor}`)
  })

  it('typography prose 里的 pre 不带 data-part 也吃到同一套细条', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="typography" data-part="prose">
        <pre style="inline-size: 120px">${'x'.repeat(400)}</pre>
      </div>
      <div data-probe style="color: var(--xh-fg-scrollbar-thumb); background-color: var(--xh-bg-scrollbar-track)"></div>`
    document.body.append(host)
    const pre = host.querySelector<HTMLElement>('pre')!
    const probe = getComputedStyle(host.querySelector<HTMLElement>('[data-probe]')!)
    const style = getComputedStyle(pre)
    expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth)
    expect(style.scrollbarWidth).toBe('thin')
    expect(style.scrollbarColor).toBe(`${probe.color} ${probe.backgroundColor}`)
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
