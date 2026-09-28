// 数据层画在画布上：绘图区部件在前面渲出垫层 svg 与画布，画布上每根柱的颜色与 SVG 柱的计算颜色一致；
// 渲染器切换时绘图区的 svg 不重建。像素只在 Chromium 里画得出来。
import type { Root } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createColumnStore, XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SALES = [
  { month: '一月', online: 100 },
  { month: '二月', online: 200 },
  { month: '三月', online: 150 },
]
const SERIES = [{ mark: 'bar', x: 'month', y: 'online', name: '线上' }] as const

const mounted: Array<{ host: HTMLElement, root: Root }> = []

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false))
afterEach(() => {
  for (const { host, root } of mounted.splice(0)) {
    root.unmount()
    host.remove()
  }
  vi.unstubAllGlobals()
})

async function frames(count = 4): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(renderer: 'svg' | 'canvas'): { host: HTMLElement, rerender: (next: 'svg' | 'canvas') => void } {
  const host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  const root = createRoot(host)
  const render = (value: 'svg' | 'canvas'): void => flushSync(() => root.render(
    <XhCartesianChartRoot data={SALES} series={SERIES} renderer={value} animated={false} locale="en-US" caption="销售额" />,
  ))
  render(renderer)
  mounted.push({ host, root })
  return { host, rerender: render }
}

function part(el: Element, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-part='${name}']`)]
}

function rgba(css: string): number[] {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  return [...ctx.getImageData(0, 0, 1, 1).data]
}

describe('画布模式', () => {
  it('垫层、画布、绘图区依次排开；画布上每根柱的颜色与 SVG 柱一致；切回 svg 时绘图区不重建', async () => {
    const svg = mount('svg')
    const chart = mount('canvas')
    await frames()
    const viewport = part(chart.host, 'viewport')[0]!
    expect([...viewport.children].slice(0, 3).map(el => el.getAttribute('data-part'))).toEqual(['underlay', 'canvas', 'plot'])
    const canvas = part(chart.host, 'canvas')[0] as unknown as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    const scale = canvas.width / canvas.clientWidth
    for (const bar of part(svg.host, 'bar')) {
      const box = bar.getBoundingClientRect()
      const origin = part(svg.host, 'viewport')[0]!.getBoundingClientRect()
      const got = [...ctx.getImageData(Math.round((box.left + box.width / 2 - origin.left) * scale), Math.round((box.top + box.height / 2 - origin.top) * scale), 1, 1).data]
      const want = rgba(getComputedStyle(bar).fill)
      expect(got.every((v, i) => Math.abs(v - want[i]!) <= 3)).toBe(true)
    }
    const plot = part(chart.host, 'plot')[0]
    chart.rerender('svg')
    await frames()
    expect(part(chart.host, 'canvas')).toHaveLength(0)
    expect(part(chart.host, 'plot')[0]).toBe(plot)
    expect(part(chart.host, 'bar')).toHaveLength(3)
  })

  it('键盘进来落到第一根柱的焦点代理，方向键换到下一根', async () => {
    const chart = mount('canvas')
    await frames()
    part(chart.host, 'plot')[0]!.focus()
    await frames()
    expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toBe('一月, 线上 100')
    await userEvent.keyboard('{ArrowRight}')
    await frames()
    expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toBe('二月, 线上 200')
  })
})

describe('列式数据', () => {
  it('柱总是画在画布上；焦点代理中心的画布颜色就是它的系列色，方向键逐根走', async () => {
    const data = createColumnStore({ fields: ['day', 'online'], columns: { day: [1, 2, 3], online: [100, 200, 150] } })
    const host = document.createElement('div')
    host.style.inlineSize = '480px'
    document.body.append(host)
    const root = createRoot(host)
    flushSync(() => root.render(
      <XhCartesianChartRoot data={data} series={[{ mark: 'bar', x: 'day', y: 'online', name: '线上' }]} animated={false} locale="en-US" caption="销售额" />,
    ))
    mounted.push({ host, root })
    await frames()
    const canvas = part(host, 'canvas')[0] as unknown as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    const scale = canvas.width / canvas.clientWidth
    part(host, 'plot')[0]!.focus()
    await frames()
    for (const label of ['1, 线上 100', '2, 线上 200']) {
      const proxy = document.activeElement as HTMLElement
      expect(proxy.getAttribute('aria-label')).toBe(label)
      const box = proxy.getBoundingClientRect()
      const origin = part(host, 'viewport')[0]!.getBoundingClientRect()
      const got = [...ctx.getImageData(Math.round((box.left + box.width / 2 - origin.left) * scale), Math.round((box.top + box.height / 2 - origin.top) * scale), 1, 1).data]
      const want = rgba(getComputedStyle(proxy).fill)
      expect(got.every((v, i) => Math.abs(v - want[i]!) <= 3)).toBe(true)
      await userEvent.keyboard('{ArrowRight}')
      await frames()
    }
  })
})
