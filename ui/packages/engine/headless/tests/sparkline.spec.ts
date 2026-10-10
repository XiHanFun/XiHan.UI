// @vitest-environment jsdom
// 迷你图：取值与横坐标、缺失断开、参考带、标记点、柱与盈亏的几何、诊断、根的无障碍属性、摘要与过渡。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { LineMark, Mark, RectMark, SymbolMark } from '@xihan-ui/viz'
import type { SparklineApi, SparklineSchema } from '../src/sparkline'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectSparkline, defaultSparklineSummary, sparklineMachine } from '../src/sparkline'
import { installInViewRig } from './in-view-rig'

type Dict = Record<string, any>
type Props = Partial<SparklineSchema['props']>

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise<void>(r => queueMicrotask(r))
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.innerHTML = ''
})

const SVG_NS = 'http://www.w3.org/2000/svg'

interface Rig {
  service: Service<SparklineSchema>
  api: () => SparklineApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size: { width: number, height: number } | null = { width: 100, height: 24 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  // 几何用例看终态；过渡另有用例，显式打开 animated
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(sparklineMachine, { props: () => props.get(), runtime })
  const root = document.createElementNS(SVG_NS, 'svg')
  root.setAttribute('aria-label', '趋势')
  document.body.append(root)
  // 无布局环境量不到尺寸，原地伪造根的内容盒；size 为 null 时模拟服务端与首帧
  if (size) {
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: size.width })
    Object.defineProperty(root, 'clientHeight', { configurable: true, value: size.height })
    service.refs.set('getRootEl', () => root)
    service.refs.set('getViewportEl', () => root)
  }
  runtime.start()
  stops.push(() => runtime.stop())
  await settle()
  return {
    service,
    api: () => connectSparkline(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

function marks(api: SparklineApi, part: string): Mark[] {
  const { back, data, front } = api.scene.layers
  return [...back, ...data, ...front].filter(m => m.part === part)
}

function lineOf(api: SparklineApi): LineMark {
  return marks(api, 'line')[0] as LineMark
}

function captured(): DiagnosticRecord[] {
  const records: DiagnosticRecord[] = []
  stops.push(onDiagnostic(r => records.push(r)))
  return records
}

// 缺省度量：线宽 2、点 8、间隙 2；有标记点时四周留出点半径加外圈 = 5
const INSET = 5

describe('取值与布局', () => {
  it('数值数组按次序等距排开，纵向铺满留边后的高度，末点标出', async () => {
    const rig = await makeRig({ data: [1, 3, 2, 5] })
    const line = lineOf(rig.api())
    expect(line.points.map(p => p.x)).toEqual([INSET, INSET + 30, INSET + 60, 100 - INSET])
    expect(line.points[0]!.y).toBeCloseTo(24 - INSET)
    expect(line.points[3]!.y).toBeCloseTo(INSET)
    const dots = marks(rig.api(), 'dot') as SymbolMark[]
    expect(dots.map(d => [d.key, d.x, d.y])).toEqual([['dot:last', 100 - INSET, INSET]])
    expect((rig.api().getMarkProps(dots[0]!) as Dict)['data-marker']).toBe('last')
  })

  it('markers="none" 不标点，两端只留出线宽的一半', async () => {
    const rig = await makeRig({ data: [1, 3, 2, 5], markers: 'none' })
    expect(marks(rig.api(), 'dot')).toHaveLength(0)
    expect(lineOf(rig.api()).points.map(p => p.x)).toEqual([1, 1 + 98 / 3, 1 + 98 * 2 / 3, 99])
  })

  it('对象数组按 y 取值；x 是日期时按时间间距排开', async () => {
    const rig = await makeRig({
      data: [
        { day: new Date(2026, 0, 1), v: 1 },
        { day: new Date(2026, 0, 2), v: 2 },
        { day: new Date(2026, 0, 5), v: 3 },
      ],
      x: 'day',
      y: 'v',
    })
    const xs = lineOf(rig.api()).points.map(p => p.x)
    // 1 日到 2 日是 1 天，2 日到 5 日是 3 天
    expect((xs[2]! - xs[1]!) / (xs[1]! - xs[0]!)).toBeCloseTo(3)
  })

  it('x 是类目名时按次序等距', async () => {
    const rig = await makeRig({ data: [{ m: '一月', v: 1 }, { m: '二月', v: 4 }, { m: '三月', v: 2 }], x: 'm', y: 'v', markers: 'none' })
    const xs = lineOf(rig.api()).points.map(p => p.x)
    expect(xs[1]! - xs[0]!).toBeCloseTo(xs[2]! - xs[1]!)
  })

  it('缺失值让折线断开，不按 0 画；摘要不计缺失', async () => {
    const rig = await makeRig({ data: [1, null, 3, Number.NaN, 5] })
    expect(lineOf(rig.api()).points.map(p => p.defined)).toEqual([true, false, true, false, true])
    expect(rig.api().summary).toBe('3 points, ranging from 1 to 5. Last 5, up 400.0% from the first.')
  })

  it('全部相等时画在正中；extremes 没有最高最低可标，只标末点', async () => {
    const rig = await makeRig({ data: [4, 4, 4], markers: 'extremes' })
    expect(lineOf(rig.api()).points.every(p => Math.abs(p.y - 12) < 1e-9)).toBe(true)
    expect(marks(rig.api(), 'dot').map(d => d.key)).toEqual(['dot:last'])
    expect(rig.api().summary).toBe('3 points, all 4. Last 4, unchanged from the first.')
  })

  it('extremes 另标最高与最低；末点就是最高点时只标一次', async () => {
    const rig = await makeRig({ data: [3, 1, 4, 2], markers: 'extremes' })
    const kinds = (marks(rig.api(), 'dot') as SymbolMark[]).map(d => [d.key, d.datum!.index])
    expect(kinds).toEqual([['dot:last', 3], ['dot:max', 2], ['dot:min', 1]])
    rig.setProps({ data: [3, 1, 2, 4] })
    await settle()
    expect(marks(rig.api(), 'dot').map(d => d.key)).toEqual(['dot:last', 'dot:min'])
  })

  it('参考带画成一条横贯的底，纵向范围扩到把它包进来', async () => {
    const rig = await makeRig({ data: [2, 3], band: [0, 10], markers: 'none' })
    const band = marks(rig.api(), 'band')[0] as RectMark
    expect(band.x).toBe(0)
    expect(band.width).toBe(100)
    expect(band.y).toBeCloseTo(1)
    expect(band.y + band.height).toBeCloseTo(23)
    expect(rig.api().scene.layers.back).toContain(band)
  })
})

describe('柱与盈亏', () => {
  it('bar：纵向范围包含 0，正值从 0 往上、负值往下；末点那根柱带强调', async () => {
    const rig = await makeRig({ data: [2, -1, 3], variant: 'bar' })
    const bars = marks(rig.api(), 'bar') as RectMark[]
    const zero = 24 * 3 / 4
    expect(bars[0]!.y + bars[0]!.height).toBeCloseTo(zero)
    expect(bars[0]!.baseline).toBe('end')
    expect(bars[1]!.y).toBeCloseTo(zero)
    expect(bars[1]!.baseline).toBe('start')
    // 三格各宽 33.3，柱宽取柱厚上限，在格里居中
    bars.forEach((b, i) => expect(b.x + b.width / 2).toBeCloseTo((i + 0.5) * 100 / 3))
    const props = bars.map(b => rig.api().getMarkProps(b) as Dict)
    expect(props.map(p => p['data-marker'])).toEqual([undefined, undefined, 'last'])
  })

  it('bar：柱宽不超过柱厚上限；格子窄时两侧各留半个间隙', async () => {
    const rig = await makeRig({ data: [1, 2], variant: 'bar' })
    expect((marks(rig.api(), 'bar') as RectMark[]).map(b => b.width)).toEqual([24, 24])
    rig.setProps({ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })
    await settle()
    expect((marks(rig.api(), 'bar') as RectMark[]).map(b => b.width)).toEqual(Array.from({ length: 10 }).fill(8))
  })

  it('win-loss：只看正负，柱等高；0 与缺失不画；摘要报胜负', async () => {
    const rig = await makeRig({ data: [3, -2, 0, null, 7], variant: 'win-loss' })
    const bars = marks(rig.api(), 'bar') as RectMark[]
    expect(bars.map(b => b.datum!.index)).toEqual([0, 1, 4])
    expect(new Set(bars.map(b => b.height))).toEqual(new Set([11]))
    expect(bars.map(b => (rig.api().getMarkProps(b) as Dict)['data-trend'])).toEqual(['rise', 'fall', 'rise'])
    expect(bars[1]!.y).toBeCloseTo(13)
    expect(marks(rig.api(), 'dot')).toHaveLength(0)
    expect(rig.api().summary).toBe('4 results: 2 wins, 1 loss, 1 tie.')
  })

  it('win-loss 写了参考带或标记点：警告被忽略，照常画', async () => {
    const records = captured()
    const rig = await makeRig({ data: [1, -1], variant: 'win-loss', band: [0, 1], markers: 'extremes' })
    expect(records.filter(r => r.code === DIAGNOSTIC_CODES.warn && r.scope === 'sparkline')).toHaveLength(2)
    expect(marks(rig.api(), 'bar')).toHaveLength(2)
  })
})

describe('诊断', () => {
  it('对象数组没给 y：报未知字段，不画，根上 data-state="error"', async () => {
    const records = captured()
    const rig = await makeRig({ data: [{ v: 1 }, { v: 2 }] })
    expect(records.some(r => r.code === DIAGNOSTIC_CODES.chartUnknownField)).toBe(true)
    expect(rig.api().scene.layers.data).toHaveLength(0)
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
  })

  it('y 指向不存在的字段：报未知字段', async () => {
    const records = captured()
    await makeRig({ data: [{ v: 1 }], y: 'value' })
    expect(records.find(r => r.code === DIAGNOSTIC_CODES.chartUnknownField)?.detail).toEqual({ field: 'value' })
  })

  it('参考带下界大于上界：报区间不合法', async () => {
    const records = captured()
    const rig = await makeRig({ data: [1, 2], band: [5, 1] })
    expect(records.some(r => r.code === DIAGNOSTIC_CODES.chartInvalidRange)).toBe(true)
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
  })
})

describe('根与摘要', () => {
  it('根是 role="img"，描述指向摘要；形态与语气写在根上', async () => {
    const rig = await makeRig({ data: [1, 2], tone: 'success', variant: 'area' })
    const api = rig.api()
    const root = api.getRootProps() as Dict
    const summary = api.getSummaryProps() as Dict
    expect(root).toMatchObject({ 'role': 'img', 'data-variant': 'area', 'data-tone': 'success', 'viewBox': '0 0 100 24' })
    expect(root['aria-describedby']).toBe(summary.id)
    expect(root.tabindex).toBeUndefined()
    expect(marks(api, 'area-fill')).toHaveLength(1)
  })

  it('缺省形态 line、语气 neutral；没有数据时根上 data-state="empty"', async () => {
    const rig = await makeRig({ data: [] })
    expect(rig.api().getRootProps()).toMatchObject({ 'data-variant': 'line', 'data-tone': 'neutral', 'data-state': 'empty' })
    expect(rig.api().summary).toBe('No data.')
  })

  it('尚未测量时不画图形，摘要照常给出', async () => {
    const rig = await makeRig({ data: [1, 2, 3] }, null)
    expect(rig.api().measured).toBe(false)
    expect(rig.api().scene.layers.data).toHaveLength(0)
    expect(rig.api().summary).toBe('3 points, ranging from 1 to 3. Last 3, up 200.0% from the first.')
    expect((rig.api().getRootProps() as Dict).viewBox).toBeUndefined()
  })

  it('摘要的数值按 format 与 locale 写；文案可以整条替换', async () => {
    const rig = await makeRig({
      data: [1200, 900],
      locale: 'zh-CN',
      format: { style: 'currency', currency: 'CNY' },
      translations: { summary: m => `末值 ${m.last}，较首值${m.direction === 'down' ? '下降' : '上升'} ${m.change}` },
    })
    expect(rig.api().summary).toBe('末值 ¥900.00，较首值下降 25.0%')
  })

  it('缺省摘要：一个点、首值为 0 时不报变化率', () => {
    const base = { variant: 'line', min: '0', max: '5', first: '0', last: '5', wins: 0, losses: 0, ties: 0, reference: null } as const
    expect(defaultSparklineSummary({ ...base, count: 1, change: null, direction: null })).toBe('1 point: 5.')
    expect(defaultSparklineSummary({ ...base, count: 2, change: null, direction: 'up' })).toBe('2 points, ranging from 0 to 5. Last 5.')
  })
})

describe('过渡', () => {
  // 帧与时钟都由假计时器推进：requestAnimationFrame 每 16ms 一帧，performance.now 随之走
  const FRAMES: Parameters<typeof vi.useFakeTimers>[0] = { toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] }

  afterEach(() => vi.useRealTimers())

  it('入场：折线从头描到尾，末点等笔尖到了才出现；走完后撤掉描线标记', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({ data: [1, 3, 2, 5], markers: 'extremes', animated: true })
    const target = rig.api().model.scene!.scene
    const line = rig.api().getMarkProps(lineOf(rig.api())) as Dict
    expect(line).toMatchObject({ 'pathLength': 1, 'data-drawing': '' })
    const delayOf = (key: string): number => {
      const dot = marks(rig.api(), 'dot').find(m => m.key === key)!
      const props = rig.api().getMarkProps(dot) as Dict
      expect(props['data-drawing']).toBe('')
      return Number.parseFloat(props.style['--xh-_chart-reveal-at'])
    }
    expect(delayOf('dot:min')).toBeLessThan(delayOf('dot:last'))
    expect(delayOf('dot:last')).toBe(1)

    vi.advanceTimersByTime(2000)
    expect(rig.api().scene).toBe(target)
    expect((rig.api().getMarkProps(lineOf(rig.api())) as Dict)['data-drawing']).toBeUndefined()
  })

  it('入场：柱从基线长出', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({ data: [2, 4], variant: 'bar', animated: true })
    const start = marks(rig.api(), 'bar') as RectMark[]
    expect(start.every(b => b.height === 0 && Math.abs(b.y - 24) < 1e-9)).toBe(true)
    vi.advanceTimersByTime(2000)
    expect((marks(rig.api(), 'bar') as RectMark[]).map(b => b.height)).toEqual([12, 24])
  })

  it('数据更新：折线从旧位置插值到新位置，不再描线', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({ data: [1, 2, 3], markers: 'none', animated: true })
    vi.advanceTimersByTime(2000)
    rig.setProps({ data: [3, 2, 1] })
    await settle()
    vi.advanceTimersByTime(80)
    const mid = lineOf(rig.api())
    expect(mid.points[0]!.y).toBeLessThan(23)
    expect(mid.points[0]!.y).toBeGreaterThan(1)
    expect((rig.api().getMarkProps(mid) as Dict)['data-drawing']).toBeUndefined()
    vi.advanceTimersByTime(2000)
    expect(lineOf(rig.api()).points[0]!.y).toBeCloseTo(1)
  })

  it('进入视口才播：还没露出来时柱停在基线、根上 data-deferred，时钟不走；露出来才长出', async () => {
    const view = installInViewRig()
    try {
      vi.useFakeTimers(FRAMES)
      const rig = await makeRig({ data: [2, 4], variant: 'bar', animated: true })
      view.reportAll(false)
      vi.advanceTimersByTime(2000)
      expect((rig.api().getRootProps() as Dict)['data-deferred']).toBe('')
      expect((marks(rig.api(), 'bar') as RectMark[]).every(b => b.height === 0)).toBe(true)
      view.reportAll(true)
      expect((rig.api().getRootProps() as Dict)['data-deferred']).toBeUndefined()
      vi.advanceTimersByTime(2000)
      expect((marks(rig.api(), 'bar') as RectMark[]).map(b => b.height)).toEqual([12, 24])
    }
    finally {
      view.restore()
    }
  })
})

describe('参考线', () => {
  it('固定值：一条横贯的线落在那个值上，纵向范围扩到把它包进来', async () => {
    const rig = await makeRig({ data: [2, 3], reference: 10, markers: 'none' })
    const line = marks(rig.api(), 'reference-line')[0] as LineMark
    expect(line.points.map(p => p.x)).toEqual([0, 100])
    // 10 是最大值：落在上沿留出线宽一半的位置
    expect(line.points[0]!.y).toBeCloseTo(1)
    expect(rig.api().scene.layers.back).toContain(line)
  })

  it('mean / median 按有值的点算：缺失不计', async () => {
    const mean = await makeRig({ data: [1, null, 3, 8], reference: 'mean', markers: 'none', locale: 'en-US' })
    expect(mean.api().model.spec.reference).toBe(4)
    const median = await makeRig({ data: [1, null, 3, 8], reference: 'median', markers: 'none' })
    expect(median.api().model.spec.reference).toBe(3)
  })

  it('摘要里读出参考线的值；盈亏形态不画也不读', async () => {
    const rig = await makeRig({ data: [1, 5, 2], reference: 4, locale: 'en-US' })
    expect(rig.api().summary).toContain('Reference 4.')
    const winLoss = await makeRig({ data: [1, -1, 2], variant: 'win-loss', reference: 0, locale: 'en-US' })
    expect(marks(winLoss.api(), 'reference-line')).toHaveLength(0)
    expect(winLoss.api().summary).not.toContain('Reference')
  })

  it('不是有限数也不是 mean / median：报出区间问题', async () => {
    const rig = await makeRig({ data: [1, 2], reference: Number.NaN })
    expect(rig.api().model.issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartInvalidRange)
  })
})
