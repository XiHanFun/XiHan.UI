// @vitest-environment jsdom
// image-viewer 的看片行为：开合、翻页与回绕、缩放钳制、旋转翻转、换图归零、方向键。
// jsdom 不做布局，几何断言落在内联 transform 字符串上。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhImageViewerContent,
  XhImageViewerCounter,
  XhImageViewerImage,
  XhImageViewerNextTrigger,
  XhImageViewerPrevTrigger,
  XhImageViewerRoot,
  XhImageViewerTrigger,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
} from '../src'

interface ViewerHandle {
  open: boolean
  index: number
  count: number
  setOpen: (next: boolean) => void
  setIndex: (next: number) => void
  next: () => void
  prev: () => void
  zoomIn: () => void
  zoomOut: () => void
  rotateRight: () => void
  flipHorizontal: () => void
  reset: () => void
}

const ITEMS = [
  { src: 'data:image/svg+xml,a', alt: '第一张' },
  { src: 'data:image/svg+xml,b', alt: '第二张' },
  { src: 'data:image/svg+xml,c', alt: '第三张' },
]

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mountViewer(opts: { loop?: boolean, maxScale?: number, defaultIndex?: number } = {}): { handle: () => ViewerHandle } {
  let captured: ViewerHandle | null = null
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhImageViewerRoot, {
        collection: ITEMS,
        defaultOpen: true,
        defaultIndex: opts.defaultIndex,
        loop: opts.loop,
        maxScale: opts.maxScale,
      }, {
        default: (scope: ViewerHandle) => {
          captured = scope
          return [
            h(XhImageViewerTrigger, () => '看大图'),
            h(XhImageViewerContent, null, () => [
              h(XhImageViewerViewport, null, () => [h(XhImageViewerImage)]),
              h(XhImageViewerCounter),
              h(XhImageViewerPrevTrigger),
              h(XhImageViewerNextTrigger),
              h(XhImageViewerZoomInTrigger),
            ]),
          ]
        },
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return {
    handle: () => {
      if (!captured)
        throw new Error('插槽作用域未就绪')
      return captured
    },
  }
}

function imageEl(): HTMLImageElement {
  const el = document.querySelector<HTMLImageElement>('[data-scope="image-viewer"][data-part="image"]')
  if (!el)
    throw new Error('找不到 image')
  return el
}

function contentEl(): HTMLElement {
  const el = document.querySelector<HTMLElement>('[data-scope="image-viewer"][data-part="content"]')
  if (!el)
    throw new Error('找不到 content')
  return el
}

describe('image-viewer', () => {
  it('展开渲染当前图：src/alt 与对话框语义', async () => {
    mountViewer()
    await tick()
    expect(contentEl().getAttribute('role')).toBe('dialog')
    expect(contentEl().getAttribute('aria-modal')).toBe('true')
    expect(imageEl().getAttribute('src')).toBe(ITEMS[0]!.src)
    expect(contentEl().getAttribute('aria-label')).toBe('第一张')
  })

  it('翻页与回绕；计数跟着走', async () => {
    const t = mountViewer()
    await tick()
    t.handle().next()
    await tick()
    expect(t.handle().index).toBe(1)
    expect(imageEl().getAttribute('src')).toBe(ITEMS[1]!.src)
    expect(document.querySelector('[data-part="counter"]')?.textContent).toBe('2 / 3')

    t.handle().prev()
    t.handle().prev()
    await tick()
    // 回绕到最后一张
    expect(t.handle().index).toBe(2)
  })

  it('loop=false 时停在两端，prev 按钮禁用', async () => {
    const t = mountViewer({ loop: false })
    await tick()
    t.handle().prev()
    await tick()
    expect(t.handle().index).toBe(0)
    const prev = document.querySelector<HTMLButtonElement>('[data-part="prev-trigger"]')
    expect(prev?.disabled).toBe(true)
  })

  it('缩放钳制到上限，放大钮到顶即禁用', async () => {
    const t = mountViewer({ maxScale: 2 })
    await tick()
    t.handle().zoomIn()
    t.handle().zoomIn()
    t.handle().zoomIn()
    await tick()
    expect(imageEl().style.transform).toContain('scaleX(2)')
    const zoomIn = document.querySelector<HTMLButtonElement>('[data-part="zoom-in-trigger"]')
    expect(zoomIn?.disabled).toBe(true)
  })

  it('旋转与翻转叠进 transform，reset 归零', async () => {
    const t = mountViewer()
    await tick()
    t.handle().rotateRight()
    t.handle().zoomIn()
    t.handle().flipHorizontal()
    await tick()
    const style = imageEl().style.transform
    expect(style).toContain('rotate(90deg)')
    expect(style).toContain('scaleX(-1.5)')
    expect(style).toContain('scaleY(1.5)')

    t.handle().reset()
    await tick()
    expect(imageEl().style.transform).toContain('rotate(0deg)')
    expect(imageEl().style.transform).toContain('scaleX(1)')
  })

  it('换图把上一张的变换归零', async () => {
    const t = mountViewer()
    await tick()
    t.handle().zoomIn()
    await tick()
    expect(imageEl().style.transform).toContain('scaleX(1.5)')
    t.handle().next()
    await tick()
    expect(imageEl().style.transform).toContain('scaleX(1)')
  })

  it('方向键在浮层内翻页', async () => {
    const t = mountViewer()
    await tick()
    contentEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await tick()
    expect(t.handle().index).toBe(1)
    contentEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await tick()
    expect(t.handle().index).toBe(0)
  })

  it('滚轮向上放大', async () => {
    mountViewer()
    await tick()
    const viewport = document.querySelector<HTMLElement>('[data-part="viewport"]')!
    viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true }))
    await tick()
    expect(imageEl().style.transform).toContain('scaleX(1.5)')
  })

  it('setOpen 关闭：content 收起', async () => {
    const t = mountViewer()
    await tick()
    t.handle().setOpen(false)
    await tick()
    expect(t.handle().open).toBe(false)
  })
})
