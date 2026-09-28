// Virtualizer 的三种滚动形态：随整页滚（window）、贴底与往前插入时按身份钉住视口（anchor）、分组标题钉在起点（stickyIndices）。
// 滚动量、布局与 sticky 定位只在 Chromium 里可信。
import type { VirtualizerItemState } from '@xihan-ui/headless'
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerRoot, XhVirtualizerViewport } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ROW = 30

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  window.scrollTo({ top: 0 })
})

interface MountOptions {
  keys: Ref<string[]>
  viewportSize?: number
  props?: Record<string, unknown>
  before?: number
}

function mount(options: MountOptions): void {
  host = document.createElement('div')
  document.body.append(host)
  const { keys } = options
  app = createApp({
    render: () => [
      options.before ? h('div', { 'style': { blockSize: `${options.before}px` }, 'data-test': 'before' }) : null,
      h(XhVirtualizerRoot, {
        count: keys.value.length,
        estimateSize: ROW,
        overscan: 2,
        getItemKey: (index: number) => keys.value[index] ?? index,
        ...options.props,
      }, {
        default: ({ virtualItems }: { virtualItems: readonly VirtualizerItemState[] }) => h(
          XhVirtualizerViewport,
          { style: options.viewportSize ? { blockSize: `${options.viewportSize}px` } : undefined },
          () => h(XhVirtualizerContent, null, () => virtualItems.map(item => h(
            XhVirtualizerItem,
            { key: item.key, value: item.index, style: { blockSize: `${ROW}px` } },
            () => h('span', { 'data-key': String(item.key) }, String(item.key)),
          ))),
        ),
      }),
    ],
  })
  app.mount(host)
}

function viewport(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')!
}

function itemByKey(key: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-key="${key}"]`)?.closest<HTMLElement>('[data-part="item"]') ?? null
}

function renderedCount(): number {
  return document.querySelectorAll('[data-scope="virtualizer"][data-part="item"]:not([hidden])').length
}

describe('scrollContainer: window', () => {
  it('随整页滚动：只渲染视口里那几条，列表上方的内容不会让区间错位', async () => {
    const keys = ref(Array.from({ length: 1000 }, (_, i) => `r${i}`))
    mount({ keys, before: 300, props: { scrollContainer: 'window' } })
    await expect.poll(() => renderedCount()).toBeGreaterThan(0)
    expect(renderedCount()).toBeLessThan(Math.ceil(window.innerHeight / ROW) + 10)
    expect(getComputedStyle(viewport()).overflowY).toBe('visible')

    // 第 100 条的顶边滚到窗口顶
    window.scrollTo({ top: 300 + 100 * ROW })
    await expect.poll(() => itemByKey('r100')).not.toBeNull()
    await expect.poll(() => Math.round(itemByKey('r100')!.getBoundingClientRect().top)).toBe(0)
    expect(renderedCount()).toBeLessThan(Math.ceil(window.innerHeight / ROW) + 10)
  })
})

describe('anchor', () => {
  it('往前插入历史：给了稳定身份时，原来视口里第一条留在原处', async () => {
    const keys = ref(Array.from({ length: 40 }, (_, i) => `m${i}`))
    mount({ keys, viewportSize: 200 })
    await expect.poll(() => itemByKey('m0')).not.toBeNull()
    viewport().scrollTop = 5 * ROW
    await expect.poll(() => Math.round(itemByKey('m5')!.getBoundingClientRect().top - viewport().getBoundingClientRect().top)).toBe(0)

    keys.value = [...Array.from({ length: 10 }, (_, i) => `h${i}`), ...keys.value]
    await nextTick()
    await expect.poll(() => viewport().scrollTop).toBe(15 * ROW)
    expect(Math.round(itemByKey('m5')!.getBoundingClientRect().top - viewport().getBoundingClientRect().top)).toBe(0)
  })

  it('end：从底部看起，贴底时追加条目继续贴底；翻上去之后不再拽回', async () => {
    const keys = ref(Array.from({ length: 20 }, (_, i) => `m${i}`))
    mount({ keys, viewportSize: 200, props: { anchor: 'end' } })
    const end = (): number => viewport().scrollHeight - viewport().clientHeight
    await expect.poll(() => viewport().scrollTop).toBe(20 * ROW - 200)

    keys.value = [...keys.value, 'm20', 'm21']
    await expect.poll(() => viewport().scrollTop).toBe(22 * ROW - 200)
    expect(viewport().scrollTop).toBe(end())

    viewport().scrollTop = 0
    await expect.poll(() => viewport().scrollTop).toBe(0)
    keys.value = [...keys.value, 'm22']
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    expect(viewport().scrollTop).toBe(0)
  })

  it('end：不足一屏时条目贴着底部排', async () => {
    const keys = ref(['m0', 'm1'])
    mount({ keys, viewportSize: 200, props: { anchor: 'end' } })
    await expect.poll(() => itemByKey('m1')).not.toBeNull()
    const bottom = viewport().getBoundingClientRect().bottom
    await expect.poll(() => Math.round(itemByKey('m1')!.getBoundingClientRect().bottom)).toBe(Math.round(bottom))
  })
})

describe('stickyIndices', () => {
  it('滚过分组标题之后它钉在视口起点，下一个标题滚上来时接替', async () => {
    const keys = ref(Array.from({ length: 100 }, (_, i) => `r${i}`))
    mount({ keys, viewportSize: 200, props: { stickyIndices: [0, 20, 40] } })
    await expect.poll(() => itemByKey('r0')).not.toBeNull()
    viewport().scrollTop = 25 * ROW
    await expect.poll(() => itemByKey('r20')).not.toBeNull()
    const header = itemByKey('r20')!
    expect(header.hasAttribute('data-fixed')).toBe(true)
    expect(getComputedStyle(header).position).toBe('sticky')
    await expect.poll(() => Math.round(header.getBoundingClientRect().top - viewport().getBoundingClientRect().top)).toBe(0)

    viewport().scrollTop = 45 * ROW
    await expect.poll(() => itemByKey('r40')?.hasAttribute('data-fixed')).toBe(true)
    expect(itemByKey('r20')).toBeNull()
  })
})
