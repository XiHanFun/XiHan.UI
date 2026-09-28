// ImageViewer 的占位态与禁用：取图时画面正中一枚加载环；取图失败画面正中一枚警示字形、不露浏览器的破图；
// 到头的翻页钮禁用时前景换成禁用色，不靠压低整颗钮的不透明度。
// 判据是伪元素与计算样式，jsdom 不给这些。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhImageViewerContent,
  XhImageViewerImage,
  XhImageViewerNextTrigger,
  XhImageViewerPrevTrigger,
  XhImageViewerRoot,
  XhImageViewerViewport,
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

function svg(fill: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${fill}"/></svg>`)}`
}

/** 一张载不出来的图：不是合法的 PNG。 */
const BROKEN = 'data:image/png;base64,AAAA'

async function mount(src: string): Promise<void> {
  await page.viewport(900, 700)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhImageViewerRoot, { collection: [{ src, alt: '一' }, { src: svg('#a85'), alt: '二' }], defaultOpen: true, loop: false }, () => [
      h(XhImageViewerContent, () => [
        h(XhImageViewerViewport, () => h(XhImageViewerImage)),
        h(XhImageViewerPrevTrigger),
        h(XhImageViewerNextTrigger),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='image-viewer'][data-part='${name}']`)!
}

function resolved(on: HTMLElement, property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  on.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe('image-viewer 的占位态', () => {
  it('取图时画面正中一枚加载环', async () => {
    await mount(svg('#58a'))
    const viewport = part('viewport')
    expect(viewport.hasAttribute('data-xh-loading-ring')).toBe(true)
    // 取图相位由图片自己回送，快图一闪即过；这一档皮肤只认属性，直接摆上去
    viewport.setAttribute('data-loading', '')
    const ring = getComputedStyle(viewport, '::before')
    expect(ring.animationName).toBe('xh-spin')
    expect(ring.animationPlayState).toBe('running')
    expect(ring.borderRadius).toBe('50%')
    await expect.poll(() => getComputedStyle(viewport, '::before').opacity).toBe('1')
  })

  it('取图失败：画面正中一枚警示字形，破图不露出来', async () => {
    await mount(BROKEN)
    const viewport = part('viewport')
    await expect.poll(() => viewport.hasAttribute('data-error'), { timeout: 2000 }).toBe(true)
    const image = part('image')
    expect(image.hasAttribute('data-error')).toBe(true)
    expect(getComputedStyle(image).visibility).toBe('hidden')
    const glyph = getComputedStyle(viewport, '::after')
    expect(glyph.maskImage).not.toBe('none')
    expect(glyph.backgroundColor).toBe(resolved(viewport, 'color', 'var(--xh-fg-danger)'))
    // 环在失败那一刻收起
    expect(viewport.hasAttribute('data-loading')).toBe(false)
  })
})

describe('image-viewer 的禁用', () => {
  it('到头的翻页钮换禁用前景，不压低不透明度', async () => {
    await mount(svg('#58a'))
    const prev = part('prev-trigger') as HTMLButtonElement
    const next = part('next-trigger') as HTMLButtonElement
    expect(prev.disabled).toBe(true)
    expect(next.disabled).toBe(false)
    await expect.poll(() => getComputedStyle(prev).opacity).toBe('1')
    await expect.poll(() => getComputedStyle(prev).color).toBe(resolved(prev, 'color', 'var(--xh-fg-disabled)'))
    expect(getComputedStyle(prev).color).not.toBe(getComputedStyle(next).color)
  })
})
