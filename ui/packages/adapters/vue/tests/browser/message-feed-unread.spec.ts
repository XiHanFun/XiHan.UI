// 回到底部上的未读数与按日期的分隔：角标落在按钮的行尾上角、露在按钮盒外面不被裁；
// 分隔两侧的线与中间的字排成一行。位置与裁切只有真实布局量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedScrollToEndTrigger,
  XhMessageFeedSeparator,
  XhMessageFeedUnreadCount,
  XhMessageFeedViewport,
} from '../../src'
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

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))

describe('message-feed 未读数与分隔', () => {
  it('离底期间来了新消息：角标露在回底钮的行尾上角，写着条数', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '360px'
    document.body.append(host)
    const count = ref(30)
    app = createApp({
      render: () => h(XhMessageFeedRoot, { count: count.value, style: { blockSize: '240px' } }, () => [
        h(XhMessageFeedViewport, null, () => h(XhMessageFeedList, null, () => [
          h(XhMessageFeedSeparator, null, () => '今天'),
          ...Array.from({ length: count.value }, (_, index) => h(XhMessageFeedItem, { key: index, itemId: `m${index}`, itemIndex: index }, () => `第 ${index + 1} 条消息`)),
        ])),
        h(XhMessageFeedScrollToEndTrigger, null, () => h(XhMessageFeedUnreadCount)),
      ]),
    })
    app.mount(host)
    for (let i = 0; i < 10; i++) await frame()

    const viewport = host.querySelector<HTMLElement>('[data-part="viewport"]')!
    viewport.scrollTop = 0
    viewport.dispatchEvent(new Event('scroll'))
    for (let i = 0; i < 5; i++) await frame()
    count.value = 33
    await nextTick()
    for (let i = 0; i < 10; i++) await frame()

    const trigger = host.querySelector<HTMLElement>('[data-part="scroll-to-end-trigger"]')!
    const badge = host.querySelector<HTMLElement>('[data-part="unread-count"]')!
    expect(badge.hidden).toBe(false)
    expect(badge.textContent).toBe('3')
    expect(trigger.getAttribute('aria-label')).toBe('Scroll to bottom, 3 new messages')
    const t = trigger.getBoundingClientRect()
    const b = badge.getBoundingClientRect()
    // 角标压在按钮的上沿与行尾缘上，并伸出按钮盒
    expect(b.top).toBeLessThan(t.top)
    expect(b.right).toBeGreaterThan(t.right)
    expect(b.bottom).toBeGreaterThan(t.top)
    // 按钮不裁它：角标整块露在外面的那一截看得见
    expect(getComputedStyle(trigger).overflow).not.toBe('hidden')
    // 按钮里只放了角标：皮肤画的向下字形照旧在
    const glyph = getComputedStyle(trigger, '::before')
    expect(glyph.content).not.toBe('none')
    expect(Number.parseFloat(glyph.width)).toBeGreaterThan(0)

    const separator = host.querySelector<HTMLElement>('[data-part="separator"]')!
    expect(getComputedStyle(separator).display).toBe('flex')
    expect(getComputedStyle(separator, '::before').borderTopStyle).toBe('solid')
  })
})
