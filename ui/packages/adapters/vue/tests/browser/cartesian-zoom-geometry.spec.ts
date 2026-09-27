import type { CartesianWindow } from '@xihan-ui/headless'
// 直角坐标图的缩放在真实浏览器里：Ctrl 滚轮被拦下并收窄窗口，缩放条与绘图区左右对齐，
// 拖手柄改窗口的一端，连续轴放大后系列按绘图区裁剪，触屏只拦能缩放的那个方向；
// jsdom 没有布局、量不出外接框与计算样式，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): CartesianWindow[] {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  const windows: CartesianWindow[] = []
  const state = reactive({ animated: false, onWindowChange: (details: { window: CartesianWindow }) => windows.push(details.window), ...props })
  app = createApp({ render: () => h(XhCartesianChartRoot, state, { caption: () => '缩放' }) })
  app.mount(host)
  return windows
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)!
}

function all(name: string): Element[] {
  return [...document.querySelectorAll(`[data-scope='cartesian-chart'][data-part='${name}']`)]
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

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月']
const BARS = {
  data: MONTHS.map((month, i) => ({ month, v: 10 + i })),
  series: [{ mark: 'bar', x: 'month', y: 'v' }],
  zoom: 'x',
}
const LINE = {
  data: Array.from({ length: 101 }, (_, i) => ({ t: i, v: Math.sin(i / 10) * 10 + 20 })),
  series: [{ mark: 'line', x: 't', y: 'v' }],
  zoom: 'x',
}

describe('缩放', () => {
  it('按住 Ctrl 滚轮：真实的滚轮事件被拦下，窗口以指针为中心收窄；不按 Ctrl 时不拦', async () => {
    const windows = mount(LINE)
    await settle()
    const scale = await mouseScale()
    const grid = part('grid').getBoundingClientRect()
    const at = { x: (grid.left + grid.width / 4) / scale, y: (grid.top + grid.height / 2) / scale }
    const seen: boolean[] = []
    part('plot').addEventListener('wheel', event => queueMicrotask(() => seen.push(event.defaultPrevented)))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseWheel', ...at, deltaX: 0, deltaY: 120 })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseWheel', ...at, deltaX: 0, deltaY: -120, modifiers: 2 })
    await settle()
    expect(seen).toEqual([false, true])
    expect(windows).toHaveLength(1)
    const { x } = windows[0]!
    expect(x.end - x.start).toBeLessThan(1)
    expect(x.start + (x.end - x.start) / 4).toBeCloseTo(0.25, 2)
  })

  it('缩放条与绘图区左右对齐，窗口画在它对着的那一段', async () => {
    mount({ ...BARS, defaultWindow: { x: { start: 0.25, end: 0.75 }, y: { start: 0, end: 1 } } })
    await settle()
    const grid = part('grid').getBoundingClientRect()
    const track = part('zoom-track').getBoundingClientRect()
    expect(track.left).toBeCloseTo(grid.left, 0)
    expect(track.right).toBeCloseTo(grid.right, 0)
    const win = part('zoom-window').getBoundingClientRect()
    expect(win.left - track.left).toBeCloseTo(track.width / 4, 0)
    expect(win.width).toBeCloseTo(track.width / 2, 0)
    // 手柄骑在窗口的两端，命中区补到与缩放条一样高的正方
    const [start, end] = all('zoom-handle').map(el => el.getBoundingClientRect())
    expect((start!.left + start!.right) / 2).toBeCloseTo(win.left, 0)
    expect((end!.left + end!.right) / 2).toBeCloseTo(win.right, 0)
    const hit = getComputedStyle(all('zoom-handle')[0]!, '::before')
    expect(Number.parseFloat(hit.width)).toBeGreaterThanOrEqual(track.height - 0.5)
  })

  it('真指针拖终点手柄往左：窗口的终点跟着走，柱只剩露出的类目', async () => {
    const windows = mount({ ...BARS, defaultWindow: { x: { start: 0, end: 0.75 }, y: { start: 0, end: 1 } } })
    await settle()
    expect(all('bar')).toHaveLength(6)
    const scale = await mouseScale()
    const track = part('zoom-track').getBoundingClientRect()
    const end = all('zoom-handle')[1]!.getBoundingClientRect()
    const y = (end.top + end.height / 2) / scale
    const from = (end.left + end.width / 2) / scale
    const to = from - track.width / 4 / scale
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from, y })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, x: from, y })
    for (let i = 1; i <= 4; i++)
      await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', x: from + ((to - from) * i) / 4, y })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: to, y })
    await settle()
    expect(windows.at(-1)!.x.end).toBeCloseTo(0.5, 1)
    expect(all('bar')).toHaveLength(4)
    expect(part('zoom-slider').hasAttribute('data-dragging')).toBe(false)
  })

  it('连续轴放大后系列按绘图区裁剪：裁剪框就是网格占的那块', async () => {
    mount({ ...LINE, defaultWindow: { x: { start: 0.5, end: 1 }, y: { start: 0, end: 1 } } })
    await settle()
    const group = all('series')[0]!
    const ref = group.getAttribute('clip-path')!
    expect(ref).toMatch(/^url\(#.+\)$/)
    const clip = document.getElementById(ref.slice(5, -1))!
    expect(clip.localName).toBe('clipPath')
    // clipPath 里的矩形不渲染、量不出外接框：按属性加上绘图区的原点换算
    const rect = clip.querySelector('rect')!
    const svg = part('plot').getBoundingClientRect()
    const grid = part('grid').getBoundingClientRect()
    expect(svg.left + rect.x.baseVal.value).toBeCloseTo(grid.left, 0)
    expect(rect.width.baseVal.value).toBeCloseTo(grid.width, 0)
  })

  it('触屏只拦能缩放的方向：竖向图缩放 x 时竖着滑照常滚页面；横向图不出缩放条', async () => {
    mount(BARS)
    await settle()
    expect(getComputedStyle(part('plot')).touchAction).toBe('pan-y')
    app!.unmount()
    host!.remove()
    mount({ ...BARS, orientation: 'horizontal' })
    await settle()
    expect(getComputedStyle(part('plot')).touchAction).toBe('pan-x')
    expect(part('zoom-slider').hidden).toBe(true)
  })
})
