// 头像载入：回退内容与图片交叉淡变，中间不露一拍底色；载入中回退内容等过 fallbackDelay 才露面，
// 期间载好就直接出图、不闪首字母。动画在不在播只有真实浏览器看得见。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 一像素透明 PNG：随时载得好
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
  return host!.querySelector<HTMLElement>(`[data-scope='avatar'][data-part='${name}']`)!
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

describe('avatar 载入交叉淡变', () => {
  it('图片载好：回退内容浮在图片之上淡出、图片淡入，同时进行；淡出播完才藏起', async () => {
    document.documentElement.style.setProperty('--xh-motion-duration-enter', '400ms')
    const src = ref<string | undefined>(undefined)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhAvatarRoot, { src: src.value, fallbackDelay: 0 }, () => [h(XhAvatarImage), h(XhAvatarFallback, null, () => '曦')]),
    })
    app.mount(host)
    await nextTick()
    await expect.poll(() => part('fallback').hidden).toBe(false)

    src.value = PIXEL
    await expect.poll(() => part('root').dataset.state).toBe('loaded')
    await nextTick()
    const fallback = part('fallback')
    const image = part('image')
    expect(fallback.hidden).toBe(false)
    expect(getComputedStyle(fallback).position).toBe('absolute')
    expect(running(fallback)).toEqual(['xh-fade-out'])
    expect(running(image)).toEqual(['xh-fade-in'])

    await Promise.all(fallback.getAnimations().map(a => a.finished.catch(() => undefined)))
    await nextTick()
    await nextTick()
    expect(fallback.hidden).toBe(true)
  })

  it('载入中回退内容等过 fallbackDelay 才露面：这段里载好就直接出图，回退内容一次都不露', async () => {
    host = document.createElement('div')
    document.body.append(host)
    const seen: Array<boolean | 'until-found'> = []
    app = createApp({
      render: () => h(XhAvatarRoot, { src: PIXEL }, () => [h(XhAvatarImage), h(XhAvatarFallback, null, () => '曦')]),
    })
    app.mount(host)
    const observer = new MutationObserver(() => seen.push(part('fallback').hidden))
    await nextTick()
    observer.observe(part('fallback'), { attributes: true, attributeFilter: ['hidden'] })
    seen.push(part('fallback').hidden)
    await expect.poll(() => part('root').dataset.state).toBe('loaded')
    await new Promise(resolve => setTimeout(resolve, 50))
    observer.disconnect()
    expect(seen.every(hidden => hidden === true)).toBe(true)
  })
})
