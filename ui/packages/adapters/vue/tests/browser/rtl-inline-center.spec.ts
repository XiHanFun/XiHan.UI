// 行内轴居中与书写方向无关：逻辑起点 inset-inline-start: 50% 配物理平移 translate: -50%，
// rtl 下起点落在右半边、再往左挪半个盒，中心偏出包含块整整一个盒宽。
// 这一份在 ltr / rtl 两个方向上量每一处这样居中的盒：中心与它该对齐的那块盒同心（允许 1px 取整）。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  createNotificationService,
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerCounter,
  XhImageViewerImage,
  XhImageViewerNextTrigger,
  XhImageViewerPrevTrigger,
  XhImageViewerRoot,
  XhImageViewerToolbar,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
  XhRatingControl,
  XhRatingItem,
  XhRatingRoot,
  XhResizableHandle,
  XhResizableRoot,
  XhSliderControl,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTickGroup,
  XhSliderTrack,
  XhSliderValueText,
} from '../../src'
import { coarsePointer, finePointer, pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
let dispose: (() => void) | null = null

afterEach(async () => {
  dispose?.()
  app?.unmount()
  host?.remove()
  app = null
  host = null
  dispose = null
  document.documentElement.removeAttribute('dir')
  await finePointer()
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(dir: 'ltr' | 'rtl', render: () => VNode): Promise<void> {
  document.documentElement.dir = dir
  host = document.createElement('div')
  host.style.cssText = 'padding: 40px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await frames()
}

function part(scope: string, name: string, extra = ''): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]${extra}`)
  if (!el)
    throw new Error(`缺少 ${scope}/${name}${extra}`)
  return el
}

/** 一块盒的内边距盒在视口里的行内中心。 */
function paddingCenter(el: HTMLElement): number {
  return el.getBoundingClientRect().left + el.clientLeft + el.clientWidth / 2
}

/** 定位盒的包含块中心：fixed 取视口，其余取最近的定位祖先的内边距盒。 */
function containingCenter(el: HTMLElement): number {
  if (getComputedStyle(el).position === 'fixed')
    return document.documentElement.clientWidth / 2
  const parent = el.offsetParent
  if (!(parent instanceof HTMLElement))
    throw new Error(`${el.dataset.scope}/${el.dataset.part} 没有定位祖先`)
  return paddingCenter(parent)
}

function expectCenteredAt(center: number, expected: number, label: string): void {
  expect(Math.abs(center - expected), `${label}：中心 ${center.toFixed(1)}，应在 ${expected.toFixed(1)}`).toBeLessThanOrEqual(1)
}

function expectElementCentered(el: HTMLElement, label: string): void {
  const rect = el.getBoundingClientRect()
  expectCenteredAt(rect.left + rect.width / 2, containingCenter(el), label)
}

function expectPseudoCentered(el: HTMLElement, pseudo: '::before' | '::after', label: string): void {
  expectCenteredAt(pseudoBox(el, pseudo).centerX, paddingCenter(el), label)
}

function carousel(props: Record<string, unknown> = {}): VNode {
  return h(XhCarouselRoot, { slideCount: 3, style: 'inline-size: 480px', ...props }, () => [
    h(XhCarouselViewport, { style: 'block-size: 240px' }, () =>
      h(XhCarouselList, () => [0, 1, 2].map(index => h(XhCarouselItem, { index }, () => '')))),
    h(XhCarouselPrevTrigger),
    h(XhCarouselNextTrigger),
    h(XhCarouselIndicatorGroup, () => [0, 1, 2].map(index => h(XhCarouselIndicator, { index }))),
  ])
}

describe.each(['ltr', 'rtl'] as const)('行内轴居中（%s）', (dir) => {
  it('走马灯横轨的分页条在内容下沿居中', async () => {
    await mount(dir, () => carousel())
    expectElementCentered(part('carousel', 'indicator-group'), '分页条')
  })

  it('走马灯纵轨的翻页钮在行内轴上居中', async () => {
    await mount(dir, () => carousel({ orientation: 'vertical' }))
    expectElementCentered(part('carousel', 'prev-trigger'), '上一张')
    expectElementCentered(part('carousel', 'next-trigger'), '下一张')
  })

  it('粗指针下走马灯的分页点画在指示格正中，自动播放时进度条与点同位', async () => {
    await coarsePointer()
    await mount(dir, () => carousel({ autoplay: 60_000 }))
    expectPseudoCentered(part('carousel', 'indicator', ':not([data-current])'), '::after', '分页点')
    const current = part('carousel', 'indicator', '[data-current]')
    expectPseudoCentered(current, '::after', '当前点')
    expectPseudoCentered(current, '::before', '进度条')
  })

  it('图片预览的工具条与计数在画面上下沿居中', async () => {
    const src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"/>')}`
    await mount(dir, () => h(XhImageViewerRoot, { collection: [{ src, alt: '样图' }, { src, alt: '样图' }], defaultOpen: true }, () => [
      h(XhImageViewerContent, () => [
        h(XhImageViewerViewport, () => h(XhImageViewerImage)),
        h(XhImageViewerToolbar, () => h(XhImageViewerZoomInTrigger)),
        h(XhImageViewerPrevTrigger),
        h(XhImageViewerNextTrigger),
        h(XhImageViewerCounter),
        h(XhImageViewerCloseTrigger),
      ]),
    ]))
    expectElementCentered(part('image-viewer', 'toolbar'), '工具条')
    expectElementCentered(part('image-viewer', 'counter'), '计数')
  })

  it('评分的空项把星形画在格子正中', async () => {
    await mount(dir, () => h(XhRatingRoot, { defaultValue: 3 }, {
      default: ({ items }: { items: number[] }) => h(XhRatingControl, () => items.map(value => h(XhRatingItem, { value }))),
    }))
    for (const item of document.querySelectorAll<HTMLElement>('[data-scope="rating"][data-part="item"]'))
      expectPseudoCentered(item, '::after', `星形 ${item.getAttribute('aria-label')}`)
  })

  it('可调尺寸上下两条把手的指示条在把手正中', async () => {
    await mount(dir, () => h(XhResizableRoot, { style: 'inline-size: 240px; block-size: 160px' }, () => [
      h(XhResizableHandle, { edge: 'n' }),
      h(XhResizableHandle, { edge: 's' }),
    ]))
    expectPseudoCentered(part('resizable', 'handle', '[data-edge="n"]'), '::after', '上把手')
    expectPseudoCentered(part('resizable', 'handle', '[data-edge="s"]'), '::after', '下把手')
  })

  it('横排滑块的刻度点与文案以刻度所在的比例点为中心', async () => {
    const marks = [{ value: 0, label: '零' }, { value: 50, label: '一半' }, { value: 100, label: '满格' }]
    await mount(dir, () => h(XhSliderRoot, { marks, defaultValue: [50], style: 'inline-size: 300px' }, () =>
      h(XhSliderControl, () => [h(XhSliderTrack), h(XhSliderTickGroup), h(XhSliderThumb)])))
    const track = part('slider', 'track').getBoundingClientRect()
    const ticks = [...document.querySelectorAll<HTMLElement>('[data-scope="slider"][data-part="tick"]')]
    const labels = [...document.querySelectorAll<HTMLElement>('[data-scope="slider"][data-part="tick-label"]')]
    expect(ticks).toHaveLength(3)
    // 比例点沿行内方向：rtl 下 0 在右端
    const points = [0, 0.5, 1].map(ratio => dir === 'rtl' ? track.right - ratio * track.width : track.left + ratio * track.width)
    ticks.forEach((tick, i) => {
      const rect = tick.getBoundingClientRect()
      expectCenteredAt(rect.left + rect.width / 2, points[i]!, `刻度点 ${i}`)
    })
    // 两端文案可以贴边对齐，中间那一条必须居中在刻度上
    const middle = labels[1]!.getBoundingClientRect()
    expectCenteredAt(middle.left + middle.width / 2, points[1]!, '中间刻度文案')
  })

  it('滑块值气泡在拇指正上方居中', async () => {
    await mount(dir, () => h(XhSliderRoot, { defaultValue: [50], style: 'inline-size: 300px' }, () =>
      h(XhSliderControl, () => [h(XhSliderTrack), h(XhSliderThumb, () => h(XhSliderValueText))])))
    const thumb = part('slider', 'thumb').getBoundingClientRect()
    const bubble = part('slider', 'value-text').getBoundingClientRect()
    expectCenteredAt(bubble.left + bubble.width / 2, thumb.left + thumb.width / 2, '值气泡')
  })

  it('竖排滑块的刻度点落在轨道的中线上', async () => {
    const marks = [{ value: 0 }, { value: 50 }, { value: 100 }]
    await mount(dir, () => h(XhSliderRoot, { orientation: 'vertical', marks, defaultValue: [50], style: 'block-size: 200px' }, () =>
      h(XhSliderControl, () => [h(XhSliderTrack), h(XhSliderTickGroup), h(XhSliderThumb)])))
    const track = paddingCenter(part('slider', 'track'))
    for (const tick of document.querySelectorAll<HTMLElement>('[data-scope="slider"][data-part="tick"]')) {
      const rect = tick.getBoundingClientRect()
      expectCenteredAt(rect.left + rect.width / 2, track, '刻度点')
    }
  })

  it.each(['top', 'bottom'] as const)('轻提示预设在 %s 居中时整摞落在视口正中', async (placement) => {
    document.documentElement.dir = dir
    const toast = createNotificationService({ preset: 'toast', placement })
    dispose = () => toast.dispose()
    toast.info('已保存')
    await nextTick()
    await frames()
    expectElementCentered(part('notification', 'group'), '轻提示那一摞')
  })
})
