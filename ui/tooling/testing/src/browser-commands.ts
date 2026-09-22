/// <reference types="@vitest/browser-playwright" />
// 浏览器态 vitest 的自定义命令：三个适配器的 vitest.browser.config 共用，实现在 Node 侧跑，
// 用例侧经 `commands.<名字>()` 触发。类型增广随实现走，各适配器的 tests/browser 引本模块即可。
import type { BrowserCommand } from 'vitest/node'
import { IMAGE_SOURCE_ORIGIN } from './suites/shared/image-source'

/** 已经挂过路由的页面：setup 逐文件跑，同一页面只装一次，免得每个文件都往上叠一层。 */
const held = new WeakSet<object>()

/**
 * 把套件图源域名下的请求一直挂着：既不放行也不失败。
 *
 * 一致性套件按 jsdom 的口径写：`<img>` 的 load / error 只由步骤派发。真实浏览器会自己去取
 * `example.test`，解析失败即派 error——CI 上负缓存后几毫秒就到，而 React 夹具的 setProps
 * 要让出宏任务，error 便抢在轮询之前把 loading 推成 error，「src 换人」用例随机判红。
 * 请求在 Playwright 的拦截层挂住后不占真实连接，页面卸载时随之丢弃。
 */
const holdImageSources: BrowserCommand<[]> = async ({ page }) => {
  if (held.has(page))
    return
  held.add(page)
  await page.route(`${IMAGE_SOURCE_ORIGIN}/**`, () => {})
}

/** 交给 `test.browser.commands`。 */
export const browserCommands = { holdImageSources }

declare module 'vitest/internal/browser' {
  interface BrowserCommands {
    /** 见 {@link browserCommands} 里的同名实现。 */
    holdImageSources: () => Promise<void>
  }
}
