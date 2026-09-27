// @vitest-environment jsdom
// 漏斗图：规格与诊断、转化率与色阶位置、梯形 / 条形 / 对齐 / 金字塔的几何、标签与转化率的落位、命中与键盘、入场、无障碍。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { LineMark, Mark, TextMark } from '@xihan-ui/viz'
import type { FunnelChartApi, FunnelChartSchema } from '../src/funnel-chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectFunnelChart, funnelChartMachine } from '../src/funnel-chart'
import { funnelEntryScene } from '../src/funnel-chart/funnel-chart.model'

type Dict = Record<string, any>
type Props = Partial<FunnelChartSchema['props']>

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
  { stage: '访问', users: 10000 },
  { stage: '注册', users: 4000 },
  { stage: '下单', users: 1000 },
  { stage: '复购', users: 400 },
]
const BASE: Props = { data: DATA, nameField: 'stage', valueField: 'users' }

interface Rig {
  service: Service<FunnelChartSchema>
  api: () => FunnelChartApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size = { width: 480, height: 320 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(funnelChartMachine, { props: () => props.get(), runtime })
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
    api: () => connectFunnelChart(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

function byPart(api: FunnelChartApi, part: string): Mark[] {
  return [...api.scene.layers.data, ...api.scene.layers.front].filter(m => m.part === part)
}

function widths(api: FunnelChartApi): { top: number, bottom: number }[] {
  return (byPart(api, 'stage') as LineMark[]).map(s => ({ top: s.points[1]!.x - s.points[0]!.x, bottom: s.points[2]!.x - s.points[3]!.x }))
}

describe('规格与派生', () => {
  it('转化率：相对上一阶段与相对第一阶段；第一阶段没有转化率', async () => {
    const rig = await makeRig(BASE)
    const { visible } = rig.api().model.derived
    expect(visible.map(s => s.previous)).toEqual([null, 0.4, 0.25, 0.4])
    expect(visible.map(s => s.first)).toEqual([null, 0.4, 0.1, 0.04])
  })

  it('色阶位置：第一阶段最深，逐级变浅到 30%', async () => {
    const rig = await makeRig(BASE)
    const ts = rig.api().model.derived.visible.map(s => s.t)
    expect(ts[0]).toBe(1)
    expect(ts[3]).toBeCloseTo(0.3)
    expect((rig.api().getMarkProps(byPart(rig.api(), 'stage')[0]!) as Dict)['data-seg']).toBe('high')
  })

  it('负值报 chart.negative-share、根上写 data-state="error"；字段不存在报 chart.unknown-field', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const rig = await makeRig({ ...BASE, data: [{ stage: 'a', users: 3 }, { stage: 'b', users: -1 }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartNegativeShare)
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
    await makeRig({ ...BASE, valueField: 'count' })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartUnknownField)
  })

  it('递增的阶段转化率大于 100%', async () => {
    const rig = await makeRig({ ...BASE, data: [{ stage: 'a', users: 100 }, { stage: 'b', users: 150 }] })
    expect(rig.api().model.derived.visible[1]!.previous).toBe(1.5)
  })

  it('隐藏一个阶段：不画它，转化率跳过它按相邻的可见阶段算', async () => {
    const rig = await makeRig({ ...BASE, defaultHiddenSeries: ['注册'] })
    const { visible } = rig.api().model.derived
    expect(visible.map(s => s.spec.id)).toEqual(['访问', '下单', '复购'])
    expect(visible[1]!.previous).toBe(0.1)
  })
})

describe('几何', () => {
  it('梯形：上边取自己的宽度，下边接下一阶段的宽度，最后一个阶段两边一样宽；宽度与数值成正比', async () => {
    const rig = await makeRig(BASE)
    const w = widths(rig.api())
    expect(w[1]!.top / w[0]!.top).toBeCloseTo(0.4)
    expect(w[0]!.bottom).toBeCloseTo(w[1]!.top)
    expect(w[3]!.bottom).toBeCloseTo(w[3]!.top)
  })

  it('条形：上下两边都是自己的宽度，居中排列', async () => {
    const rig = await makeRig({ ...BASE, shape: 'bar' })
    const stages = byPart(rig.api(), 'stage') as LineMark[]
    expect(widths(rig.api()).every(w => Math.abs(w.top - w.bottom) < 0.01)).toBe(true)
    const centers = stages.map(s => (s.points[0]!.x + s.points[1]!.x) / 2)
    expect(new Set(centers.map(c => c.toFixed(3))).size).toBe(1)
  })

  it('align="start"：左缘对齐', async () => {
    const rig = await makeRig({ ...BASE, align: 'start', shape: 'bar' })
    const lefts = (byPart(rig.api(), 'stage') as LineMark[]).map(s => s.points[0]!.x)
    expect(new Set(lefts.map(x => x.toFixed(3))).size).toBe(1)
  })

  it('direction="up"：金字塔，第一阶段在最下面，梯形朝上接下一阶段', async () => {
    const rig = await makeRig({ ...BASE, direction: 'up' })
    const stages = byPart(rig.api(), 'stage') as LineMark[]
    expect(stages[0]!.points[0]!.y).toBeGreaterThan(stages[1]!.points[0]!.y)
    const w = widths(rig.api())
    // 第一阶段的下边是自己的宽度、上边接第二阶段
    expect(w[0]!.top).toBeCloseTo(w[1]!.bottom)
  })

  it('labels="inside"：放得下写在阶段里，窄的阶段写到阶段右边；转化率写在左侧、落在两个阶段的交界处', async () => {
    const rig = await makeRig({ ...BASE, labels: 'inside' })
    const api = rig.api()
    const labels = byPart(api, 'stage-label') as TextMark[]
    expect(labels.map(l => l.text)).toEqual(['访问 10,000', '注册 4,000', '下单 1,000', '复购 400'])
    const placements = labels.map(l => (api.getMarkProps(l) as Dict)['data-placement'])
    expect(placements[0]).toBe('inside')
    expect(placements[3]).toBe('outside')
    const conversions = byPart(api, 'conversion') as TextMark[]
    expect(conversions.map(c => c.text)).toEqual(['40.0%', '25.0%', '40.0%'])
    const stages = byPart(api, 'stage') as LineMark[]
    expect(conversions[0]!.y).toBeGreaterThan(stages[0]!.points[3]!.y - 0.01)
    expect(conversions[0]!.y).toBeLessThan(stages[1]!.points[0]!.y + 0.01)
    expect(conversions[0]!.anchor).toBe('end')
  })

  it('conversion="none" 不写转化率、左侧不留列；缺省的外侧标签跟在各阶段的右边，最宽的那条也在视口里', async () => {
    const rig = await makeRig({ ...BASE, conversion: 'none' })
    const api = rig.api()
    expect(byPart(api, 'conversion')).toHaveLength(0)
    expect(api.model.scene!.layout.left).toBe(0)
    const labels = byPart(api, 'stage-label') as TextMark[]
    const stages = byPart(api, 'stage') as LineMark[]
    const gap = api.model.scene!.layout.metrics.labelGap
    labels.forEach((l, i) => expect(l.x).toBeCloseTo(Math.max(stages[i]!.points[1]!.x, stages[i]!.points[2]!.x) + gap))
    expect(labels.every(l => (api.getMarkProps(l) as Dict)['data-placement'] === 'outside')).toBe(true)
    expect(labels[0]!.text).toBe('访问 10,000')
  })
})

describe('命中、提示框与键盘', () => {
  it('指着一行就命中那个阶段；提示框写数值与两种转化率，其余阶段淡出', async () => {
    const rig = await makeRig(BASE)
    const g = rig.api().model.scene!.layout.stages[2]!
    const { width, height } = rig.api().model.scene!.layout.size
    ;(rig.api().getPlotProps() as Dict).onPointerMove({ clientX: 5, clientY: g.y + g.height / 2, currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width, height }) } })
    await settle()
    const api = rig.api()
    expect(api.tooltip).toEqual({ header: '下单', rows: [{ key: 'value', name: 'Value', value: '1,000' }, { key: 'previous', name: 'From previous', value: '25.0%' }, { key: 'first', name: 'From first', value: '10.0%' }] })
    const stages = byPart(api, 'stage')
    expect(stages.map(s => (api.getMarkProps(s) as Dict)['data-dimmed'])).toEqual(['', '', undefined, ''])
  })

  it('下键与右键到下一阶段；金字塔里上键是下一阶段', async () => {
    const key = async (rig: Rig, name: string): Promise<void> => {
      ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault: vi.fn() })
      await settle()
    }
    const rig = await makeRig(BASE)
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: '访问', index: 0 }, key: '访问', focus: true, visible: true })
    await settle()
    await key(rig, 'ArrowDown')
    expect(rig.service.context.get('focused')?.seriesId).toBe('注册')
    await key(rig, 'ArrowRight')
    expect(rig.service.context.get('focused')?.seriesId).toBe('下单')
    const up = await makeRig({ ...BASE, direction: 'up' })
    up.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: '访问', index: 0 }, key: '访问', focus: true, visible: true })
    await settle()
    await key(up, 'ArrowUp')
    expect(up.service.context.get('focused')?.seriesId).toBe('注册')
    await key(up, 'ArrowDown')
    expect(up.service.context.get('focused')?.seriesId).toBe('访问')
  })

  it('阶段是数据标记：名字写阶段名、数值与相对上一阶段的转化率', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    const [first, second] = byPart(api, 'stage')
    expect((api.getMarkProps(first!) as Dict)['aria-label']).toBe('访问, 10,000')
    const props = api.getMarkProps(second!) as Dict
    expect([props.role, props['aria-label'], props.tabindex]).toEqual(['graphics-symbol', '注册, 4,000, 40.0% of previous', -1])
  })
})

describe('入场与无障碍', () => {
  it('入场：居中的阶段都收到中线横向展开，左对齐的收到左缘', async () => {
    const rig = await makeRig(BASE)
    const target = rig.api().model.scene!.scene
    const entry = funnelEntryScene(target)
    const xs = (entry.layers.data as LineMark[]).flatMap(s => s.points.map(p => p.x))
    expect(new Set(xs.map(x => x.toFixed(3))).size).toBe(1)
    const start = await makeRig({ ...BASE, align: 'start' })
    const left = start.api().model.scene!.layout.left
    const flush = (funnelEntryScene(start.api().model.scene!.scene).layers.data as LineMark[]).flatMap(s => s.points.map(p => p.x))
    expect(flush.every(x => Math.abs(x - left) < 0.01)).toBe(true)
  })

  it('摘要写阶段数、首尾、总转化率与流失最多的一步；数据表四列', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect(api.summary).toBe('4 stages from 访问 (10,000) to 复购 (400). Overall conversion 4.0%. Largest drop: 注册 to 下单, 25.0% kept.')
    expect(api.table.columns.map(c => c.label)).toEqual(['Stage', 'Value', 'From previous', 'From first'])
    expect(api.table.rows[0]!.cells.map(c => c.text)).toEqual(['访问', '10,000', 'No value', 'No value'])
    expect(api.table.rows[2]!.cells.map(c => c.text)).toEqual(['下单', '1,000', '25.0%', '10.0%'])
  })
})
