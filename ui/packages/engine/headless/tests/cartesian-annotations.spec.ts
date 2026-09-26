// @vitest-environment jsdom
// 直角坐标图的注释：参考线与参考带计入定义域、标出的点套在数据点外、平均线在均值处、趋势线按最小二乘或移动平均，
// 标签缺省写值并与数据标签一起落位；指错目标只报提醒不挡整张图；摘要写出参考线、参考带与平均线。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { LineMark, Mark, RectMark, SymbolMark, TextMark } from '@xihan-ui/viz'
import type { CartesianChartApi, CartesianChartSchema } from '../src/cartesian-chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
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

interface Rig {
  service: Service<CartesianChartSchema>
  api: () => CartesianChartApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size = { width: 400, height: 240 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(cartesianChartMachine, { props: () => props.get(), runtime })
  const root = document.createElement('figure')
  const viewport = document.createElement('div')
  root.append(viewport)
  document.body.append(root)
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

function notes(api: CartesianChartApi): Mark[] {
  return walk([...api.scene.layers.back, ...api.scene.layers.front]).filter(m => m.part === 'annotation')
}

function noteLabels(api: CartesianChartApi): TextMark[] {
  return api.scene.layers.front.filter((m): m is TextMark => m.part === 'annotation-label')
}

const SALES = [
  { month: '一月', online: 100, store: 60 },
  { month: '二月', online: 200, store: 80 },
  { month: '三月', online: 150, store: 70 },
  { month: '四月', online: 250, store: 90 },
]

const LINES: Props = {
  data: SALES,
  series: [{ mark: 'line', x: 'month', y: 'online', name: '线上' }, { mark: 'line', x: 'month', y: 'store', name: '门店' }],
}

describe('参考线与参考带', () => {
  it('数值轴上的参考线计入定义域：比数据大的目标也看得到，横跨绘图区，标签缺省写值、写在右端上方', async () => {
    const rig = await makeRig({ ...LINES, annotations: [{ kind: 'line', axis: 'y', value: 330 }] })
    const api = rig.api()
    const { valueScale, plot } = api.model.scene!.layout
    expect(valueScale.domain[1]).toBeGreaterThanOrEqual(330)
    const line = notes(api)[0] as LineMark
    expect(line.points.map(p => p.x)).toEqual([plot.x, plot.x + plot.width])
    expect(line.points[0]!.y).toBeCloseTo(Math.round(valueScale.map(330)!) + 0.5)
    const label = noteLabels(api)[0]!
    expect(label.text).toBe('330')
    expect([label.anchor, label.baseline]).toEqual(['end', 'bottom'])
    const props = api.getMarkProps(line) as Dict
    expect([props['data-kind'], props['aria-hidden']]).toEqual(['line', true])
    expect((api.getMarkProps(label) as Dict)['aria-hidden']).toBe(true)
  })

  it('参考线贴着绘图区上沿时标签翻到线下，不越出视口', async () => {
    const rig = await makeRig({ ...LINES, annotations: [{ kind: 'line', axis: 'y', value: 400 }] })
    const api = rig.api()
    expect(api.model.scene!.layout.valueScale.domain[1]).toBe(400)
    const label = noteLabels(api)[0]!
    expect([label.anchor, label.baseline]).toEqual(['end', 'top'])
    expect(label.y).toBeGreaterThan((notes(api)[0] as LineMark).points[0]!.y)
  })

  it('写了标签就写标签；自变量轴上的参考线落在类目中心，横向时变成横线', async () => {
    const rig = await makeRig({ ...LINES, annotations: [{ kind: 'line', axis: 'x', value: '三月', label: '改版' }] })
    const api = rig.api()
    const line = notes(api)[0] as LineMark
    const center = api.model.scene!.layout.keyCenters[2]!
    expect(line.points[0]!.x).toBeCloseTo(Math.round(center) + 0.5)
    expect(line.points[0]!.x).toBe(line.points[1]!.x)
    expect(noteLabels(api)[0]!.text).toBe('改版')
    rig.setProps({ orientation: 'horizontal' })
    await settle()
    const turned = notes(rig.api())[0] as LineMark
    expect(turned.points[0]!.y).toBe(turned.points[1]!.y)
  })

  it('参考带垫在数据之下：数值轴上的一段铺满宽度；类目轴上盖满两端类目的整条带', async () => {
    const rig = await makeRig({
      ...LINES,
      annotations: [
        { kind: 'band', axis: 'y', from: 120, to: 180, label: '正常' },
        { kind: 'band', axis: 'x', from: '二月', to: '三月' },
      ],
    })
    const api = rig.api()
    const [value, key] = notes(api) as RectMark[]
    const { valueScale, plot, keyCenters, keyScale } = api.model.scene!.layout
    expect(api.scene.layers.back.includes(value!)).toBe(true)
    expect(value!.width).toBe(plot.width)
    expect(value!.y).toBeCloseTo(valueScale.map(180)!)
    expect(value!.y + value!.height).toBeCloseTo(valueScale.map(120)!)
    const step = (keyScale as { step: number }).step
    expect(key!.x).toBeCloseTo(keyCenters[1]! - step / 2)
    expect(key!.x + key!.width).toBeCloseTo(keyCenters[2]! + step / 2)
    expect(noteLabels(api).map(l => l.text)).toEqual(['正常', '二月 – 三月'])
  })
})

describe('跟着系列的注释', () => {
  it('标出最大、最小、最后一个与指定 x 的数据：一圈环套在数据点上，标签写值；隐藏系列时一起收起', async () => {
    const rig = await makeRig({
      ...LINES,
      annotations: [
        { kind: 'point', series: 'online', at: 'max' },
        { kind: 'point', series: 'online', at: 'min' },
        { kind: 'point', series: 'store', at: 'last' },
        { kind: 'point', series: 'store', at: { x: '二月' }, label: '促销' },
      ],
    })
    const api = rig.api()
    const anchors = api.model.scene!.anchors
    const rings = notes(api) as SymbolMark[]
    expect(rings.map(r => [r.x, r.y])).toEqual([
      [anchors.get('online')![3]!.x, anchors.get('online')![3]!.y],
      [anchors.get('online')![0]!.x, anchors.get('online')![0]!.y],
      [anchors.get('store')![3]!.x, anchors.get('store')![3]!.y],
      [anchors.get('store')![1]!.x, anchors.get('store')![1]!.y],
    ])
    expect(noteLabels(api).map(l => l.text)).toEqual(['250', '100', '90', '促销'])
    expect((api.getMarkProps(rings[0]!) as Dict)['data-xh-chart-slot']).toBe('1')
    rig.setProps({ hiddenSeries: ['store'] })
    await settle()
    expect(notes(rig.api())).toHaveLength(2)
  })

  it('平均线落在均值处，标签缺省「Average 均值」；悬停图例的另一个系列时它随系列淡出', async () => {
    const rig = await makeRig({ ...LINES, annotations: [{ kind: 'average', series: 'online' }] })
    const api = rig.api()
    const line = notes(api)[0] as LineMark
    expect(line.points[0]!.y).toBeCloseTo(Math.round(api.model.scene!.layout.valueScale.map(175)!) + 0.5)
    expect(noteLabels(api)[0]!.text).toBe('Average 175')
    rig.service.send({ type: 'LEGEND.HOVER', id: 'store' })
    await settle()
    const next = rig.api()
    expect((next.getMarkProps(notes(next)[0]!) as Dict)['data-dimmed']).toBe('')
  })

  it('趋势线：最小二乘直线从第一个画到最后一个位置；移动平均凑不满窗口的位置断开', async () => {
    const rig = await makeRig({
      ...LINES,
      annotations: [
        { kind: 'trend', series: 'online', method: 'linear' },
        { kind: 'trend', series: 'online', method: 'moving-average', window: 2 },
      ],
    })
    const api = rig.api()
    const [fit, smooth] = notes(api) as LineMark[]
    const { keyCenters, valueScale } = api.model.scene!.layout
    // 0..3 上 100 / 200 / 150 / 250 的最小二乘：斜率 40、截距 115
    expect(fit!.points.map(p => p.x)).toEqual([keyCenters[0], keyCenters[3]])
    expect(fit!.points[0]!.y).toBeCloseTo(valueScale.map(115)!)
    expect(fit!.points[1]!.y).toBeCloseTo(valueScale.map(235)!)
    expect(smooth!.points.map(p => p.defined)).toEqual([false, true, true, true])
    expect(smooth!.points[1]!.y).toBeCloseTo(valueScale.map(150)!)
  })
})

describe('诊断与摘要', () => {
  it('指错目标只报提醒、少画那一条，图照常画', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => seen.push(record)))
    const rig = await makeRig({
      ...LINES,
      annotations: [
        { kind: 'average', series: 'nobody' },
        { kind: 'line', axis: 'x', value: '十月' },
        { kind: 'line', axis: 'y', value: 120 },
      ],
    })
    const api = rig.api()
    expect(api.measured).toBe(true)
    expect(notes(api)).toHaveLength(1)
    const hits = seen.filter(r => r.code === DIAGNOSTIC_CODES.chartAnnotationTarget)
    expect(hits.map(r => r.level)).toEqual(['warn', 'warn'])
  })

  it('摘要末尾写出参考线、参考带与平均线；文案可以整条替换', async () => {
    const rig = await makeRig({
      ...LINES,
      annotations: [
        { kind: 'line', axis: 'y', value: 180, label: '目标' },
        { kind: 'band', axis: 'y', from: 50, to: 100 },
        { kind: 'average', series: 'store' },
        { kind: 'trend', series: 'online', method: 'linear' },
      ],
    })
    expect(rig.api().summary).toMatch(/目标: 180\. Reference: 50 – 100\. Average \(门店\): 75\.$/)
    rig.setProps({ translations: { annotationSummary: items => `共 ${items.length} 条注释` } })
    await settle()
    expect(rig.api().summary).toMatch(/共 3 条注释$/)
  })
})
