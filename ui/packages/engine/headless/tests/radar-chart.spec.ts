// @vitest-environment jsdom
// 雷达图：规格与诊断、各指标的量程、角度与半径的几何、指标名的落位、命中与提示框、键盘与图例、入场、无障碍。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { LineMark, Mark, SymbolMark, TextMark } from '@xihan-ui/viz'
import type { RadarChartApi, RadarChartSchema } from '../src/radar-chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectRadarChart, radarChartMachine } from '../src/radar-chart'
import { radarEntryScene } from '../src/radar-chart/radar-chart.model'

type Dict = Record<string, any>
type Props = Partial<RadarChartSchema['props']>

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
  { model: 'A', speed: 80, power: 60, range: 70, price: 40, comfort: 90 },
  { model: 'B', speed: 60, power: 90, range: 50, price: 70, comfort: 60 },
]
const INDICATORS = [
  { key: 'speed', label: '速度' },
  { key: 'power', label: '动力' },
  { key: 'range', label: '续航' },
  { key: 'price', label: '价格' },
  { key: 'comfort', label: '舒适' },
]
const BASE: Props = { data: DATA, nameField: 'model', indicators: INDICATORS }

interface Rig {
  service: Service<RadarChartSchema>
  api: () => RadarChartApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size = { width: 480, height: 320 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(radarChartMachine, { props: () => props.get(), runtime })
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
    api: () => connectRadarChart(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

function all(marks: readonly Mark[]): Mark[] {
  return marks.flatMap(m => (m.kind === 'group' ? [m, ...all(m.children)] : [m]))
}

function byPart(api: RadarChartApi, part: string): Mark[] {
  return all([...api.scene.layers.back, ...api.scene.layers.data]).filter(m => m.part === part)
}

function plotEvent(api: RadarChartApi, x: number, y: number): Dict {
  const { width, height } = api.model.scene!.layout.size
  return { clientX: x, clientY: y, currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width, height }) }, preventDefault: vi.fn() }
}

describe('规格与诊断', () => {
  it('每行一个实体、按数据次序取色槽；每个指标一根轴，自 12 点顺时针', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect(api.legendItems.map(i => [i.id, i.slot])).toEqual([['A', 1], ['B', 2]])
    const { angles, cx, cy, radius } = api.model.scene!.layout
    expect(angles).toHaveLength(5)
    expect(angles[1]! - angles[0]!).toBeCloseTo((2 * Math.PI) / 5)
    const [spoke] = byPart(api, 'spoke') as LineMark[]
    expect(spoke!.points[1]!.x).toBeCloseTo(cx)
    expect(spoke!.points[1]!.y).toBeCloseTo(cy - radius)
  })

  it('指标少于 3 个报 chart.indicator-count，根上写 data-state="error"、不画', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const rig = await makeRig({ ...BASE, indicators: INDICATORS.slice(0, 2) })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartIndicatorCount)
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
    expect(rig.api().model.scene).toBeNull()
  })

  it('多于 3 个实体按提醒报 chart.radar-overlap，图照常画', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const data = ['A', 'B', 'C', 'D'].map((model, i) => ({ ...DATA[i % 2]!, model }))
    const rig = await makeRig({ ...BASE, data })
    const hit = seen.find(r => r.code === DIAGNOSTIC_CODES.chartRadarOverlap)
    expect(hit?.level).toBe('warn')
    expect(byPart(rig.api(), 'series')).toHaveLength(4)
  })

  it('字段不存在报 chart.unknown-field', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    await makeRig({ ...BASE, indicators: [...INDICATORS.slice(0, 3), { key: 'weight' }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartUnknownField)
  })
})

describe('量程与几何', () => {
  it('independent：每个指标自己的量程，下限 0、上限按最大值取整；顶点按比例落在轴上', async () => {
    const rig = await makeRig(BASE)
    const { domains } = rig.api().model.derived
    expect(domains[0]).toEqual([0, 80])
    expect(domains[1]).toEqual([0, 100])
    const { points, cx, cy, radius } = rig.api().model.scene!.layout
    // A 的速度 80 顶到速度轴的最外圈
    expect(points.get('A')![0]!.y).toBeCloseTo(cy - radius)
    // B 的动力 90 在动力轴 90% 处
    const p = points.get('B')![1]!
    expect(Math.hypot(p.x - cx, p.y - cy)).toBeCloseTo(radius * 0.9)
  })

  it('shared：全部指标共用一个量程；写了上下限的指标以写的为准', async () => {
    const rig = await makeRig({ ...BASE, scale: 'shared', indicators: [...INDICATORS.slice(0, 4), { key: 'comfort', label: '舒适', min: 50, max: 100 }] })
    const { domains } = rig.api().model.derived
    expect(domains.slice(0, 4)).toEqual([[0, 100], [0, 100], [0, 100], [0, 100]])
    expect(domains[4]).toEqual([50, 100])
  })

  it('隐藏一个实体不改量程：其余实体的形状不变', async () => {
    const rig = await makeRig(BASE)
    const before = rig.api().model.scene!.layout.points.get('B')
    rig.api().toggleSeries('A')
    await settle()
    expect(rig.api().model.derived.domains[0]).toEqual([0, 80])
    expect(rig.api().model.scene!.layout.points.get('B')).toEqual(before)
    expect(byPart(rig.api(), 'series')).toHaveLength(1)
  })

  it('网格：polygon 画成多边形的四圈，circle 画成同心圆', async () => {
    const polygon = await makeRig(BASE)
    const rings = byPart(polygon.api(), 'grid-ring') as LineMark[]
    expect(rings).toHaveLength(4)
    expect(rings[0]!.curve).toBe('linearClosed')
    const circle = await makeRig({ ...BASE, shape: 'circle' })
    expect(byPart(circle.api(), 'grid-ring').every(m => m.kind === 'path')).toBe(true)
  })

  it('指标名写在轴端外侧：右半边从轴端往外写、左半边往回写，正上方居中写在轴端之上', async () => {
    const rig = await makeRig(BASE)
    const labels = byPart(rig.api(), 'indicator-label') as TextMark[]
    expect(labels.map(l => l.anchor)).toEqual(['middle', 'start', 'start', 'end', 'end'])
    expect(labels[0]!.baseline).toBe('bottom')
    expect(labels.map(l => l.text)).toEqual(['速度', '动力', '续航', '价格', '舒适'])
  })

  it('缺失的值落在圆心、不画顶点；area 关掉时只画轮廓', async () => {
    const rig = await makeRig({ ...BASE, area: false, data: [{ ...DATA[0]!, power: null }, DATA[1]!] })
    const api = rig.api()
    const { points, cx, cy } = api.model.scene!.layout
    expect(points.get('A')![1]).toEqual({ x: cx, y: cy })
    expect(byPart(api, 'point').filter(p => p.datum?.seriesId === 'A')).toHaveLength(4)
    expect(byPart(api, 'area-fill')).toHaveLength(0)
    expect(byPart(api, 'line')).toHaveLength(2)
  })

  it('curve="catmull-rom" 让轮廓平滑地闭合', async () => {
    const rig = await makeRig({ ...BASE, curve: 'catmull-rom' })
    expect((byPart(rig.api(), 'line')[0] as LineMark).curve).toBe('catmullRomClosed')
  })
})

describe('命中、提示框与键盘', () => {
  it('悬停按角度落到最近的指标轴，取离指针最近的顶点；提示框列出全部实体在这个指标上的值', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    const p = api.model.scene!.layout.points.get('B')![1]!
    ;(api.getPlotProps() as Dict).onPointerMove(plotEvent(api, p.x + 1, p.y))
    await settle()
    const next = rig.api()
    expect(next.active?.seriesId).toBe('B')
    expect(next.active?.key).toBe('power')
    expect(next.tooltip).toEqual({ header: '动力', rows: [{ seriesId: 'A', name: 'A', value: '60', slot: 1 }, { seriesId: 'B', name: 'B', value: '90', slot: 2 }] })
    expect((next.getTooltipRowProps(next.tooltip!.rows[1]!) as Dict)['data-current']).toBe('')
    // 准线落在激活的指标轴上
    expect(next.overlay.under.map(m => m.part)).toEqual(['crosshair'])
  })

  it('左右键沿顺时针在指标之间走，上下键在同一个指标上换实体', async () => {
    const rig = await makeRig(BASE)
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'A', index: 0 }, key: 'speed', focus: true, visible: true })
    await settle()
    const key = async (name: string): Promise<void> => {
      ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault: vi.fn() })
      await settle()
    }
    await key('ArrowRight')
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'A', index: 1 })
    await key('ArrowUp')
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'B', index: 1 })
    await key('End')
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'B', index: 4 })
    await key('ArrowUp')
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'B', index: 4 })
  })

  it('顶点是数据标记：名字是「指标, 实体 值」，锚点顶点占 Tab 位', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    const [first, second] = byPart(api, 'point') as SymbolMark[]
    const props = api.getMarkProps(first!) as Dict
    expect([props.role, props['aria-label'], props.tabindex]).toEqual(['graphics-symbol', '速度, A 80', 0])
    expect((api.getMarkProps(second!) as Dict).tabindex).toBe(-1)
    const group = byPart(api, 'series')[0]!
    const g = api.getMarkProps(group) as Dict
    expect([g.role, g['aria-label'], g['data-xh-chart-slot']]).toEqual(['graphics-object', 'A', '1'])
    expect((api.getMarkProps(byPart(api, 'indicator-label')[0]!) as Dict)['aria-hidden']).toBe(true)
  })

  it('联动：受控 activeKey 是指标的 key，其余图在同一个指标上一起指示', async () => {
    const rig = await makeRig({ ...BASE, activeKey: 'range' })
    expect(rig.api().tooltip?.header).toBe('续航')
  })
})

describe('入场与无障碍', () => {
  it('入场从圆心张开：轮廓与顶点都收在圆心，网格与指标名淡入', async () => {
    const rig = await makeRig(BASE)
    const target = rig.api().model.scene!.scene
    const entry = radarEntryScene(target)
    const { cx, cy } = rig.api().model.scene!.layout
    const lines = all(entry.layers.data).filter((m): m is LineMark => m.kind === 'line')
    expect(lines.every(l => l.points.every(p => p.x === cx && p.y === cy))).toBe(true)
    expect(entry.layers.back).toHaveLength(0)
  })

  it('摘要写实体数、指标数与每个实体最高最低的指标；数据表每个实体一行、每个指标一列', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect(api.summary).toBe('2 series across 5 indicators. A: highest 速度 80, lowest 价格 40. B: highest 动力 90, lowest 舒适 60.')
    expect(api.table.columns.map(c => c.label)).toEqual(['Name', '速度', '动力', '续航', '价格', '舒适'])
    expect(api.table.rows.map(r => r.cells.map(c => c.text))).toEqual([['A', '80', '60', '70', '40', '90'], ['B', '60', '90', '50', '70', '60']])
  })
})
