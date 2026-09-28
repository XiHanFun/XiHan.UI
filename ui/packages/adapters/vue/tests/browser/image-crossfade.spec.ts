// 图片载入：占位层（模糊小图、骨架）盖在图位之上原地淡出，图片在它底下直接落位，
// 两者交叉，不先透出一拍底色；没有占位层时图片自己淡入。动画在不在播只有真实浏览器看得见。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhImageImage, XhImagePlaceholder, XhImageRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.style.removeProperty('--xh-motion-duration-enter')
})

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='image'][data-part='${name}']`)!
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

async function mount(withPlaceholder: boolean): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '200px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhImageRoot, { src: PIXEL, alt: '示意', style: '--xh-image-ratio: 16 / 9' }, () => [
      h(XhImageImage),
      ...(withPlaceholder ? [h(XhImagePlaceholder, null, () => '载入中')] : []),
    ]),
  })
  app.mount(host)
  await nextTick()
  await expect.poll(() => part('root').dataset.state).toBe('loaded')
  await nextTick()
}

describe('image 载入交叉淡变', () => {
  it('有占位层：占位层原地淡出、图片在底下直接落位，淡出播完才藏起', async () => {
    document.documentElement.style.setProperty('--xh-motion-duration-enter', '400ms')
    await mount(true)
    const placeholder = part('placeholder')
    expect(placeholder.hidden).toBe(false)
    expect(running(placeholder)).toEqual(['xh-fade-out'])
    expect(running(part('image'))).toEqual([])
    expect(getComputedStyle(part('image')).opacity).toBe('1')
    await Promise.all(placeholder.getAnimations().map(a => a.finished.catch(() => undefined)))
    await nextTick()
    await nextTick()
    expect(placeholder.hidden).toBe(true)
  })

  it('没有占位层：图片自己淡入', async () => {
    document.documentElement.style.setProperty('--xh-motion-duration-enter', '400ms')
    await mount(false)
    expect(running(part('image'))).toEqual(['xh-fade-in'])
  })
})
