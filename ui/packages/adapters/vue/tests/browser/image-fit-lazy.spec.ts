// 图片的铺法与懒加载：object-fit 的计算值、懒加载的图在视口外不去取、滚到附近才取，只有真实浏览器量得出来。
// 懒加载那一支守的是一个真实的坑：收起（display: none）的图片浏览器永远不会去取，等着取图时不能收。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhImageFallback, XhImageImage, XhImageRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  window.scrollTo(0, 0)
})

/** 一张横幅的 SVG 图：data URL 一样走浏览器的懒加载，又不依赖网络。 */
function landscape(fill: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="${fill}"/></svg>`)}`
}

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))

function mount(render: () => ReturnType<typeof h>): HTMLElement {
  host = document.createElement('div')
  document.body.prepend(host)
  app = createApp({ render })
  app.mount(host)
  return host
}

function images(root: HTMLElement): HTMLImageElement[] {
  return [...root.querySelectorAll<HTMLImageElement>('[data-scope="image"][data-part="image"]:not([data-xh-ghost])')]
}

describe('图片铺法', () => {
  it('写了 fit 就按它铺、压过 --xh-image-fit；没写时照旧取那个变量，再没有就是 cover', async () => {
    const box = 'inline-size: 120px; --xh-image-ratio: 1;'
    const root = mount(() => h('div', [
      h(XhImageRoot, { src: landscape('#58a'), alt: '缺省', style: box }, () => h(XhImageImage)),
      h(XhImageRoot, { src: landscape('#58a'), alt: '变量', style: `${box} --xh-image-fit: fill;` }, () => h(XhImageImage)),
      h(XhImageRoot, { src: landscape('#58a'), alt: '写了', fit: 'contain', style: `${box} --xh-image-fit: fill;` }, () => h(XhImageImage)),
      h(XhImageRoot, { src: landscape('#58a'), alt: '不缩放', fit: 'none', style: box }, () => h(XhImageImage)),
      h(XhImageRoot, { src: landscape('#58a'), alt: '只缩不放', fit: 'scale-down', style: box }, () => h(XhImageImage)),
    ]))
    await nextTick()
    const [plain, slot, prop, none, scaleDown] = images(root)
    expect(plain!.hasAttribute('data-fit')).toBe(false)
    expect(getComputedStyle(plain!).objectFit).toBe('cover')
    expect(getComputedStyle(slot!).objectFit).toBe('fill')
    expect(prop!.getAttribute('data-fit')).toBe('contain')
    expect(getComputedStyle(prop!).objectFit).toBe('contain')
    expect(getComputedStyle(none!).objectFit).toBe('none')
    expect(getComputedStyle(scaleDown!).objectFit).toBe('scale-down')
  })
})

describe('图片懒加载', () => {
  it('视口外的懒加载图不去取：图片不收起、叠在图位上保持透明，占位与回退照常顶着', async () => {
    await page.viewport(800, 600)
    const root = mount(() => h('div', [
      h('div', { style: 'block-size: 6000px' }),
      h(XhImageRoot, { src: landscape('#a85'), alt: '远处', lazy: true, style: 'inline-size: 200px; --xh-image-ratio: 2;' }, () => [
        h(XhImageImage),
        h(XhImageFallback, null, () => '加载中'),
      ]),
    ]))
    await nextTick()
    const [image] = images(root)
    for (let i = 0; i < 10; i++)
      await frame()
    expect(image!.getAttribute('loading')).toBe('lazy')
    expect(image!.getAttribute('data-state')).toBe('loading')
    // 真去取过的话 data URL 一帧之内就到了
    expect(image!.naturalWidth).toBe(0)
    expect(image!.hidden).toBe(false)
    const style = getComputedStyle(image!)
    expect(style.display).not.toBe('none')
    expect(style.position).toBe('absolute')
    expect(style.opacity).toBe('0')
    // 回退内容照常占着图位，盒子不塌
    const fallback = root.querySelector<HTMLElement>('[data-scope="image"][data-part="fallback"]')!
    expect(fallback.hidden).toBe(false)
    expect(root.querySelector<HTMLElement>('[data-scope="image"][data-part="root"]')!.getBoundingClientRect().height).toBe(100)
  })

  it('滚到附近才取：载好后回到文档流、淡入显出', async () => {
    await page.viewport(800, 600)
    const root = mount(() => h('div', [
      h('div', { style: 'block-size: 6000px' }),
      h(XhImageRoot, { src: landscape('#5a8'), alt: '远处', lazy: true, style: 'inline-size: 200px; --xh-image-ratio: 2;' }, () => [
        h(XhImageImage),
        h(XhImageFallback, null, () => '加载中'),
      ]),
    ]))
    await nextTick()
    const [image] = images(root)
    for (let i = 0; i < 5; i++)
      await frame()
    expect(image!.naturalWidth).toBe(0)

    image!.closest('[data-part="root"]')!.scrollIntoView()
    await expect.poll(() => image!.getAttribute('data-state'), { timeout: 3000 }).toBe('loaded')
    expect(image!.naturalWidth).toBe(400)
    const style = getComputedStyle(image!)
    expect(style.position).toBe('static')
    // 等着取图时没播进场，载好那一刻才起跑
    expect(image!.getAnimations().map(a => (a as CSSAnimation).animationName)).toContain('xh-fade-in')
    for (const animation of image!.getAnimations())
      animation.finish()
    expect(getComputedStyle(image!).opacity).toBe('1')
  })

  it('视口里的懒加载图照常取到', async () => {
    await page.viewport(800, 600)
    const root = mount(() => h(XhImageRoot, { src: landscape('#85a'), alt: '眼前', lazy: true, style: 'inline-size: 200px;' }, () => h(XhImageImage)))
    await nextTick()
    const [image] = images(root)
    await expect.poll(() => image!.getAttribute('data-state'), { timeout: 3000 }).toBe('loaded')
    expect(image!.hidden).toBe(false)
  })

  it('懒加载的图取不到：照样收起，回退内容顶上', async () => {
    const root = mount(() => h(XhImageRoot, { src: 'data:image/png;base64,broken', alt: '坏图', lazy: true, style: 'inline-size: 200px;' }, () => [
      h(XhImageImage),
      h(XhImageFallback, null, () => '图挂了'),
    ]))
    await nextTick()
    const [image] = images(root)
    await expect.poll(() => image!.getAttribute('data-state'), { timeout: 3000 }).toBe('error')
    expect(getComputedStyle(image!).display).toBe('none')
  })
})
