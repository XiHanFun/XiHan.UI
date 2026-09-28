// 可展开的截断文本是一颗按钮：悬停要有看得见的回执。正文本来就是正文色时，只提亮到正文色等于零反馈，
// 所以悬停时还淡进一条下划线。计算样式只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTruncate } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

describe('truncate 悬停回执', () => {
  it('被裁的可展开文本：静息时下划线透明，悬停淡进下划线；正文色不变时也看得出变化', async () => {
    host = document.createElement('div')
    host.style.cssText = 'inline-size: 160px; color: var(--xh-fg-default)'
    document.body.append(host)
    app = createApp({
      render: () => h(XhTruncate, { expandable: true }, () => '这是一段很长很长、一行装不下、需要截断的说明文字'),
    })
    app.mount(host)
    await nextTick()
    const root = host.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='root']`)!
    await expect.poll(() => root.hasAttribute('data-overflowing')).toBe(true)
    // 被裁与否挂载后才量出：量出来那一下不该有过渡在播（下划线一开始就是透明的）
    expect(root.getAnimations()).toEqual([])
    const rest = getComputedStyle(root)
    expect(rest.textDecorationLine).toBe('underline')
    expect(rest.textDecorationColor).toBe('rgba(0, 0, 0, 0)')
    const restColor = rest.color

    await userEvent.hover(root)
    await Promise.all(root.getAnimations().map(animation => animation.finished.catch(() => undefined)))
    const hover = getComputedStyle(root)
    expect(hover.color).toBe(restColor)
    expect(hover.textDecorationColor).toBe(hover.color)
  })
})
