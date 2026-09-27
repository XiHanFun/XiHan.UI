// 关系图在真实布局里：力导的节点互不重叠、都在绘图区里，名字不互相压住；真指针拖动节点，它跟着指针、松手后留在原地；
// 开了 zoom 时按住 Ctrl 滚轮放大，节点之间拉开、大小不变；树的根在最左、叶子在最右。
// jsdom 量不出外接框与计算样式，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhGraphChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  const state = reactive({ animated: false, ...props })
  app = createApp({ render: () => h(XhGraphChartRoot, state, { caption: () => '关系图' }) })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): SVGGraphicsElement[] {
  return [...document.querySelectorAll<SVGGraphicsElement>(`[data-scope='graph-chart'][data-part='${name}']`)]
}

function nodeNamed(name: string): SVGGraphicsElement {
  return all('node').find(n => n.getAttribute('aria-label')?.startsWith(`${name},`))!
}

function center(el: Element): { x: number, y: number, r: number } {
  const b = el.getBoundingClientRect()
  return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: b.width / 2 }
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

const NODES = ['网关', '认证', '用户', '订单', '支付', '库存', '通知', '用户库', '订单库', '缓存', '消息队列'].map((name, i) => ({ id: `n${i}`, name, group: i < 2 ? '接入' : i < 7 ? '业务' : '数据' }))
const LINKS = [[0, 1], [0, 2], [0, 3], [3, 4], [3, 5], [3, 6], [4, 6], [2, 7], [3, 8], [2, 9], [3, 9], [6, 10], [4, 10]].map(([s, t]) => ({ source: `n${s}`, target: `n${t}` }))

describe('关系图', () => {
  it('力导：节点互不重叠、都在绘图区里；名字不互相压住', async () => {
    mount({ nodes: NODES, links: LINKS })
    await settle()
    const plot = document.querySelector(`[data-scope='graph-chart'][data-part='plot']`)!.getBoundingClientRect()
    const nodes = all('node').map(center)
    expect(nodes).toHaveLength(11)
    for (const n of nodes) {
      expect(n.x - n.r).toBeGreaterThanOrEqual(plot.left - 1)
      expect(n.x + n.r).toBeLessThanOrEqual(plot.right + 1)
      expect(n.y - n.r).toBeGreaterThanOrEqual(plot.top - 1)
      expect(n.y + n.r).toBeLessThanOrEqual(plot.bottom + 1)
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++)
        expect(Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y)).toBeGreaterThan(nodes[i]!.r + nodes[j]!.r)
    }
    const labels = all('node-label').map(l => l.getBoundingClientRect())
    expect(labels.length).toBeGreaterThan(5)
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i]!
        const b = labels[j]!
        expect(a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1).toBe(false)
      }
    }
  })

  it('真指针拖动节点：它跟着指针走，松手后留在放下的地方', async () => {
    mount({ nodes: NODES, links: LINKS })
    await settle()
    const scale = await mouseScale()
    const from = center(nodeNamed('网关'))
    const to = { x: from.x + 60, y: from.y + 30 }
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x / scale, y: from.y / scale })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, x: from.x / scale, y: from.y / scale })
    for (let i = 1; i <= 6; i++)
      await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', x: (from.x + (to.x - from.x) * i / 6) / scale, y: (from.y + (to.y - from.y) * i / 6) / scale })
    await settle()
    const dragged = center(nodeNamed('网关'))
    expect(Math.hypot(dragged.x - to.x, dragged.y - to.y)).toBeLessThan(2)
    expect(document.querySelector(`[data-scope='graph-chart'][data-part='plot']`)!.hasAttribute('data-dragging')).toBe(true)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: to.x / scale, y: to.y / scale })
    await settle()
    const dropped = center(nodeNamed('网关'))
    // 松手后模拟冷却，节点被连线拉回一点点，但不回到原处
    expect(Math.hypot(dropped.x - from.x, dropped.y - from.y)).toBeGreaterThan(30)
  })

  it('zoom：按住 Ctrl 滚轮放大，节点之间拉开、大小不变', async () => {
    mount({ nodes: NODES, links: LINKS, zoom: true, layout: 'circular' })
    await settle()
    const scale = await mouseScale()
    const a0 = center(nodeNamed('网关'))
    const b0 = center(nodeNamed('订单'))
    const plot = document.querySelector(`[data-scope='graph-chart'][data-part='plot']`)!.getBoundingClientRect()
    const mid = { x: plot.left + plot.width / 2, y: plot.top + plot.height / 2 }
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: mid.x / scale, y: mid.y / scale, deltaX: 0, deltaY: -300, modifiers: 2 })
    await settle()
    const a1 = center(nodeNamed('网关'))
    const b1 = center(nodeNamed('订单'))
    expect(Math.hypot(a1.x - b1.x, a1.y - b1.y)).toBeGreaterThan(Math.hypot(a0.x - b0.x, a0.y - b0.y) * 1.3)
    expect(a1.r).toBeCloseTo(a0.r, 0)
    expect(document.querySelector(`[data-scope='graph-chart'][data-part='plot']`)!.hasAttribute('data-zoomed')).toBe(true)
  })

  it('树：根在最左，叶子在最右', async () => {
    const people = ['总经理', '技术', '财务', '前端', '后端', '会计'].map((name, i) => ({ id: `p${i}`, name }))
    const reports = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]].map(([s, t]) => ({ source: `p${s}`, target: `p${t}` }))
    mount({ nodes: people, links: reports, layout: 'tree' })
    await settle()
    const root = center(nodeNamed('总经理'))
    const mid = center(nodeNamed('技术'))
    const leaf = center(nodeNamed('前端'))
    expect(root.x).toBeLessThan(mid.x)
    expect(mid.x).toBeLessThan(leaf.x)
    expect(center(nodeNamed('会计')).x).toBeCloseTo(leaf.x, 0)
  })
})
