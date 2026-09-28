// 日志的 ANSI 着色与虚拟滚动接线：着色落到哪个语义色、虚拟化后只挂窗口里的行且粘底跟着 Virtualizer 的视口走，
// 计算色与滚动几何只有真实浏览器量得出来。
import type { CollectionVirtualizer, VirtualizerItemState } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhLogContent,
  XhLogLine,
  XhLogRoot,
  XhLogViewport,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
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

/** 取一个令牌在文档上解出来的颜色，拿一个探针元素读计算值。 */
function tokenColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

describe('log ANSI 着色', () => {
  it('红色与粗体落到危险前景与半粗字重，没着色的那段随行的颜色', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhLogRoot, { rows: 4 }, () => h(XhLogViewport, null, () => h(XhLogContent, null, () => [
        h(XhLogLine, { ansi: '\u001B[1;31merror\u001B[0m disk full' }),
      ]))),
    })
    app.mount(host)
    await nextTick()
    const segments = host.querySelectorAll<HTMLElement>('[data-scope="log"][data-part="segment"]')
    expect(segments).toHaveLength(2)
    expect(getComputedStyle(segments[0]!).color).toBe(tokenColor('--xh-fg-danger'))
    expect(Number(getComputedStyle(segments[0]!).fontWeight)).toBeGreaterThan(Number(getComputedStyle(segments[1]!).fontWeight))
    expect(getComputedStyle(segments[1]!).color).toBe(getComputedStyle(segments[1]!.parentElement!).color)
  })
})

describe('log 与虚拟滚动接线', () => {
  it('只挂窗口里的行，首帧粘在底部；追加的行来了照样跟到底', async () => {
    host = document.createElement('div')
    document.body.append(host)
    let count = 500
    const render = (): ReturnType<typeof h> => h(XhVirtualizerRoot, { count, estimateSize: 20, overscan: 2 }, {
      default: ({ virtualItems, collectionVirtualizer }: { virtualItems: readonly VirtualizerItemState[], collectionVirtualizer: CollectionVirtualizer }) =>
        h(XhLogRoot, { rows: 8, virtualizer: collectionVirtualizer }, () => h(XhLogViewport, null, () =>
          h(XhVirtualizerViewport, null, () => h(XhVirtualizerContent, null, () => virtualItems.map(item =>
            h(XhVirtualizerItem, { key: item.key, value: item.index }, () => h(XhLogLine, null, () => `第 ${item.index + 1} 行`))))))),
    })
    app = createApp({ render })
    app.mount(host)
    const scroller = (): HTMLElement => host!.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')!
    // 离底不到一行，且日志根报告在底：末行整行露在视口里
    const atBottom = (): boolean => {
      const el = scroller()
      const line = host!.querySelector<HTMLElement>('[data-scope="log"][data-part="line"]')!.getBoundingClientRect().height
      return el.scrollHeight - el.clientHeight - el.scrollTop < line
        && host!.querySelector('[data-scope="log"][data-part="root"]')!.hasAttribute('data-at-bottom')
    }
    for (let i = 0; i < 30; i++) await frame()

    const lines = host.querySelectorAll('[data-scope="log"][data-part="line"]')
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.length).toBeLessThan(40)
    expect(atBottom()).toBe(true)
    expect(host.textContent).toContain('第 500 行')
    // 日志视口只定高不滚动：滚动的是里面那层
    const viewport = host.querySelector<HTMLElement>('[data-scope="log"][data-part="viewport"]')!
    expect(viewport.hasAttribute('data-virtualized')).toBe(true)
    expect(getComputedStyle(viewport).overflowY).toBe('hidden')

    count = 520
    app._instance!.proxy!.$forceUpdate()
    for (let i = 0; i < 30; i++) await frame()
    expect(host.textContent).toContain('第 520 行')
    expect(atBottom()).toBe(true)
  })
})
