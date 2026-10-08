// 数据层画在画布上：同一张图 svg 与画布各挂一份，逐个在柱、K 线、折线的位置上抽画布的像素，
// 对照 SVG 同一个部件的计算颜色——亮暗主题、强制色、淡出与作者覆盖的系列色都要一致；
// 垫层在画布之下、绘图区在上，键盘进来落到焦点代理，后备尺寸按 DPR。jsdom 画不出像素，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const apps: App[] = []
const hosts: HTMLElement[] = []

const SALES = [
  { month: '一月', online: 100, store: 60 },
  { month: '二月', online: 200, store: 90 },
  { month: '三月', online: 150, store: 120 },
]
const BARS = [
  { mark: 'bar', x: 'month', y: 'online', name: '线上' },
  { mark: 'bar', x: 'month', y: 'store', name: '门店' },
]

function mount(props: Record<string, unknown>, width = 480): { host: HTMLElement, state: Record<string, unknown> } {
  const host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  const state = reactive({ animated: false, locale: 'en-US', ...props })
  const app = createApp({ render: () => h(XhCartesianChartRoot, state, { caption: () => '销售额' }) })
  app.mount(host)
  apps.push(app)
  hosts.push(host)
  return { host, state }
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
  // 重绘排在宿主提交之后的微任务里：再让一帧
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function part(host: Element, name: string): HTMLElement[] {
  return [...host.querySelectorAll<HTMLElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)]
}

/** 任一 CSS 颜色串在这台浏览器上画出来的 RGBA 字节。 */
function rgba(css: string): [number, number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  return [...ctx.getImageData(0, 0, 1, 1).data] as [number, number, number, number]
}

/** 画布在某个 CSS 像素位置（相对画布左上角）上的 RGBA。 */
function pixel(canvas: HTMLCanvasElement, x: number, y: number): [number, number, number, number] {
  const scale = canvas.width / canvas.clientWidth
  const ctx = canvas.getContext('2d')!
  return [...ctx.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data] as [number, number, number, number]
}

function near(a: readonly number[], b: readonly number[], tolerance = 3): boolean {
  return a.every((v, i) => Math.abs(v - (b[i] as number)) <= tolerance)
}

/** SVG 模式下某个部件的中心相对它所在视口的坐标：两张图同尺寸，画布铺满视口，这就是画布坐标。 */
function centerIn(el: Element): { x: number, y: number } {
  const box = el.getBoundingClientRect()
  const origin = el.closest('[data-part="viewport"]')!.getBoundingClientRect()
  return { x: box.left + box.width / 2 - origin.left, y: box.top + box.height / 2 - origin.top }
}

afterEach(async () => {
  for (const app of apps.splice(0))
    app.unmount()
  for (const host of hosts.splice(0))
    host.remove()
  document.documentElement.removeAttribute('data-theme')
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('分层与结构', () => {
  it('画布模式：视口里依次是垫层 svg、画布、绘图区；网格与坐标轴在垫层，系列分组只剩样式探针', async () => {
    const { host } = mount({ data: SALES, series: BARS, renderer: 'canvas' })
    await settle()
    const viewport = part(host, 'viewport')[0]!
    const layers = [...viewport.children].map(el => el.getAttribute('data-part'))
    expect(layers.slice(0, 3)).toEqual(['underlay', 'canvas', 'plot'])
    expect(part(part(host, 'underlay')[0]!, 'grid')).toHaveLength(1)
    const plot = part(host, 'plot')[0]!
    expect(part(plot, 'series')).toHaveLength(2)
    for (const probe of part(plot, 'bar')) {
      expect(probe.getAttribute('aria-hidden')).toBe('true')
      expect(probe.getBoundingClientRect().width).toBe(0)
    }
    const canvas = part(host, 'canvas')[0] as HTMLCanvasElement
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
    expect(canvas.width).toBe(Math.round(canvas.clientWidth * devicePixelRatio))
    expect(canvas.height).toBe(Math.round(canvas.clientHeight * devicePixelRatio))
  })
})

describe('画布的颜色取自 CSS', () => {
  /** 对照：svg 与画布各挂一份，逐根柱在画布上抽像素，与 SVG 柱的计算填充色比。 */
  async function compareBars(extra: Record<string, unknown> = {}): Promise<void> {
    const svg = mount({ data: SALES, series: BARS, renderer: 'svg', ...extra })
    const canvasChart = mount({ data: SALES, series: BARS, renderer: 'canvas', ...extra })
    await settle()
    const canvas = part(canvasChart.host, 'canvas')[0] as HTMLCanvasElement
    const bars = part(svg.host, 'bar')
    expect(bars).toHaveLength(6)
    for (const bar of bars) {
      const { x, y } = centerIn(bar)
      const want = rgba(getComputedStyle(bar).fill)
      expect(near(pixel(canvas, x, y), want), `柱 ${bar.getAttribute('aria-label')} 在画布上的颜色`).toBe(true)
    }
    // 柱上方是空白：画布透明
    const top = centerIn(bars[0]!)
    expect(pixel(canvas, top.x, 2)[3]).toBe(0)
  }

  it('亮色主题：每根柱的颜色与 SVG 的计算填充色一致', async () => {
    await compareBars()
  })

  it('暗色主题：祖先换主题后画布重画，颜色跟着 CSS 换', async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    await compareBars()
  })

  it('祖先写了配色方案：画布与 SVG 同样取方案的色槽', async () => {
    document.documentElement.setAttribute('data-xh-chart-palette', 'muted')
    try {
      await compareBars()
    }
    finally {
      document.documentElement.removeAttribute('data-xh-chart-palette')
    }
  })

  it('图表自身改写配色方案：画布跟着重画', async () => {
    const { host } = mount({ data: SALES, series: BARS, renderer: 'canvas' })
    await settle()
    const canvas = part(host, 'canvas')[0] as HTMLCanvasElement
    const root = part(host, 'root')[0]!
    // 第一个系列的第一根柱：画布上只有数据层，靠下的一行里从左数第一块不透明像素就落在它身上
    const probe = part(host, 'bar')[0]!
    const row = canvas.clientHeight - 24
    let column = 0
    while (column < canvas.clientWidth && pixel(canvas, column, row)[3] !== 255)
      column++
    expect(column).toBeLessThan(canvas.clientWidth)
    const before = pixel(canvas, column + 3, row)
    expect(near(before, rgba(getComputedStyle(probe).fill))).toBe(true)
    root.setAttribute('data-xh-chart-palette', 'monochrome')
    await settle()
    const after = pixel(canvas, column + 3, row)
    expect(near(after, before)).toBe(false)
    expect(near(after, rgba(getComputedStyle(probe).fill))).toBe(true)
  })

  it('作者在系列上覆盖系列色：画布同样取覆盖后的颜色', async () => {
    const style = document.createElement('style')
    style.textContent = `[data-scope='cartesian-chart'][data-part='series'][data-series-id='store'] { --xh-cartesian-chart-series-color: rgb(200, 30, 90); }`
    document.head.append(style)
    try {
      await compareBars()
    }
    finally {
      style.remove()
    }
  })

  it('强制色：画布上的柱用系统色（与 SVG 柱的计算填充色相同）', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    const svg = mount({ data: SALES, series: BARS, renderer: 'svg' })
    const canvasChart = mount({ data: SALES, series: BARS, renderer: 'canvas' })
    await settle()
    const canvas = part(canvasChart.host, 'canvas')[0] as HTMLCanvasElement
    const bar = part(svg.host, 'bar')[1]!
    // 强制色下柱改用纹理填充：纹理的线与轮廓都取 CanvasText，线与线之间透空；画布上柱里凡是不透明的像素都该是系统前景色
    const systemText = rgba(getComputedStyle(part(svg.host, 'pattern-line')[0]!).stroke)
    const seriesColor = rgba(getComputedStyle(part(svg.host, 'series')[0]!).getPropertyValue('--xh-_chart-series'))
    const box = bar.getBoundingClientRect()
    const origin = part(svg.host, 'viewport')[0]!.getBoundingClientRect()
    const opaque: number[][] = []
    for (let y = box.top + 3; y < box.bottom - 3; y += 2) {
      for (let x = box.left + 3; x < box.right - 3; x += 2) {
        const p = pixel(canvas, x - origin.left, y - origin.top)
        if (p[3] > 40)
          opaque.push(p)
      }
    }
    // 线只有一两个像素宽，抗锯齿后不一定满不透明：按颜色通道比，不比 alpha
    const rgb = (p: readonly number[]): number[] => p.slice(0, 3)
    expect(opaque.length, JSON.stringify({ systemText, sample: opaque.slice(0, 5) })).toBeGreaterThan(0)
    expect(opaque.every(p => near(rgb(p), rgb(systemText), 12))).toBe(true)
    expect(opaque.some(p => near(rgb(p), rgb(seriesColor), 12))).toBe(false)
  })

  it('涨跌两种 K 线：实体分别取涨色与跌色', async () => {
    const data = [
      { d: '1', o: 10, h: 14, l: 9, c: 13 },
      { d: '2', o: 13, h: 13.5, l: 8, c: 9 },
    ]
    const series = [{ mark: 'candlestick', x: 'd', open: 'o', high: 'h', low: 'l', close: 'c', name: 'K' }]
    const svg = mount({ data, series, renderer: 'svg' })
    const canvasChart = mount({ data, series, renderer: 'canvas' })
    await settle()
    const canvas = part(canvasChart.host, 'canvas')[0] as HTMLCanvasElement
    const candles = part(svg.host, 'candle')
    expect(candles.map(c => c.getAttribute('data-trend'))).toEqual(['rise', 'fall'])
    for (const candle of candles) {
      const { x, y } = centerIn(candle)
      expect(near(pixel(canvas, x, y), rgba(getComputedStyle(candle).fill))).toBe(true)
    }
  })

  it('折线：线上的点取折线的描边色', async () => {
    const series = [{ mark: 'line', x: 'month', y: 'online', name: '线上' }]
    const svg = mount({ data: SALES, series, renderer: 'svg' })
    const canvasChart = mount({ data: SALES, series, renderer: 'canvas' })
    await settle()
    const canvas = part(canvasChart.host, 'canvas')[0] as HTMLCanvasElement
    const line = part(svg.host, 'line')[0] as unknown as SVGPathElement
    const total = line.getTotalLength()
    const at = line.getPointAtLength(total * 0.25)
    // 绘图区的 svg 与画布都铺满视口：svg 的用户坐标就是画布的 CSS 坐标
    const sample = pixel(canvas, at.x, at.y)
    expect(near(sample, rgba(getComputedStyle(line).stroke), 8)).toBe(true)
  })
})

describe('淡出', () => {
  it('悬停图例项：其余系列的分组淡出，画布跟着读分组的不透明度重画', async () => {
    const { host } = mount({ data: SALES, series: BARS, renderer: 'canvas' })
    const svg = mount({ data: SALES, series: BARS, renderer: 'svg' })
    await settle()
    const canvas = part(host, 'canvas')[0] as HTMLCanvasElement
    const storeBar = part(svg.host, 'bar')[3]!
    const at = centerIn(storeBar)
    const before = pixel(canvas, at.x, at.y)
    expect(before[3]).toBe(255)
    await userEvent.hover(part(host, 'legend-item')[0]!)
    // 淡出是 CSS 过渡：等它走完
    await new Promise(resolve => setTimeout(resolve, 400))
    const group = part(part(host, 'plot')[0]!, 'series')[1]!
    const alpha = Number.parseFloat(getComputedStyle(group).opacity)
    expect(alpha).toBeLessThan(1)
    expect(Math.abs(pixel(canvas, at.x, at.y)[3] / 255 - alpha)).toBeLessThan(0.02)
  })
})

describe('键盘与焦点代理', () => {
  it('绘图区占 Tab 位；进来后焦点落在第一根柱的 SVG 代理上，方向键换到下一根', async () => {
    const { host } = mount({ data: SALES, series: BARS, renderer: 'canvas' })
    await settle()
    const plot = part(host, 'plot')[0]!
    expect(plot.getAttribute('tabindex')).toBe('0')
    plot.focus()
    await settle()
    const first = document.activeElement as HTMLElement
    expect(first.getAttribute('data-part')).toBe('bar')
    expect(first.getAttribute('aria-label')).toBe('一月, 线上 100')
    expect(first.closest('[data-part="series"]')?.getAttribute('data-series-id')).toBe('online')
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toBe('二月, 线上 200')
  })
})

describe('auto', () => {
  it('节点预算以内是 svg；数据变多越过预算就换成画布，绘图区节点不重建、焦点不丢', async () => {
    const small = Array.from({ length: 40 }, (_, i) => ({ x: i, y: i % 7 }))
    const { host, state } = mount({ data: small, series: [{ mark: 'scatter', x: 'x', y: 'y', name: '点' }] })
    await settle()
    expect(part(host, 'canvas')).toHaveLength(0)
    const plot = part(host, 'plot')[0]!
    state.data = Array.from({ length: 3500 }, (_, i) => ({ x: i, y: (i * 13) % 97 }))
    await settle()
    expect(part(host, 'canvas')).toHaveLength(1)
    expect(part(host, 'plot')[0]).toBe(plot)
    expect(part(plot, 'point').length).toBeLessThan(5)
  })
})
