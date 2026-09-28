// 轮播回绕与自动播放进度：只有真实浏览器量得出过渡的走向与过渡结束的时机。
// ① loop 下从末页往后翻：轨道向前多走一张（首屏条目平移到末尾之后），不倒着刷过全部页；过渡播完无动画地归位。
// ② 自动播放按住时进度条回到起点、恢复从头走：计时器每次恢复都重计一整个间隔，进度条跟它同一口径。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCarouselIndicator, XhCarouselIndicatorGroup, XhCarouselItem, XhCarouselList, XhCarouselNextTrigger, XhCarouselRoot, XhCarouselViewport } from '../../src'
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

async function mount(props: Record<string, unknown>): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '400px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhCarouselRoot, { slideCount: 3, ...props }, () => [
      h(XhCarouselViewport, { style: 'block-size: 120px' }, () => h(XhCarouselList, null, () => [0, 1, 2].map(index =>
        h(XhCarouselItem, { index, key: index }, () => `第 ${index + 1} 张`),
      ))),
      h(XhCarouselNextTrigger),
      h(XhCarouselIndicatorGroup, null, () => [0, 1, 2].map(index => h(XhCarouselIndicator, { index, key: index }))),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='carousel'][data-part='${name}']`)!
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

describe('carousel 无缝回绕', () => {
  it('末页往后翻：轨道继续向前走，过渡结束后无动画地归位到首页', async () => {
    document.documentElement.style.setProperty('--xh-motion-duration-slide', '400ms')
    await mount({ loop: true, defaultPage: 2 })
    // 轨道位移按百分比写，计算值保留百分比：末页是 -200%
    const before = Number.parseFloat(getComputedStyle(part('list')).translate)
    expect(before).toBe(-200)

    part('next-trigger').click()
    await nextTick()
    await frames(6)
    // 过渡途中：比末页更往前（更负），而不是往 0 倒卷
    const mid = Number.parseFloat(getComputedStyle(part('list')).translate)
    expect(mid).toBeLessThan(before)
    // 首张条目平移到末尾之后接住画面
    const first = host!.querySelector<HTMLElement>(`[data-scope='carousel'][data-part='item'][data-index='0']`)!
    expect(getComputedStyle(first).translate).toBe('300%')

    await new Promise<void>(resolve => part('list').addEventListener('transitionend', () => resolve(), { once: true }))
    await nextTick()
    await nextTick()
    expect(part('list').hasAttribute('data-snapped')).toBe(true)
    expect(Number.parseFloat(getComputedStyle(part('list')).translate)).toBe(0)
    expect(getComputedStyle(first).translate).toBe('none')
  })
})

describe('carousel 自动播放进度', () => {
  it('按住时进度条回到起点、不再计时；松开后从头走', async () => {
    await mount({ autoplay: 3000 })
    const root = part('root')
    const indicator = host!.querySelector<HTMLElement>(`[data-scope='carousel'][data-part='indicator'][data-current]`)!
    expect(getComputedStyle(indicator, '::before').animationName).toBe('xh-carousel-indicator-progress')
    root.dispatchEvent(new PointerEvent('pointerenter'))
    await nextTick()
    await nextTick()
    expect(root.hasAttribute('data-paused')).toBe(true)
    // 按住：进度条不再走、回到起点
    expect(getComputedStyle(indicator, '::before').animationName).toBe('none')
    root.dispatchEvent(new PointerEvent('pointerleave'))
    await nextTick()
    await nextTick()
    // 松开：从头走一整个间隔
    const [animation] = indicator.getAnimations({ subtree: true })
    expect(animation).toBeDefined()
    expect(Number(animation!.currentTime ?? 0)).toBeLessThan(100)
  })
})
