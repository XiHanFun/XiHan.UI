/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

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
  it('文字条使用 12px 高度与 12px 组间距，且不接管指针', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhSkeletonRoot, null, () => [h(XhSkeletonItem), h(XhSkeletonItem)]),
    })
    app.mount(host)
    await nextTick()

    const root = document.querySelector<HTMLElement>('[data-scope="skeleton"][data-part="root"]')!
    const item = document.querySelector<HTMLElement>('[data-scope="skeleton"][data-part="item"]')!
    expect(getComputedStyle(root).gap).toBe('12px')
    expect(item.getBoundingClientRect().height).toBe(12)
    expect(getComputedStyle(item).pointerEvents).toBe('none')
  })
})
