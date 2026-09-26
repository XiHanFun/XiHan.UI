// 轮播的手势松手：真指针拖动，松手后轨道由弹簧带着松手速度落到目标页。
// 钉住：拖过阈值翻页后先接着松手位置、逐帧收到整页位移再撤掉 data-animating；首页往外拖越拉越沉、
// 松手硬弹簧弹回；减弱动效下松手直接落定；落定途中再按下接着拖，轨道不跳。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhCarouselItem, XhCarouselList, XhCarouselRoot, XhCarouselViewport } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function frames(count = 3): Promise<void> {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function mount(): Promise<{ viewport: HTMLElement, list: HTMLElement }> {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 400px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhCarouselRoot, { slideCount: 4, allowPointerDrag: true }, () => [
      h(XhCarouselViewport, { style: 'block-size: 160px' }, () => [
        h(XhCarouselList, null, () => [0, 1, 2, 3].map(index => h(XhCarouselItem, { index }, () => `第 ${index + 1} 张`))),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await frames()
  return {
    viewport: host.querySelector<HTMLElement>('[data-part="viewport"]')!,
    list: host.querySelector<HTMLElement>('[data-part="list"]')!,
  }
}

/** 测试页的 iframe 被缩放进窗口，CDP 坐标与页面坐标差一个比例：先派一次移动量出这个比例。 */
async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 按下、分几步拖过 dx、松手；每步隔一帧，最后几步决定松手速度。 */
async function drag(el: HTMLElement, dx: number, steps = 6): Promise<void> {
  const scale = await mouseScale()
  const rect = el.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const at = (px: number) => ({ x: px / scale, y: y / scale })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(x) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(x) })
  for (let i = 1; i <= steps; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(x + (dx * i) / steps) })
  }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(x + dx) })
}

/** 轨道 transform 里叠加的像素位移；没有时为 0。 */
function pixelOffset(list: HTMLElement): number {
  const match = /([+-]) ([\d.]+)px/.exec(list.style.transform)
  return match ? Number(match[2]) * (match[1] === '-' ? -1 : 1) : 0
}

describe('轮播手势松手', () => {
  it('拖过阈值翻到下一页：松手后接着松手位置由弹簧逐帧收到整页位移，落定撤掉 data-animating', async () => {
    const { list } = await mount()
    await drag(list, -120)
    await frames(1)
    expect(list.hasAttribute('data-animating')).toBe(true)
    expect(list.style.transform).toContain('-100%')
    // 松手时轨道在 -120px 处，换算到下一页（-400px）还差 +280px 左右，弹簧从这里起收
    const first = pixelOffset(list)
    expect(first).toBeGreaterThan(150)
    await frames(3)
    expect(pixelOffset(list)).toBeLessThan(first)
    await expect.poll(() => list.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(list.style.transform).toBe('translateX(-100%)')
  })

  it('首页往上一页拖：越拉越沉，松手硬弹簧弹回原页', async () => {
    const { list } = await mount()
    await drag(list, 200)
    await frames(1)
    const pulled = pixelOffset(list)
    expect(pulled).toBeGreaterThan(0)
    // 橡皮筋上限 60px：拖了 200px，轨道只出来不到 60px
    expect(pulled).toBeLessThan(60)
    expect(list.style.transform).toMatch(/^translateX\(calc\(0% \+/)
    await expect.poll(() => list.style.transform, { timeout: 2000 }).toBe('translateX(0%)')
    expect(list.hasAttribute('data-animating')).toBe(false)
  })

  it('减弱动效：松手直接落定，不经弹簧', async () => {
    const { list } = await mount()
    host!.dataset.motion = 'reduce'
    await drag(list, -120)
    await frames(1)
    expect(list.hasAttribute('data-animating')).toBe(false)
    expect(list.style.transform).toBe('translateX(-100%)')
  })

  it('落定途中再按下：从弹簧此刻的位置接着拖，轨道不跳', async () => {
    const { list } = await mount()
    await drag(list, -120)
    await frames(2)
    const before = list.getBoundingClientRect().left
    const scale = await mouseScale()
    const rect = list.parentElement!.getBoundingClientRect()
    const at = { x: (rect.left + rect.width / 2) / scale, y: (rect.top + rect.height / 2) / scale }
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at })
    await frames(1)
    expect(list.hasAttribute('data-animating')).toBe(false)
    expect(list.hasAttribute('data-dragging')).toBe(true)
    // 按下的那一帧里弹簧只走了一小步：轨道位置与按下前差不到一帧的位移
    expect(Math.abs(list.getBoundingClientRect().left - before)).toBeLessThan(40)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at })
    await expect.poll(() => list.style.transform, { timeout: 2000 }).toBe('translateX(-100%)')
  })
})
