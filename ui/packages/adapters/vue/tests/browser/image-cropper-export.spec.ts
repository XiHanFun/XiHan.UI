// 图片裁切的出图：toCanvas 按所见出图，旋转、翻转与圆形外形都要落进像素里。
// 像素只有真实浏览器的 2d 上下文画得出来：jsdom 没有画布上下文，只能核调用，核不了结果。
import type { ImageCropperFlip } from '@xihan-ui/headless'
import type { App } from 'vue'
import type { ImageCropperRootSlotProps } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhImageCropperCropArea,
  XhImageCropperFlipTrigger,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

/** 200×100 的源图：左半纯红、右半纯蓝，翻没翻、转没转一看像素就知道。 */
function sourceImage(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 100
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgb(255, 0, 0)'
  ctx.fillRect(0, 0, 100, 100)
  ctx.fillStyle = 'rgb(0, 0, 255)'
  ctx.fillRect(100, 0, 100, 100)
  return canvas.toDataURL('image/png')
}

interface Mounted {
  slot: () => ImageCropperRootSlotProps
  image: HTMLImageElement
  flipTrigger: HTMLButtonElement
}

async function mount(props: Record<string, unknown>): Promise<Mounted> {
  let latest: ImageCropperRootSlotProps | null = null
  host = document.createElement('div')
  document.body.prepend(host)
  app = createApp({
    render: () => h(XhImageCropperRoot, { src: sourceImage(), style: { inlineSize: '200px' }, ...props }, {
      default: (slot: ImageCropperRootSlotProps) => {
        latest = slot
        return [
          h(XhImageCropperViewport, null, () => [h(XhImageCropperImage), h(XhImageCropperCropArea)]),
          h(XhImageCropperFlipTrigger, { axis: 'horizontal' }, () => '左右翻转'),
        ]
      },
    }),
  })
  app.mount(host)
  const image = host.querySelector<HTMLImageElement>(`[data-scope='image-cropper'][data-part='image']`)!
  await expect.poll(() => latest?.natural.width ?? 0).toBe(200)
  await nextTick()
  return {
    slot: () => latest!,
    image,
    flipTrigger: host.querySelector<HTMLButtonElement>(`[data-scope='image-cropper'][data-part='flip-trigger']`)!,
  }
}

/** 画布上某一点的 RGBA。 */
function pixel(canvas: HTMLCanvasElement, x: number, y: number): [number, number, number, number] {
  const data = canvas.getContext('2d')!.getImageData(x, y, 1, 1).data
  return [data[0]!, data[1]!, data[2]!, data[3]!]
}

const RED: [number, number, number, number] = [255, 0, 0, 255]
const BLUE: [number, number, number, number] = [0, 0, 255, 255]

describe('image-cropper 出图（真实浏览器）', () => {
  it('不转不翻：左红右蓝原样出图', async () => {
    const { slot } = await mount({ defaultValue: { x: 0, y: 0, width: 200, height: 100 } })
    const canvas = slot().toCanvas()!
    expect([canvas.width, canvas.height]).toEqual([200, 100])
    expect(pixel(canvas, 20, 50)).toEqual(RED)
    expect(pixel(canvas, 180, 50)).toEqual(BLUE)
  })

  it('左右翻转：点翻转钮之后出的图左蓝右红，与屏幕上看到的一致', async () => {
    const { slot, flipTrigger } = await mount({ defaultValue: { x: 0, y: 0, width: 200, height: 100 } })
    flipTrigger.click()
    await nextTick()
    expect(slot().flip).toEqual({ horizontal: true, vertical: false } satisfies ImageCropperFlip)
    const canvas = slot().toCanvas()!
    expect(pixel(canvas, 20, 50)).toEqual(BLUE)
    expect(pixel(canvas, 180, 50)).toEqual(RED)
  })

  it('旋转 90°：画布宽高互换，左边的红转到上面', async () => {
    const { slot } = await mount({ defaultValue: { x: 0, y: 0, width: 200, height: 100 }, defaultRotation: 90 })
    const canvas = slot().toCanvas()!
    expect([canvas.width, canvas.height]).toEqual([100, 200])
    expect(pixel(canvas, 50, 20)).toEqual(RED)
    expect(pixel(canvas, 50, 180)).toEqual(BLUE)
  })

  it('圆形：内切圆之外透明，圆心照常取到源图像素', async () => {
    const { slot } = await mount({ shape: 'round', aspectRatio: 1, defaultValue: { x: 0, y: 0, width: 100, height: 100 } })
    const canvas = slot().toCanvas()!
    expect([canvas.width, canvas.height]).toEqual([100, 100])
    expect(pixel(canvas, 2, 2)[3]).toBe(0)
    expect(pixel(canvas, 50, 50)).toEqual(RED)
  })

  it('翻转在屏幕上与出图一致：图片与裁切框同一份镜像变换', async () => {
    const { image, flipTrigger } = await mount({ defaultValue: { x: 0, y: 0, width: 200, height: 100 } })
    const before = image.getBoundingClientRect()
    flipTrigger.click()
    await nextTick()
    expect(getComputedStyle(image).transform).toBe('matrix(-1, 0, 0, 1, 0, 0)')
    // 镜像不挪位置：翻过来的图仍铺满同一块视口
    const after = image.getBoundingClientRect()
    expect(after.left).toBeCloseTo(before.left, 1)
    expect(after.width).toBeCloseTo(before.width, 1)
  })
})
