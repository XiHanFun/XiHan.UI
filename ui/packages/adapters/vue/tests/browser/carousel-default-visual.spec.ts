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
    <div data-scope="carousel" class="xh-scope-carousel" data-part="root" data-orientation="${orientation}"${autoplay ? ' data-autoplay style="--xh-_carousel-autoplay-duration:2500ms"' : ''}>
      <button data-scope="carousel" class="xh-scope-carousel" data-part="prev-trigger" data-orientation="${orientation}" data-xh-action-control data-xh-action-profile="floating" data-xh-action-display="always" data-xh-action-size="md"></button>
      <div data-scope="carousel" class="xh-scope-carousel" data-part="viewport" data-orientation="${orientation}" style="block-size:176px">
        <div data-scope="carousel" class="xh-scope-carousel" data-part="list" data-orientation="${orientation}">
          <div data-scope="carousel" class="xh-scope-carousel" data-part="item" data-orientation="${orientation}" style="flex-basis:100%">
            <article>Vue、React 与 Web Components 共享同一份行为契约</article>
          </div>
        </div>
      </div>
      <button data-scope="carousel" class="xh-scope-carousel" data-part="next-trigger" data-orientation="${orientation}" data-xh-action-control data-xh-action-profile="floating" data-xh-action-display="always" data-xh-action-size="md"></button>
      <button data-scope="carousel" class="xh-scope-carousel" data-part="autoplay-trigger" data-state="running" data-xh-action-control data-xh-action-profile="floating" data-xh-action-display="always" data-xh-action-size="md"></button>
      <div data-scope="carousel" class="xh-scope-carousel" data-part="indicator-group" data-orientation="${orientation}">
        <button data-scope="carousel" class="xh-scope-carousel" data-part="indicator" data-current></button>
        <button data-scope="carousel" class="xh-scope-carousel" data-part="indicator"></button>
      </div>
    </div>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    prev: host.querySelector<HTMLElement>('[data-part="prev-trigger"]')!,
    viewport: host.querySelector<HTMLElement>('[data-part="viewport"]')!,
    next: host.querySelector<HTMLElement>('[data-part="next-trigger"]')!,
    autoplay: host.querySelector<HTMLElement>('[data-part="autoplay-trigger"]')!,
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
    // 翻页钮走 Action Control floating 档，视觉盒取 xs 动作钮的尺：24px 正圆、字形 16px
    expect([prev.width, prev.height, next.width, next.height]).toEqual([24, 24, 24, 24])
    expect(getComputedStyle(carousel.prev).borderRadius).toBe('50%')
    expect(getComputedStyle(carousel.prev, '::before').width).toBe('16px')
  })

  it('翻页与播放钮是 24px 圆钮：矮到 96px 的视口里右侧居中的翻页钮与右下角的播放钮仍不相叠', () => {
    const carousel = mount()
    // 居中的钮占下半 12px、角上的钮连 12px 控件内距占 36px：h / 2 + 12 ≤ h − 36 即 h ≥ 96
    carousel.viewport.style.blockSize = '96px'
    for (const trigger of [carousel.prev, carousel.next, carousel.autoplay]) {
      const rect = trigger.getBoundingClientRect()
      expect([rect.width, rect.height]).toEqual([24, 24])
      expect(getComputedStyle(trigger).borderRadius).toBe('50%')
    }
    expect(carousel.next.getBoundingClientRect().bottom).toBeLessThanOrEqual(carousel.autoplay.getBoundingClientRect().top)
  })

  it('分页点是 6px 圆点、点距 8px，当前页拉长成 20px 品牌胶囊', () => {
    const carousel = mount()
    const [current, other] = [...carousel.indicators.querySelectorAll<HTMLElement>('[data-part="indicator"]')]
    const currentRect = current!.getBoundingClientRect()
    const otherRect = other!.getBoundingClientRect()
    const probe = document.createElement('span')
    probe.style.setProperty('background-color', 'var(--xh-bg-brand)')
    current!.append(probe)
    const brand = getComputedStyle(probe).backgroundColor
    probe.remove()

    expect([otherRect.width, otherRect.height]).toEqual([6, 6])
    expect(getComputedStyle(other!).borderRadius).toBe('50%')
    expect([currentRect.width, currentRect.height]).toEqual([20, 6])
    expect(otherRect.left - currentRect.right).toBe(8)
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
    expect([current.width, current.height]).toEqual([6, 20])
    expect(getComputedStyle(carousel.prev).rotate).toBe('90deg')
  })

  it('自动播放时当前分页按间隔显示进度，暂停时回到起点', () => {
    const carousel = mount('horizontal', true)
    const running = getComputedStyle(carousel.current, '::before')

    expect(running.animationName).toBe('xh-carousel-indicator-progress')
    expect(running.animationDuration).toBe('2.5s')
    expect(running.animationPlayState).toBe('running')

    // 计时器每次恢复都重计一整个间隔：按住时进度条不走并回到起点，恢复时从头走
    carousel.root.removeAttribute('data-autoplay')
    carousel.root.setAttribute('data-paused', '')
    const paused = getComputedStyle(carousel.current, '::before')
    expect(paused.animationName).toBe('none')
    expect(paused.scale).toBe(getComputedStyle(carousel.current).getPropertyValue('--xh-_carousel-progress-from').trim())
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

    // 盒子只管命中，点改由 ::after 画：当前项 20×6 的胶囊、其余 6×6 的圆点
    const currentMark = getComputedStyle(carousel.current, '::after')
    expect([currentMark.width, currentMark.height]).toEqual(
      orientation === 'horizontal' ? ['20px', '6px'] : ['6px', '20px'],
    )
    expect(getComputedStyle(carousel.current).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    const otherMark = getComputedStyle(indicators[1]!, '::after')
    expect([otherMark.width, otherMark.height]).toEqual(['6px', '6px'])
  })

  it.each(['horizontal', 'vertical'] as const)('%s 细指针下 6px 圆点的命中区两向都不低于 24px', (orientation) => {
    const carousel = mount(orientation)
    const other = carousel.indicators.querySelectorAll<HTMLElement>('[data-part="indicator"]')[1]!
    const hit = getComputedStyle(other, '::after')
    expect(Number.parseFloat(hit.width)).toBeGreaterThanOrEqual(24)
    expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(24)
  })

  /** 细横条风格：沿轨道 16px、当前页 28px，垂直于轨道只有 4px；横条不是正方盒，圆角改走胶囊 */
  function useBars(root: HTMLElement): void {
    root.style.setProperty('--xh-carousel-indicator-size', '16px')
    root.style.setProperty('--xh-carousel-indicator-size-current', '28px')
    root.style.setProperty('--xh-carousel-indicator-thickness', '4px')
    root.style.setProperty('--xh-carousel-indicator-radius', 'var(--xh-shape-pill)')
  }

  /** [沿轨道, 垂直于轨道] 的两段长度 */
  function alongAndAcross(orientation: 'horizontal' | 'vertical', width: number | string, height: number | string): Array<number | string> {
    return orientation === 'horizontal' ? [width, height] : [height, width]
  }

  it.each(['horizontal', 'vertical'] as const)('%s 粗细槽单独定点的粗细：细横条沿轨道伸长、垂直于轨道 4px，命中区垂直于轨道仍有 24px', (orientation) => {
    const carousel = mount(orientation)
    useBars(carousel.root)
    const [current, other] = [...carousel.indicators.querySelectorAll<HTMLElement>('[data-part="indicator"]')]
    const otherRect = other!.getBoundingClientRect()
    const currentRect = current!.getBoundingClientRect()

    expect(alongAndAcross(orientation, otherRect.width, otherRect.height)).toEqual([16, 4])
    expect(alongAndAcross(orientation, currentRect.width, currentRect.height)).toEqual([28, 4])
    // 细指针的命中区由 ::after 外扩：点变细了，外扩跟着补足，垂直于轨道不低于 24px 的最小目标
    const hit = getComputedStyle(other!, '::after')
    const [, across] = alongAndAcross(orientation, hit.width, hit.height)
    expect(Number.parseFloat(String(across))).toBeGreaterThanOrEqual(24)
  })

  it.each(['horizontal', 'vertical'] as const)('%s 粗指针下伪元素画的点与进度条同样按粗细槽，命中区仍是 44px', async (orientation) => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    const carousel = mount(orientation, true)
    useBars(carousel.root)
    const [current, other] = [...carousel.indicators.querySelectorAll<HTMLElement>('[data-part="indicator"]')]

    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    for (const indicator of [current!, other!]) {
      const rect = indicator.getBoundingClientRect()
      expect(rect.width).toBeGreaterThanOrEqual(44)
      expect(rect.height).toBeGreaterThanOrEqual(44)
    }
    const otherMark = getComputedStyle(other!, '::after')
    const currentMark = getComputedStyle(current!, '::after')
    const progress = getComputedStyle(current!, '::before')
    expect(alongAndAcross(orientation, otherMark.width, otherMark.height)).toEqual(['16px', '4px'])
    expect(alongAndAcross(orientation, currentMark.width, currentMark.height)).toEqual(['28px', '4px'])
    expect(alongAndAcross(orientation, progress.width, progress.height)).toEqual(['28px', '4px'])
    // 点落在 44px 命中盒的正中：细指针按轨道方向外扩命中区的规则不能把粗指针下点的定位顶掉
    const box = other!.getBoundingClientRect()
    expect(Number.parseFloat(otherMark.top)).toBeCloseTo(box.height / 2, 0)
    expect(Number.parseFloat(otherMark.left)).toBeCloseTo(box.width / 2, 0)
  })

  it('粗指针下点的伸长与细指针同一档：尺寸变化走 move，不走 nudge', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    const carousel = mount()
    const fine = getComputedStyle(document.documentElement).getPropertyValue('--xh-motion-duration-move').trim()
    const mark = getComputedStyle(carousel.current, '::after')
    const props = mark.transitionProperty.split(', ')
    const durations = mark.transitionDuration.split(', ')
    for (const name of ['width', 'height']) {
      const at = props.findIndex(prop => prop === name || prop === (name === 'width' ? 'inline-size' : 'block-size'))
      expect(durations[at], name).toBe(`${Number.parseFloat(fine) / 1000}s`)
    }
  })
})
