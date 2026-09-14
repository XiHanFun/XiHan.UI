import { userEvent } from '@vitest/browser/context'
import { beforeAll } from 'vitest'

/**
 * 把真实指针停到视口角落的一块 2×2 上，并把它留在 DOM 里当命中目标。
 *
 * fixture 一律挂在 body 开头：真实指针停在那一片时，浏览器会在每次挂载后按指针位置
 * 补发一发真实 pointerenter，hover 档的滚动条被它推回 visible，用例里自己派的
 * pointerleave 就白派了。角落这块钉在最上层，fixture 从此收不到真实指针。
 */
async function parkPointer(): Promise<void> {
  const park = document.createElement('div')
  park.dataset.testParkPointer = ''
  park.setAttribute('aria-hidden', 'true')
  park.style.cssText = 'position:fixed;right:0;bottom:0;width:2px;height:2px;z-index:2147483647'
  document.body.append(park)
  await userEvent.hover(park)
}

beforeAll(parkPointer)
