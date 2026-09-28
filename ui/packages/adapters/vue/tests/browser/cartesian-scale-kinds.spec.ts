// 直角坐标图的对称对数轴与按时区排的时间轴：真实布局里的刻度落点与标签文字。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCartesianChartRoot } from '../../src'
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

function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  app = createApp({ render: () => h(XhCartesianChartRoot, { animated: false, locale: 'en-US', ...props }, { caption: () => '图' }) })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)]
}

describe('直角坐标图的比例尺', () => {
  it('对称对数轴：负数与 0 都画得出，最矮那根正柱仍看得见', async () => {
    mount({
      data: [{ s: 'a', v: -1800 }, { s: 'b', v: 0 }, { s: 'c', v: 12 }, { s: 'd', v: 9600 }],
      series: [{ mark: 'bar', x: 's', y: 'v' }],
      yAxis: { scale: 'symlog' },
    })
    await settle()
    const bars = all('bar')
    expect(bars.length).toBe(4)
    const heights = bars.map(bar => bar.getBoundingClientRect().height)
    // 12 这一根在线性轴上不到一像素，对称对数轴上至少有几像素
    expect(heights[2]!).toBeGreaterThan(8)
    expect(all('root')[0]!.getAttribute('data-state')).not.toBe('error')
  })

  it('时间轴按东京排刻度：第一条刻度标签是东京的 3 月 2 日', async () => {
    mount({
      data: Array.from({ length: 5 }, (_, i) => ({ t: new Date(Date.UTC(2024, 2, 1, 15 + i * 24)), v: i + 1 })),
      series: [{ mark: 'line', x: 't', y: 'v' }],
      xAxis: { scale: 'utc', timeZone: 'Asia/Tokyo' },
    })
    await settle()
    const labels = all('tick-label').map(el => el.textContent?.trim() ?? '')
    expect(labels.some(text => /Mar 2|2\b/.test(text))).toBe(true)
    expect(labels.some(text => /Mar 1\b/.test(text))).toBe(false)
  })
})
