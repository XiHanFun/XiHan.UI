// @vitest-environment jsdom
// 饼图：规格归一与「其他」合并、角度次序与隐藏、环形 / 半环 / 玫瑰的几何、外侧标签避让、命中与提示框、键盘与图例、无障碍。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { ArcMark, Mark } from '@xihan-ui/viz'
import type { PieChartApi, PieChartSchema } from '../src/pie-chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectPieChart, pieChartMachine } from '../src/pie-chart'

type Dict = Record<string, any>
type Props = Partial<PieChartSchema['props']>

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
  { region: '华东', sales: 40 },
  { region: '华南', sales: 25 },
  { region: '华北', sales: 20 },
  { region: '西部', sales: 10 },
  { region: '东北', sales: 5 },
]

const BASE: Props = { data: DATA, nameField: 'region', valueField: 'sales' }

interface Rig {
  service: Service<PieChartSchema>
  api: () => PieChartApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size = { width: 480, height: 320 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  // 几何用例看终态；过渡另有用例，显式打开 animated
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(pieChartMachine, { props: () => props.get(), runtime })
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
    api: () => connectPieChart(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

function slices(api: PieChartApi): ArcMark[] {
  return api.scene.layers.data.filter((m: Mark): m is ArcMark => m.kind === 'arc')
}

function ids(api: PieChartApi): string[] {
  return slices(api).map(m => m.datum!.seriesId)
}

describe('规格与「其他」', () => {
  it('每行一个扇区，色槽按数据次序；缺省按数值从大到小、自 12 点顺时针', async () => {
    const rig = await makeRig({ ...BASE, data: [DATA[3]!, DATA[0]!, DATA[1]!] })
    const api = rig.api()
    expect(api.legendItems.map(i => [i.id, i.slot])).toEqual([['西部', 1], ['华东', 2], ['华南', 3]])
    expect(ids(api)).toEqual(['华东', '华南', '西部'])
    expect(slices(api)[0]!.startAngle).toBeCloseTo(0, 5)
  })

  it('sort: none 按数据次序', async () => {
    const rig = await makeRig({ ...BASE, sort: 'none', data: [DATA[3]!, DATA[0]!] })
    expect(ids(rig.api())).toEqual(['西部', '华东'])
  })

  it('超过 maxSlices 时尾部的小扇区并成「其他」，排在最后、取「其他」色', async () => {
    const rig = await makeRig({ ...BASE, maxSlices: 4 })
    const api = rig.api()
    expect(api.legendItems.map(i => i.id)).toEqual(['华东', '华南', '华北', '__other__'])
    const other = api.legendItems.at(-1)!
    expect(other).toMatchObject({ name: 'Other', slot: null, other: true })
    expect(ids(api).at(-1)).toBe('__other__')
    expect((api.getLegendItemProps(other) as Dict)['data-xh-chart-slot']).toBe('other')
  })

  it('负值报 negative-share，根上 data-state="error"、不画扇区', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const rig = await makeRig({ ...BASE, data: [{ region: 'A', sales: -1 }, { region: 'B', sales: 2 }] })
    expect(seen.some(r => r.code === DIAGNOSTIC_CODES.chartNegativeShare)).toBe(true)
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
    expect(slices(rig.api())).toHaveLength(0)
  })

  it('字段拼错报 unknown-field', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    await makeRig({ ...BASE, valueField: 'amount' })
    expect(seen.some(r => r.code === DIAGNOSTIC_CODES.chartUnknownField)).toBe(true)
  })

  it('全部为 0 进入空态', async () => {
    const rig = await makeRig({ ...BASE, data: [{ region: 'A', sales: 0 }, { region: 'B', sales: 0 }] })
    expect(rig.api().empty).toBe(true)
    expect((rig.api().getEmptyProps() as Dict).hidden).toBeUndefined()
  })
})

describe('几何', () => {
  it('环形：内半径是外半径的 0.6；扇区首尾相接闭成一整圈', async () => {
    const rig = await makeRig(BASE)
    const arcs = slices(rig.api())
    expect(arcs[0]!.innerRadius / arcs[0]!.outerRadius).toBeCloseTo(0.6, 5)
    expect(arcs[0]!.startAngle).toBeCloseTo(0, 5)
    expect(arcs.at(-1)!.endAngle).toBeCloseTo(2 * Math.PI, 5)
    for (let i = 1; i < arcs.length; i++)
      expect(arcs[i]!.startAngle).toBeCloseTo(arcs[i - 1]!.endAngle, 5)
  })

  it('扇区四角取与柱同一档圆角（度量槽），焦点环的圆角放大一道间隙', async () => {
    const rig = await makeRig(BASE)
    const radius = rig.service.context.get('metrics').radius
    expect(radius).toBe(4)
    expect(slices(rig.api()).every(a => a.cornerRadius === radius)).toBe(true)
    rig.service.send({ type: 'DATUM.FOCUS', ref: slices(rig.api())[0]!.datum!, key: '华东', focus: true, visible: true })
    await settle()
    const ring = rig.api().overlay.over[0] as ArcMark
    expect(ring.cornerRadius).toBe(radius + rig.service.context.get('metrics').gap + 1)
  })

  it('pie：实心，没有环形中心', async () => {
    const rig = await makeRig({ ...BASE, variant: 'pie' })
    expect(slices(rig.api())[0]!.innerRadius).toBe(0)
    expect((rig.api().getCenterProps() as Dict).hidden).toBe(true)
  })

  it('半环：自 9 点扫到 3 点', async () => {
    const rig = await makeRig({ ...BASE, sweep: 'half' })
    const arcs = slices(rig.api())
    expect(arcs[0]!.startAngle).toBeCloseTo(-Math.PI / 2, 5)
    expect(arcs.at(-1)!.endAngle).toBeCloseTo(Math.PI / 2, 5)
  })

  it('玫瑰图：角度均分，半径按数值的平方根', async () => {
    const rig = await makeRig({ ...BASE, rose: true, variant: 'pie', labels: 'none' })
    const arcs = slices(rig.api())
    const span = arcs.map(a => a.endAngle - a.startAngle)
    expect(span[0]).toBeCloseTo(span[4]!, 5)
    // 40 与 10：半径之比是 √4 = 2
    expect(arcs[0]!.outerRadius / arcs[3]!.outerRadius).toBeCloseTo(2, 5)
  })

  it('外侧标签：每个扇区一条引导线与一个标签，同一侧的标签不互相压', async () => {
    const rig = await makeRig(BASE)
    const front = rig.api().scene.layers.front
    const labels = front.filter(m => m.part === 'slice-label')
    expect(labels).toHaveLength(5)
    expect(front.filter(m => m.part === 'leader-line')).toHaveLength(5)
    const lineHeight = rig.service.context.get('metrics').font.lineHeight
    for (const anchor of ['start', 'end']) {
      const ys = labels.filter(m => m.kind === 'text' && m.anchor === anchor).map(m => (m as { y: number }).y).sort((a, b) => a - b)
      for (let i = 1; i < ys.length; i++)
        expect(ys[i]! - ys[i - 1]!).toBeGreaterThanOrEqual(lineHeight - 0.01)
    }
  })

  it('视口太窄放不下外侧标签时不画，饼本身保住', async () => {
    const rig = await makeRig(BASE, { width: 120, height: 120 })
    expect(rig.api().scene.layers.front).toHaveLength(0)
    expect(slices(rig.api())[0]!.outerRadius).toBeGreaterThan(40)
  })
})

describe('悬停、键盘与图例', () => {
  it('指针落在扇区上：提示框头部是扇区名，一行数值与占比；其余扇区淡出', async () => {
    const onDatumActive = vi.fn()
    const rig = await makeRig({ ...BASE, onDatumActive })
    const arc = slices(rig.api())[1]!
    const mid = (arc.startAngle + arc.endAngle) / 2
    const r = (arc.innerRadius + arc.outerRadius) / 2
    const x = arc.cx + Math.sin(mid) * r
    const y = arc.cy - Math.cos(mid) * r
    rig.service.send({ type: 'HOVER', hover: { ref: arc.datum!, x, y }, key: '华南' })
    await settle()
    const api = rig.api()
    expect(api.tooltip).toEqual({ header: '华南', rows: [{ key: '华南', name: '25.0%', value: '25', slot: 2, other: false }] })
    expect(onDatumActive).toHaveBeenLastCalledWith(expect.objectContaining({ seriesId: '华南', key: '华南' }))
    const dimmed = slices(api).map(m => (api.getMarkProps(m) as Dict)['data-dimmed'])
    expect(dimmed).toEqual(['', undefined, '', '', ''])
  })

  it('「其他」的提示框列出被合并的各项', async () => {
    const rig = await makeRig({ ...BASE, maxSlices: 3 })
    const other = slices(rig.api()).at(-1)!
    rig.service.send({ type: 'HOVER', hover: { ref: other.datum!, x: 0, y: 0 }, key: '__other__' })
    await settle()
    const tooltip = rig.api().tooltip!
    expect(tooltip.header).toBe('Other')
    expect(tooltip.rows.map(r => [r.name, r.value])).toEqual([['35.0%', '35'], ['华北', '20'], ['西部', '10'], ['东北', '5']])
  })

  it('键盘：锚点扇区占 Tab 位，右键顺时针走、End 到最后，到头原地不动', async () => {
    const rig = await makeRig(BASE)
    const tabbable = () => slices(rig.api()).map(m => (rig.api().getMarkProps(m) as Dict).tabindex)
    expect(tabbable()).toEqual([0, -1, -1, -1, -1])
    const key = (k: string) => ({ key: k, preventDefault: vi.fn() }) as unknown as KeyboardEvent
    rig.service.send({ type: 'DATUM.FOCUS', ref: slices(rig.api())[0]!.datum!, key: '华东' })
    await settle()
    ;(rig.api().getPlotProps() as Dict).onKeyDown(key('ArrowRight'))
    await settle()
    expect(tabbable()).toEqual([-1, 0, -1, -1, -1])
    ;(rig.api().getPlotProps() as Dict).onKeyDown(key('End'))
    await settle()
    expect(tabbable()).toEqual([-1, -1, -1, -1, 0])
    const stay = key('ArrowRight')
    ;(rig.api().getPlotProps() as Dict).onKeyDown(stay)
    expect(stay.preventDefault).toHaveBeenCalled()
  })

  it('图例隐藏一个扇区：合计与占比跟着变，环形中心显示新的合计', async () => {
    const changes: string[][] = []
    const rig = await makeRig({ ...BASE, onHiddenSeriesChange: d => changes.push(d.hiddenSeries) })
    expect(rig.api().center).toEqual({ value: '100', label: 'Total' })
    rig.api().toggleSeries('华东')
    await settle()
    expect(changes).toEqual([['华东']])
    expect(ids(rig.api())).not.toContain('华东')
    expect(rig.api().center.value).toBe('60')
    expect((rig.api().getLegendItemProps(rig.api().legendItems[0]!) as Dict)['aria-pressed']).toBe('false')
  })

  it('受控 activeKey：别的图联动过来的类目点亮提示框，但不回报', async () => {
    const onDatumActive = vi.fn()
    const rig = await makeRig({ ...BASE, activeKey: '华北', onDatumActive })
    expect(rig.api().tooltip?.header).toBe('华北')
    expect(onDatumActive).not.toHaveBeenCalled()
  })
})

describe('无障碍', () => {
  it('扇区的可及名是「名字, 数值, 占比」；摘要写最大与最小；数据表三列', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect((api.getMarkProps(slices(api)[0]!) as Dict)['aria-label']).toBe('华东, 40, 40.0%')
    expect(api.summary).toBe('5 slices, total 100. Largest: 华东 40.0%. Smallest: 东北 5.0%.')
    expect(api.table.columns.map(c => c.label)).toEqual(['Name', 'Value', 'Share'])
    expect(api.table.rows[0]!.cells.map(c => c.text)).toEqual(['华东', '40', '40.0%'])
  })
})

describe('过渡', () => {
  // 帧与时钟都由假计时器推进：requestAnimationFrame 每 16ms 一帧，performance.now 随之走
  const FRAMES: Parameters<typeof vi.useFakeTimers>[0] = { toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] }

  afterEach(() => vi.useRealTimers())

  it('入场：扇区都收在 12 点，整圈顺着扫开，标签淡入；走完落到目标场景', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({ ...BASE, animated: true })
    const target = rig.api().model.scene!.scene
    const start = slices(rig.api())
    expect(start.every(a => a.startAngle === 0 && a.endAngle === 0)).toBe(true)
    expect(rig.api().scene.layers.front.every(m => m.opacity === 0)).toBe(true)

    vi.advanceTimersByTime(80)
    const mid = slices(rig.api())
    const last = mid[mid.length - 1]!
    expect(last.endAngle).toBeGreaterThan(0)
    expect(last.endAngle).toBeLessThan(Math.PI * 2)
    // 整圈按同一个比例放开：前一块的终点就是后一块的起点
    mid.slice(1).forEach((arc, i) => expect(arc.startAngle).toBeCloseTo(mid[i]!.endAngle, 9))

    vi.advanceTimersByTime(1000)
    expect(rig.api().scene).toBe(target)
  })

  it('图例隐藏一个扇区：它收拢并淡出，颜色留着，收场期间不可聚焦', async () => {
    vi.useFakeTimers(FRAMES)
    const rig = await makeRig({ ...BASE, animated: true })
    vi.advanceTimersByTime(1000)
    rig.api().toggleSeries('华东')
    vi.advanceTimersByTime(80)
    const api = rig.api()
    const leaving = slices(api).find(a => a.datum!.seriesId === '华东')!
    expect(leaving.exiting).toBe(true)
    expect(leaving.opacity).toBeLessThan(1)
    const props = api.getMarkProps(leaving) as Dict
    expect(props).toMatchObject({ 'aria-hidden': true, 'data-xh-chart-slot': '1' })
    expect(props.tabindex).toBeUndefined()
    expect(props.role).toBeUndefined()
    vi.advanceTimersByTime(1000)
    expect(ids(rig.api())).not.toContain('华东')
  })
})
