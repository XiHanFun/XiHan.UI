// 粗指针下走马灯的分页：命中区划成 44px 分区，点与进度条的视觉尺寸不变。要开触屏仿真，单独成份：
// Linux 无头 Chromium 关过一次触屏仿真，同一页面的 (pointer) 就再也回不到 fine，细指针的命中区断言在 carousel-default-visual.spec.ts。
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

function mount(orientation: 'horizontal' | 'vertical' = 'horizontal', autoplay = false, size: 'sm' | 'md' | 'lg' = 'md') {
  host = document.createElement('div')
  host.style.inlineSize = orientation === 'horizontal' ? '560px' : '360px'
  host.innerHTML = `
    <div data-scope="carousel" class="xh-scope-carousel" data-part="root" data-orientation="${orientation}"${autoplay ? ' data-autoplay style="--xh-_carousel-autoplay-duration:2500ms"' : ''}>
      <button data-scope="carousel" class="xh-scope-carousel" data-part="prev-trigger" data-orientation="${orientation}" data-xh-action-control data-xh-action-profile="floating" data-xh-action-display="always" data-xh-action-size="${size}"></button>
      <div data-scope="carousel" class="xh-scope-carousel" data-part="viewport" data-orientation="${orientation}" style="block-size:176px">
        <div data-scope="carousel" class="xh-scope-carousel" data-part="list" data-orientation="${orientation}">
          <div data-scope="carousel" class="xh-scope-carousel" data-part="item" data-orientation="${orientation}" style="flex-basis:100%">
            <article>Vue、React 与 Web Components 共享同一份行为契约</article>
          </div>
        </div>
      </div>
      <button data-scope="carousel" class="xh-scope-carousel" data-part="next-trigger" data-orientation="${orientation}" data-xh-action-control data-xh-action-profile="floating" data-xh-action-display="always" data-xh-action-size="${size}"></button>
      <button data-scope="carousel" class="xh-scope-carousel" data-part="autoplay-trigger" data-state="running" data-xh-action-control data-xh-action-profile="floating" data-xh-action-display="always" data-xh-action-size="${size}"></button>
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

describe('carousel 粗指针', () => {
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
