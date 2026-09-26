// 看片的手势松手：真指针拖动，平移限定在范围内，松手后由弹簧惯性滑行或回弹。
// 钉住：图比视口小时只能拖出一小截、松手硬弹簧弹回居中；放大后快甩松手顺着速度继续滑、一路减速、停在范围内；
// 拖出范围越拉越沉、松手收回边界；减弱动效下松手直接收回，不经弹簧。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhImageViewerContent,
  XhImageViewerImage,
  XhImageViewerRoot,
  XhImageViewerToolbar,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
} from '../../src'
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

// 400 × 300 的纯色图，取图立刻完成
const IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#58a"/></svg>')}`

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

async function mount(): Promise<HTMLImageElement> {
  await page.viewport(900, 700)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhImageViewerRoot, { collection: [{ src: IMAGE, alt: '样图' }], defaultOpen: true }, () => [
      h(XhImageViewerContent, () => [
        h(XhImageViewerViewport, () => h(XhImageViewerImage)),
        // 放大钮照皮肤给的组合装进工具条：散放的话会压在图中央，按下落在钮上
        h(XhImageViewerToolbar, () => h(XhImageViewerZoomInTrigger)),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  const image = document.querySelector<HTMLImageElement>('[data-scope="image-viewer"][data-part="image"]')!
  await expect.poll(() => image.complete && image.naturalWidth > 0, { timeout: 2000 }).toBe(true)
  await frames(4)
  return image
}

/** 图的平移量（transform 里的 translate）。 */
function offset(image: HTMLImageElement): { x: number, y: number } {
  const match = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(image.style.transform)
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: Number.NaN, y: Number.NaN }
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 从图中心按下、分几步拖过 dx、松手；每步隔一帧，最后几步决定松手速度。 */
async function drag(image: HTMLImageElement, dx: number, steps = 6): Promise<void> {
  const scale = await mouseScale()
  const rect = image.getBoundingClientRect()
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

async function zoomTo3(): Promise<void> {
  const zoomIn = document.querySelector<HTMLButtonElement>('[data-scope="image-viewer"][data-part="zoom-in-trigger"]')!
  for (let i = 0; i < 20 && !/scaleX\(3\)/.test(document.querySelector<HTMLElement>('[data-part="image"]')!.style.transform); i++) {
    zoomIn.click()
    await nextTick()
  }
  // 等缩放的过渡走完，量到的尺寸才是放大后的
  await frames(20)
}

describe('看片手势松手', () => {
  it('图比视口小：只能拖出一小截，松手硬弹簧弹回居中', async () => {
    const image = await mount()
    await drag(image, 200)
    await frames(1)
    const pulled = offset(image).x
    expect(pulled).toBeGreaterThan(0)
    // 橡皮筋上限 80px：拖了 200px，图只出来不到 80px
    expect(pulled).toBeLessThan(80)
    expect(image.hasAttribute('data-animating')).toBe(true)
    await expect.poll(() => offset(image).x, { timeout: 2000 }).toBe(0)
    await expect.poll(() => image.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
  })

  it('放大后快甩：松手顺着速度继续滑、一路减速，停在范围内', async () => {
    const image = await mount()
    await zoomTo3()
    await drag(image, -60, 3)
    await frames(1)
    const released = offset(image).x
    expect(image.hasAttribute('data-animating')).toBe(true)
    await frames(3)
    const gliding = offset(image).x
    // 松手之后还在朝拖的方向走
    expect(gliding).toBeLessThan(released)
    await expect.poll(() => image.hasAttribute('data-animating'), { timeout: 4000 }).toBe(false)
    const rest = offset(image).x
    expect(rest).toBeLessThan(gliding)
    // 放大 3 倍的图是 1200 × 900，视口宽 900：左右各能平移 150px
    const limit = (image.offsetWidth * 3 - image.parentElement!.clientWidth) / 2
    expect(rest).toBeGreaterThanOrEqual(-limit - 0.5)
  })

  it('拖出范围越拉越沉，松手收回边界', async () => {
    const image = await mount()
    await zoomTo3()
    const limit = (image.offsetWidth * 3 - image.parentElement!.clientWidth) / 2
    await drag(image, limit + 300, 10)
    await frames(1)
    const pulled = offset(image).x
    expect(pulled).toBeGreaterThan(limit)
    expect(pulled).toBeLessThan(limit + 80)
    await expect.poll(() => image.hasAttribute('data-animating'), { timeout: 3000 }).toBe(false)
    expect(Math.abs(offset(image).x - limit)).toBeLessThan(0.6)
  })

  it('减弱动效：松手直接收回，不经弹簧', async () => {
    const image = await mount()
    host!.dataset.motion = 'reduce'
    document.querySelector<HTMLElement>('[data-scope="image-viewer"][data-part="content"]')!.dataset.motion = 'reduce'
    await drag(image, 200)
    await frames(1)
    expect(image.hasAttribute('data-animating')).toBe(false)
    expect(offset(image).x).toBe(0)
  })
})
