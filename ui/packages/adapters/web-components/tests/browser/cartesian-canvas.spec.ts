// 数据层画在画布上：元素在作者的绘图区前面生成垫层 svg 与画布，切回 svg 时撤掉；画布上的柱取 SVG 同部件的计算颜色，
// 键盘进来落到焦点代理。像素只在 Chromium 里画得出来。
import type { XhCartesianChartElement } from '../../src/elements/cartesian-chart'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createColumnStore } from '../../src'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const hosts: HTMLElement[] = []

afterEach(() => {
  for (const host of hosts.splice(0))
    host.remove()
})

async function frames(count = 4): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(renderer: string): XhCartesianChartElement {
  const host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.innerHTML = `
    <xh-cartesian-chart renderer="${renderer}" animated="false" locale="en-US">
      <figure data-xh-part="root">
        <figcaption data-xh-part="caption">销售额</figcaption>
        <div data-xh-part="viewport"><svg data-xh-part="plot"></svg><div data-xh-part="empty"></div></div>
      </figure>
    </xh-cartesian-chart>`
  document.body.append(host)
  hosts.push(host)
  const chart = host.firstElementChild as XhCartesianChartElement
  chart.data = [
    { month: '一月', online: 100 },
    { month: '二月', online: 200 },
    { month: '三月', online: 150 },
  ]
  chart.series = [{ mark: 'bar', x: 'month', y: 'online', name: '线上' }]
  return chart
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
  it('元素在绘图区前面生成垫层与画布；画布上每根柱的颜色与 SVG 柱的计算填充色一致；切回 svg 撤掉', async () => {
    const svg = mount('svg')
    const chart = mount('canvas')
    await frames()
    expect(chart.currentRenderer).toBe('canvas')
    const viewport = part(chart, 'viewport')[0]!
    expect([...viewport.children].slice(0, 3).map(el => el.getAttribute('data-part'))).toEqual(['underlay', 'canvas', 'plot'])
    const canvas = part(chart, 'canvas')[0] as unknown as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    const scale = canvas.width / canvas.clientWidth
    for (const bar of part(svg, 'bar')) {
      const box = bar.getBoundingClientRect()
      const origin = part(svg, 'viewport')[0]!.getBoundingClientRect()
      const x = Math.round((box.left + box.width / 2 - origin.left) * scale)
      const y = Math.round((box.top + box.height / 2 - origin.top) * scale)
      const got = [...ctx.getImageData(x, y, 1, 1).data]
      const want = rgba(getComputedStyle(bar).fill)
      expect(got.every((v, i) => Math.abs(v - want[i]!) <= 3)).toBe(true)
    }
    chart.renderer = 'svg'
    await frames()
    expect(part(chart, 'canvas')).toHaveLength(0)
    expect(part(chart, 'underlay')).toHaveLength(0)
    expect(part(chart, 'bar')).toHaveLength(3)
  })

  it('键盘进来落到第一根柱的焦点代理，方向键换到下一根', async () => {
    const chart = mount('canvas')
    await frames()
    part(chart, 'plot')[0]!.focus()
    await frames()
    expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toBe('一月, 线上 100')
    await userEvent.keyboard('{ArrowRight}')
    await frames()
    expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toBe('二月, 线上 200')
  })
})

describe('列式数据', () => {
  it('列式数据的 K 线总是画在画布上；焦点代理中心的画布颜色就是它自己的涨跌色，方向键逐根走', async () => {
    const chart = mount('auto')
    const n = 40
    const cols = { t: new Float64Array(n), open: new Float64Array(n), high: new Float64Array(n), low: new Float64Array(n), close: new Float64Array(n) }
    for (let i = 0; i < n; i++) {
      cols.t[i] = Date.UTC(2026, 0, 5) + i * 86_400_000
      cols.open[i] = 50 + (i % 9)
      cols.close[i] = cols.open[i]! + (i % 2 ? 4 : -4)
      cols.high[i] = Math.max(cols.open[i]!, cols.close[i]!) + 2
      cols.low[i] = Math.min(cols.open[i]!, cols.close[i]!) - 2
    }
    chart.xAxis = { scale: 'utc', ordinal: true }
    chart.series = [{ mark: 'candlestick', x: 't', open: 'open', high: 'high', low: 'low', close: 'close', name: '收盘' }]
    chart.data = createColumnStore({ fields: Object.keys(cols), columns: cols })
    await frames()
    expect(chart.currentRenderer).toBe('canvas')
    const canvas = part(chart, 'canvas')[0] as unknown as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    const scale = canvas.width / canvas.clientWidth
    part(chart, 'plot')[0]!.focus()
    await frames()
    for (const trend of ['fall', 'rise']) {
      const proxy = document.activeElement as HTMLElement
      expect(proxy.getAttribute('data-part')).toBe('candle')
      expect(proxy.getAttribute('data-trend')).toBe(trend)
      const box = proxy.getBoundingClientRect()
      const origin = part(chart, 'viewport')[0]!.getBoundingClientRect()
      const got = [...ctx.getImageData(Math.round((box.left + box.width / 2 - origin.left) * scale), Math.round((box.top + box.height / 2 - origin.top) * scale), 1, 1).data]
      const want = rgba(getComputedStyle(proxy).fill)
      expect(got.every((v, i) => Math.abs(v - want[i]!) <= 3)).toBe(true)
      await userEvent.keyboard('{ArrowRight}')
      await frames()
    }
  })
})
