import type { TourStep } from '@xihan-ui/headless'
// 引导的目标晚到：进入该步时目标还没挂上，气泡不露面；目标挂上来即定位到它旁边、高亮框罩住它；
// 等满时长仍没有，该步改在视口中居中。几何与可见性只有真实 Chromium 量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTourContent, XhTourPositioner, XhTourRoot, XhTourSpotlight, XhTourTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

function mountTour(step: TourStep, targetTimeout?: number): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhTourRoot, { open: true, steps: [step], targetTimeout }, {
      default: () => [
        h(XhTourSpotlight),
        h(XhTourPositioner, null, () => [h(XhTourContent, null, () => [h(XhTourTitle)])]),
      ],
    }),
  })
  app.mount(host)
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='${name}']`)!
}

async function frames(count = 3): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
  }
}

function insertTarget(): HTMLElement {
  const target = document.createElement('button')
  target.id = 'tour-late-target'
  target.textContent = '晚到的目标'
  target.style.cssText = 'position: fixed; left: 40px; top: 60px; inline-size: 120px; block-size: 32px'
  document.body.append(target)
  return target
}

describe('tour 目标晚到', () => {
  it('缺席时气泡不露面；目标挂上来即定位、高亮框罩住它', async () => {
    mountTour({ id: 'a', target: '#tour-late-target', title: '晚到' })
    await frames()
    expect(part('positioner').hasAttribute('data-positioned')).toBe(false)
    expect(getComputedStyle(part('positioner')).visibility).toBe('hidden')

    const target = insertTarget()
    await frames(4)
    expect(part('positioner').hasAttribute('data-positioned')).toBe(true)
    // 高亮框自带进场动画（缩放），量几何前等它播完
    await Promise.all(part('spotlight').getAnimations().map(animation => animation.finished))
    const rect = target.getBoundingClientRect()
    const spot = part('spotlight').getBoundingClientRect()
    expect(spot.left).toBeLessThanOrEqual(rect.left)
    expect(spot.right).toBeGreaterThanOrEqual(rect.right)
    expect(spot.top).toBeLessThanOrEqual(rect.top)
    expect(spot.bottom).toBeGreaterThanOrEqual(rect.bottom)
  })

  it('函数写法：每次节点变动后现调', async () => {
    let el: HTMLElement | null = null
    mountTour({ id: 'a', target: () => el, title: '晚到' })
    await frames()
    el = insertTarget()
    await frames(4)
    expect(part('positioner').hasAttribute('data-positioned')).toBe(true)
  })

  it('等满时长仍没有：该步在视口中居中呈现', async () => {
    mountTour({ id: 'a', target: '#tour-never', title: '等不到' }, 50)
    await new Promise(resolve => setTimeout(resolve, 80))
    await frames()
    const positioner = part('positioner')
    expect(positioner.dataset.position).toBe('center')
    expect(getComputedStyle(positioner).visibility).not.toBe('hidden')
    expect(part('spotlight').hasAttribute('hidden')).toBe(true)
    const box = part('content').getBoundingClientRect()
    const cx = box.left + box.width / 2
    expect(Math.abs(cx - window.innerWidth / 2)).toBeLessThanOrEqual(2)
  })
})
