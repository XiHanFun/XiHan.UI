// 雷达图各圈的数值：真实布局里写在 12 点方向那根轴右侧、贴着各圈，颜色取图表标注色。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhRadarChartRoot } from '../../src'
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

const people = [
  { name: 'A', a: 85, b: 92, c: 60, d: 70, e: 78 },
  { name: 'B', a: 58, b: 70, c: 90, d: 82, e: 64 },
]
const indicators = ['a', 'b', 'c', 'd', 'e'].map(key => ({ key, label: key.toUpperCase() }))

describe('雷达图各圈的数值', () => {
  it('共用量程：每一圈一个数，从内到外往上排，都在最上那根轴的右侧', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '480px'
    document.body.append(host)
    app = createApp({
      render: () => h(XhRadarChartRoot, { data: people, nameField: 'name', indicators, scale: 'shared', rings: 5, ringLabels: true, animated: false, locale: 'en-US' }, { caption: () => '能力' }),
    })
    app.mount(host)
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    const labels = [...document.querySelectorAll<SVGTextElement>("[data-scope='radar-chart'][data-part='ring-label']")]
    await expect.poll(() => document.querySelectorAll("[data-scope='radar-chart'][data-part='ring-label']").length).toBe(5)
    expect(labels.map(l => l.textContent)).toEqual(['20', '40', '60', '80', '100'])
    const tops = labels.map(l => l.getBoundingClientRect().top)
    expect(tops).toEqual([...tops].sort((x, y) => y - x))
    const spoke = document.querySelector<SVGElement>("[data-scope='radar-chart'][data-part='spoke']")!.getBoundingClientRect()
    for (const label of labels)
      expect(label.getBoundingClientRect().left).toBeGreaterThanOrEqual(spoke.left)
    expect(Number(getComputedStyle(labels[0]!).opacity)).toBeCloseTo(0.8)
  })
})
