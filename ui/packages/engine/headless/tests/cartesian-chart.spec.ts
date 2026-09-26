// @vitest-environment jsdom
// 直角坐标图：规格归一与诊断、柱与折线的几何、悬停命中与提示框、键盘导航、图例显隐、联动的激活键、通知去重与管线记忆。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { Mark, RectMark } from '@xihan-ui/viz'
import type { CartesianChartApi, CartesianChartSchema } from '../src/cartesian-chart'
import type { ChartDatumDetails } from '../src/shared/chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cartesianChartMachine, connectCartesianChart } from '../src/cartesian-chart'

type Dict = Record<string, any>
type Props = Partial<CartesianChartSchema['props']>

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise<void>(r => queueMicrotask(r))
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.innerHTML = ''
})

const DATA = [
  { month: '一月', online: 120, offline: 80 },
  { month: '二月', online: 200, offline: 100 },
  { month: '三月', online: 150, offline: null },
]

interface Rig {
  service: Service<CartesianChartSchema>
  api: () => CartesianChartApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size = { width: 400, height: 240 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(cartesianChartMachine, { props: () => props.get(), runtime })
  const root = document.createElement('figure')
  const viewport = document.createElement('div')
  root.append(viewport)
  document.body.append(root)
  // 无布局环境量不到尺寸，原地伪造视口的内容盒
  Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: size.width })
  Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: size.height })
  service.refs.set('getRootEl', () => root)
  service.refs.set('getViewportEl', () => viewport)
  runtime.start()
  stops.push(() => runtime.stop())
  await settle()
  return {
    service,
    api: () => connectCartesianChart(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

function walk(marks: readonly Mark[], out: Mark[] = []): Mark[] {
  for (const mark of marks) {
    out.push(mark)
    if (mark.kind === 'group')
      walk(mark.children, out)
  }
  return out
}

function marksOf(api: CartesianChartApi, part: string): Mark[] {
  return walk([...api.scene.layers.back, ...api.scene.layers.data]).filter(m => m.part === part)
}

const BARS: Props = {
  data: DATA,
  series: [{ mark: 'bar', x: 'month', y: 'online', name: '线上' }, { mark: 'bar', x: 'month', y: 'offline', name: '线下' }],
}

describe('规格与诊断', () => {
  it('系列 id 缺省取 y 字段名，色槽按声明顺序分配，自变量保持首次出现的次序', async () => {
    const rig = await makeRig(BARS)
    const api = rig.api()
    expect(api.legendItems.map(i => [i.id, i.name, i.slot])).toEqual([['online', '线上', 1], ['offline', '线下', 2]])
    expect(api.model.spec.keys).toEqual(['一月', '二月', '三月'])
    expect(api.model.spec.keyScale).toBe('band')
  })

  it('字段拼错、id 重复时报诊断，根上 data-state="error" 且不画标记', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => seen.push(record)))
    const rig = await makeRig({ data: DATA, series: [{ mark: 'bar', x: 'month', y: 'onlin' }, { mark: 'line', x: 'month', y: 'onlin' }] })
    const api = rig.api()
    expect((api.getRootProps() as Dict)['data-state']).toBe('error')
    expect(api.measured).toBe(false)
    expect(seen.map(r => r.code)).toEqual(expect.arrayContaining([DIAGNOSTIC_CODES.chartUnknownField, DIAGNOSTIC_CODES.chartDuplicateSeries]))
  })

  it('对数轴的数值含 0 时报 log-domain', async () => {
    const rig = await makeRig({ data: [{ x: 'a', y: 0 }, { x: 'b', y: 10 }], series: [{ mark: 'line', x: 'x', y: 'y' }], yAxis: { scale: 'log' } })
    expect(rig.api().model.issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartLogDomain)
  })
})

describe('柱', () => {
  it('分组柱：每个键两根，厚度不超过上限，间隔一道表面间隙，基线在下端', async () => {
    const rig = await makeRig(BARS)
    const bars = marksOf(rig.api(), 'bar') as RectMark[]
    // 三月的线下是缺失值：不画，也不按 0 处理
    expect(bars).toHaveLength(5)
    for (const bar of bars) {
      expect(bar.width).toBeLessThanOrEqual(24)
      expect(bar.baseline).toBe('end')
    }
    const [a, b] = bars.filter(bar => bar.key.endsWith(':0'))
    expect(b!.x - (a!.x + a!.width)).toBeCloseTo(2)
    // 柱高与数值成比例（同一根基线）
    const jan = bars.find(bar => bar.key === 'online:0')!
    const feb = bars.find(bar => bar.key === 'online:1')!
    expect(feb.height / jan.height).toBeCloseTo(200 / 120, 1)
  })

  it('堆叠：同一列的段首尾相接留出间隙，只有最外层的段做圆角', async () => {
    const rig = await makeRig({
      data: DATA,
      series: [{ mark: 'bar', x: 'month', y: 'online', stack: 's' }, { mark: 'bar', x: 'month', y: 'offline', stack: 's' }],
    })
    const bars = marksOf(rig.api(), 'bar') as RectMark[]
    const low = bars.find(bar => bar.key === 'online:0')!
    const high = bars.find(bar => bar.key === 'offline:0')!
    expect(high.x).toBe(low.x)
    expect(low.cornerRadius).toBe(0)
    expect(high.cornerRadius).toBeGreaterThan(0)
    expect(low.y - (high.y + high.height)).toBeCloseTo(2, 5)
  })

  it('百分比堆叠：数值轴定义域是 [0, 1]', async () => {
    const rig = await makeRig({
      data: DATA,
      series: [{ mark: 'bar', x: 'month', y: 'online', stack: 's', stackOffset: 'expand' }, { mark: 'bar', x: 'month', y: 'offline', stack: 's', stackOffset: 'expand' }],
    })
    expect(rig.api().model.domains.value).toEqual([0, 1])
    expect(rig.api().model.domains.percent).toBe(true)
  })

  it('横向：自变量竖排，柱沿 x 长，基线在左端', async () => {
    const rig = await makeRig({ ...BARS, orientation: 'horizontal' })
    const bars = marksOf(rig.api(), 'bar') as RectMark[]
    const first = bars.find(bar => bar.key === 'online:0')!
    const second = bars.find(bar => bar.key === 'online:1')!
    expect(first.baseline).toBe('start')
    expect(second.y).toBeGreaterThan(first.y)
    expect(second.width).toBeGreaterThan(first.width)
  })

  it('同一堆叠组的 stackOffset 不一致时报诊断', async () => {
    const rig = await makeRig({
      data: DATA,
      series: [{ mark: 'bar', x: 'month', y: 'online', stack: 's', stackOffset: 'expand' }, { mark: 'bar', x: 'month', y: 'offline', stack: 's', stackOffset: 'none' }],
    })
    expect(rig.api().model.issues.map(i => i.code)).toContain(DIAGNOSTIC_CODES.chartStackOffsetConflict)
  })
})

describe('折线', () => {
  const LINES: Props = {
    data: DATA,
    series: [{ mark: 'line', x: 'month', y: 'online' }, { mark: 'line', x: 'month', y: 'offline', area: true }],
  }

  it('一条系列一条折线，缺失值处断开；面积画在折线之下', async () => {
    const rig = await makeRig(LINES)
    const lines = marksOf(rig.api(), 'line')
    expect(lines).toHaveLength(2)
    const offline = lines.find(l => l.key === 'offline:line')!
    expect(offline.kind === 'line' && offline.points.map(p => p.defined)).toEqual([true, true, false])
    expect(marksOf(rig.api(), 'area-fill')).toHaveLength(1)
  })

  it('connectNulls：缺失值不断开，直接略过', async () => {
    const rig = await makeRig({ data: DATA, series: [{ mark: 'line', x: 'month', y: 'offline', connectNulls: true }] })
    const line = marksOf(rig.api(), 'line')[0]!
    expect(line.kind === 'line' && line.points).toHaveLength(2)
  })

  it('横向面积以 x0 为基线', async () => {
    const rig = await makeRig({ ...LINES, orientation: 'horizontal' })
    const area = marksOf(rig.api(), 'area-fill')[0]!
    expect(area.kind === 'area' && area.orientation).toBe('horizontal')
    expect(area.kind === 'area' && area.points.every(p => p.x0 !== undefined)).toBe(true)
  })

  it('点间距够宽时逐点画 marker，symbols: none 时不画', async () => {
    const rig = await makeRig(LINES)
    expect(marksOf(rig.api(), 'dot').length).toBeGreaterThan(0)
    rig.setProps({ series: [{ mark: 'line', x: 'month', y: 'online', symbols: 'none' }] })
    await settle()
    expect(marksOf(rig.api(), 'dot')).toHaveLength(0)
  })
})

describe('悬停、提示框与记忆', () => {
  it('悬停命中一个键：axis 模式提示框列出该键的全部系列，柱图的准线是整条类目带', async () => {
    const rig = await makeRig(BARS)
    const bar = marksOf(rig.api(), 'bar').find(m => m.key === 'online:1') as RectMark
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'online', index: 1 }, x: bar.x + 1, y: bar.y + 1 }, key: '二月' })
    await settle()
    const api = rig.api()
    expect(api.tooltip?.header).toBe('二月')
    expect(api.tooltip?.rows.map(r => [r.seriesId, r.value])).toEqual([['online', '200'], ['offline', '100']])
    expect(api.overlay.under.map(m => m.part)).toEqual(['crosshair'])
    expect((api.getMarkProps(api.overlay.under[0]!) as Dict)['data-kind']).toBe('band')
    expect((api.getTooltipProps() as Dict)['data-state']).toBe('visible')
  })

  it('悬停与离开不让管线重算：场景是同一个对象', async () => {
    const rig = await makeRig(BARS)
    const before = rig.api().scene
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'online', index: 0 }, x: 10, y: 10 }, key: '一月' })
    await settle()
    rig.service.send({ type: 'HOVER.CLEAR' })
    await settle()
    expect(rig.api().scene).toBe(before)
  })

  it('同一个数据只通知一次；离开时通知 null', async () => {
    const seen: Array<ChartDatumDetails | null> = []
    const rig = await makeRig({ ...BARS, onDatumActive: d => seen.push(d) })
    const hover = { type: 'HOVER' as const, hover: { ref: { seriesId: 'online', index: 0 }, x: 10, y: 10 }, key: '一月' }
    rig.service.send(hover)
    await settle()
    rig.service.send({ ...hover, hover: { ...hover.hover, x: 12 } })
    await settle()
    rig.service.send({ type: 'HOVER.CLEAR' })
    await settle()
    expect(seen.map(d => d && [d.seriesId, d.formatted.value, d.items?.length])).toEqual([['online', '120', 2], null])
  })

  it('按 Escape 收起提示框，下一次悬停再打开', async () => {
    const rig = await makeRig(BARS)
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'online', index: 0 }, x: 10, y: 10 }, key: '一月' })
    await settle()
    const keydown = (rig.api().getPlotProps() as Dict).onKeyDown
    keydown({ key: 'Escape', preventDefault: vi.fn() })
    await settle()
    expect(rig.api().tooltip).toBeNull()
  })
})

describe('键盘', () => {
  function key(rig: Rig, name: string): ReturnType<typeof vi.fn> {
    const preventDefault = vi.fn()
    ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault })
    return preventDefault
  }

  it('按 Tab 进入时落在锚点：首次为第一个可见系列的第一个柱', async () => {
    const rig = await makeRig(BARS)
    const api = rig.api()
    const first = marksOf(api, 'bar').find(m => m.key === 'online:0')!
    expect((api.getMarkProps(first) as Dict).tabindex).toBe(0)
    expect((api.getPlotProps() as Dict).tabindex).toBe(-1)
  })

  it('左右走键（跳过缺失值），上下换系列，到头原地不动但仍拦下按键', async () => {
    const rig = await makeRig(BARS)
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'offline', index: 0 }, key: '一月' })
    await settle()
    key(rig, 'ArrowRight')
    await settle()
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'offline', index: 1 })
    // 三月的线下缺失：再往右没有可去的地方
    const prevented = key(rig, 'ArrowRight')
    await settle()
    expect(prevented).toHaveBeenCalled()
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'offline', index: 1 })
    key(rig, 'ArrowDown')
    await settle()
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'online', index: 1 })
    key(rig, 'End')
    await settle()
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'online', index: 2 })
  })

  it('不归绘图区的按键不拦', async () => {
    const rig = await makeRig(BARS)
    expect(key(rig, 'a')).not.toHaveBeenCalled()
  })

  it('按 Enter 报告聚焦的数据', async () => {
    const pressed: ChartDatumDetails[] = []
    const rig = await makeRig({ ...BARS, onDatumPress: d => pressed.push(d) })
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'online', index: 1 }, key: '二月' })
    await settle()
    key(rig, 'Enter')
    expect(pressed.map(d => [d.seriesId, d.formatted.key])).toEqual([['online', '二月']])
  })
})

describe('图例与联动', () => {
  it('切换显隐：隐藏系列从定义域里移除，幸存系列颜色不变', async () => {
    const changes: string[][] = []
    const rig = await makeRig({ ...BARS, onHiddenSeriesChange: d => changes.push(d.hiddenSeries) })
    rig.api().toggleSeries('online')
    await settle()
    const api = rig.api()
    expect(changes).toEqual([['online']])
    expect(marksOf(api, 'bar').every(m => m.key.startsWith('offline'))).toBe(true)
    expect(api.legendItems.find(i => i.id === 'offline')?.slot).toBe(2)
    expect((api.getLegendItemProps(api.legendItems[0]!) as Dict)['aria-pressed']).toBe('false')
  })

  it('没有激活的数据时切换显隐，不派发 datum-active', async () => {
    const onDatumActive = vi.fn()
    const rig = await makeRig({ ...BARS, onDatumActive })
    rig.api().toggleSeries('offline')
    await settle()
    expect(onDatumActive).not.toHaveBeenCalled()
  })

  it('受控 hiddenSeries：只发意图，由作者写回', async () => {
    const changes: string[][] = []
    const rig = await makeRig({ ...BARS, hiddenSeries: [], onHiddenSeriesChange: d => changes.push(d.hiddenSeries) })
    rig.api().toggleSeries('online')
    await settle()
    expect(changes).toEqual([['online']])
    expect(rig.api().hiddenSeries).toEqual([])
  })

  it('受控 activeKey：另一张图的键在本图显示提示框，但本图不回报', async () => {
    const seen: Array<ChartDatumDetails | null> = []
    const rig = await makeRig({ ...BARS, activeKey: '二月', onDatumActive: d => seen.push(d) })
    expect(rig.api().tooltip?.header).toBe('二月')
    expect(seen).toEqual([])
  })

  it('只有一个系列时图例整条收起', async () => {
    const rig = await makeRig({ data: DATA, series: [{ mark: 'bar', x: 'month', y: 'online' }] })
    expect((rig.api().getLegendProps() as Dict).hidden).toBe(true)
  })
})

describe('无障碍', () => {
  it('摘要与数据表：缺失值写 missingValue，列名缺省取 x 轴标题', async () => {
    const rig = await makeRig({ ...BARS, xAxis: { title: '月份' } })
    const api = rig.api()
    expect(api.summary).toBe('2 series, 3 points from 一月 to 三月. 线上: lowest 120 at 一月, highest 200 at 二月. 线下: lowest 80 at 一月, highest 100 at 二月.')
    expect(api.table.columns.map(c => c.label)).toEqual(['月份', '线上', '线下'])
    expect(api.table.rows[2]!.cells.map(c => c.text)).toEqual(['三月', '150', 'No value'])
  })

  it('柱的可及名是「键, 系列 值」；绘图区描述指向摘要', async () => {
    const rig = await makeRig(BARS)
    const api = rig.api()
    const bar = marksOf(api, 'bar').find(m => m.key === 'online:1')!
    expect((api.getMarkProps(bar) as Dict)['aria-label']).toBe('二月, 线上 200')
    expect((api.getPlotProps() as Dict)['aria-describedby']).toBe((api.getSummaryProps() as Dict).id)
  })

  it('pending：根上 aria-busy', async () => {
    const rig = await makeRig({ ...BARS, pending: true })
    expect((rig.api().getRootProps() as Dict)['aria-busy']).toBe('true')
  })
})
