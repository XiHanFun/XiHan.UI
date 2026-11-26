// 选择器与组合框的触底加载：浮层里的列表滚到末端派发 load-more，新一页接到 collection 末尾后再滚到底才派发下一次。
//
// 只有真实浏览器量得出来：列表要靠浮层外壳的高度上限收住才会滚，jsdom 不排版、也不产生滚动。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhComboboxRoot, XhSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const page = (from: number) => Array.from({ length: 30 }, (_, i) => ({ value: `o${from + i}`, label: `选项 ${from + i}` }))

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function frames(count = 2): Promise<void> {
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

/** 把滚动面滚到底，等滚动事件派发出去。 */
async function scrollToEnd(el: HTMLElement): Promise<void> {
  el.scrollTop = el.scrollHeight
  await frames()
}

function mountSelect(virtual: boolean) {
  const collection = ref(page(0))
  const loading = ref(false)
  const requests = ref(0)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhSelectRoot, {
      collection: collection.value,
      virtual,
      loading: loading.value,
      label: '分页候选',
      defaultOpen: true,
      onLoadMore: () => {
        requests.value++
      },
    }),
  })
  app.mount(host)
  return { collection, loading, requests }
}

describe('select 的 load-more', () => {
  it.each([
    ['列表自己滚', false, '[data-scope="select"][data-part="list"]'],
    ['开了虚拟化、视口来滚', true, '[data-scope="select"][data-part="content"] > [data-scope="virtualizer"][data-part="viewport"]'],
  ] as const)('%s：滚到底派发一次，停在底部不重复；在途时不派发；接上新一页后再滚到底再派发', async (_name, virtual, surface) => {
    const t = mountSelect(virtual)
    await expect.poll(() => document.querySelectorAll('[data-scope="select"][data-part="item"]').length).toBeGreaterThan(0)
    await frames()
    const scroller = document.querySelector<HTMLElement>(surface)!
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)

    scroller.scrollTop = 40
    await frames()
    expect(t.requests.value).toBe(0)
    await scrollToEnd(scroller)
    await expect.poll(() => t.requests.value).toBe(1)
    // 停在底部来回微滚：不重复请求
    scroller.scrollTop -= 0.5
    await frames()
    await scrollToEnd(scroller)
    expect(t.requests.value).toBe(1)

    // 宿主置上 loading：期间离开再滚回底部也不派发
    t.loading.value = true
    await frames()
    scroller.scrollTop = 40
    await frames()
    await scrollToEnd(scroller)
    expect(t.requests.value).toBe(1)

    // 新一页接上、撤掉 loading：内容变长，再滚到底才派发下一次
    const before = scroller.scrollHeight
    t.collection.value = [...t.collection.value, ...page(30)]
    t.loading.value = false
    await expect.poll(() => scroller.scrollHeight).toBeGreaterThan(before)
    await scrollToEnd(scroller)
    await expect.poll(() => t.requests.value).toBe(2)
  })
})

describe('combobox 的 load-more', () => {
  it('浮层里的列表滚到底派发一次', async () => {
    const requests = ref(0)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhComboboxRoot, {
        collection: page(0),
        label: '分页候选',
        defaultOpen: true,
        onLoadMore: () => {
          requests.value++
        },
      }),
    })
    app.mount(host)
    await expect.poll(() => document.querySelectorAll('[data-scope="combobox"][data-part="item"]').length).toBe(30)
    await frames()
    const content = document.querySelector<HTMLElement>('[data-scope="combobox"][data-part="content"]')!
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight)
    await scrollToEnd(content)
    await expect.poll(() => requests.value).toBe(1)
  })
})
