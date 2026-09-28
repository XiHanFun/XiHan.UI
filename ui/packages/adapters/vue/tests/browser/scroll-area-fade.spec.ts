// 滚动区的边缘渐隐：滚到头时那一侧的遮罩带收起、离开端点时铺开。jsdom 不跑过渡，
// 要在真实浏览器里看带宽是沿过渡淡去，而不是到端那一帧瞬间消失。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhScrollAreaContent, XhScrollAreaRoot, XhScrollAreaViewport } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function viewport(): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='scroll-area'][data-part='viewport']`)!
}

/** 视口身上正在播的过渡属性。 */
function transitions(el: HTMLElement): string[] {
  return el.getAnimations()
    .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
    .map(animation => animation.transitionProperty)
}

describe('scroll-area 边缘渐隐', () => {
  it('滚到底：下缘的遮罩带沿过渡收起，不在到端那一帧消失；上缘的带子随之铺开', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhScrollAreaRoot, { variant: 'fade', style: 'block-size: 120px; inline-size: 200px' }, () =>
        h(XhScrollAreaViewport, null, () => h(XhScrollAreaContent, null, () =>
          Array.from({ length: 30 }, (_, i) => h('p', { style: 'margin: 0' }, `第 ${i + 1} 行`))))),
    })
    app.mount(host)
    await nextTick()
    const el = viewport()
    await expect.poll(() => el.hasAttribute('data-at-min-vertical')).toBe(true)
    await Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => undefined)))
    const full = Number.parseFloat(getComputedStyle(el).getPropertyValue('--xh-_scroll-area-fade-block-end'))
    expect(full).toBeGreaterThan(0)

    el.scrollTop = el.scrollHeight
    el.dispatchEvent(new Event('scroll'))
    await expect.poll(() => el.hasAttribute('data-at-max-vertical')).toBe(true)
    expect(transitions(el)).toEqual(expect.arrayContaining(['--xh-_scroll-area-fade-block-end', '--xh-_scroll-area-fade-block-start']))
    const mid = Number.parseFloat(getComputedStyle(el).getPropertyValue('--xh-_scroll-area-fade-block-end'))
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThanOrEqual(full)

    await Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => undefined)))
    expect(Number.parseFloat(getComputedStyle(el).getPropertyValue('--xh-_scroll-area-fade-block-end'))).toBe(0)
  })
})
