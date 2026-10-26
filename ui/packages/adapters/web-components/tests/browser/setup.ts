/// <reference types="@xihan-ui/testing/browser-commands" />
import { beforeAll } from 'vitest'
import { commands, userEvent } from 'vitest/browser'
import { preloadOverlay } from '../../src/runtime/preload-overlay'

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

/**
 * 套件图源域名下的请求全程挂住：<img> 的 load / error 只由套件步骤派发，真实网络不插手。
 * 命令本身与缘由见 @xihan-ui/testing 的 browser-commands。
 */
function holdImageSources(): Promise<void> {
  return commands.holdImageSources()
}

/**
 * 浮层的按需块（core 的消解层、焦点域、视觉桥，定位引擎，浮层里的自绘滚动条）先取齐：用例断言的是
 * 打开之后的同步行为。第一次打开时按需块还没到的那条路径由专门的用例测，它们在文件顶层写
 * `globalThis.__xhColdOverlay = true` 跳过这一步（文件先收集、后跑这里的 beforeAll）。
 */
async function preloadOverlays(): Promise<void> {
  if (!(globalThis as { __xhColdOverlay?: boolean }).__xhColdOverlay)
    await preloadOverlay()
}

beforeAll(preloadOverlays)
beforeAll(parkPointer)
beforeAll(holdImageSources)
