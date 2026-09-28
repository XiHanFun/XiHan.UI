// 轮播的淡入淡出切换：条目叠放在同一格里，翻页时新一张淡入、旧一张淡出，轨道不位移。
// 只有真实浏览器量得出叠放的几何、过渡途中的透明度与减弱动效下的直接换。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCarouselItem, XhCarouselList, XhCarouselNextTrigger, XhCarouselRoot, XhCarouselViewport } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.style.removeProperty('--xh-motion-duration-slide')
})

async function mount(props: Record<string, unknown>, motion?: 'reduce'): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '400px'
  if (motion)
    host.dataset.motion = motion
  document.body.append(host)
  app = createApp({
    render: () => h(XhCarouselRoot, { slideCount: 3, effect: 'fade', ...props }, () => [
      h(XhCarouselViewport, { style: 'block-size: 120px' }, () => h(XhCarouselList, null, () => [0, 1, 2].map(index =>
        h(XhCarouselItem, { index, key: index }, () => `第 ${index + 1} 张`),
      ))),
      h(XhCarouselNextTrigger),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='carousel'][data-part='${name}']`)!
}

function item(index: number): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='carousel'][data-part='item'][data-index='${index}']`)!
}

function opacity(el: HTMLElement): number {
  return Number(getComputedStyle(el).opacity)
}

function frames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number): void => {
      if (left <= 0)
        resolve()
      else
        requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

describe('carousel 淡入淡出切换', () => {
  it('条目叠放在视口里同一格，只露当前那一张，首帧不播淡入', async () => {
    await mount({})
    const viewport = part('viewport').getBoundingClientRect()
    for (const index of [0, 1, 2]) {
      const rect = item(index).getBoundingClientRect()
      expect([rect.left, rect.top, rect.width, rect.height]).toEqual([viewport.left, viewport.top, viewport.width, viewport.height])
    }
    expect(getComputedStyle(part('list')).translate).toBe('none')
    expect(opacity(item(0))).toBe(1)
    expect([opacity(item(1)), opacity(item(2))]).toEqual([0, 0])
    expect(getComputedStyle(item(1)).visibility).toBe('hidden')
    expect(item(0).getAnimations()).toHaveLength(0)
  })

  it('翻页时新一张盖在上面淡入、旧一张同时淡出，轨道不位移；落定后旧一张藏起', async () => {
    document.documentElement.style.setProperty('--xh-motion-duration-slide', '400ms')
    await mount({})
    // 先让翻页前的样子落成一帧：过渡要有起点
    expect([opacity(item(0)), opacity(item(1))]).toEqual([1, 0])
    part('next-trigger').click()
    await nextTick()
    await frames(6)

    const incoming = opacity(item(1))
    const outgoing = opacity(item(0))
    expect(incoming).toBeGreaterThan(0)
    expect(incoming).toBeLessThan(1)
    expect(outgoing).toBeGreaterThan(0)
    expect(outgoing).toBeLessThan(1)
    // 淡出途中旧一张仍看得见，新一张压在它上面
    expect(getComputedStyle(item(0)).visibility).toBe('visible')
    expect(Number(getComputedStyle(item(1)).zIndex)).toBeGreaterThan(Number(getComputedStyle(item(0)).zIndex) || 0)
    expect(getComputedStyle(part('list')).translate).toBe('none')

    await Promise.all(item(0).getAnimations().map(animation => animation.finished))
    expect([opacity(item(0)), opacity(item(1))]).toEqual([0, 1])
    expect(getComputedStyle(item(0)).visibility).toBe('hidden')
  })

  it('loop 下从末页翻回首页同样只是淡变，不走回绕的虚拟页', async () => {
    document.documentElement.style.setProperty('--xh-motion-duration-slide', '400ms')
    await mount({ loop: true, defaultPage: 2 })
    expect([opacity(item(2)), opacity(item(0))]).toEqual([1, 0])
    part('next-trigger').click()
    await nextTick()
    await frames(6)
    expect(getComputedStyle(item(0)).translate).toBe('none')
    expect(getComputedStyle(part('list')).translate).toBe('none')
    expect(opacity(item(0))).toBeGreaterThan(0)
    expect(opacity(item(0))).toBeLessThan(1)
  })

  it('减弱动效下直接换张，不留淡变', async () => {
    await mount({}, 'reduce')
    expect([opacity(item(0)), opacity(item(1))]).toEqual([1, 0])
    part('next-trigger').click()
    await nextTick()
    await frames(3)
    expect([opacity(item(0)), opacity(item(1))]).toEqual([0, 1])
    expect(getComputedStyle(item(0)).visibility).toBe('hidden')
  })
})
