// 库自有彩色面：实心语气面与 Tooltip 反白面打 data-xh-ink-surface，面内的内容按这块面的底色成为墨色域；
// ImageViewer 看片层两种主题下都是深底，整层是白墨域。
//
// 钉住四件事：面内的中性描边与淡底取这块面的墨色（深底白墨、浅底黑墨，禁用换成中性面后跟着换）；
// 面自己的底色与箭头不受域改写（域落在面内，不落在面上，否则底色与墨色互相引用成环）；
// 非彩色档不成域；减少透明照样打到面内的内容上。判据取计算样式，颜色经画布转成 sRGB 分量。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhButton,
  XhImageViewerContent,
  XhImageViewerImage,
  XhImageViewerRoot,
  XhImageViewerToolbar,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
  XhTagLabel,
  XhTagRoot,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
})

/** 任意 CSS 颜色 → sRGB 0–1 分量与透明度。 */
function rgba(color: string): [number, number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const d = context.getImageData(0, 0, 1, 1).data
  return [d[0]! / 255, d[1]! / 255, d[2]! / 255, d[3]! / 255]
}

/** 面内的探针：一块用中性描边与淡底画的小方块，代表作者塞进彩色面里的快捷键、分隔这类装饰。 */
const probe = (): VNode => h('span', {
  'data-probe': '',
  'style': 'display: inline-block; inline-size: 8px; block-size: 8px; border: 1px solid var(--xh-border-default); background: var(--xh-bg-subtle)',
})

async function mount(render: () => VNode, attrs: Record<string, string> = {}): Promise<void> {
  host = document.createElement('div')
  for (const [name, value] of Object.entries(attrs))
    host.setAttribute(name, value)
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function probeBorder(): [number, number, number, number] {
  return rgba(getComputedStyle(document.querySelector('[data-probe]')!).borderTopColor)
}

/** 墨色：三个分量都落在同一端（白 1、黑 0），且是透明的比例色。 */
function expectInk(color: [number, number, number, number], ink: 0 | 1): void {
  for (const channel of color.slice(0, 3))
    expect(channel).toBeCloseTo(ink, 1)
  expect(color[3]).toBeGreaterThan(0.05)
  expect(color[3]).toBeLessThan(0.3)
}

describe('实心语气面', () => {
  it('品牌实心钮里的描边取白墨，钮自己的底色仍是品牌色', async () => {
    await mount(() => h('div', [
      h(XhButton, null, () => ['保存', probe()]),
      h('span', { 'data-reference': '', 'style': 'background: var(--xh-bg-brand)' }),
    ]))
    const button = document.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')!
    expect(button.hasAttribute('data-xh-ink-surface')).toBe(true)
    expectInk(probeBorder(), 1)
    const reference = document.querySelector<HTMLElement>('[data-reference]')!
    expect(getComputedStyle(button).backgroundColor).toBe(getComputedStyle(reference).backgroundColor)
  })

  it('浅色语气（warning 实心）里取黑墨', async () => {
    await mount(() => h(XhButton, { tone: 'warning' }, () => ['提醒', probe()]))
    expectInk(probeBorder(), 0)
  })

  it('禁用后底换成中性面，墨色跟着换成黑墨', async () => {
    await mount(() => h(XhButton, { disabled: true }, () => ['保存', probe()]))
    expectInk(probeBorder(), 0)
  })

  it('非实心档不成域，描边仍是不透明的中性色', async () => {
    await mount(() => h(XhButton, { variant: 'subtle' }, () => ['取消', probe()]))
    const button = document.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')!
    expect(button.hasAttribute('data-xh-ink-surface')).toBe(false)
    expect(probeBorder()[3]).toBe(1)
  })

  it('实心标签里的描边取白墨', async () => {
    await mount(() => h(XhTagRoot, { variant: 'solid' }, () => [h(XhTagLabel, null, () => ['新', probe()])]))
    expectInk(probeBorder(), 1)
  })

  it('减少透明照样打到面内：面内的磨砂材质取实体底', async () => {
    await mount(() => h(XhButton, null, () => ['保存', h('span', {
      'data-frosted': '',
      'style': 'display: inline-block; inline-size: 8px; block-size: 8px; background: var(--xh-material-frosted-bg)',
    })]), { 'data-transparency': 'reduce' })
    const frosted = document.querySelector<HTMLElement>('[data-frosted]')!
    expect(rgba(getComputedStyle(frosted).backgroundColor)[3]).toBe(1)
  })
})

describe('tooltip 反白面', () => {
  async function mountTooltip(theme: 'light' | 'dark'): Promise<void> {
    await mount(() => h(XhTooltipRoot, { open: true }, () => [
      h(XhTooltipTrigger, null, () => '目标'),
      h(XhTooltipPositioner, null, () => [
        h(XhTooltipContent, null, () => ['快捷键 ', probe(), h(XhTooltipArrow)]),
      ]),
    ]), { 'data-theme': theme })
  }

  it('浅色主题下是深底，面内取白墨；箭头的底色仍与面同色', async () => {
    await mountTooltip('light')
    const content = document.querySelector<HTMLElement>('[data-scope="tooltip"][data-part="content"]')!
    expect(content.hasAttribute('data-xh-ink-surface')).toBe(true)
    expectInk(probeBorder(), 1)
    const arrow = document.querySelector<HTMLElement>('[data-scope="tooltip"][data-part="arrow"]')!
    const surface = rgba(getComputedStyle(content, '::before').backgroundColor)
    expect(rgba(getComputedStyle(arrow).backgroundColor)).toEqual(surface)
    // 面是深底：底色的分量都在暗端
    expect(Math.max(...surface.slice(0, 3))).toBeLessThan(0.3)
  })

  it('深色主题下是浅底，面内取黑墨', async () => {
    await mountTooltip('dark')
    expectInk(probeBorder(), 0)
  })
})

describe('imageViewer 看片层', () => {
  it('整层是白墨域：焦点环取白墨', async () => {
    const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    await mount(() => h(XhImageViewerRoot, { collection: [{ src: PIXEL, alt: '一张' }], defaultOpen: true }, () => [
      h(XhImageViewerContent, () => [
        h(XhImageViewerViewport, () => h(XhImageViewerImage)),
        h(XhImageViewerToolbar, () => [h(XhImageViewerZoomInTrigger)]),
      ]),
    ]), { 'data-theme': 'light' })
    const content = document.querySelector<HTMLElement>('[data-scope="image-viewer"][data-part="content"]')!
    expect(content.getAttribute('data-xh-ink')).toBe('light')
    const trigger = document.querySelector<HTMLElement>('[data-scope="image-viewer"][data-part="zoom-in-trigger"]')!
    expect(rgba(getComputedStyle(trigger).getPropertyValue('--xh-ring-focus'))).toEqual([1, 1, 1, 1])
    // 这一层自己的字色取原语，不受域改写
    expect(rgba(getComputedStyle(content).color)).toEqual([1, 1, 1, 1])
  })
})
