import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
  host?.remove()
  host = null
})

function mount(orientation: 'horizontal' | 'vertical' = 'horizontal', autoplay = false) {
  host = document.createElement('div')
  host.style.inlineSize = orientation === 'horizontal' ? '560px' : '360px'
  host.innerHTML = `
    <div data-scope="carousel" data-part="root" data-orientation="${orientation}"${autoplay ? ' data-autoplay style="--xh-_carousel-autoplay-duration:2500ms"' : ''}>
      <button data-scope="carousel" data-part="prev-trigger" data-orientation="${orientation}" data-xh-action-control data-xh-action-profile="floating" data-xh-action-display="always" data-xh-action-size="md"></button>
      <div data-scope="carousel" data-part="viewport" data-orientation="${orientation}" style="block-size:176px">
        <div data-scope="carousel" data-part="list" data-orientation="${orientation}">
          <div data-scope="carousel" data-part="item" data-orientation="${orientation}" style="flex-basis:100%">
            <article>Vue、React 与 Web Components 共享同一份行为契约</article>
          </div>
        </div>
      </div>
      <button data-scope="carousel" data-part="next-trigger" data-orientation="${orientation}" data-xh-action-control data-xh-action-profile="floating" data-xh-action-display="always" data-xh-action-size="md"></button>
      <div data-scope="carousel" data-part="indicator-group" data-orientation="${orientation}">
        <button data-scope="carousel" data-part="indicator" data-current></button>
        <button data-scope="carousel" data-part="indicator"></button>
      </div>
    </div>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    prev: host.querySelector<HTMLElement>('[data-part="prev-trigger"]')!,
    viewport: host.querySelector<HTMLElement>('[data-part="viewport"]')!,
    next: host.querySelector<HTMLElement>('[data-part="next-trigger"]')!,
    indicators: host.querySelector<HTMLElement>('[data-part="indicator-group"]')!,
    current: host.querySelector<HTMLElement>('[data-part="indicator"][data-current]')!,
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
    // 翻页钮走 Action Control floating 档 md：48px 正圆
    expect([prev.width, prev.height, next.width, next.height]).toEqual([48, 48, 48, 48])
    expect(getComputedStyle(carousel.prev).borderRadius).toBe('50%')
  })

  it('分页点是 8px 圆点，当前页拉长成 20px 品牌胶囊', () => {
    const carousel = mount()
    const [current, other] = [...carousel.indicators.querySelectorAll<HTMLElement>('[data-part="indicator"]')]
    const currentRect = current!.getBoundingClientRect()
    const otherRect = other!.getBoundingClientRect()
    const probe = document.createElement('span')
    probe.style.setProperty('background-color', 'var(--xh-bg-brand)')
    current!.append(probe)
    const brand = getComputedStyle(probe).backgroundColor
    probe.remove()

    expect([otherRect.width, otherRect.height]).toEqual([8, 8])
    expect(getComputedStyle(other!).borderRadius).toBe('50%')
    expect([currentRect.width, currentRect.height]).toEqual([20, 8])
    expect(getComputedStyle(current!).borderRadius).toBe('9999px')
    expect(getComputedStyle(current!).backgroundColor).toBe(brand)
  })

  it('纵向轨道的箭头落在上下两端，分页沿右侧竖排', () => {
    const carousel = mount('vertical')
    const viewport = carousel.viewport.getBoundingClientRect()
    const prev = carousel.prev.getBoundingClientRect()
    const next = carousel.next.getBoundingClientRect()
    const indicators = carousel.indicators.getBoundingClientRect()
    const current = carousel.current.getBoundingClientRect()

    expect(prev.left + prev.width / 2).toBe(viewport.left + viewport.width / 2)
    expect(next.left + next.width / 2).toBe(viewport.left + viewport.width / 2)
    expect(prev.top).toBeGreaterThanOrEqual(viewport.top)
    expect(next.bottom).toBeLessThanOrEqual(viewport.bottom)
    expect(prev.bottom).toBeLessThan(next.top)
    expect(indicators.right).toBeLessThanOrEqual(viewport.right)
    expect(indicators.top + indicators.height / 2).toBe(viewport.top + viewport.height / 2)
    expect([current.width, current.height]).toEqual([8, 20])
    expect(getComputedStyle(carousel.prev).rotate).toBe('90deg')
  })

  it('自动播放时当前分页按间隔显示进度，暂停时冻结', () => {
    const carousel = mount('horizontal', true)
    const running = getComputedStyle(carousel.current, '::before')

    expect(running.animationName).toBe('xh-carousel-indicator-progress')
    expect(running.animationDuration).toBe('2.5s')
    expect(running.animationPlayState).toBe('running')

    carousel.root.removeAttribute('data-autoplay')
    carousel.root.setAttribute('data-paused', '')
    expect(getComputedStyle(carousel.current, '::before').animationPlayState).toBe('paused')
  })

  it.each(['horizontal', 'vertical'] as const)('%s 粗指针分页划成不重叠的 44px 分区，圆点与胶囊的视觉尺寸不变', async (orientation) => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    const carousel = mount(orientation)
    const indicators = [...carousel.indicators.querySelectorAll<HTMLElement>('[data-part="indicator"]')]

    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    for (const indicator of indicators) {
      const rect = indicator.getBoundingClientRect()
      expect(rect.width).toBeGreaterThanOrEqual(44)
      expect(rect.height).toBeGreaterThanOrEqual(44)
    }

    const [first, second] = indicators.map(indicator => indicator.getBoundingClientRect())
    if (orientation === 'horizontal')
      expect(first!.right).toBeLessThanOrEqual(second!.left)
    else
      expect(first!.bottom).toBeLessThanOrEqual(second!.top)

    // 盒子只管命中，点改由 ::after 画：当前项 20×8 的胶囊、其余 8×8 的圆点
    const currentMark = getComputedStyle(carousel.current, '::after')
    expect([currentMark.width, currentMark.height]).toEqual(
      orientation === 'horizontal' ? ['20px', '8px'] : ['8px', '20px'],
    )
    expect(getComputedStyle(carousel.current).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    const otherMark = getComputedStyle(indicators[1]!, '::after')
    expect([otherMark.width, otherMark.height]).toEqual(['8px', '8px'])
  })
})
