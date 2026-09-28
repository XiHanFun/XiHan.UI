// 相对时间的自动刷新：文字只在跨过分钟边界时才变，就只在那一刻刷新；离开视口时暂停，重回视口立即补一次。
// 视口判定走 IntersectionObserver，jsdom 不排版也没有它，只有真实浏览器验得了「离开视口不刷新」。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTimestamp } from '../../src'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function stamp(): HTMLElement {
  const element = host!.querySelector<HTMLElement>('[data-scope="timestamp"][data-part="root"]')
  if (!element)
    throw new Error('缺少 timestamp root')
  return element
}

async function mount(value: number, offscreen: boolean): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h('div', {
      'data-testid': 'scroller',
      'style': { blockSize: '120px', overflow: 'auto' },
      'data-xh-scroll': '',
    }, [
      // 离开视口的那一档：时刻排在一块比滚动容器高得多的留白之后
      offscreen ? h('div', { style: { blockSize: '2000px' } }) : null,
      h(XhTimestamp, { value, type: 'relative', locale: 'en-US' }),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-testid="scroller"]')!
}

describe('timestamp 自动刷新', () => {
  it('在视口里：跨过一分钟的那一刻文字从 now 变成 1 minute ago', async () => {
    // 离满一分钟还差 800ms
    await mount(Date.now() - 59_200, false)
    expect(stamp().textContent).toBe('now')
    await expect.poll(() => stamp().textContent, { timeout: 3000 }).toBe('1 minute ago')
  })

  it('离开视口不刷新，滚回视口立即补一次', async () => {
    const scroller = await mount(Date.now() - 59_200, true)
    expect(stamp().textContent).toBe('now')
    // 过了边界仍停在 now：视口外的时间戳不值得每分钟重排一次
    await new Promise(resolve => setTimeout(resolve, 1500))
    expect(stamp().textContent).toBe('now')

    scroller.scrollTop = scroller.scrollHeight
    await expect.poll(() => stamp().textContent, { timeout: 2000 }).toBe('1 minute ago')
  })
})
