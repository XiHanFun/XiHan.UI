// @vitest-environment jsdom
//
// 图片在机器进入 loading 之前就已经解码完（浏览器缓存命中、注水前就加载好的那种）时，
// `load` 事件早就派过了，之后再挂处理器一辈子等不到——那张图会永远停在占位与回退位。
// 补报那一次由 image 部件提交后的效应负责。
//
// 共享一致性套件咬不到这条路：jsdom 不真去取图，`complete` 恒假、`naturalWidth` 恒零，
// 套件里的 load 全是手工派发的。这里把这三个只读属性按「已解码」的样子接管掉。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhImageFallback, XhImageImage, XhImagePlaceholder, XhImageRoot } from '../src'

const SRC = 'https://example.test/photo.png'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null
let restore: (() => void) | null = null

/** 让 jsdom 的 <img> 自称已解码完成。 */
function pretendDecoded(): () => void {
  const proto = HTMLImageElement.prototype
  const saved = (['complete', 'naturalWidth', 'currentSrc'] as const)
    .map(key => [key, Object.getOwnPropertyDescriptor(proto, key)] as const)
  Object.defineProperty(proto, 'complete', { configurable: true, get: () => true })
  Object.defineProperty(proto, 'naturalWidth', { configurable: true, get: () => 128 })
  Object.defineProperty(proto, 'currentSrc', {
    configurable: true,
    get(this: HTMLImageElement) {
      return this.src
    },
  })
  return () => {
    for (const [key, descriptor] of saved) {
      if (descriptor)
        Object.defineProperty(proto, key, descriptor)
      else
        Reflect.deleteProperty(proto, key)
    }
  }
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  restore?.()
  host = null
  root = null
  restore = null
})

function mount(): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(
    <XhImageRoot src={SRC} alt="一张示例图">
      <XhImageImage />
      <XhImagePlaceholder />
      <XhImageFallback>加载中</XhImageFallback>
    </XhImageRoot>,
  ))
}

function state(part: string): string | null {
  return host!.querySelector<HTMLElement>(`[data-scope="image"][data-part="${part}"]`)!.getAttribute('data-state')
}

function hidden(part: string): boolean {
  return host!.querySelector<HTMLElement>(`[data-scope="image"][data-part="${part}"]`)!.hasAttribute('hidden')
}

describe('图片：在机器就位前就已解码', () => {
  it('一个 load 事件都不派，也照样落到 loaded', () => {
    restore = pretendDecoded()
    mount()
    expect(state('root')).toBe('loaded')
    expect(state('image')).toBe('loaded')
    expect(hidden('image')).toBe(false)
    expect(hidden('placeholder')).toBe(true)
    expect(hidden('fallback')).toBe(true)
  })

  it('图片没解码完时不抢跑，仍停在 loading 等真正的 load', () => {
    mount()
    expect(state('root')).toBe('loading')
    expect(hidden('image')).toBe(true)
  })
})
