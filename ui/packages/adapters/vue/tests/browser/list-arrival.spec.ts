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
  XhSelectControl,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagList,
  XhSelectTrigger,
  XhSelectValueText,
  XhTagGroupRoot,
  XhToolCallLabel,
  XhToolCallRoot,
  XhToolCallTrigger,
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

describe('历史消息里的卡片', () => {
  it('首帧就在的消息里的工具卡片直接呈现；新到的消息里的照常滑入', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const ids = ref(['h0', 'h1'])
    app = createApp({
      render: () => h(XhMessageFeedRoot, { style: 'block-size: 400px' }, () => h(XhMessageFeedViewport, () => h(XhMessageFeedList, () =>
        ids.value.map((id, index) => h(XhMessageFeedItem, { key: id, itemId: id, itemIndex: index }, () =>
          h(XhToolCallRoot, { phase: 'output-available' }, () => h(XhToolCallTrigger, () => h(XhToolCallLabel, () => id)))))))),
    })
    app.mount(host)
    await settle()
    const cards = (): HTMLElement[] => [...host.querySelectorAll<HTMLElement>('[data-scope="tool-call"][data-part="root"]')]
    expect(cards().map(running)).toEqual([[], []])

    ids.value = [...ids.value, 'fresh']
    await nextTick()
    expect(running(cards().at(-1)!)).toEqual(['xh-item-in'])
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

  it('一张卡收起后，其余卡片从旧位置过渡到新位置，不整张跳位', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    let dismiss: ((id: string) => void) | undefined
    const initial = [0, 1, 2].map(i => ({ id: `m${i}`, title: `第 ${i} 条`, duration: Number.POSITIVE_INFINITY }))
    app = createApp({
      render: () => h(XhNotificationRoot, { defaultItems: initial, max: 20 }, {
        default: (scope: { dismiss: typeof dismiss }) => {
          dismiss = scope.dismiss
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
    const card = (id: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="notification"][data-part="item"][data-id="${id}"]`)
      ?? [...document.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="item"]')].find(el => el.textContent?.includes(id.replace('m', '第 ')))!
    for (const el of document.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="item"]'))
      await Promise.all(el.getAnimations().map(a => a.finished.catch(() => undefined)))

    // 缺省落位 bottom-end 从底部往上摞：收起最底下那张，上面的卡片才往下挪
    const survivors = [card('m0'), card('m1')]
    const tops = survivors.map(el => el.offsetTop)
    dismiss!('m2')
    // 等收起那张的退场播完、被收起
    const first = card('m2')
    await Promise.all(first.getAnimations().map(a => a.finished.catch(() => undefined)))
    await settle()
    // 排布位变了的那张：换位中途带着反向补偿的 translate，而不是已经在新位置上
    const moved = survivors.find((el, i) => el.offsetTop !== tops[i])!
    expect(moved).toBeDefined()
    expect(getComputedStyle(moved).translate).not.toBe('none')
    await Promise.all(moved.getAnimations().map(a => a.finished.catch(() => undefined)))
    expect(['none', '0px'].includes(getComputedStyle(moved).translate)).toBe(true)
  })
})

describe('tag-group 标签增删', () => {
  it('删掉一枚：原处的替身淡出，后面的标签从旧位置滑过来；新加的一枚播进场', async () => {
    const host = document.createElement('div')
    host.style.inlineSize = '600px'
    document.body.append(host)
    const items = ref(['vue', 'react', 'svelte', 'angular'].map(value => ({ value, label: value })))
    app = createApp({
      render: () => h(XhTagGroupRoot, {
        'collection': items.value,
        'deletable': true,
        'onItem-delete': ({ value }: { value: string }) => {
          items.value = items.value.filter(item => item.value !== value)
        },
      }),
    })
    app.mount(host)
    await settle()
    const tags = (): HTMLElement[] => [...host.querySelectorAll<HTMLElement>('[data-scope="tag-group"][data-part="list"] > [data-scope="tag"][data-part="root"]')]
    // 首帧就在的标签不播进场
    for (const tag of tags())
      expect(running(tag)).toEqual([])

    const after = tags()[2]!
    const left = after.offsetLeft
    host.querySelectorAll<HTMLButtonElement>('[data-scope="tag"][data-part="close-trigger"]')[1]!.click()
    await nextTick()
    await nextTick()
    const ghost = host.querySelector<HTMLElement>('[data-scope="tag"][data-part="root"][data-state="closed"]')!
    expect(ghost).not.toBeNull()
    expect(ghost.inert).toBe(true)
    expect(running(ghost)).toEqual(['xh-fade-out'])
    // 后面那枚已排到新位置，换位中途带着反向补偿的 translate
    expect(after.offsetLeft).toBeLessThan(left)
    expect(getComputedStyle(after).translate).not.toBe('none')

    items.value = [...items.value, { value: 'solid', label: 'solid' }]
    await nextTick()
    await nextTick()
    expect(running(tags().at(-1)!)).toContain('xh-item-in')
  })
})

describe('select 多选标签行', () => {
  it('取消选中一枚：替身在行里淡出，后面的标签从旧位置滑过来；新选中的一枚播进场', async () => {
    const host = document.createElement('div')
    host.style.inlineSize = '480px'
    document.body.append(host)
    const options = ['北京', '上海', '广州', '深圳'].map(label => ({ value: label, label }))
    const value = ref(['北京', '上海', '广州'])
    app = createApp({
      render: () => h(XhSelectRoot, {
        'collection': options,
        'multiple': true,
        'value': value.value,
        'onUpdate:value': (next: string[]) => {
          value.value = next
        },
      }, {
        default: ({ tags }: { tags: Array<{ value: string, label: string }> }) => [
          h(XhSelectControl, null, () => h(XhSelectTrigger, null, () => [
            h(XhSelectValueText),
            h(XhSelectTagList, null, () => tags.map(t => h(XhSelectTag, { key: t.value, value: t.value }, () => t.label))),
          ])),
        ],
      }),
    })
    app.mount(host)
    await settle()
    const tags = (): HTMLElement[] => [...host.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="tag-list"] > [data-scope="tag"][data-part="root"][data-value]:not([inert])')]
    for (const tag of tags())
      expect(running(tag)).toEqual([])

    const last = tags()[2]!
    const left = last.offsetLeft
    value.value = ['北京', '广州']
    await nextTick()
    await nextTick()
    const ghost = host.querySelector<HTMLElement>('[data-scope="select"][data-part="tag-list"] > [data-state="closed"]')!
    expect(ghost).not.toBeNull()
    expect(ghost.textContent).toBe('上海')
    expect(running(ghost)).toEqual(['xh-fade-out'])
    // 替身绝对定位、裁在标签行里
    expect(getComputedStyle(ghost).position).toBe('absolute')
    expect(ghost.offsetParent).toBe(ghost.parentElement)
    expect(last.offsetLeft).toBeLessThan(left)
    expect(getComputedStyle(last).translate).not.toBe('none')

    value.value = ['北京', '广州', '深圳']
    await nextTick()
    await nextTick()
    expect(running(tags().at(-1)!)).toContain('xh-item-in')
  })
})
