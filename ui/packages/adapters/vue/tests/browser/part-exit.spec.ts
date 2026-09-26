// 常挂部件的退场：回到底部按钮不卸载、收起时靠 hidden 藏掉；藏之前先把退场动画播完。
// 动画是否在播、hidden 何时落下只有真实浏览器量得出来：jsdom 不跑 CSS 动画。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhBackTopRoot, XhBackTopTrigger, XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger, XhMessageFeedItem, XhMessageFeedList, XhMessageFeedRoot, XhMessageFeedScrollToEndTrigger, XhMessageFeedViewport } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  window.scrollTo(0, 0)
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
    await until(() => trigger.hidden === true)

    // 用户上滚：先有一下向上的滚轮解除粘附，视口才不会被粘底拉回去
    viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))
    viewport.scrollTop = 0
    await until(() => trigger.hidden === false)
    expect(trigger.dataset.state).toBe('visible')
    expect(running(trigger)).toEqual(['xh-pop-in'])

    viewport.scrollTop = viewport.scrollHeight
    await until(() => trigger.dataset.state === 'hidden')
    expect(trigger.hidden).toBe(false)
    expect(running(trigger)).toEqual(['xh-pop-out'])
    expect(getComputedStyle(trigger).pointerEvents).toBe('none')
    await until(() => trigger.hidden === true)
  })
})

describe('back-top 按钮', () => {
  it('滚过线弹出；退回线内先播完退场，根上才带 hidden，退场途中不接指针', async () => {
    const host = document.createElement('div')
    // 撑出一页可滚的高度
    host.style.blockSize = '3000px'
    document.body.append(host)
    app = createApp({
      render: () => h(XhBackTopRoot, { visibilityHeight: 200 }, () => h(XhBackTopTrigger)),
    })
    app.mount(host)
    await nextTick()
    const root = document.querySelector<HTMLElement>('[data-scope="back-top"][data-part="root"]')!
    const trigger = document.querySelector<HTMLElement>('[data-scope="back-top"][data-part="trigger"]')!
    expect(root.hidden).toBe(true)

    window.scrollTo(0, 600)
    await until(() => root.hidden === false)
    expect(trigger.dataset.state).toBe('visible')
    expect(running(trigger)).toEqual(['xh-pop-in'])

    window.scrollTo(0, 0)
    await until(() => trigger.dataset.state === 'hidden')
    expect(root.hidden).toBe(false)
    expect(running(trigger)).toEqual(['xh-pop-out'])
    expect(getComputedStyle(trigger).pointerEvents).toBe('none')
    await until(() => root.hidden === true)
  })
})

describe('float-button 展开列表', () => {
  it('收起时列表先留着，条目逆着冒出的次序逐条缩回，播完才藏起', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhFloatButtonRoot, null, () => [
        h(XhFloatButtonList, null, () => ['a', 'b', 'c'].map(label => h('button', { 'key': label, 'type': 'button', 'aria-label': label }, label))),
        h(XhFloatButtonTrigger, { 'aria-label': '更多' }),
      ]),
    })
    app.mount(host)
    await nextTick()
    const trigger = host.querySelector<HTMLElement>('[data-scope="float-button"][data-part="trigger"]')!
    const list = host.querySelector<HTMLElement>('[data-scope="float-button"][data-part="list"]')!
    const items = [...list.children] as HTMLElement[]

    trigger.click()
    await until(() => list.hidden === false)
    await new Promise(resolve => setTimeout(resolve, 400))

    trigger.click()
    await until(() => list.dataset.state === 'closed')
    expect(list.hidden).toBe(false)
    expect(items.map(el => running(el)[0])).toEqual(['xh-pop-out', 'xh-pop-out', 'xh-pop-out'])
    // 离触发器最远的（DOM 里最后一条）先走，最近的最后收
    const delays = items.map(el => Number(el.getAnimations()[0]!.effect!.getTiming().delay))
    expect(delays[2]).toBe(0)
    expect(delays[0]).toBeGreaterThan(delays[1]!)
    expect(delays[1]).toBeGreaterThan(delays[2]!)
    await until(() => list.hidden === true)
  })
})
