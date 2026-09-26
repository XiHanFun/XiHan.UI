// 直角坐标图的散点与气泡在真实布局里：点是可聚焦的标记、贴着定义域两端也不压在轴线上，
// 气泡的外接框与面积对得上，图例与提示框的色标画成点的形状，隐藏的裁切形状改为淡出。
// jsdom 量不出外接框与裁切，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>, width = 480): Record<string, unknown> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  const state = reactive({ animated: false, ...props })
  app = createApp({
    render: () => h(XhCartesianChartRoot, state, { caption: () => '散点' }),
  })
  app.mount(host)
  return state
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

const POINTS = [
  { x: 0, a: 0, b: 5 },
  { x: 5, a: 3, b: 1 },
  { x: 10, a: 10, b: 8 },
]

describe('散点', () => {
  it('点是 graphics-symbol，贴着定义域两端的点整个落在绘图区里、不压在坐标轴线上', async () => {
    mount({ data: POINTS, series: [{ mark: 'scatter', x: 'x', y: 'a' }] })
    await settle()
    const points = all('point')
    expect(points).toHaveLength(3)
    expect(points.every(p => p.getAttribute('role') === 'graphics-symbol')).toBe(true)
    const axis = all('axis-line')[0]!.getBoundingClientRect()
    const plot = document.querySelector<SVGElement>(`[data-scope='cartesian-chart'][data-part='plot']`)!.getBoundingClientRect()
    for (const p of points) {
      const box = p.getBoundingClientRect()
      expect(box.bottom).toBeLessThan(axis.top)
      expect(box.left).toBeGreaterThan(plot.left)
    }
  })

  it('键盘：Tab 落在第一个点上，方向键沿 x 走到下一个点', async () => {
    mount({ data: POINTS, series: [{ mark: 'scatter', x: 'x', y: 'a' }] })
    await settle()
    await userEvent.tab()
    await settle()
    const points = all('point')
    expect(document.activeElement).toBe(points[0])
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(document.activeElement?.getAttribute('data-key')).toBe(points[1]!.getAttribute('data-key'))
    // 焦点环按点的大小外扩，圆心落在点上
    const ring = all('focus-ring')[0]!.getBoundingClientRect()
    const own = (document.activeElement as SVGGraphicsElement).getBoundingClientRect()
    expect(ring.width).toBeGreaterThan(own.width)
    expect(ring.left + ring.width / 2).toBeCloseTo(own.left + own.width / 2, 0)
  })

  it('色标画成点的形状：第一个系列是圆，第二个系列按裁切多边形画成方块以外的形状时带裁切', async () => {
    mount({
      data: POINTS,
      series: [
        { mark: 'scatter', x: 'x', y: 'a' },
        { mark: 'scatter', x: 'x', y: 'b', symbol: 'diamond' },
      ],
    })
    await settle()
    const [circle, diamond] = all('legend-swatch') as unknown as HTMLElement[]
    expect(circle!.dataset.symbol).toBe('circle')
    expect(getComputedStyle(circle!).borderTopLeftRadius).toBe('50%')
    expect(getComputedStyle(diamond!).clipPath).toMatch(/^polygon\(/)
    // 隐藏的裁切形状画不出空心：改为淡出
    ;(all('legend-item')[1] as unknown as HTMLElement).click()
    await settle()
    expect(Number(getComputedStyle(diamond!).opacity)).toBeLessThan(1)
  })
})

describe('气泡', () => {
  it('外接框的面积之比等于大小之比，最大的直径是两倍柱厚上限', async () => {
    mount({
      data: [{ x: 1, y: 1, n: 100 }, { x: 2, y: 2, n: 400 }],
      series: [{ mark: 'scatter', x: 'x', y: 'y', size: 'n' }],
    })
    await settle()
    const [big, small] = all('point').map(p => p.getBBox())
    const barMax = Number.parseFloat(getComputedStyle(document.querySelector(`[data-scope='cartesian-chart'][data-part='root']`)!).getPropertyValue('--xh-_chart-metric-bar-max'))
    expect(big!.width).toBeCloseTo(barMax * 2, 0)
    expect((big!.width * big!.height) / (small!.width * small!.height)).toBeCloseTo(4, 1)
  })
})
