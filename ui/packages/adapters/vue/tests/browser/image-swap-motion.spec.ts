// 换图的交叉淡变：头像与图片换了 src、新图还在载入时，旧图的替身原样盖在原处；新图载好那一刻替身淡出、播完即移除。
// 替身的去留与在播的动画只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot, XhImageFallback, XhImageImage, XhImageRoot } from '../../src'
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

/** 一张纯色的 SVG 图：data URL 载得快，又是真正走一遍载入的图片。 */
function swatch(color: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="${color}"/></svg>`)}`
}

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

describe.each(['avatar', 'image'] as const)('%s 换图', (scope) => {
  it('换了 src：旧图的替身盖在原处、不重播进场；新图载好那一刻替身淡出，播完即移除', async () => {
    host = document.createElement('div')
    host.style.setProperty('--xh-motion-duration-exit', '10s')
    document.body.append(host)
    const src = ref(swatch('red'))
    app = createApp({
      render: () => scope === 'avatar'
        ? h(XhAvatarRoot, { src: src.value, alt: '头像' }, () => [h(XhAvatarImage), h(XhAvatarFallback, null, () => 'AB')])
        : h(XhImageRoot, { src: src.value, alt: '图片', style: 'inline-size: 64px; block-size: 64px' }, () => [h(XhImageImage), h(XhImageFallback, null, () => '失败')]),
    })
    app.mount(host)
    const image = (): HTMLElement => host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='image']:not([data-xh-ghost])`)!
    await expect.poll(() => image().getAttribute('data-state')).toBe('loaded')
    await frames()
    src.value = swatch('blue')
    await expect.poll(() => host!.querySelector(`[data-scope='${scope}'][data-part='image'][data-xh-ghost]`) !== null).toBe(true)
    const ghost = host!.querySelector<HTMLImageElement>(`[data-scope='${scope}'][data-part='image'][data-xh-ghost]`)!
    expect(ghost.getAttribute('src')).toBe(swatch('red'))
    expect(ghost.getAttribute('aria-hidden')).toBe('true')
    expect(ghost.id).toBe('')
    await expect.poll(() => image().getAttribute('data-state')).toBe('loaded')
    await expect.poll(() => ghost.getAttribute('data-state')).toBe('closed')
    expect(ghost.getAnimations().map(a => (a as CSSAnimation).animationName)).toEqual(['xh-fade-out'])
    for (const animation of ghost.getAnimations())
      animation.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })
})
