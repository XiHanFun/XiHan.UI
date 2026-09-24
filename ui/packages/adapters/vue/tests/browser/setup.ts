/// <reference types="@xihan-ui/testing/browser-commands" />
import { beforeAll } from 'vitest'
import { cdp, commands, userEvent } from 'vitest/browser'

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
 * 媒介仿真挂在整张页面上，同一 worker 里的下一个文件复用这张页面。
 * 上一个文件末条用例仿真成 print / forced-colors 后不还原，这个文件就整份跑在那个媒介里。每个文件开跑前复位。
 *
 * 触屏仿真不在这里复位：Linux 无头 Chromium 上关一次就把 (pointer) / (hover) 永久落成 none，
 * 复位本身就会弄坏页面。仿真过触屏的文件由 vitest.browser.config 单开项目隔离。
 */
async function resetEmulation(): Promise<void> {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
}

beforeAll(resetEmulation)
beforeAll(parkPointer)
beforeAll(holdImageSources)
