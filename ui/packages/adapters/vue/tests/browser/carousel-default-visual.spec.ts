import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount() {
  host = document.createElement('div')
  host.style.inlineSize = '560px'
  host.innerHTML = `
    <div data-scope="carousel" data-part="root" data-orientation="horizontal">
      <button data-scope="carousel" data-part="prev-trigger"></button>
      <div data-scope="carousel" data-part="viewport" style="block-size:176px">
        <div data-scope="carousel" data-part="list">
          <div data-scope="carousel" data-part="item" style="flex-basis:100%">
            <article>Vue、React 与 Web Components 共享同一份行为契约</article>
          </div>
        </div>
      </div>
      <button data-scope="carousel" data-part="next-trigger"></button>
      <div data-scope="carousel" data-part="indicator-group" data-orientation="horizontal">
        <button data-scope="carousel" data-part="indicator" data-current></button>
      </div>
    </div>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    prev: host.querySelector<HTMLElement>('[data-part="prev-trigger"]')!,
    viewport: host.querySelector<HTMLElement>('[data-part="viewport"]')!,
    next: host.querySelector<HTMLElement>('[data-part="next-trigger"]')!,
    indicators: host.querySelector<HTMLElement>('[data-part="indicator-group"]')!,
  }
}

describe('carousel 默认视觉', () => {
  it('富内容下导航与分页覆盖在视口内部', () => {
    const carousel = mount()
    const root = carousel.root.getBoundingClientRect()
    const prev = carousel.prev.getBoundingClientRect()
    const viewport = carousel.viewport.getBoundingClientRect()
    const next = carousel.next.getBoundingClientRect()
    const indicators = carousel.indicators.getBoundingClientRect()

    expect(viewport.top + viewport.height / 2).toBe(prev.top + prev.height / 2)
    expect(next.top + next.height / 2).toBe(prev.top + prev.height / 2)
    expect(prev.left).toBeGreaterThanOrEqual(viewport.left)
    expect(next.right).toBeLessThanOrEqual(viewport.right)
    expect(indicators.bottom).toBeLessThanOrEqual(viewport.bottom)
    expect(indicators.top).toBeGreaterThan(viewport.top)
    expect(carousel.viewport.clientWidth).toBe(carousel.root.clientWidth)
    expect(root.height).toBe(viewport.height)
    expect(getComputedStyle(carousel.viewport).overflow).toBe('hidden')
    expect(getComputedStyle(carousel.indicators).position).toBe('absolute')
  })
})
