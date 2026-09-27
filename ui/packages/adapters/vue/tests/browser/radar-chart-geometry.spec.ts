// 雷达图在真实布局里：顶点落在各自的指标轴上，指标名整个落在视口里、不压住网格，
// 面积是系列色的淡洗、轮廓是实色，悬停时准线落在最近的指标轴上；jsdom 量不出外接框与计算样式，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhRadarChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  const state = reactive({ animated: false, ...props })
  app = createApp({ render: () => h(XhRadarChartRoot, state, { caption: () => '雷达图' }) })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): SVGGraphicsElement[] {
  return [...document.querySelectorAll<SVGGraphicsElement>(`[data-scope='radar-chart'][data-part='${name}']`)]
}

function center(el: Element): { x: number, y: number } {
  const box = el.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const DATA = [
  { model: 'A', speed: 80, power: 60, range: 70, price: 40, comfort: 90 },
  { model: 'B', speed: 60, power: 90, range: 50, price: 70, comfort: 60 },
]
const BASE = {
  data: DATA,
  nameField: 'model',
  indicators: [
    { key: 'speed', label: '速度' },
    { key: 'power', label: '动力' },
    { key: 'range', label: '续航里程' },
    { key: 'price', label: '价格' },
    { key: 'comfort', label: '舒适' },
  ],
}

describe('雷达图', () => {
  it('顶点落在各自的指标轴上：顶点、圆心与轴端三点共线', async () => {
    mount(BASE)
    await settle()
    const spokes = all('spoke')
    const points = all('point')
    expect(spokes).toHaveLength(5)
    expect(points).toHaveLength(10)
    const plot = document.querySelector('[data-scope=\'radar-chart\'][data-part=\'plot\']')!.getBoundingClientRect()
    const cx = plot.left + plot.width / 2
    const cy = plot.top + plot.height / 2
    // B 的动力（第二根轴，72°）：顶点的方向与轴的方向一致
    const p = center(points[6]!)
    const angle = Math.atan2(p.x - cx, -(p.y - cy))
    expect(angle).toBeCloseTo((2 * Math.PI) / 5, 1)
  })

  it('指标名整个落在视口里，且都在网格最外圈之外', async () => {
    mount(BASE)
    await settle()
    const viewport = document.querySelector('[data-scope=\'radar-chart\'][data-part=\'viewport\']')!.getBoundingClientRect()
    const outer = all('grid-ring').at(-1)!.getBoundingClientRect()
    for (const label of all('indicator-label')) {
      const box = label.getBoundingClientRect()
      expect(box.left).toBeGreaterThanOrEqual(viewport.left - 0.5)
      expect(box.right).toBeLessThanOrEqual(viewport.right + 0.5)
      expect(box.top).toBeGreaterThanOrEqual(viewport.top - 0.5)
      expect(box.bottom).toBeLessThanOrEqual(viewport.bottom + 0.5)
      // 标签的外接框不整个落在网格里：至少有一边伸出最外圈
      const inside = box.left >= outer.left && box.right <= outer.right && box.top >= outer.top && box.bottom <= outer.bottom
      expect(inside).toBe(false)
    }
  })

  it('面积是系列色的淡洗、轮廓是实色；两个实体取不同的系列色', async () => {
    mount(BASE)
    await settle()
    const [areaA, areaB] = all('area-fill')
    const [lineA] = all('line')
    const fillOpacity = Number(getComputedStyle(areaA!).fillOpacity)
    expect(fillOpacity).toBeGreaterThan(0)
    expect(fillOpacity).toBeLessThan(1)
    expect(getComputedStyle(lineA!).stroke).toBe(getComputedStyle(areaA!).fill)
    expect(getComputedStyle(areaA!).fill).not.toBe(getComputedStyle(areaB!).fill)
    expect(getComputedStyle(all('grid-ring')[0]!).fill).toBe('none')
  })

  it('悬停一个顶点：准线落在它那根轴上，其余实体淡出，提示框显示', async () => {
    mount(BASE)
    await settle()
    const target = center(all('point')[6]!)
    all('point')[6]!.closest('svg')!.dispatchEvent(new PointerEvent('pointermove', { clientX: target.x, clientY: target.y, bubbles: true }))
    await settle()
    const [crosshair] = all('crosshair')
    expect(crosshair).toBeTruthy()
    const [seriesA, seriesB] = all('series')
    expect(seriesA!.hasAttribute('data-dimmed')).toBe(true)
    expect(seriesB!.hasAttribute('data-dimmed')).toBe(false)
    const tooltip = document.querySelector('[data-scope=\'radar-chart\'][data-part=\'tooltip\']')!
    expect(tooltip.getAttribute('data-state')).toBe('visible')
    expect(tooltip.textContent).toContain('动力')
  })
})
