import { preloadOverlay } from '@xihan-ui/web-components'
import { beforeAll } from 'vitest'
import { userEvent } from 'vitest/browser'

/**
 * 把真实指针停到视口角落的一块 2×2 上，并把它留在 DOM 里当命中目标。
 * fixture 挂在 body 开头：真实指针停在那一片时，浏览器会按指针位置补发真实的 pointerenter，
 * 用例里自己派的指针事件就被它搅乱了。
 */
async function parkPointer(): Promise<void> {
  const park = document.createElement('div')
  park.dataset.testParkPointer = ''
  park.setAttribute('aria-hidden', 'true')
  park.style.cssText = 'position:fixed;right:0;bottom:0;width:2px;height:2px;z-index:2147483647'
  document.body.append(park)
  await userEvent.hover(park)
}

/**
 * 库内浮层（对话框、菜单、提示）的按需块先取齐：用例断言的是打开之后的同步行为，
 * 第一次打开时按需块还没到的那条路径由 Web Components 适配器自己的用例测。
 */
beforeAll(preloadOverlay)
beforeAll(parkPointer)
