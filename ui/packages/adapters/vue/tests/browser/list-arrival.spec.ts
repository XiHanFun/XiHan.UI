// 列表条目的到达：首帧就在的条目直接呈现，之后新到的一批播进场，同一批按到达顺序错开。
// 动画是否在播、延迟取了几个步长只有真实浏览器量得出来：jsdom 不跑 CSS 动画。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCommandContent,
  XhCommandInput,
  XhCommandItem,
  XhCommandList,
  XhCommandRoot,
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

/** 部件上正在播的 CSS 动画名（不含过渡）。 */
function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => a.animationName)
}

/** 进场延迟换算成错开步长的个数。步长是 calc()，借一个探针的 transition-duration 读出算好的毫秒数。 */
function staggerSteps(el: Element): number {
  const probe = document.createElement('div')
  probe.style.transitionDuration = 'var(--xh-motion-stagger-step)'
  document.body.append(probe)
  const step = Number.parseFloat(getComputedStyle(probe).transitionDuration) * 1000
  probe.remove()
  const [animation] = el.getAnimations()
  return Math.round(Number(animation!.effect!.getTiming().delay) / step)
}

describe('message-feed 条目到达', () => {
  it('历史消息挂载时不播进场；之后新到的一批播进场，按到达顺序错开，不看排在第几条', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const ids = ref(Array.from({ length: 6 }, (_, i) => `h${i}`))
    app = createApp({
      render: () => h(XhMessageFeedRoot, { style: 'block-size: 400px' }, () => h(XhMessageFeedViewport, () => h(XhMessageFeedList, () =>
        ids.value.map((id, index) => h(XhMessageFeedItem, { key: id, itemId: id, itemIndex: index }, () => id))))),
    })
    app.mount(host)
    await settle()
    const items = (): HTMLElement[] => [...host.querySelectorAll<HTMLElement>('[data-scope="message-feed"][data-part="item"]')]
    for (const item of items())
      expect(running(item)).toEqual([])

    ids.value = [...ids.value, 'ask', 'reply']
    await nextTick()
    const [ask, reply] = items().slice(-2)
    expect(running(ask!)).toEqual(['xh-item-in'])
    expect(running(reply!)).toEqual(['xh-item-in'])
    expect(staggerSteps(ask!)).toBe(0)
    expect(staggerSteps(reply!)).toBe(1)
    // 已在的消息不因新消息到来而重播
    expect(running(items()[0]!)).toEqual([])
  })
})

describe('command 条目到达', () => {
  it('打开时已有的结果不逐条入场；筛掉又露面的一批按到达顺序错开，一直露着的不重播', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const values = ['a', 'b', 'c', 'd', 'e', 'f']
    const hidden = ref<string[]>([])
    app = createApp({
      render: () => h(XhCommandRoot, { defaultOpen: true, modal: false, collection: values.map(value => ({ value, label: value })) }, () =>
        h(XhCommandContent, null, () => [
          h(XhCommandInput),
          h(XhCommandList, null, () => values.map(value => h(XhCommandItem, { key: value, value, hidden: hidden.value.includes(value) }, () => value))),
        ])),
    })
    app.mount(host)
    await settle()
    const item = (value: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="command"][data-part="item"][data-value="${value}"]`)!
    for (const value of values)
      expect(running(item(value))).toEqual([])

    hidden.value = ['e', 'f']
    await settle()
    hidden.value = []
    await nextTick()
    expect(running(item('e'))).toEqual(['xh-rise-in'])
    expect([staggerSteps(item('e')), staggerSteps(item('f'))]).toEqual([0, 1])
    expect(running(item('a'))).toEqual([])
  })
})

describe('notification 条目到达', () => {
  it('一摞里已有 6 条时新来的一批从 0 起错开，不等排在前面的那几条；页面载入时就在的卡片也照常进场', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    let create: ((options: { title: string, duration: number }) => string) | undefined
    const initial = Array.from({ length: 6 }, (_, i) => ({ id: `n${i}`, title: `第 ${i} 条`, duration: Number.POSITIVE_INFINITY }))
    app = createApp({
      render: () => h(XhNotificationRoot, { defaultItems: initial, max: 20 }, {
        default: (scope: { create: typeof create }) => {
          create = scope.create
          return [h(XhNotificationGroup, null, {
            default: ({ item }: { item: { id: string, title?: string } }) => [
              h(XhNotificationItem, { key: item.id, id: item.id, title: item.title }, () => [h(XhNotificationItemTitle)]),
            ],
          })]
        },
      }),
    })
    app.mount(host)
    await settle()
    const cards = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="item"]')]
    expect(cards().map(el => running(el)[0])).toEqual(Array.from({ length: 6 }).fill('xh-sheet-in'))
    expect(cards().slice(0, 5).map(staggerSteps)).toEqual([0, 1, 2, 3, 4])

    create!({ title: '新来的一条', duration: Number.POSITIVE_INFINITY })
    create!({ title: '紧跟着的一条', duration: Number.POSITIVE_INFINITY })
    await nextTick()
    const fresh = cards().filter(el => running(el).length > 0 && el.textContent?.includes('一条'))
    expect(fresh).toHaveLength(2)
    expect(fresh.map(staggerSteps)).toEqual([0, 1])
  })
})
