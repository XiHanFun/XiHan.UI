// 往前取数（edge: start）：新的一页插在已有内容前面时，视口里原来那几条留在原处。
// 滚动量与插入后的布局只在 Chromium 里可信。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref, shallowRef } from 'vue'
import { XhInfiniteScrollRoot, XhInfiniteScrollSentinel } from '../../src'
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
})

function mount(edge: 'start' | 'end') {
  host = document.createElement('div')
  document.body.append(host)
  const rows = ref(Array.from({ length: 20 }, (_, i) => `m${i}`))
  const loading = ref(false)
  const scroller = shallowRef<HTMLElement | null>(null)
  app = createApp({
    render: () => h('div', {
      'ref': (el: unknown) => { scroller.value = el as HTMLElement | null },
      'style': { blockSize: '200px', overflowY: 'auto' },
      'data-test': 'scroller',
    }, h(XhInfiniteScrollRoot, { edge, loading: loading.value, target: scroller.value }, () => [
      h(XhInfiniteScrollSentinel),
      ...rows.value.map(row => h('div', { 'key': row, 'data-row': row, 'style': { blockSize: `${ROW}px` } }, row)),
    ])),
  })
  app.mount(host)
  return { rows, loading, scroller: (): HTMLElement => host!.querySelector<HTMLElement>('[data-test="scroller"]')! }
}

function offsetInScroller(scroller: HTMLElement, row: string): number {
  const el = scroller.querySelector<HTMLElement>(`[data-row="${row}"]`)!
  return Math.round(el.getBoundingClientRect().top - scroller.getBoundingClientRect().top)
}

describe('infiniteScroll edge: start', () => {
  it('取数期间往前插入一页：视口里原来的第一条留在原处', async () => {
    const { rows, loading, scroller } = mount('start')
    await nextTick()
    // 关掉浏览器自己的滚动锚定：Safari 没有它，列表滚到顶时 Chromium 也不锚定，保住视口得靠组件
    scroller().style.overflowAnchor = 'none'
    scroller().scrollTop = 2 * ROW
    await expect.poll(() => scroller().scrollTop).toBe(2 * ROW)
    const before = offsetInScroller(scroller(), 'm2')

    loading.value = true
    await nextTick()
    // 宿主在同一轮里插入新内容并写回 loading=false
    rows.value = [...Array.from({ length: 10 }, (_, i) => `h${i}`), ...rows.value]
    loading.value = false
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    expect(offsetInScroller(scroller(), 'm2')).toBe(before)
    expect(scroller().scrollTop).toBe(12 * ROW)
  })

  it('缺省的 end 不动滚动量：往前插入时内容整体后移', async () => {
    const { rows, loading, scroller } = mount('end')
    await nextTick()
    // 关掉浏览器自己的滚动锚定，只看组件做了什么
    scroller().style.overflowAnchor = 'none'
    scroller().scrollTop = 2 * ROW
    await expect.poll(() => scroller().scrollTop).toBe(2 * ROW)

    loading.value = true
    await nextTick()
    rows.value = [...Array.from({ length: 10 }, (_, i) => `h${i}`), ...rows.value]
    loading.value = false
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    expect(scroller().scrollTop).toBe(2 * ROW)
  })
})
