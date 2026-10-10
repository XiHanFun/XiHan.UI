// 图表进入视口才播入场：首屏以下的图停在入场第一帧，标记都在场、由样式播的关键帧停在起点，滚进视口才两半一起起跑；
// 关掉 animateInView 挂载即播。交叉观察、关键帧的暂停与起播只有 Chromium 量得出来。
import type { App, Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhCartesianChartRoot, XhHeatmapRoot, XhPieChartRoot, XhSparkline } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  window.scrollTo(0, 0)
})

// 时长拉长到几秒：起跑之后好几帧都还在半路，量得到「已经起跑、还没走完」
const SLOW = '--xh-motion-duration-reveal: 4s; --xh-motion-duration-enter: 4s'
const SALES = [
  { month: '一月', amount: 100 },
  { month: '二月', amount: 200 },
  { month: '三月', amount: 150 },
]
const MIXED = [{ mark: 'bar', x: 'month', y: 'amount' }, { mark: 'line', x: 'month', y: 'amount', id: 'trend' }]

async function frames(count: number): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 挂一张图；below 时前面垫一段两倍视口高的空白，图落在首屏以下。 */
function mount(component: Component, props: Record<string, unknown>, slots: Record<string, () => unknown> = {}, below = true): HTMLElement {
  host = document.createElement('div')
  if (below) {
    const spacer = document.createElement('div')
    spacer.style.blockSize = `${window.innerHeight * 2}px`
    host.append(spacer)
  }
  const at = document.createElement('div')
  at.style.inlineSize = '480px'
  host.append(at)
  document.body.append(host)
  app = createApp({ render: () => h(component, props, slots) })
  app.mount(at)
  return at
}

function part(at: HTMLElement, scope: string, name: string): HTMLElement[] {
  return [...at.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)]
}

/** 元素上由 CSS 起播的那段关键帧。 */
function keyframes(el: Element): CSSAnimation {
  const animation = el.getAnimations().find((a): a is CSSAnimation => a instanceof CSSAnimation)
  if (!animation)
    throw new Error('没有在播的关键帧')
  return animation
}

describe('直角坐标图', () => {
  it('首屏以下：柱停在基线、标记在场可聚焦，描线与数据点的关键帧停在起点；滚进视口两半一起起跑', async () => {
    const at = mount(XhCartesianChartRoot, { data: SALES, series: MIXED, animated: true, style: SLOW }, { caption: () => '月度销售额' })
    await frames(8)
    const [root] = part(at, 'cartesian-chart', 'root')
    expect(root!.hasAttribute('data-deferred')).toBe(true)
    const bars = part(at, 'cartesian-chart', 'bar')
    expect(bars.length).toBe(3)
    expect(bars.every(bar => bar.getBoundingClientRect().height <= 0.5)).toBe(true)
    expect(bars.some(bar => bar.tabIndex === 0)).toBe(true)
    const [line] = part(at, 'cartesian-chart', 'line')
    expect(line!.hasAttribute('data-drawing')).toBe(true)
    const draw = keyframes(line!)
    expect(draw.playState).toBe('paused')
    expect(draw.currentTime).toBe(0)
    expect(Number.parseFloat(getComputedStyle(line!).strokeDashoffset)).toBe(1)
    const dot = part(at, 'cartesian-chart', 'dot').at(-1)!
    expect(keyframes(dot).playState).toBe('paused')
    expect(Number(getComputedStyle(dot).opacity)).toBe(0)

    root!.scrollIntoView({ block: 'center' })
    await expect.poll(() => root!.hasAttribute('data-deferred')).toBe(false)
    expect(draw.playState).toBe('running')
    await expect.poll(() => Math.max(...bars.map(bar => bar.getBoundingClientRect().height))).toBeGreaterThan(0.5)
    await expect.poll(() => Number.parseFloat(getComputedStyle(line!).strokeDashoffset)).toBeLessThan(1)
  })

  it('挂载时就在视口里：不用滚，视口观察一报回来就起跑', async () => {
    const at = mount(XhCartesianChartRoot, { data: SALES, series: MIXED, animated: true, style: SLOW }, { caption: () => '月度销售额' }, false)
    const [root] = part(at, 'cartesian-chart', 'root')
    await expect.poll(() => part(at, 'cartesian-chart', 'line').length).toBe(1)
    await expect.poll(() => root!.hasAttribute('data-deferred')).toBe(false)
    expect(keyframes(part(at, 'cartesian-chart', 'line')[0]!).playState).toBe('running')
  })

  it('animateInView 为 false：首屏以下也挂载即播', async () => {
    const at = mount(XhCartesianChartRoot, { data: SALES, series: MIXED, animated: true, animateInView: false, style: SLOW }, { caption: () => '月度销售额' })
    await frames(8)
    const [root] = part(at, 'cartesian-chart', 'root')
    expect(root!.hasAttribute('data-deferred')).toBe(false)
    expect(keyframes(part(at, 'cartesian-chart', 'line')[0]!).playState).toBe('running')
    expect(Math.max(...part(at, 'cartesian-chart', 'bar').map(bar => bar.getBoundingClientRect().height))).toBeGreaterThan(0.5)
  })
})

describe('饼图', () => {
  it('首屏以下：环形中心的淡入停在起点、保持透明，滚进视口才开始等扫开', async () => {
    const at = mount(XhPieChartRoot, {
      data: [{ channel: '搜索', visits: 40 }, { channel: '直接访问', visits: 30 }],
      nameField: 'channel',
      valueField: 'visits',
      variant: 'donut',
      labels: 'none',
      animated: true,
      style: SLOW,
    }, { caption: () => '访问来源' })
    await frames(8)
    const [root] = part(at, 'pie-chart', 'root')
    const [center] = part(at, 'pie-chart', 'center')
    expect(root!.hasAttribute('data-deferred')).toBe(true)
    const fade = keyframes(center!)
    expect(fade.playState).toBe('paused')
    expect(Number(getComputedStyle(center!).opacity)).toBe(0)

    root!.scrollIntoView({ block: 'center' })
    await expect.poll(() => fade.playState).toBe('running')
    // 中心等整圈扫完才淡入：起跑之后仍是透明的
    expect(Number(getComputedStyle(center!).opacity)).toBe(0)
  })
})

describe('迷你图', () => {
  it('首屏以下：描线的关键帧停在起点，滚进视口才描', async () => {
    const at = mount(XhSparkline, { 'data': [1, 3, 2, 5], 'animated': true, 'style': SLOW, 'aria-label': '趋势' })
    await frames(8)
    const [root] = part(at, 'sparkline', 'root')
    const [line] = part(at, 'sparkline', 'line')
    expect(root!.hasAttribute('data-deferred')).toBe(true)
    const draw = keyframes(line!)
    expect(draw.playState).toBe('paused')

    root!.scrollIntoView({ block: 'center' })
    await expect.poll(() => draw.playState).toBe('running')
  })
})

describe('热力图', () => {
  it('首屏以下：有数据的格子停在空格底色，滚进视口才按先后填色', async () => {
    const at = mount(XhHeatmapRoot, {
      value: [{ date: '2024-01-03', count: 5 }],
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      animated: true,
      style: SLOW,
    })
    await frames(8)
    const [root] = part(at, 'heatmap', 'root')
    const cells = part(at, 'heatmap', 'cell')
    const filled = cells.find(cell => cell.getAttribute('data-level') !== '0')!
    const blank = cells.find(cell => cell.getAttribute('data-level') === '0')!
    expect(root!.hasAttribute('data-deferred')).toBe(true)
    const fill = keyframes(filled)
    expect(fill.playState).toBe('paused')
    expect(getComputedStyle(filled).backgroundColor).toBe(getComputedStyle(blank).backgroundColor)

    root!.scrollIntoView({ block: 'center' })
    await expect.poll(() => root!.hasAttribute('data-deferred')).toBe(false)
    expect(fill.playState).toBe('running')
  })
})
