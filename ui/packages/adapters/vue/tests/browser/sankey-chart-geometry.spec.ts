// 桑基图在真实布局里：各列自左而右、流带落在两端的节点之间、名字不越出绘图区也不互相压住；
// 真指针悬停节点时相连的流带换成它的颜色、其余淡出；渐变流带的两端取两端节点的颜色；竖排时各列自上而下。
// jsdom 量不出外接框与计算样式，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhSankeyChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  const state = reactive({ animated: false, ...props })
  app = createApp({ render: () => h(XhSankeyChartRoot, state, { caption: () => '桑基图' }) })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): SVGGraphicsElement[] {
  return [...document.querySelectorAll<SVGGraphicsElement>(`[data-scope='sankey-chart'][data-part='${name}']`)]
}

function nodeNamed(name: string): SVGGraphicsElement {
  return all('node').find(n => n.getAttribute('aria-label')?.startsWith(`${name},`))!
}

/** CDP 的坐标是 CSS 像素乘页面缩放：先派一次移动量出比例。 */
async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const NODES = [
  { id: 'search', name: '搜索', group: '渠道' },
  { id: 'ads', name: '广告', group: '渠道' },
  { id: 'home', name: '首页', group: '页面' },
  { id: 'detail', name: '详情', group: '页面' },
  { id: 'order', name: '下单', group: '结果' },
  { id: 'leave', name: '离开', group: '结果' },
]
const LINKS = [
  { source: 'search', target: 'home', value: 300 },
  { source: 'ads', target: 'home', value: 200 },
  { source: 'ads', target: 'detail', value: 100 },
  { source: 'home', target: 'detail', value: 350 },
  { source: 'home', target: 'leave', value: 150 },
  { source: 'detail', target: 'order', value: 250 },
  { source: 'detail', target: 'leave', value: 200 },
]

describe('桑基图', () => {
  it('各列自左而右，流带落在两端的节点之间；名字不越出绘图区，也不互相压住', async () => {
    mount({ nodes: NODES, links: LINKS })
    await settle()
    const [search, home, detail, order] = ['搜索', '首页', '详情', '下单'].map(n => nodeNamed(n).getBoundingClientRect())
    expect(search!.right).toBeLessThan(home!.left)
    expect(home!.right).toBeLessThan(detail!.left)
    expect(detail!.right).toBeLessThan(order!.left)
    const link = all('link')[0]!.getBoundingClientRect()
    expect(link.left).toBeGreaterThanOrEqual(search!.right - 1)
    expect(link.right).toBeLessThanOrEqual(home!.left + 1)
    const plot = document.querySelector<SVGSVGElement>(`[data-scope='sankey-chart'][data-part='plot']`)!.getBoundingClientRect()
    const labels = all('node-label').map(l => l.getBoundingClientRect())
    expect(labels.length).toBe(6)
    for (const b of labels) {
      expect(b.left).toBeGreaterThanOrEqual(plot.left - 1)
      expect(b.right).toBeLessThanOrEqual(plot.right + 1)
    }
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i]!
        const b = labels[j]!
        const overlap = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1
        expect(overlap).toBe(false)
      }
    }
  })

  it('真指针悬停节点：相连的流带换成它的颜色，其余流带淡出', async () => {
    mount({ nodes: NODES, links: LINKS })
    // 淡出的过渡即时完成：断言的是悬停的稳定态，不是过渡中间帧。真实指针是整个浏览器共用的一颗，
    // 并行跑的别份用例随时会把它停回角落；悬停一落下、等 Vue 刷新一拍就读，不给挪走留窗口
    host!.style.setProperty('--xh-motion-duration-micro', '0ms')
    await settle()
    const scale = await mouseScale()
    const home = nodeNamed('首页')
    const box = home.getBoundingClientRect()
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: (box.left + box.width / 2) / scale, y: (box.top + box.height / 2) / scale })
    await nextTick()
    const links = all('link')
    const homeFill = getComputedStyle(home).fill
    // 0 搜索→首页 连着首页；2 广告→详情 不连
    expect(getComputedStyle(links[0]!).fill).toBe(homeFill)
    expect(Number(getComputedStyle(links[2]!).opacity)).toBeLessThan(1)
    expect(Number(getComputedStyle(links[0]!).opacity)).toBe(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
  })

  it('渐变流带：流带填渐变，两端的色标取两端节点的颜色', async () => {
    mount({ nodes: NODES, links: LINKS, linkColor: 'gradient' })
    await settle()
    const link = all('link')[4]!
    expect(getComputedStyle(link).fill).toMatch(/^url\(/)
    const id = /url\("?#([^")]+)"?\)/.exec(getComputedStyle(link).fill)![1]!
    const stops = [...document.getElementById(id)!.querySelectorAll('stop')]
    expect(getComputedStyle(stops[0]!).stopColor).toBe(getComputedStyle(nodeNamed('首页')).fill)
    expect(getComputedStyle(stops[1]!).stopColor).toBe(getComputedStyle(nodeNamed('离开')).fill)
  })

  it('竖排：各列自上而下', async () => {
    mount({ nodes: NODES, links: LINKS, orientation: 'vertical' })
    await settle()
    const [search, home, detail, order] = ['搜索', '首页', '详情', '下单'].map(n => nodeNamed(n).getBoundingClientRect())
    expect(search!.bottom).toBeLessThan(home!.top)
    expect(home!.bottom).toBeLessThan(detail!.top)
    expect(detail!.bottom).toBeLessThan(order!.top)
  })
})
