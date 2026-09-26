// @vitest-environment jsdom
// 直角坐标图：规格归一与诊断、柱与折线的几何、悬停命中与提示框、键盘导航、图例显隐、联动的激活键、通知去重与管线记忆。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { LineMark, Mark, RectMark, TextMark } from '@xihan-ui/viz'
import type { CartesianChartApi, CartesianChartSchema } from '../src/cartesian-chart'
import type { ChartDatumDetails } from '../src/shared/chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cartesianChartMachine, connectCartesianChart } from '../src/cartesian-chart'
import { CHART_ANIMATION_MARK_LIMIT } from '../src/shared/chart'

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
  // 几何用例看终态；过渡另有用例，显式打开 animated
  const props = runtime.signal<Props>({ animated: false, ...initial })
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
    const [a, b] = bars.filter(bar => bar.key.endsWith(':s一月'))
    expect(b!.x - (a!.x + a!.width)).toBeCloseTo(2)
    // 柱高与数值成比例（同一根基线）
    const jan = bars.find(bar => bar.key === 'online:s一月')!
    const feb = bars.find(bar => bar.key === 'online:s二月')!
    expect(feb.height / jan.height).toBeCloseTo(200 / 120, 1)
  })

  it('堆叠：同一列的段首尾相接留出间隙，只有最外层的段做圆角', async () => {
    const rig = await makeRig({
      data: DATA,
      series: [{ mark: 'bar', x: 'month', y: 'online', stack: 's' }, { mark: 'bar', x: 'month', y: 'offline', stack: 's' }],
    })
    const bars = marksOf(rig.api(), 'bar') as RectMark[]
    const low = bars.find(bar => bar.key === 'online:s一月')!
    const high = bars.find(bar => bar.key === 'offline:s一月')!
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
    const first = bars.find(bar => bar.key === 'online:s一月')!
    const second = bars.find(bar => bar.key === 'online:s二月')!
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
  it('tooltipOrder：提示框里的行按数值排，回调里的 items 仍按图例次序', async () => {
    const onDatumActive = vi.fn()
    const rig = await makeRig({ ...BARS, tooltipOrder: 'ascending', onDatumActive })
    const bar = marksOf(rig.api(), 'bar').find(m => m.key === 'online:s二月') as RectMark
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'online', index: 1 }, x: bar.x + 1, y: bar.y + 1 }, key: '二月' })
    await settle()
    expect(rig.api().tooltip?.rows.map(r => r.seriesId)).toEqual(['offline', 'online'])
    const items = (onDatumActive.mock.lastCall![0] as ChartDatumDetails).items!.map(i => i.seriesId)
    expect(items).toEqual(['online', 'offline'])
    rig.setProps({ tooltipOrder: 'descending' })
    expect(rig.api().tooltip?.rows.map(r => r.seriesId)).toEqual(['online', 'offline'])
  })

  it('悬停命中一个键：axis 模式提示框列出该键的全部系列，柱图的准线是整条类目带', async () => {
    const rig = await makeRig(BARS)
    const bar = marksOf(rig.api(), 'bar').find(m => m.key === 'online:s二月') as RectMark
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
    const first = marksOf(api, 'bar').find(m => m.key === 'online:s一月')!
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

describe('纹理', () => {
  it('每个系列一种纹理，序号等于色槽；defs 里的 pattern 由绘图区的 id 派生，带着系列的色槽', async () => {
    const rig = await makeRig(BARS)
    const api = rig.api()
    const plotId = (api.getPlotProps() as Dict).id as string
    expect(api.patterns.map(p => [p.index, p.id, p.slot])).toEqual([
      [1, `${plotId}-pattern-1`, 1],
      [2, `${plotId}-pattern-2`, 2],
    ])
    const [first, second] = api.patterns
    expect(api.getPatternProps(first!) as Dict).toMatchObject({
      'data-part': 'pattern',
      'data-xh-chart-part': 'pattern',
      'id': `${plotId}-pattern-1`,
      'patternUnits': 'userSpaceOnUse',
      'patternTransform': 'rotate(45)',
      'data-xh-chart-slot': '1',
    })
    expect((api.getPatternProps(second!) as Dict).patternTransform).toBe('rotate(135)')
    // 线画在格子正中，格子边长按数据点直径
    const size = first!.size
    expect(size).toBe(api.model.scene!.layout.metrics.pointSize)
    expect((api.getPatternLineProps(first!) as Dict).d).toBe(`M${size / 2},0V${size}`)
  })

  it('系列分组、图例项与提示框的行带纹理序号，分组把本系列的纹理写进内联样式', async () => {
    const rig = await makeRig(BARS)
    const api = rig.api()
    const plotId = (api.getPlotProps() as Dict).id as string
    const group = walk(api.scene.layers.data).find(m => m.key === 'series:offline')!
    expect(api.getMarkProps(group) as Dict).toMatchObject({
      'data-xh-chart-pattern': '2',
      'style': { '--xh-_chart-pattern': `url(#${plotId}-pattern-2)` },
    })
    expect((api.getLegendItemProps(api.legendItems[0]!) as Dict)['data-xh-chart-pattern']).toBe('1')
    const bar = marksOf(api, 'bar').find(m => m.key === 'online:s二月') as RectMark
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'online', index: 1 }, x: bar.x + 1, y: bar.y + 1 }, key: '二月' })
    await settle()
    const row = rig.api().tooltip!.rows.find(r => r.seriesId === 'offline')!
    expect((rig.api().getTooltipRowProps(row) as Dict)['data-xh-chart-pattern']).toBe('2')
  })

  it('语义系列按声明次序取纹理', async () => {
    const rig = await makeRig({
      data: DATA,
      series: [
        { mark: 'bar', x: 'month', y: 'online', tone: 'success' },
        { mark: 'bar', x: 'month', y: 'offline', tone: 'danger' },
      ],
    })
    expect(rig.api().patterns.map(p => [p.index, p.slot, p.tone])).toEqual([[1, null, 'success'], [2, null, 'danger']])
    expect(rig.api().getPatternProps(rig.api().patterns[1]!) as Dict).toMatchObject({ 'data-tone': 'danger' })
  })
})

describe('横向数值轴', () => {
  it('取整后的两端都落在刻度上：各种宽度与量级下，第一个与最后一个刻度就是定义域的两端', async () => {
    for (const [width, max] of [[400, 230], [600, 1830], [320, 97], [900, 48000], [500, 7.3]] as const) {
      const rig = await makeRig({ data: [{ m: 'a', v: max * 0.4 }, { m: 'b', v: max }], series: [{ mark: 'bar', x: 'm', y: 'v' }], orientation: 'horizontal' }, { width, height: 240 })
      const layout = rig.api().model.scene!.layout
      const ticks = layout.valueAxis.ticks.map(t => t.value as number)
      expect(ticks[0]).toBe(layout.valueScale.domain[0])
      expect(ticks.at(-1)).toBe(layout.valueScale.domain[1])
      // 相邻标签之间留得下两行字高
      const gaps = layout.valueAxis.ticks.slice(1).map((t, i) => t.offset - layout.valueAxis.ticks[i]!.offset)
      expect(Math.min(...gaps)).toBeGreaterThanOrEqual(layout.font.lineHeight * 2)
    }
  })
})

describe('数据标签', () => {
  let rigMeasure: (text: string) => number = () => 0
  const labelsOf = (api: CartesianChartApi, part = 'data-label'): TextMark[] => api.scene.layers.front.filter(m => m.part === part) as TextMark[]
  const barOf = (api: CartesianChartApi, key: string): RectMark => marksOf(api, 'bar').find(m => m.key === key) as RectMark
  const boxOf = (api: CartesianChartApi, label: TextMark): { top: number, bottom: number, left: number, right: number } => {
    const width = rigMeasure(label.text)
    const height = api.model.scene!.layout.font.lineHeight
    const left = label.anchor === 'start' ? label.x : label.anchor === 'end' ? label.x - width : label.x - width / 2
    const top = label.baseline === 'top' ? label.y : label.baseline === 'bottom' ? label.y - height : label.y - height / 2
    return { top, bottom: top + height, left, right: left + width }
  }

  async function labelRig(props: Props, size?: { width: number, height: number }): Promise<Rig> {
    const rig = await makeRig(props, size)
    const layout = rig.api().model.scene!.layout
    rigMeasure = text => layout.measurer.measure(text, layout.font).width
    return rig
  }

  it('end：柱端外侧写数值，最高的那根柱上面也有地方写', async () => {
    const rig = await labelRig({ data: DATA, series: [{ mark: 'bar', x: 'month', y: 'online', labels: 'end' }] })
    const api = rig.api()
    const labels = labelsOf(api)
    expect(labels.map(l => l.text)).toEqual(['120', '200', '150'])
    const feb = labels.find(l => l.key === 'label:online:s二月')!
    expect(boxOf(api, feb).bottom).toBeLessThanOrEqual(barOf(api, 'online:s二月').y)
    expect(boxOf(api, feb).top).toBeGreaterThanOrEqual(0)
    const props = api.getMarkProps(feb) as Dict
    expect(props).toMatchObject({ 'aria-hidden': true, 'data-placement': 'end' })
    expect(props['data-xh-chart-slot']).toBeUndefined()
  })

  it('end：负值柱的标签翻到柱的下端', async () => {
    const rig = await labelRig({ data: [{ m: 'a', v: 40 }, { m: 'b', v: -30 }], series: [{ mark: 'bar', x: 'm', y: 'v', labels: 'end' }] })
    const api = rig.api()
    const neg = labelsOf(api).find(l => l.key === 'label:v:sb')!
    const bar = barOf(api, 'v:sb')
    expect(boxOf(api, neg).top).toBeGreaterThanOrEqual(bar.y + bar.height)
  })

  it('inside：放得下写在柱内正中，带色槽取配对的前景色；柱太短不写', async () => {
    const rig = await labelRig({
      data: [{ m: 'a', v: 100 }, { m: 'b', v: 2 }],
      series: [{ mark: 'bar', x: 'm', y: 'v', labels: 'inside' }],
      orientation: 'horizontal',
    })
    const api = rig.api()
    const labels = labelsOf(api)
    expect(labels.map(l => l.key)).toEqual(['label:v:sa'])
    const bar = barOf(api, 'v:sa')
    const box = boxOf(api, labels[0]!)
    expect(box.left).toBeGreaterThanOrEqual(bar.x)
    expect(box.right).toBeLessThanOrEqual(bar.x + bar.width)
    expect(api.getMarkProps(labels[0]!) as Dict).toMatchObject({ 'data-placement': 'inside', 'data-xh-chart-slot': '1' })
  })

  it('堆叠的段写 end：写在段内的远端；totals 在整叠外侧写合计', async () => {
    const rig = await labelRig({
      data: [{ m: 'a', x: 60, y: 40 }, { m: 'b', x: 30, y: 50 }],
      series: [
        { mark: 'bar', x: 'm', y: 'x', stack: 's', labels: 'end' },
        { mark: 'bar', x: 'm', y: 'y', stack: 's', labels: 'end' },
      ],
      totals: true,
    }, { width: 400, height: 320 })
    const api = rig.api()
    const inner = labelsOf(api).find(l => l.key === 'label:x:sa')
    const bar = barOf(api, 'x:sa')
    if (inner) {
      expect((api.getMarkProps(inner) as Dict)['data-placement']).toBe('inside')
      expect(boxOf(api, inner).top).toBeGreaterThanOrEqual(bar.y)
    }
    const totals = labelsOf(api, 'total-label')
    expect(totals.map(t => t.text)).toEqual(['100', '80'])
    const top = Math.min(barOf(api, 'x:sa').y, barOf(api, 'y:sa').y)
    expect(boxOf(api, totals[0]!).bottom).toBeLessThanOrEqual(top)
  })

  it('百分比堆叠不写合计', async () => {
    const rig = await labelRig({
      data: DATA,
      series: [
        { mark: 'bar', x: 'month', y: 'online', stack: 's', stackOffset: 'expand' },
        { mark: 'bar', x: 'month', y: 'offline', stack: 's', stackOffset: 'expand' },
      ],
      totals: true,
    })
    expect(labelsOf(rig.api(), 'total-label')).toEqual([])
  })

  it('折线的 end 写在每个点的上方', async () => {
    const rig = await labelRig({ data: DATA, series: [{ mark: 'line', x: 'month', y: 'online', labels: 'end' }] })
    const api = rig.api()
    const anchors = api.model.scene!.anchors.get('online')!
    for (const label of labelsOf(api)) {
      const j = DATA.findIndex(d => label.key.endsWith(`s${d.month}`))
      expect(boxOf(api, label).bottom).toBeLessThan(anchors[j]!.y)
    }
  })

  it('线尾标签：写系列名与末值，两条线的末端挨着时上下推开', async () => {
    const rig = await labelRig({
      data: [{ m: 'a', p: 10, q: 11 }, { m: 'b', p: 50, q: 51 }],
      series: [
        { mark: 'line', x: 'm', y: 'p', name: '甲', endLabel: true },
        { mark: 'line', x: 'm', y: 'q', name: '乙', endLabel: true },
      ],
    })
    const api = rig.api()
    const ends = labelsOf(api, 'end-label')
    expect(ends.map(e => e.text).sort()).toEqual(['乙 51', '甲 50'])
    const [a, b] = ends
    expect(Math.abs(a!.y - b!.y)).toBeGreaterThanOrEqual(api.model.scene!.layout.font.lineHeight - 0.5)
    const last = api.model.scene!.anchors.get('p')![1]!
    expect(ends.find(e => e.key === 'end:p')!.x).toBeGreaterThan(last.x)
    expect(boxOf(api, ends[0]!).right).toBeLessThanOrEqual(400)
    // 被推开的标签有引导线连回自己的线尾，线尾一端在点上，另一端在标签左侧
    const leaders = api.scene.layers.front.filter(m => m.part === 'leader-line') as LineMark[]
    expect(leaders.length).toBeGreaterThan(0)
    for (const leader of leaders) {
      const id = leader.datum!.seriesId
      const anchor = api.model.scene!.anchors.get(id)![1]!
      const label = ends.find(e => e.key === `end:${id}`)!
      const [from, to] = leader.points
      expect(from!.y).toBeCloseTo(anchor.y, 5)
      expect(from!.x).toBeGreaterThan(anchor.x)
      expect(to!.y).toBeCloseTo(label.y, 5)
      expect(to!.x).toBeLessThan(label.x)
      expect((api.getMarkProps(leader) as Dict)['aria-hidden']).toBe(true)
    }
  })

  it('线尾标签：末端相隔足够远时标签落在线尾的高度，不画引导线', async () => {
    const rig = await labelRig({
      data: [{ m: 'a', p: 10, q: 90 }, { m: 'b', p: 10, q: 90 }],
      series: [
        { mark: 'line', x: 'm', y: 'p', name: '甲', endLabel: true },
        { mark: 'line', x: 'm', y: 'q', name: '乙', endLabel: true },
      ],
    })
    const api = rig.api()
    for (const end of labelsOf(api, 'end-label')) {
      const id = end.key.slice('end:'.length)
      expect(end.y).toBeCloseTo(api.model.scene!.anchors.get(id)![1]!.y, 5)
    }
    expect(api.scene.layers.front.some(m => m.part === 'leader-line')).toBe(false)
  })

  it('标签彼此重叠时只留一个，留下的互不相交', async () => {
    const data = Array.from({ length: 30 }, (_, i) => ({ m: `k${i}`, v: 1_000_000 + i }))
    const rig = await labelRig({ data, series: [{ mark: 'bar', x: 'm', y: 'v', labels: 'end' }] })
    const api = rig.api()
    const labels = labelsOf(api)
    expect(labels.length).toBeGreaterThan(0)
    expect(labels.length).toBeLessThan(30)
    const boxes = labels.map(l => boxOf(api, l))
    boxes.forEach((a, i) => boxes.slice(i + 1).forEach((b) => {
      const apart = a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top
      expect(apart).toBe(true)
    }))
  })

  it('悬停图例淡出其余系列时，标签随所属系列一起淡出', async () => {
    const rig = await labelRig({
      data: DATA,
      series: [
        { mark: 'bar', x: 'month', y: 'online', labels: 'end' },
        { mark: 'bar', x: 'month', y: 'offline', labels: 'end' },
      ],
    })
    rig.service.send({ type: 'LEGEND.HOVER', id: 'online' })
    const api = rig.api()
    const offline = labelsOf(api).find(l => l.datum?.seriesId === 'offline')!
    const online = labelsOf(api).find(l => l.datum?.seriesId === 'online')!
    expect((api.getMarkProps(offline) as Dict)['data-dimmed']).toBe('')
    expect((api.getMarkProps(online) as Dict)['data-dimmed']).toBeUndefined()
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
    const bar = marksOf(api, 'bar').find(m => m.key === 'online:s二月')!
    expect((api.getMarkProps(bar) as Dict)['aria-label']).toBe('二月, 线上 200')
    expect((api.getPlotProps() as Dict)['aria-describedby']).toBe((api.getSummaryProps() as Dict).id)
  })

  it('取数中还没有数据：空态写「加载中」并带加载状态；取完仍没有数据写「没有数据」', async () => {
    const rig = await makeRig({ data: [], series: BARS.series, pending: true })
    expect(rig.api().emptyText).toBe('Loading…')
    expect(rig.api().getEmptyProps() as Dict).toMatchObject({ 'data-state': 'loading' })
    rig.setProps({ pending: false })
    expect(rig.api().emptyText).toBe('No data')
    expect((rig.api().getEmptyProps() as Dict)['data-state']).toBeUndefined()
  })

  it('pending：根上 aria-busy', async () => {
    const rig = await makeRig({ ...BARS, pending: true })
    expect((rig.api().getRootProps() as Dict)['aria-busy']).toBe('true')
  })
})

describe('过渡', () => {
  // 帧与时钟都由假计时器推进：requestAnimationFrame 每 16ms 一帧，performance.now 随之走
  const FRAMES: Parameters<typeof vi.useFakeTimers>[0] = { toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] }
  const MIXED: Props = {
    data: DATA,
    series: [{ mark: 'bar', x: 'month', y: 'online', name: '线上' }, { mark: 'line', x: 'month', y: 'offline', name: '线下' }],
    animated: true,
  }

  afterEach(() => {
    vi.useRealTimers()
    document.body.removeAttribute('data-motion')
  })

  function barHeights(api: CartesianChartApi): number[] {
    return (marksOf(api, 'bar') as RectMark[]).map(b => b.height)
  }

  it('入场：柱从基线长出，折线原样在场、带描线标记，走完落到目标场景', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig(MIXED)
    const target = rig.api().model.scene!.scene
    const finals = (walk(target.layers.data).filter(m => m.part === 'bar') as RectMark[]).map(b => b.height)
    expect(barHeights(rig.api())).toEqual(finals.map(() => 0))
    const line = marksOf(rig.api(), 'line')[0]!
    expect(rig.api().getMarkProps(line) as Dict).toMatchObject({ 'pathLength': 1, 'data-drawing': '' })

    vi.advanceTimersByTime(100)
    barHeights(rig.api()).forEach((h, i) => {
      expect(h).toBeGreaterThan(0)
      expect(h).toBeLessThan(finals[i]!)
    })

    vi.advanceTimersByTime(1000)
    expect(rig.api().scene).toBe(target)
    expect((rig.api().getMarkProps(line) as Dict)['data-drawing']).toBeUndefined()
  })

  it('入场：数据点等笔尖扫到才出现，越靠后的点延迟越大', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({
      data: [{ m: 'a', v: 1 }, { m: 'b', v: 3 }, { m: 'c', v: 2 }],
      series: [{ mark: 'line', x: 'm', y: 'v' }],
      animated: true,
    })
    const delays = marksOf(rig.api(), 'dot').map((dot) => {
      const props = rig.api().getMarkProps(dot) as Dict
      expect(props['data-drawing']).toBe('')
      return Number.parseFloat(props.style['--xh-_chart-reveal-at'])
    })
    expect(delays).toHaveLength(3)
    expect(delays[0]).toBe(0)
    expect(delays[1]).toBeGreaterThan(delays[0]!)
    expect(delays[2]).toBeGreaterThan(delays[1]!)
    vi.advanceTimersByTime(2000)
    expect((rig.api().getMarkProps(marksOf(rig.api(), 'dot')[0]!) as Dict)['data-drawing']).toBeUndefined()
  })

  it('标记太多时不做几何插值：柱第一帧就是终值高度，只淡入', async () => {
    vi.useFakeTimers(FRAMES)
    const many = Array.from({ length: CHART_ANIMATION_MARK_LIMIT + 1 }, (_, i) => ({ m: `k${i}`, v: (i % 7) + 1 }))
    const rig = await makeRig({ data: many, series: [{ mark: 'bar', x: 'm', y: 'v' }], animated: true })
    const target = walk(rig.api().model.scene!.scene.layers.data).filter(m => m.part === 'bar') as RectMark[]
    const first = marksOf(rig.api(), 'bar') as RectMark[]
    expect(first.map(b => b.height)).toEqual(target.map(b => b.height))
    expect(first.every(b => b.opacity === 0)).toBe(true)
  })

  it('animated 为 false：直接画目标场景', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({ ...MIXED, animated: false })
    expect(rig.api().scene).toBe(rig.api().model.scene!.scene)
  })

  it('尺寸变化不重播：走完之后换尺寸，直接落到新场景', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig(MIXED)
    vi.advanceTimersByTime(1000)
    rig.service.send({ type: 'RESIZE', size: { width: 320, height: 200 }, offset: { x: 0, y: 0 } })
    const api = rig.api()
    expect(api.model.scene!.layout.size.width).toBe(320)
    expect(api.scene).toBe(api.model.scene!.scene)
  })

  it('图例隐藏一个系列：它的柱收回基线并淡出，收场期间不进可访问树', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({ ...BARS, animated: true })
    vi.advanceTimersByTime(1000)
    const before = (marksOf(rig.api(), 'bar') as RectMark[]).find(b => b.key === 'offline:s一月')!
    rig.api().toggleSeries('offline')
    vi.advanceTimersByTime(100)
    const api = rig.api()
    const group = walk(api.scene.layers.data).find(m => m.key === 'series:offline')!
    expect(api.getMarkProps(group) as Dict).toMatchObject({ 'aria-hidden': true, 'data-xh-chart-slot': '2' })
    expect((api.getMarkProps(group) as Dict).role).toBeUndefined()
    const leaving = (marksOf(api, 'bar') as RectMark[]).find(b => b.key === 'offline:s一月')!
    expect(leaving.height).toBeLessThan(before.height)
    expect(leaving.opacity).toBeLessThan(1)
    const props = api.getMarkProps(leaving) as Dict
    expect(props.tabindex).toBeUndefined()
    expect(props['aria-hidden']).toBe(true)
    vi.advanceTimersByTime(1000)
    expect(walk(rig.api().scene.layers.data).some(m => m.key === 'series:offline')).toBe(false)
  })

  it('图例切换改了数值轴：两边都有的刻度滑到新位置，只在一边的刻度淡入淡出', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({ ...BARS, animated: true })
    vi.advanceTimersByTime(1000)
    const labels = (api: CartesianChartApi): Map<string, Mark> => new Map(marksOf(api, 'tick-label').map(m => [m.key, m]))
    const before = labels(rig.api())
    rig.api().toggleSeries('online')
    const target = new Map(walk(rig.api().model.scene!.scene.layers.back).filter(m => m.part === 'tick-label').map(m => [m.key, m]))
    vi.advanceTimersByTime(100)
    const mid = labels(rig.api())
    const shared = [...target.keys()].filter(key => before.has(key) && (before.get(key) as Dict).y !== (target.get(key) as Dict).y)
    expect(shared.length).toBeGreaterThan(0)
    for (const key of shared) {
      const [from, to, now] = [before, target, mid].map(m => (m.get(key) as Dict).y as number)
      expect(now).toBeGreaterThan(Math.min(from!, to!))
      expect(now).toBeLessThan(Math.max(from!, to!))
    }
    const fresh = [...target.keys()].filter(key => !before.has(key))
    expect(fresh.length).toBeGreaterThan(0)
    expect(fresh.every(key => (mid.get(key)!.opacity ?? 1) < 1)).toBe(true)
  })

  it('类目换了次序：同一个类目的柱滑到新位置，高度不变', async () => {
    vi.useFakeTimers(FRAMES)
    const series: Props['series'] = [{ mark: 'bar', x: 'month', y: 'online' }]
    const rig = await makeRig({ data: DATA, series, animated: true })
    vi.advanceTimersByTime(1000)
    const feb = (): RectMark => (marksOf(rig.api(), 'bar') as RectMark[]).find(b => b.key === 'online:s二月')!
    const before = feb()
    rig.setProps({ data: [DATA[1]!, DATA[0]!, DATA[2]!] })
    const target = walk(rig.api().model.scene!.scene.layers.data).find(m => m.key === 'online:s二月') as RectMark
    vi.advanceTimersByTime(150)
    const mid = feb()
    expect(target.x).toBeLessThan(before.x)
    expect(mid.x).toBeLessThan(before.x)
    expect(mid.x).toBeGreaterThan(target.x)
    expect(mid.height).toBeCloseTo(before.height, 6)
  })

  it('时间序列往后推一格：同一天的点平移过去，不与相邻的点串值', async () => {
    vi.useFakeTimers(FRAMES)
    const day = (d: number): Date => new Date(Date.UTC(2026, 0, d))
    const rows = (from: number): Record<string, unknown>[] => [0, 1, 2, 3].map(i => ({ day: day(from + i), v: (from + i) * 10 }))
    const series: Props['series'] = [{ mark: 'line', x: 'day', y: 'v' }]
    const rig = await makeRig({ data: rows(1), series, animated: true })
    vi.advanceTimersByTime(1000)
    const lineOf = (marks: readonly Mark[]): LineMark => walk(marks).find(m => m.part === 'line') as LineMark
    const pointOf = (line: LineMark, d: number): { x: number, y: number } => line.points.find(p => p.key === `d${day(d).valueOf()}`)!
    const before = pointOf(lineOf(rig.api().scene.layers.data), 3)
    rig.setProps({ data: rows(2) })
    const target = pointOf(lineOf(rig.api().model.scene!.scene.layers.data), 3)
    vi.advanceTimersByTime(150)
    const mid = pointOf(lineOf(rig.api().scene.layers.data), 3)
    expect(target.x).toBeLessThan(before.x)
    expect(mid.x).toBeLessThan(before.x)
    expect(mid.x).toBeGreaterThan(target.x)
  })

  it('数据更新：标签上的数随柱从旧值滚到新值；首次出现直接写终值', async () => {
    vi.useFakeTimers(FRAMES)
    const series = [{ mark: 'bar' as const, x: 'm', y: 'v', labels: 'end' as const }]
    const rig = await makeRig({ data: [{ m: 'a', v: 100 }], series, animated: true })
    const text = (): string | undefined => (rig.api().scene.layers.front.find(m => m.key === 'label:v:sa') as TextMark | undefined)?.text
    expect(text()).toBe('100')
    vi.advanceTimersByTime(1000)
    rig.setProps({ data: [{ m: 'a', v: 200 }] })
    vi.advanceTimersByTime(100)
    const mid = Number(text())
    expect(mid).toBeGreaterThan(100)
    expect(mid).toBeLessThan(200)
    expect(Number.isInteger(mid)).toBe(true)
    vi.advanceTimersByTime(1000)
    expect(text()).toBe('200')
    expect(rig.api().scene).toBe(rig.api().model.scene!.scene)
  })

  it('数据更新：线尾标签的末值同样滚动，系列名不变', async () => {
    vi.useFakeTimers(FRAMES)
    const series = [{ mark: 'line' as const, x: 'm', y: 'v', name: '甲', endLabel: true }]
    const rig = await makeRig({ data: [{ m: 'a', v: 10 }, { m: 'b', v: 10 }], series, animated: true })
    vi.advanceTimersByTime(1000)
    rig.setProps({ data: [{ m: 'a', v: 10 }, { m: 'b', v: 90 }] })
    vi.advanceTimersByTime(100)
    const label = rig.api().scene.layers.front.find(m => m.key === 'end:v') as TextMark
    const [name, value] = label.text.split(' ')
    expect(name).toBe('甲')
    expect(Number(value)).toBeGreaterThan(10)
    expect(Number(value)).toBeLessThan(90)
  })

  it('减弱动效：几何直接落到终态，只淡入', async () => {
    vi.useFakeTimers(FRAMES)
    document.body.setAttribute('data-motion', 'reduce')
    const rig = await makeRig(MIXED)
    const target = rig.api().model.scene!.scene
    const finals = (walk(target.layers.data).filter(m => m.part === 'bar') as RectMark[]).map(b => b.height)
    expect(barHeights(rig.api())).toEqual(finals)
    expect((marksOf(rig.api(), 'bar') as RectMark[]).every(b => b.opacity === 0)).toBe(true)
    vi.advanceTimersByTime(1000)
    expect(rig.api().scene).toBe(target)
  })
})
