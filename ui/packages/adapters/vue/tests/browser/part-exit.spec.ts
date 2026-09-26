// 常挂部件的退场：回到底部按钮不卸载、收起时靠 hidden 藏掉；藏之前先把退场动画播完。
// 动画是否在播、hidden 何时落下只有真实浏览器量得出来：jsdom 不跑 CSS 动画。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhMessageFeedItem, XhMessageFeedList, XhMessageFeedRoot, XhMessageFeedScrollToEndTrigger, XhMessageFeedViewport } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => a.animationName)
}

/** 等到条件成立：滚动事件与粘底回报跨几帧才落定。 */
async function until(check: () => boolean): Promise<void> {
  await expect.poll(check, { timeout: 2000 }).toBe(true)
}

describe('message-feed 回到底部按钮', () => {
  it('离底时弹出；回底时先播完退场才带上 hidden，退场途中不接指针', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhMessageFeedRoot, { style: 'block-size: 200px; display: flex; flex-direction: column' }, () => [
        h(XhMessageFeedViewport, { style: 'flex: 1; min-block-size: 0' }, () => h(XhMessageFeedList, () =>
          Array.from({ length: 30 }, (_, i) => h(XhMessageFeedItem, { key: i, itemId: `m${i}`, itemIndex: i }, () => `第 ${i} 条消息`)))),
        h(XhMessageFeedScrollToEndTrigger),
      ]),
    })
    app.mount(host)
    await nextTick()
    const viewport = host.querySelector<HTMLElement>('[data-scope="message-feed"][data-part="viewport"]')!
    const trigger = host.querySelector<HTMLElement>('[data-scope="message-feed"][data-part="scroll-to-end-trigger"]')!
    await until(() => trigger.hidden)

    // 用户上滚：先有一下向上的滚轮解除粘附，视口才不会被粘底拉回去
    viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))
    viewport.scrollTop = 0
    await until(() => !trigger.hidden)
    expect(trigger.dataset.state).toBe('visible')
    expect(running(trigger)).toEqual(['xh-pop-in'])

    viewport.scrollTop = viewport.scrollHeight
    await until(() => trigger.dataset.state === 'hidden')
    expect(trigger.hidden).toBe(false)
    expect(running(trigger)).toEqual(['xh-pop-out'])
    expect(getComputedStyle(trigger).pointerEvents).toBe('none')
    await until(() => trigger.hidden)
  })
})
