// 液态面的其余消费者：MessageFeed / Log 回到底部、Carousel 控制钮与分页条、ImageViewer 控制层、Layout 吸顶顶栏。
// 钉住：liquid 档下各部件挂进液态面（写墨色域、换液态面的背景滤镜），standard 档下保持原材质；
// 顶栏只在吸顶时算导航层；四种下层（黑、白、品牌 500、黄）上截屏量前景对比度：文字 ≥ 4.5:1、图标 ≥ 3:1。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
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
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLogContent,
  XhLogLine,
  XhLogRoot,
  XhLogScrollToEndTrigger,
  XhLogViewport,
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
let under: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  under?.remove()
  under = null
  document.documentElement.removeAttribute('data-material')
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

/** 铺一层全视口的纯色下层，再挂组件；material 为 null 时不写材质轴（standard 缺省）。 */
async function mount(render: () => VNode, background: string, material: 'liquid' | null = 'liquid'): Promise<void> {
  if (material)
    document.documentElement.setAttribute('data-material', material)
  under = document.createElement('div')
  under.style.cssText = `position: fixed; inset: 0; background: ${background}`
  document.body.append(under)
  host = document.createElement('div')
  host.style.cssText = 'position: relative'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await frames()
}

const part = (scope: string, name: string): HTMLElement =>
  document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!

// ── 各组件的最小装配 ──

const lines = Array.from({ length: 40 }, (_, i) => `第 ${i + 1} 行`)

/** 视口定高、内容超出，挂上后滚回顶部：离开底部，回到底部按钮才露面。 */
async function scrollAwayFromBottom(scope: string): Promise<HTMLElement> {
  const viewport = part(scope, 'viewport')
  await expect.poll(() => viewport.scrollHeight > viewport.clientHeight).toBe(true)
  viewport.scrollTop = 0
  viewport.dispatchEvent(new Event('scroll'))
  const trigger = part(scope, 'scroll-to-end-trigger')
  await expect.poll(() => trigger.hidden).toBe(false)
  if (document.documentElement.getAttribute('data-material') === 'liquid')
    await judged(trigger)
  else await frames(4)
  return trigger
}

const messageFeed = (): VNode => h(XhMessageFeedRoot, { count: lines.length, style: 'block-size: 240px; inline-size: 360px' }, () => [
  h(XhMessageFeedViewport, { style: 'background: transparent' }, () => h(XhMessageFeedList, () =>
    lines.map((text, index) => h(XhMessageFeedItem, { itemId: `m${index}`, itemIndex: index }, () => text)))),
  h(XhMessageFeedScrollToEndTrigger),
])

const log = (): VNode => h(XhLogRoot, { style: 'block-size: 240px; inline-size: 360px' }, () => [
  h(XhLogViewport, () => h(XhLogContent, () => lines.map(text => h(XhLogLine, () => text)))),
  h(XhLogScrollToEndTrigger),
])

const carousel = (): VNode => h(XhCarouselRoot, { slideCount: 3, style: 'inline-size: 480px' }, () => [
  h(XhCarouselViewport, { style: 'block-size: 200px' }, () =>
    h(XhCarouselList, () => [0, 1, 2].map(index => h(XhCarouselItem, { index }, () => '')))),
  h(XhCarouselPrevTrigger),
  h(XhCarouselNextTrigger),
  h(XhCarouselIndicatorGroup, () => [0, 1, 2].map(index => h(XhCarouselIndicator, { index }))),
])

// 纯色图。与视口同比例（900 × 700）时 contain 之后铺满取景区，工具条与计数压在图上；
// 缺省用一张小图，控制层压在下层上
const image = (fill: string, width = 40, height = 30): string =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${fill}"/></svg>`)}`

/** variant 为 transparent 时遮罩不画底，下层直接透出来（背景被模态设为 inert，命中不到）。 */
function imageViewer(src = image('transparent'), variant?: 'transparent'): () => VNode {
  const collection = [{ src, alt: '样图' }, { src, alt: '样图' }]
  return () => h(XhImageViewerRoot, { collection, defaultOpen: true, defaultIndex: 1, variant }, () => [
    h(XhImageViewerContent, () => [
      h(XhImageViewerViewport, () => h(XhImageViewerImage)),
      h(XhImageViewerToolbar, () => h(XhImageViewerZoomInTrigger)),
      h(XhImageViewerPrevTrigger),
      h(XhImageViewerNextTrigger),
      h(XhImageViewerCounter),
      h(XhImageViewerCloseTrigger),
    ]),
  ])
}

const layout = (fixed: boolean) => (): VNode => h(XhLayoutRoot, { headerFixed: fixed, style: 'background: transparent' }, () => [
  h(XhLayoutHeader, () => h('span', { 'data-testid': 'title' }, '控制台')),
  h(XhLayoutContent, () => h('div', { style: 'block-size: 1200px' })),
])

// ── 像素取样 ──

interface Shot { data: Uint8ClampedArray, width: number, height: number }

async function shoot(element: HTMLElement): Promise<Shot> {
  const base64 = await page.screenshot({ element, save: false })
  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob()
  const bitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext('2d')!
  context.drawImage(bitmap, 0, 0)
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height)
  return { data, width: bitmap.width, height: bitmap.height }
}

/** 计算后的颜色（任意写法）→ 相对亮度：借画布转成 sRGB。 */
function cssLuminance(color: string): number {
  const context = new OffscreenCanvas(1, 1).getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return luminance(context.getImageData(0, 0, 1, 1).data, 0)
}

function channel(value: number): number {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(data: Uint8ClampedArray, i: number): number {
  return 0.2126 * channel(data[i]) + 0.7152 * channel(data[i + 1]) + 0.0722 * channel(data[i + 2])
}

/**
 * 前景与面的对比度，按 WCAG 的口径：前景取指定的颜色（元素计算后的 color，字形与 currentColor 图标都是它），
 * 面取截图中间一块里出现最多的那个像素值——下层透上来之后真正合成出来的样子；纯色下层上面是平的，
 * 字形抗锯齿的灰像素各不相同，占不了多数（用中位数会被小字拉偏）。
 * inset 是四边各裁掉的比例，避开描边、亮边与投影。不用字形像素：细字抗锯齿，最深的像素也到不了指定色
 */
function contrast(shot: Shot, inset: number, fg: HTMLElement): number {
  const x0 = Math.floor(shot.width * inset)
  const x1 = Math.ceil(shot.width * (1 - inset))
  const y0 = Math.floor(shot.height * inset)
  const y1 = Math.ceil(shot.height * (1 - inset))
  const counts = new Map<number, number>()
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * shot.width + x) * 4
      // 三个通道拼成一个键
      const key = (shot.data[i] << 16) | (shot.data[i + 1] << 8) | shot.data[i + 2]
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  const [mode] = [...counts].reduce((best, entry) => (entry[1] > best[1] ? entry : best))
  const surface = luminance(new Uint8ClampedArray([mode >> 16, (mode >> 8) & 255, mode & 255]), 0)
  const ink = cssLuminance(getComputedStyle(fg).color)
  return (Math.max(surface, ink) + 0.05) / (Math.min(surface, ink) + 0.05)
}

const UNDERLAYS: Array<[string, string]> = [
  ['黑', 'oklch(0 0 0)'],
  ['白', 'oklch(1 0 0)'],
  ['品牌 500', 'var(--xh-color-brand-500)'],
  ['黄', 'oklch(0.9 0.18 100)'],
]

/** 液态面不嵌液态面：页面上每个带 data-xh-liquid 的节点，祖先里都没有另一个。 */
function expectNoNestedLiquid(): void {
  for (const el of document.querySelectorAll('[data-xh-liquid]'))
    expect(el.parentElement?.closest('[data-xh-liquid]') ?? null, el.getAttribute('data-part') ?? '').toBe(null)
}

/**
 * 液态面判定过下层（写了墨色域）且画面落定：换色调有一段淡变，看图的内容层还有进场淡入，
 * 截在半路上面的颜色就不是终值。等文档里所有有限时长的动画与过渡播完
 */
async function judged(el: HTMLElement): Promise<void> {
  await expect.poll(() => el.hasAttribute('data-xh-ink'), { timeout: 2000 }).toBe(true)
  await frames(2)
  await Promise.all(document.getAnimations()
    .filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
    .map(animation => animation.finished.catch(() => {})))
  await frames(2)
}

describe('接入液态面', () => {
  it('MessageFeed / Log 的回到底部：liquid 档挂进液态面，standard 档保持磨砂', async () => {
    for (const [scope, render] of [['message-feed', messageFeed], ['log', log]] as const) {
      await mount(render, 'oklch(0.96 0.02 100)')
      const trigger = await scrollAwayFromBottom(scope)
      expect(trigger.hasAttribute('data-xh-liquid')).toBe(true)
      await judged(trigger)
      expect(getComputedStyle(trigger).backdropFilter).toMatch(/blur\(8px\)|url\(/)
      app!.unmount()
      host!.remove()
      under!.remove()
      document.documentElement.removeAttribute('data-material')

      await mount(render, 'oklch(0.96 0.02 100)', null)
      const standard = await scrollAwayFromBottom(scope)
      expect(standard.hasAttribute('data-xh-ink')).toBe(false)
      expect(getComputedStyle(standard).backdropFilter).toContain('blur(16px)')
      app!.unmount()
      host!.remove()
      under!.remove()
    }
    app = null
    host = null
    under = null
  })

  it('Carousel：翻页钮与分页条挂进液态面，分页条成为液态胶囊', async () => {
    await mount(carousel, 'oklch(0.3 0.1 258)')
    const prev = part('carousel', 'prev-trigger')
    const group = part('carousel', 'indicator-group')
    await judged(group)
    expect(prev.getAttribute('data-xh-ink')).toBe('light')
    expect(group.getAttribute('data-xh-ink')).toBe('light')
    const style = getComputedStyle(group)
    expect(style.backdropFilter).toMatch(/blur\(8px\)|url\(/)
    expect(Number.parseFloat(style.paddingTop)).toBeGreaterThan(0)
    // 胶囊：圆角不小于半高
    expect(Number.parseFloat(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(group.offsetHeight / 2)
    expectNoNestedLiquid()
  })

  it('Carousel：standard 档的分页条没有面', async () => {
    await mount(carousel, 'oklch(0.3 0.1 258)', null)
    const style = getComputedStyle(part('carousel', 'indicator-group'))
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.paddingTop).toBe('0px')
  })

  it('ImageViewer：工具条、计数与三颗钮挂进液态面，前景跟着墨色域走', async () => {
    // 透明遮罩：页面浅色，控制层判成浅色调、黑墨
    await mount(imageViewer(undefined, 'transparent'), 'oklch(0.96 0.02 100)')
    const toolbar = part('image-viewer', 'toolbar')
    await judged(toolbar)
    for (const name of ['toolbar', 'counter', 'prev-trigger', 'next-trigger', 'close-trigger']) {
      const el = part('image-viewer', name)
      expect(el.hasAttribute('data-xh-liquid'), name).toBe(true)
      expect(el.getAttribute('data-xh-ink'), name).toBe('dark')
      expect(getComputedStyle(el).backdropFilter, name).toMatch(/blur\(8px\)|url\(/)
    }
    // 浅下层上是黑墨：前景不再钉在浅字上
    const { color } = getComputedStyle(part('image-viewer', 'counter'))
    const [r, g, b] = color.match(/[\d.]+/g)!.map(Number)
    expect(r + g + b).toBeLessThan(200)
    expect(Number.parseFloat(getComputedStyle(toolbar).borderTopLeftRadius)).toBeGreaterThanOrEqual(toolbar.offsetHeight / 2)
    const close = part('image-viewer', 'close-trigger')
    expect(Number.parseFloat(getComputedStyle(close).borderTopLeftRadius)).toBeGreaterThanOrEqual(close.offsetHeight / 2)
    expectNoNestedLiquid()
  })

  it('ImageViewer：缺省遮罩读成深色下层；透明遮罩下背景被模态压住，只猜色调、不换通透档', async () => {
    await mount(imageViewer(), 'oklch(0.96 0.02 100)')
    const toolbar = part('image-viewer', 'toolbar')
    await judged(toolbar)
    expect(toolbar.getAttribute('data-xh-ink')).toBe('light')
    app!.unmount()
    host!.remove()
    under!.remove()

    await mount(imageViewer(undefined, 'transparent'), 'oklch(0.96 0.02 100)')
    const counter = part('image-viewer', 'counter')
    await judged(counter)
    expect(counter.hasAttribute('data-xh-liquid-clarity')).toBe(false)
  })

  it('ImageViewer：standard 档仍是那层深色纱', async () => {
    await mount(imageViewer(), 'oklch(0.96 0.02 100)', null)
    const toolbar = part('image-viewer', 'toolbar')
    expect(toolbar.hasAttribute('data-xh-ink')).toBe(false)
    expect(getComputedStyle(toolbar).backdropFilter).toBe('none')
  })

  it('Layout：吸顶的顶栏挂进液态面，不吸顶的顶栏保持原样', async () => {
    await mount(layout(true), 'oklch(0.3 0.1 258)')
    const header = part('layout', 'header')
    expect(header.hasAttribute('data-xh-liquid')).toBe(true)
    await judged(header)
    expect(getComputedStyle(header).backdropFilter).toMatch(/blur\(8px\)|url\(/)
    expectNoNestedLiquid()
    app!.unmount()
    host!.remove()
    under!.remove()

    await mount(layout(false), 'oklch(0.3 0.1 258)')
    const plain = part('layout', 'header')
    expect(plain.hasAttribute('data-xh-liquid')).toBe(false)
    await frames(4)
    expect(plain.hasAttribute('data-xh-ink')).toBe(false)
    expect(getComputedStyle(plain).backdropFilter).toBe('none')
  })
})

describe('四种下层上的前景对比度', () => {
  for (const [name, background] of UNDERLAYS) {
    it(`${name}：图标 ≥ 3:1，文字 ≥ 4.5:1`, async () => {
      await page.viewport(900, 700)
      const results: Array<[string, number, number]> = []

      await mount(messageFeed, background)
      const feedTrigger = await scrollAwayFromBottom('message-feed')
      results.push(['message-feed 回到底部', contrast(await shoot(feedTrigger), 0.25, feedTrigger), 3])
      app!.unmount()
      host!.remove()
      under!.remove()

      await mount(log, background)
      const logTrigger = await scrollAwayFromBottom('log')
      results.push(['log 回到底部', contrast(await shoot(logTrigger), 0.25, logTrigger), 3])
      app!.unmount()
      host!.remove()
      under!.remove()

      await mount(carousel, background)
      // 首页的「上一张」是禁用的，量「下一张」
      const next = part('carousel', 'next-trigger')
      await judged(next)
      results.push(['carousel 翻页钮', contrast(await shoot(next), 0.25, next), 3])
      app!.unmount()
      host!.remove()
      under!.remove()

      // 遮罩透明、背景被模态压住：判定只能按根的配色方案猜，记为杂乱，取可读下限
      await mount(imageViewer(undefined, 'transparent'), background)
      const counter = part('image-viewer', 'counter')
      await judged(counter)
      const close = part('image-viewer', 'close-trigger')
      const zoom = part('image-viewer', 'zoom-in-trigger')
      results.push(['image-viewer 计数', contrast(await shoot(counter), 0.2, counter), 4.5])
      results.push(['image-viewer 关闭', contrast(await shoot(close), 0.25, close), 3])
      results.push(['image-viewer 工具条的钮', contrast(await shoot(zoom), 0.15, zoom), 3])
      app!.unmount()
      host!.remove()
      under!.remove()

      await mount(layout(true), background)
      await judged(part('layout', 'header'))
      const title = document.querySelector<HTMLElement>('[data-testid="title"]')!
      results.push(['layout 顶栏标题', contrast(await shoot(title), 0.1, title), 4.5])

      for (const [label, ratio, floor] of results)
        expect(ratio, `${label}：${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(floor)
    })
  }

  it('放大到图盖住计数：缺省遮罩上是深色声明的通透档，压到没声明的亮图上即退回可读下限，仍 ≥ 4.5:1', async () => {
    await page.viewport(900, 700)
    await mount(imageViewer(image('#fff3b0', 400, 300)), 'oklch(0.15 0 0)')
    const img = part('image-viewer', 'image') as HTMLImageElement
    await expect.poll(() => img.complete && img.naturalWidth > 0, { timeout: 2000 }).toBe(true)
    const counter = part('image-viewer', 'counter')
    await judged(counter)
    // 图按 85% 留边，计数落在遮罩上：定位层声明身后是深色遮罩
    expect(counter.getAttribute('data-xh-ink')).toBe('light')
    expect(counter.getAttribute('data-xh-liquid-clarity')).toBe('clear')

    const zoom = part('image-viewer', 'zoom-in-trigger')
    for (let i = 0; i < 4; i++)
      zoom.click()
    // 缩放落定后重读，不必等滚动
    await expect.poll(() => {
      const box = img.getBoundingClientRect()
      const own = counter.getBoundingClientRect()
      return own.top >= box.top && own.left >= box.left && own.right <= box.right
    }, { timeout: 2000 }).toBe(true)
    await expect.poll(() => counter.hasAttribute('data-xh-liquid-clarity'), { timeout: 2000 }).toBe(false)
    await judged(counter)
    expect(contrast(await shoot(counter), 0.2, counter)).toBeGreaterThanOrEqual(4.5)
  })
})
