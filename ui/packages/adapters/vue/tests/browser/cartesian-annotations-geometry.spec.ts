// 直角坐标图的注释在真实布局里：参考带在数据之下、参考线是结构色的虚线、平均线取系列色，
// 标签都落在视口里；jsdom 量不出计算样式与外接框，只在 Chromium 验证。
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
  app = createApp({ render: () => h(XhCartesianChartRoot, state, { caption: () => '注释' }) })
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

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const SALES = [
  { month: '一月', online: 100 },
  { month: '二月', online: 200 },
  { month: '三月', online: 150 },
  { month: '四月', online: 250 },
]

describe('注释', () => {
  it('参考带画在系列之前（被数据压着），参考线是虚线，平均线取系列色', async () => {
    mount({
      data: SALES,
      series: [{ mark: 'line', x: 'month', y: 'online' }],
      annotations: [
        { kind: 'band', axis: 'y', from: 120, to: 180 },
        { kind: 'line', axis: 'y', value: 300, label: '目标' },
        { kind: 'average', series: 'online' },
      ],
    })
    await settle()
    const [band, line, average] = all('annotation')
    const series = all('series')[0]!
    expect(band!.compareDocumentPosition(series) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(getComputedStyle(band!).fill).not.toBe('none')
    expect(getComputedStyle(line!).strokeDasharray).not.toBe('none')
    const seriesColor = getComputedStyle(all('line')[0]!).stroke
    expect(getComputedStyle(average!).stroke).toBe(seriesColor)
    expect(getComputedStyle(line!).stroke).not.toBe(seriesColor)
  })

  it('标签都落在视口里：贴着上沿的参考线的标签翻到线下', async () => {
    mount({
      data: SALES,
      series: [{ mark: 'line', x: 'month', y: 'online' }],
      annotations: [{ kind: 'line', axis: 'y', value: 300 }, { kind: 'point', series: 'online', at: 'max' }],
    })
    await settle()
    const plot = document.querySelector<SVGElement>(`[data-scope='cartesian-chart'][data-part='plot']`)!.getBoundingClientRect()
    const labels = all('annotation-label')
    expect(labels).toHaveLength(2)
    for (const label of labels) {
      const box = label.getBoundingClientRect()
      expect(box.top).toBeGreaterThanOrEqual(plot.top - 0.5)
      expect(box.right).toBeLessThanOrEqual(plot.right + 0.5)
    }
  })
})
