// 粗指针下的分页命中区在 carousel-coarse-target.spec.ts：要开触屏仿真，不能和这里的细指针断言同页
import { afterEach, describe, expect, it } from 'vitest'
import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
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

  it.each([
    ['sm', 24, 12],
    ['md', 24, 16],
    ['lg', 28, 20],
  ] as const)('%s 档：翻页与播放钮 %ipx 圆钮、字形 %ipx（sm 不低于 24px 的最小目标，只收字形）', (size, box, glyph) => {
    const carousel = mount('horizontal', false, size)
    for (const trigger of [carousel.prev, carousel.next, carousel.autoplay]) {
      const rect = trigger.getBoundingClientRect()
      expect([rect.width, rect.height]).toEqual([box, box])
      expect(getComputedStyle(trigger, '::before').width).toBe(`${glyph}px`)
    }
  })

  it.each(['sm', 'md', 'lg'] as const)('紧凑档 %s：翻页与播放钮的视觉盒仍不低于细指针最小目标（floating 档在细指针下不外扩命中区）', (size) => {
    const carousel = mount('horizontal', false, size)
    host!.dataset.density = 'compact'
    const target = tokenLength('--xh-control-target-min', carousel.root)
    for (const trigger of [carousel.prev, carousel.next, carousel.autoplay]) {
      const rect = trigger.getBoundingClientRect()
      expect(rect.width).toBeGreaterThanOrEqual(target)
      expect(rect.height).toBeGreaterThanOrEqual(target)
    }
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
    // 回到起点：行尾那一侧整条裁掉
    expect(paused.clipPath).toMatch(/^inset\(0px 100% 0px 0(?:px|%) round /)
  })

  it('进度条自己带圆角、由 clip-path 裁出，点的盒子不裁切：rtl 从右往左长，纵轨从上往下长', () => {
    const carousel = mount('horizontal', true)
    expect(getComputedStyle(carousel.current).overflow).toBe('visible')
    const running = getComputedStyle(carousel.current, '::before')
    expect(running.borderRadius).toBe(getComputedStyle(carousel.current).borderRadius)
    expect(running.scale).toBe('none')

    carousel.root.removeAttribute('data-autoplay')
    carousel.root.setAttribute('data-paused', '')
    carousel.root.setAttribute('dir', 'rtl')
    expect(getComputedStyle(carousel.current, '::before').clipPath).toMatch(/^inset\(0px 0(?:px|%) 0px 100% round /)

    host!.remove()
    const vertical = mount('vertical', true)
    vertical.root.removeAttribute('data-autoplay')
    vertical.root.setAttribute('data-paused', '')
    expect(getComputedStyle(vertical.current, '::before').clipPath).toMatch(/^inset\(0px 0px 100%(?: 0px)? round /)
  })

  it.each([
    ['horizontal', false],
    ['vertical', false],
    ['horizontal', true],
    ['vertical', true],
  ] as const)('%s（自动播放 %s）细指针下点外 24px 命中区里的落点命中那颗点，每颗点的中心命中它自己', (orientation, autoplay) => {
    const carousel = mount(orientation, autoplay)
    expect(matchMedia('(pointer: fine)').matches).toBe(true)
    const target = tokenLength('--xh-control-target-min', carousel.root)
    for (const indicator of carousel.indicators.querySelectorAll<HTMLElement>('[data-part="indicator"]')) {
      const rect = indicator.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      expect(document.elementFromPoint(x, y)).toBe(indicator)
      // 垂直于轨道离中心 10px：落在 6px 点之外、24px 命中区之内，命中要算到这颗点上
      const reach = target / 2 - 2
      const [px, py] = orientation === 'horizontal' ? [x, y + reach] : [x + reach, y]
      expect(document.elementFromPoint(px, py)).toBe(indicator)
    }
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
})
