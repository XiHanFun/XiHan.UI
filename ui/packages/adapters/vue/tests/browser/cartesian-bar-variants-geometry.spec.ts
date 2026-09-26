// 直角坐标图柱的变体在真实布局里：瀑布的涨跌取涨跌色、小计保持系列色，连接线连着相邻两根柱。
// jsdom 量不出计算样式与外接框，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  const state = reactive({ animated: false, ...props })
  app = createApp({ render: () => h(XhCartesianChartRoot, state, { caption: () => '柱的变体' }) })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): SVGGraphicsElement[] {
  return [...document.querySelectorAll<SVGGraphicsElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)]
}

/** 把令牌解析成这台浏览器上的最终取值。 */
function tokenColor(token: string): string {
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.append(probe)
  document.body.append(svg)
  probe.style.setProperty('fill', `var(${token})`)
  const value = getComputedStyle(probe).fill
  svg.remove()
  return value
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('瀑布', () => {
  it('涨取涨色、跌取跌色，小计保持系列色；连接线的两端贴着相邻两根柱', async () => {
    mount({
      data: [
        { item: '收入', v: 500 },
        { item: '成本', v: -200 },
        { item: '毛利', total: true },
      ],
      series: [{ mark: 'bar', x: 'item', y: 'v', waterfall: { total: 'total' } }],
    })
    await settle()
    const [rise, fall, total] = all('bar')
    expect(getComputedStyle(rise!).fill).toBe(tokenColor('--xh-chart-rise'))
    expect(getComputedStyle(fall!).fill).toBe(tokenColor('--xh-chart-fall'))
    expect(getComputedStyle(total!).fill).toBe(tokenColor('--xh-chart-categorical-1'))
    const link = all('connector')[0]!.getBoundingClientRect()
    const a = rise!.getBoundingClientRect()
    const b = fall!.getBoundingClientRect()
    expect(link.left).toBeCloseTo(a.right, 0)
    expect(link.right).toBeCloseTo(b.left, 0)
    // 与上一步的终点同高：收入的顶端
    expect(Math.abs(link.top - a.top)).toBeLessThanOrEqual(1)
  })
})
