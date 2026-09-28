// 关系图的预设布局、连线上的字与受控视图在真实布局里：节点按坐标等比摆放，连线上的字落在两端圆心的中点、
// 描一圈承载面色把线断开且不接指针；受控视图由宿主写回后画面才放大。jsdom 量不出外接框与计算样式，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhGraphChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): Record<string, unknown> {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  const state = reactive<Record<string, unknown>>({ animated: false, locale: 'en-US', ...props })
  app = createApp({ render: () => h(XhGraphChartRoot, state, { caption: () => '拓扑' }) })
  app.mount(host)
  return state
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

function center(el: Element): { x: number, y: number } {
  const b = el.getBoundingClientRect()
  return { x: b.left + b.width / 2, y: b.top + b.height / 2 }
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const NODES = [
  { id: 'a', name: 'Edge', x: 0, y: 0 },
  { id: 'b', name: 'Core', x: 200, y: 0 },
  { id: 'c', name: 'Store', x: 0, y: 100 },
]
const LINKS = [{ source: 'a', target: 'b', label: 'uplink' }, { source: 'a', target: 'c' }]

describe('关系图的预设布局与连线上的字', () => {
  it('节点按坐标等比摆放：横向跨度是纵向的两倍', async () => {
    mount({ nodes: NODES, links: LINKS, layout: 'preset' })
    await settle()
    await expect.poll(() => all('node').length).toBe(3)
    const [a, b, c] = ['Edge', 'Core', 'Store'].map(name => center(nodeNamed(name)))
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(0.5)
    expect(Math.abs(a!.x - c!.x)).toBeLessThan(0.5)
    expect((b!.x - a!.x) / (c!.y - a!.y)).toBeCloseTo(2, 1)
  })

  it('连线上的字落在两端圆心的中点，描一圈承载面色，不接指针', async () => {
    mount({ nodes: NODES, links: LINKS, layout: 'preset' })
    await settle()
    await expect.poll(() => all('link-label').length).toBe(1)
    const label = all('link-label')[0]!
    expect(label.textContent).toBe('uplink')
    const [a, b] = ['Edge', 'Core'].map(name => center(nodeNamed(name)))
    const at = center(label)
    expect(Math.abs(at.x - (a!.x + b!.x) / 2)).toBeLessThan(1)
    expect(Math.abs(at.y - (a!.y + b!.y) / 2)).toBeLessThan(1.5)
    const style = getComputedStyle(label)
    expect(style.paintOrder).toContain('stroke')
    expect(Number.parseFloat(style.strokeWidth)).toBeGreaterThan(0)
    expect(style.pointerEvents).toBe('none')
    // 次级文字色：与节点名字分出主次
    expect(style.fill).not.toBe(getComputedStyle(all('node-label')[0]!).fill)
  })

  it('受控视图：宿主写回放大后的视图，节点之间的距离跟着翻倍', async () => {
    const state = mount({ nodes: NODES, links: LINKS, layout: 'preset', zoom: true, view: { k: 1, x: 0, y: 0 } })
    await settle()
    await expect.poll(() => all('node').length).toBe(3)
    const before = center(nodeNamed('Core')).x - center(nodeNamed('Edge')).x
    state.view = { k: 2, x: -320, y: -100 }
    await settle()
    await expect.poll(() => center(nodeNamed('Core')).x - center(nodeNamed('Edge')).x).toBeCloseTo(before * 2, 0)
    expect(all('plot')[0]!.hasAttribute('data-zoomed')).toBe(true)
  })
})
