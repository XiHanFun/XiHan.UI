// Skeleton 的内容节奏依赖真实计算样式。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSkeletonItem, XhSkeletonRoot } from '../../src'
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

describe('骨架屏的内容节奏', () => {
  it('文字条高一行正文行框（14 × 1.5 = 21px）、条间距 16px、圆角 2px，且不接管指针', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhSkeletonRoot, null, () => [h(XhSkeletonItem), h(XhSkeletonItem)]),
    })
    app.mount(host)
    await nextTick()

    const root = document.querySelector<HTMLElement>('[data-scope="skeleton"][data-part="root"]')!
    const item = document.querySelector<HTMLElement>('[data-scope="skeleton"][data-part="item"]')!
    expect(getComputedStyle(root).gap).toBe('16px')
    expect(item.getBoundingClientRect().height).toBe(21)
    expect(getComputedStyle(item).borderRadius).toBe('2px')
    expect(getComputedStyle(item).pointerEvents).toBe('none')
  })

  it('扫光取淡底一档：浅色下是一道比条底深的暗带，深色下是一道亮带', async () => {
    for (const theme of ['light', 'dark'] as const) {
      host = document.createElement('div')
      host.dataset.theme = theme
      document.body.append(host)
      app = createApp({ render: () => h(XhSkeletonRoot, null, () => [h(XhSkeletonItem)]) })
      app.mount(host)
      await nextTick()
      const item = host.querySelector<HTMLElement>('[data-scope="skeleton"][data-part="item"]')!
      const probe = document.createElement('span')
      probe.style.color = 'var(--xh-bg-subtle)'
      host.append(probe)
      const sheen = getComputedStyle(probe).color
      probe.remove()
      expect(getComputedStyle(item).backgroundImage, theme).toContain(sheen)
      app.unmount()
      host.remove()
    }
    app = null
    host = null
  })
})
