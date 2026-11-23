// @vitest-environment jsdom
// 日志的 threshold（距底多少 px 仍算在底部）要交到状态机手里：声明了却没接线时，写多少都按缺省的 64px 判。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from '../src'

let app: App | null = null
let host: HTMLElement | null = null

const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

/** 挂一份日志，把视口的滚动量换成可控的数：内容 1000 高、视口 200 高。 */
async function mountLog(threshold?: number): Promise<{ root: HTMLElement, scrollTo: (top: number) => Promise<void> }> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhLogRoot, { threshold }, () => [
      h(XhLogViewport, null, () => [h(XhLogContent, null, () => [h(XhLogLine, null, () => '一行日志')])]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await settle()
  const viewport = host.querySelector<HTMLElement>('[data-scope="log"][data-part="viewport"]')!
  const metrics = { scrollTop: 0, scrollHeight: 1000, clientHeight: 200 }
  for (const key of ['scrollTop', 'scrollHeight', 'clientHeight'] as const) {
    Object.defineProperty(viewport, key, {
      get: () => metrics[key],
      set: (v: number) => {
        metrics[key] = v
      },
      configurable: true,
    })
  }
  return {
    root: host.querySelector<HTMLElement>('[data-scope="log"][data-part="root"]')!,
    scrollTo: async (top) => {
      metrics.scrollTop = top
      viewport.dispatchEvent(new Event('scroll'))
      await settle()
      await nextTick()
    },
  }
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('log 的 threshold', () => {
  it('不写时按缺省 64px：离底 150px 不算在底部', async () => {
    const log = await mountLog()
    await log.scrollTo(800)
    await log.scrollTo(650)
    expect(log.root.hasAttribute('data-at-bottom')).toBe(false)
  })

  it('写 200 时离底 150px 仍算在底部', async () => {
    const log = await mountLog(200)
    await log.scrollTo(800)
    await log.scrollTo(650)
    expect(log.root.hasAttribute('data-at-bottom')).toBe(true)
  })
})
