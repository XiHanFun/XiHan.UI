// 看片换图：转过、放大过的旧图不当着用户转回、缩回——换下标那一刻变换直接复位、旧图随即让位给占位面；
// 新图取到之后淡入。过渡有没有起、不透明度与变换的计算值只有真实浏览器给得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhImageViewerContent,
  XhImageViewerImage,
  XhImageViewerNextTrigger,
  XhImageViewerRoot,
  XhImageViewerRotateRightTrigger,
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

function svg(fill: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${fill}"/></svg>`)}`
}

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))

async function mount(): Promise<HTMLImageElement> {
  await page.viewport(900, 700)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhImageViewerRoot, { collection: [{ src: svg('#58a'), alt: '一' }, { src: svg('#a85'), alt: '二' }], defaultOpen: true }, () => [
      h(XhImageViewerContent, () => [
        h(XhImageViewerViewport, () => h(XhImageViewerImage)),
        h(XhImageViewerToolbar, () => [h(XhImageViewerZoomInTrigger), h(XhImageViewerRotateRightTrigger), h(XhImageViewerNextTrigger)]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  const image = document.querySelector<HTMLImageElement>('[data-scope="image-viewer"][data-part="image"]')!
  await expect.poll(() => !image.hasAttribute('data-loading'), { timeout: 2000 }).toBe(true)
  return image
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='image-viewer'][data-part='${name}']`)!
}

/** 图身上正在播的某一支过渡。 */
function transitions(image: HTMLElement, property: string): Animation[] {
  return image.getAnimations().filter(a => (a as CSSTransition).transitionProperty === property)
}

describe('image-viewer 换图', () => {
  it('换下标那一刻变换直接复位、不补间，旧图随即让位给占位面；新图取到之后淡入', async () => {
    const image = await mount()
    part('zoom-in-trigger').click()
    part('rotate-right-trigger').click()
    await expect.poll(() => transitions(image, 'rotate').length + transitions(image, 'scale').length).toBe(0)
    expect(getComputedStyle(image).rotate).toBe('90deg')

    part('next-trigger').click()
    await nextTick()
    // 取图期间：变换当场归位，不起旋转、缩放、平移的过渡；旧图不露面，视口垫着占位面
    if (image.hasAttribute('data-loading')) {
      expect(transitions(image, 'rotate')).toHaveLength(0)
      expect(transitions(image, 'scale')).toHaveLength(0)
      expect(getComputedStyle(image).opacity).toBe('0')
      expect(getComputedStyle(part('viewport'), '::after').content).not.toBe('none')
    }
    expect(getComputedStyle(image).rotate).not.toBe('90deg')

    // 取到之后淡入
    await expect.poll(() => image.hasAttribute('data-loading'), { timeout: 2000 }).toBe(false)
    expect(transitions(image, 'opacity').length + (getComputedStyle(image).opacity === '1' ? 1 : 0)).toBeGreaterThan(0)
    await frame()
    await expect.poll(() => getComputedStyle(image).opacity).toBe('1')
  })

  it('取图期间图不透明度为 0、不挂变换过渡；取到之后不透明度走进场档淡入', async () => {
    const image = await mount()
    const probe = document.createElement('span')
    probe.style.transition = 'opacity var(--xh-motion-duration-enter) var(--xh-motion-ease-enter)'
    host!.append(probe)
    const expected = getComputedStyle(probe)
    const style = getComputedStyle(image)
    const list = style.transitionProperty.split(', ')
    const at = list.indexOf('opacity')
    expect(at).toBeGreaterThanOrEqual(0)
    expect(style.transitionDuration.split(', ')[at]).toBe(expected.transitionDuration)
    // 曲线里自带逗号：只按括号外的逗号切
    expect(style.transitionTimingFunction.split(/,\s*(?![^(]*\))/)[at]).toBe(expected.transitionTimingFunction)

    image.setAttribute('data-loading', '')
    expect(getComputedStyle(image).opacity).toBe('0')
    expect(getComputedStyle(image).transitionProperty).toBe('none')
  })
})
