// 列式数据：百万点的折线画在画布上，绘图区里只有系列分组与样式探针；键盘进来落到焦点代理（折线是前景的点，
// K 线与柱是它自己的 SVG 版本），代理的位置上画布的颜色就是它自己的颜色；悬停在绘图区里弹出提示框、准线在垫层。
// jsdom 画不出像素，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { createColumnStore, XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const apps: App[] = []
const hosts: HTMLElement[] = []
const DAY = 86_400_000
const T0 = Date.UTC(2026, 0, 5)

function mount(props: Record<string, unknown>, width = 480): { host: HTMLElement, state: Record<string, unknown> } {
  const host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  const state = reactive({ animated: false, locale: 'en-US', ...props })
  const app = createApp({ render: () => h(XhCartesianChartRoot, state, { caption: () => '采集曲线' }) })
  app.mount(host)
  apps.push(app)
  hosts.push(host)
  return { host, state }
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function part(host: Element, name: string): HTMLElement[] {
  return [...host.querySelectorAll<HTMLElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)]
}

function rgba(css: string): [number, number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  return [...ctx.getImageData(0, 0, 1, 1).data] as [number, number, number, number]
}

function pixel(canvas: HTMLCanvasElement, x: number, y: number): [number, number, number, number] {
  const scale = canvas.width / canvas.clientWidth
  return [...canvas.getContext('2d')!.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data] as [number, number, number, number]
}

function near(a: readonly number[], b: readonly number[], tolerance = 3): boolean {
  return a.every((v, i) => Math.abs(v - (b[i] as number)) <= tolerance)
}

function centerIn(el: Element): { x: number, y: number } {
  const box = el.getBoundingClientRect()
  const origin = el.closest('[data-part="viewport"]')!.getBoundingClientRect()
  return { x: box.left + box.width / 2 - origin.left, y: box.top + box.height / 2 - origin.top }
}

/** n 个点的采集曲线：两段正弦叠加，由序号算出。 */
function samples(n: number): ReturnType<typeof createColumnStore> {
  const t = new Float64Array(n)
  const v = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    t[i] = T0 + i * 1000
    v[i] = 50 + Math.sin(i / 5000) * 30 + Math.sin(i / 37) * 5
  }
  return createColumnStore({ fields: ['t', 'v'], columns: { t, v } })
}

/** n 根日 K 与成交量：收盘交替涨跌。 */
function market(n: number): ReturnType<typeof createColumnStore> {
  const cols = { t: new Float64Array(n), open: new Float64Array(n), high: new Float64Array(n), low: new Float64Array(n), close: new Float64Array(n) }
  for (let i = 0; i < n; i++) {
    const open = 50 + (i % 9)
    const close = open + (i % 2 ? 4 : -4)
    cols.t[i] = T0 + i * DAY
    cols.open[i] = open
    cols.close[i] = close
    cols.high[i] = Math.max(open, close) + 2
    cols.low[i] = Math.min(open, close) - 2
  }
  return createColumnStore({ fields: Object.keys(cols), columns: cols })
}

afterEach(async () => {
  for (const app of apps.splice(0))
    app.unmount()
  for (const host of hosts.splice(0))
    host.remove()
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('百万点折线', () => {
  it('画在画布上，绘图区里只有系列分组与样式探针；键盘进来落到前景的点，点下的画布是折线的描边色', async () => {
    const { host } = mount({ data: samples(1_000_000), series: [{ mark: 'line', x: 't', y: 'v', name: '振动' }], xAxis: { scale: 'utc' } })
    await settle()
    const canvas = part(host, 'canvas')[0] as HTMLCanvasElement
    expect(canvas.hasAttribute('data-empty')).toBe(false)
    const plot = part(host, 'plot')[0]!
    expect(plot.querySelectorAll('*').length).toBeLessThan(40)
    const probe = part(plot, 'line')[0]!
    expect(probe.getAttribute('aria-hidden')).toBe('true')

    plot.focus()
    await settle()
    const point = document.activeElement as HTMLElement
    expect(point.getAttribute('data-part')).toBe('point')
    expect(point.getAttribute('aria-label')).toMatch(/振动 \d/)
    const at = centerIn(point)
    // 点在最左一列：这一列里的上万个点降采样成一段竖线，点落在这段上
    expect(near(pixel(canvas, at.x, at.y), rgba(getComputedStyle(probe).stroke), 12)).toBe(true)
    // End 跳到最后一个点：焦点代理换到最右一列
    await userEvent.keyboard('{End}')
    await settle()
    const last = document.activeElement as HTMLElement
    expect(last.getAttribute('data-part')).toBe('point')
    expect(last.getAttribute('aria-label')).not.toBe(point.getAttribute('aria-label'))
    const end = centerIn(last)
    expect(end.x - at.x).toBeGreaterThan(300)
    // 线在最后一个点处收尾，端点那一列是半个线帽：抽内侧一个像素
    expect(near(pixel(canvas, end.x - 1, end.y), rgba(getComputedStyle(probe).stroke), 12)).toBe(true)
  })

  it('悬停在绘图区中部：提示框显示这一点的值，准线画在垫层', async () => {
    const { host } = mount({ data: samples(200_000), series: [{ mark: 'line', x: 't', y: 'v', name: '振动' }], xAxis: { scale: 'utc' } })
    await settle()
    const plot = part(host, 'plot')[0]!
    const box = plot.getBoundingClientRect()
    await userEvent.hover(plot, { position: { x: box.width / 2, y: box.height / 2 } })
    await settle()
    expect(part(host, 'tooltip')[0]!.getAttribute('data-state')).toBe('visible')
    expect(part(part(host, 'underlay')[0]!, 'crosshair')).toHaveLength(1)
    expect(part(host, 'tooltip-row')).toHaveLength(1)
  })
})

describe('日 K 线', () => {
  it('焦点代理是它自己的 SVG 版本：代理中心的画布颜色就是它的涨跌色，方向键逐根走', async () => {
    const series = [{ mark: 'candlestick', x: 't', open: 'open', high: 'high', low: 'low', close: 'close', name: '收盘' }]
    const { host } = mount({ data: market(60), series, xAxis: { scale: 'utc', ordinal: true } })
    await settle()
    const canvas = part(host, 'canvas')[0] as HTMLCanvasElement
    part(host, 'plot')[0]!.focus()
    await settle()
    for (const trend of ['fall', 'rise']) {
      const proxy = document.activeElement as HTMLElement
      expect(proxy.getAttribute('data-part')).toBe('candle')
      expect(proxy.getAttribute('data-trend')).toBe(trend)
      const at = centerIn(proxy)
      expect(near(pixel(canvas, at.x, at.y), rgba(getComputedStyle(proxy).fill))).toBe(true)
      await userEvent.keyboard('{ArrowRight}')
      await settle()
    }
  })
})

describe('流式', () => {
  it('数据仓追加：窗口跟着末端走、数据表跟着长；键盘把焦点移回开头后停止跟随并派发 update:follow', async () => {
    const store = createColumnStore({ fields: ['t', 'v'] })
    for (let i = 0; i < 200; i++)
      store.append({ t: T0 + i * 1000, v: 50 + Math.sin(i / 9) * 10 })
    const windows: number[][] = []
    const follows: boolean[] = []
    const { host } = mount({
      'data': store,
      'series': [{ mark: 'line', x: 't', y: 'v', name: '价格' }],
      'xAxis': { scale: 'utc' },
      'zoom': 'x',
      'defaultWindow': { x: [new Date(T0 + 150 * 1000), new Date(T0 + 199 * 1000)], y: null },
      'onWindowChange': (details: { window: { x: Date[] | null } }) => windows.push((details.window.x ?? []).map(d => d.valueOf())),
      'onUpdate:follow': (follow: boolean) => follows.push(follow),
    })
    await settle()
    for (let i = 200; i < 210; i++)
      store.append({ t: T0 + i * 1000, v: 50 })
    await settle()
    // 十次追加在同一帧里合成一次刷新：窗口只挪一次，右端落在最新的点上
    expect(windows).toEqual([[T0 + 160 * 1000, T0 + 209 * 1000]])
    expect(host.querySelectorAll('[data-part="table"] tbody tr')).toHaveLength(210)
    part(host, 'plot')[0]!.focus()
    await settle()
    await userEvent.keyboard('{Home}')
    await settle()
    expect(follows).toEqual([false])
  })
})
