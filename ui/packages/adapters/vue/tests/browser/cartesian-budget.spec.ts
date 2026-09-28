// 大数据图表的主线程预算：百万点折线的首帧、缩放平移的一帧、悬停一帧、流式每帧、二十万点散点与十万根 K 线加成交量。
//
// 「画完」按画布上最后一次绘制调用的时刻算：把 2D 上下文的 stroke / fill / drawImage 包一层记下时间，
// 从赋数据（或换窗、派发指针事件）那一刻起到这个时刻为止，就是管线、框架提交与重画加起来的同步耗时。
// 流式按帧量：包一层 requestAnimationFrame 记下每一帧回调开始的时刻，一帧的耗时是它到这一帧里最后一次绘制。
// 数据仓在计时之外建好：量的是图表，不是造数据。本机按预算硬判；CI 共享 runner 慢，按 2 倍宽放并把实测数打进断言信息。
import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, inject, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { createColumnStore, XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SLACK = inject('ci') ? 2 : 1
/** Long Tasks API 的门槛。 */
const LONG_TASK_MS = 50
const T0 = Date.UTC(2026, 8, 1)

const apps: App[] = []
const hosts: HTMLElement[] = []

/** 画布上的每一次绘制调用的时刻。 */
const draws: number[] = []
type DrawMethod = 'stroke' | 'fill' | 'drawImage'
const METHODS: readonly DrawMethod[] = ['stroke', 'fill', 'drawImage']
const originals = new Map<DrawMethod, (...args: never[]) => unknown>()

beforeEach(() => {
  draws.length = 0
  const proto = CanvasRenderingContext2D.prototype as unknown as Record<DrawMethod, (...args: never[]) => unknown>
  for (const method of METHODS) {
    const original = proto[method]
    originals.set(method, original)
    proto[method] = function (this: CanvasRenderingContext2D, ...args: never[]) {
      draws.push(performance.now())
      return original.apply(this, args)
    }
  }
})

afterEach(() => {
  const proto = CanvasRenderingContext2D.prototype as unknown as Record<DrawMethod, (...args: never[]) => unknown>
  for (const [method, original] of originals)
    proto[method] = original
  for (const app of apps.splice(0))
    app.unmount()
  for (const host of hosts.splice(0))
    host.remove()
})

function mount(props: Record<string, unknown>): Record<string, unknown> {
  const host = document.createElement('div')
  host.style.inlineSize = '960px'
  document.body.append(host)
  const state = reactive({ animated: false, locale: 'en-US', ...props })
  const app = createApp({ render: () => h(XhCartesianChartRoot, state, { caption: () => '预算' }) })
  app.mount(host)
  apps.push(app)
  hosts.push(host)
  return state
}

function frame(): Promise<number> {
  return new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等画布画完：自 since 起有过绘制，且之后连续两帧没有新的绘制。返回最后一次绘制的时刻。 */
async function painted(since: number): Promise<number> {
  for (let i = 0; i < 120; i++) {
    const before = draws.length
    await frame()
    await frame()
    const last = draws.at(-1) ?? 0
    if (last >= since && draws.length === before)
      return last
  }
  throw new Error('画布一直没有画完')
}

function p95(samples: readonly number[]): number {
  const sorted = [...samples].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))]!
}

/** 一条 n 个点的折线数据仓：两段正弦叠加。 */
function wave(n: number): ReturnType<typeof createColumnStore> {
  const t = new Float64Array(n)
  const v = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    t[i] = T0 + i * 1000
    v[i] = 50 + Math.sin(i / 5000) * 30 + Math.sin(i / 37) * 5
  }
  return createColumnStore({ fields: ['t', 'v'], columns: { t, v } })
}

const LINE = [{ mark: 'line', x: 't', y: 'v', name: '读数' }]

describe('百万点折线', () => {
  it('赋数据到画布画完不超过 250ms；缩放平移的一帧 p95 不超过 16ms', async () => {
    const store = wave(1_000_000)
    const state = mount({ series: LINE, xAxis: { scale: 'utc' }, zoom: 'x' })
    await frame()
    await frame()
    const start = performance.now()
    state.data = store
    const first = (await painted(start)) - start
    expect(first, `首帧 ${first.toFixed(1)}ms`).toBeLessThanOrEqual(250 * SLACK)

    // 换窗：每次把十分之一宽的窗口往右挪一截，量从写入窗口到画完
    const span = 100_000 * 1000
    const samples: number[] = []
    for (let k = 0; k < 30; k++) {
      const a = T0 + k * 20_000 * 1000
      const at = performance.now()
      const before = draws.length
      state.window = { x: [new Date(a), new Date(a + span)], y: null }
      await nextTick()
      await frame()
      expect(draws.length).toBeGreaterThan(before)
      samples.push(draws.at(-1)! - at)
    }
    expect(p95(samples), `换窗 p95 ${p95(samples).toFixed(1)}ms`).toBeLessThanOrEqual(16 * SLACK)
  })

  it('悬停一帧：从指针事件到提示框内容就位不超过 4ms', async () => {
    const store = wave(1_000_000)
    const state = mount({ series: LINE, xAxis: { scale: 'utc' } })
    await frame()
    state.data = store
    await painted(0)
    const plot = document.querySelector<HTMLElement>('[data-scope="cartesian-chart"][data-part="plot"]')!
    const tooltip = document.querySelector<HTMLElement>('[data-scope="cartesian-chart"][data-part="tooltip"]')!
    const box = plot.getBoundingClientRect()
    const samples: number[] = []
    for (let k = 0; k < 20; k++) {
      const x = box.left + box.width * (0.2 + k * 0.03)
      const at = performance.now()
      plot.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: box.top + box.height / 2, pointerType: 'mouse', bubbles: true }))
      await nextTick()
      samples.push(performance.now() - at)
      expect(tooltip.getAttribute('data-state')).toBe('visible')
      await frame()
    }
    expect(p95(samples), `悬停 p95 ${p95(samples).toFixed(1)}ms`).toBeLessThanOrEqual(4 * SLACK)
  })
})

describe('流式', () => {
  it('容量十万、每帧追加一百行、连续 120 帧：每帧 p95 不超过 8ms，没有 50ms 以上的长任务', async () => {
    const store = createColumnStore({ fields: ['t', 'v'], capacity: 100_000 })
    for (let i = 0; i < 100_000; i++)
      store.append({ t: T0 + i * 1000, v: 50 + Math.sin(i / 37) * 5 })
    const state = mount({ series: LINE, xAxis: { scale: 'utc' }, zoom: 'x', defaultWindow: { x: [new Date(T0 + 90_000 * 1000), new Date(T0 + 99_999 * 1000)], y: null } })
    await frame()
    state.data = store
    await painted(0)

    const longTasks: number[] = []
    const observer = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(entry => entry.duration)))
    observer.observe({ type: 'longtask' })
    // 每一帧回调开始的时刻：一帧里所有回调共用同一个时间戳，按它分帧
    const starts: number[] = []
    const original = window.requestAnimationFrame
    let stamp = -1
    window.requestAnimationFrame = callback => original.call(window, (time) => {
      if (time !== stamp) {
        stamp = time
        starts.push(performance.now())
      }
      callback(time)
    })
    try {
      let next = 100_000
      for (let f = 0; f < 120; f++) {
        await frame()
        for (let r = 0; r < 100; r++, next++)
          store.append({ t: T0 + next * 1000, v: 50 + Math.sin(next / 37) * 5 })
      }
      await frame()
      await frame()
    }
    finally {
      window.requestAnimationFrame = original
      observer.disconnect()
    }
    // 一帧的耗时：这一帧的回调开始到这一帧里最后一次绘制
    const costs: number[] = []
    starts.forEach((start, i) => {
      const end = starts[i + 1] ?? Number.POSITIVE_INFINITY
      const last = draws.filter(t => t >= start && t < end).at(-1)
      if (last != null)
        costs.push(last - start)
    })
    expect(costs.length).toBeGreaterThan(100)
    expect(p95(costs), `每帧 p95 ${p95(costs).toFixed(1)}ms`).toBeLessThanOrEqual(8 * SLACK)
    expect(longTasks.filter(d => d >= LONG_TASK_MS * SLACK), `长任务 ${longTasks.map(d => d.toFixed(0)).join(', ')}`).toEqual([])
  })
})

describe('散点与 K 线', () => {
  it('二十万点散点：赋数据到画完不超过 300ms', async () => {
    const n = 200_000
    const x = new Float64Array(n)
    const y = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      x[i] = Math.sin(i * 12.9898) * 43758.5453 % 1000
      y[i] = Math.cos(i * 78.233) * 12345.6789 % 500
    }
    const store = createColumnStore({ fields: ['x', 'y'], columns: { x, y } })
    const state = mount({ series: [{ mark: 'scatter', x: 'x', y: 'y', name: '样本' }] })
    await frame()
    const start = performance.now()
    state.data = store
    const cost = (await painted(start)) - start
    expect(cost, `散点首帧 ${cost.toFixed(1)}ms`).toBeLessThanOrEqual(300 * SLACK)
  })

  it('十万根 K 线加十万根成交量（等距轴）：赋数据到两张图画完不超过 200ms', async () => {
    const n = 100_000
    const cols = { t: new Float64Array(n), open: new Float64Array(n), high: new Float64Array(n), low: new Float64Array(n), close: new Float64Array(n), volume: new Float64Array(n) }
    let close = 100
    for (let i = 0; i < n; i++) {
      const open = close
      close = Math.max(1, open + Math.sin(i / 7) * 0.8 + Math.sin(i / 131) * 0.5)
      cols.t[i] = T0 + i * 60_000
      cols.open[i] = open
      cols.close[i] = close
      cols.high[i] = Math.max(open, close) + 0.4
      cols.low[i] = Math.min(open, close) - 0.4
      cols.volume[i] = 1000 + Math.abs(close - open) * 800
    }
    const store = createColumnStore({ fields: Object.keys(cols), columns: cols })
    const axis = { scale: 'utc', ordinal: true }
    const kline = mount({ series: [{ mark: 'candlestick', x: 't', open: 'open', high: 'high', low: 'low', close: 'close', name: '价格' }], xAxis: axis, yAxis: { minSize: 64 } })
    const volume = mount({ series: [{ mark: 'bar', x: 't', y: 'volume', name: '成交量', trend: ['open', 'close'] }], xAxis: axis, yAxis: { minSize: 64 } })
    await frame()
    const start = performance.now()
    kline.data = store
    volume.data = store
    const cost = (await painted(start)) - start
    expect(cost, `K 线加成交量首帧 ${cost.toFixed(1)}ms`).toBeLessThanOrEqual(200 * SLACK)
  })
})
