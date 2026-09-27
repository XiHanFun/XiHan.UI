// @vitest-environment jsdom
// 桑基图：规格与诊断、分组色槽与图例显隐、横竖两种流向的几何、名字的落位、命中与提示框、强调、按列的键盘、流带着色、入场、无障碍。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { AreaMark, Mark, RectMark, TextMark } from '@xihan-ui/viz'
import type { SankeyChartApi, SankeyChartSchema } from '../src/sankey-chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { markPath } from '@xihan-ui/viz'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectSankeyChart, sankeyChartMachine } from '../src/sankey-chart'
import { sankeyEntryScene } from '../src/sankey-chart/sankey-chart.model'

type Dict = Record<string, any>
type Props = Partial<SankeyChartSchema['props']>

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise<void>(r => queueMicrotask(r))
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.innerHTML = ''
})

// 四列：[搜索, 广告] → [首页] → [详情] → [下单, 离开]
const NODES = [
  { id: 'search', name: '搜索', group: '渠道' },
  { id: 'ads', name: '广告', group: '渠道' },
  { id: 'home', name: '首页', group: '页面' },
  { id: 'detail', name: '详情', group: '页面' },
  { id: 'order', name: '下单', group: '结果' },
  { id: 'leave', name: '离开', group: '结果' },
]
const LINKS = [
  { source: 'search', target: 'home', value: 300 },
  { source: 'ads', target: 'home', value: 200 },
  { source: 'ads', target: 'detail', value: 100 },
  { source: 'home', target: 'detail', value: 350 },
  { source: 'home', target: 'leave', value: 150 },
  { source: 'detail', target: 'order', value: 250 },
  { source: 'detail', target: 'leave', value: 200 },
]
const BASE: Props = { nodes: NODES, links: LINKS }

interface Rig {
  service: Service<SankeyChartSchema>
  api: () => SankeyChartApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size = { width: 640, height: 360 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(sankeyChartMachine, { props: () => props.get(), runtime })
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
    api: () => connectSankeyChart(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

function byPart(api: SankeyChartApi, part: string): Mark[] {
  return [...api.scene.layers.data, ...api.scene.layers.front].filter(m => m.part === part)
}

function node(api: SankeyChartApi, id: string): RectMark {
  return byPart(api, 'node').find(m => m.key === `node:${id}`) as RectMark
}

function plotRect(api: SankeyChartApi): { getBoundingClientRect: () => Dict } {
  const { width, height } = api.model.scene!.layout.size
  return { getBoundingClientRect: () => ({ left: 0, top: 0, width, height }) }
}

async function hover(rig: Rig, x: number, y: number): Promise<void> {
  ;(rig.api().getPlotProps() as Dict).onPointerMove({ clientX: x, clientY: y, currentTarget: plotRect(rig.api()) })
  await settle()
}

async function key(rig: Rig, name: string): Promise<void> {
  ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault: vi.fn() })
  await settle()
}

function focusedId(rig: Rig): string | undefined {
  const ref = rig.service.context.get('focused')
  return ref?.seriesId === 'node' ? NODES[ref.index]?.id : undefined
}

async function focus(rig: Rig, id: string): Promise<void> {
  const index = NODES.findIndex(n => n.id === id)
  rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'node', index }, key: id, focus: true, visible: true })
  await settle()
}

describe('规格与派生', () => {
  it('分组按第一次出现的先后分色槽，图例一组一项', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect(api.legendItems.map(i => [i.id, i.slot])).toEqual([['渠道', 1], ['页面', 2], ['结果', 3]])
    expect((api.getMarkProps(node(api, 'detail')) as Dict)['data-xh-chart-slot']).toBe('2')
  })

  it('不写 nodes 时从流带推断：名字即身份，全部色槽 1，图例收起', async () => {
    const rig = await makeRig({ links: LINKS })
    const api = rig.api()
    expect(api.model.spec.nodes.map(n => n.id)).toEqual(['search', 'home', 'ads', 'detail', 'leave', 'order'])
    expect(api.model.spec.nodes.every(n => n.slot === 1 && n.name === n.id)).toBe(true)
    expect((api.getLegendProps() as Dict).hidden).toBe(true)
  })

  it('成环、自环与不存在的节点报 chart.sankey-shape；负值报 chart.negative-share；根上写 data-state="error"', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const cycle = await makeRig({ links: [{ source: 'a', target: 'b', value: 1 }, { source: 'b', target: 'a', value: 1 }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartSankeyShape)
    expect(seen.find(r => r.code === DIAGNOSTIC_CODES.chartSankeyShape)!.detail).toMatchObject({ cycle: ['a', 'b', 'a'] })
    expect((cycle.api().getRootProps() as Dict)['data-state']).toBe('error')
    seen.length = 0
    await makeRig({ links: [{ source: 'a', target: 'a', value: 1 }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartSankeyShape)
    seen.length = 0
    await makeRig({ nodes: [{ id: 'a' }], links: [{ source: 'a', target: 'x', value: 1 }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartSankeyShape)
    seen.length = 0
    await makeRig({ links: [{ source: 'a', target: 'b', value: -1 }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartNegativeShare)
  })

  it('多于 8 个分组报 chart.too-many-series', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const nodes = Array.from({ length: 10 }, (_, i) => ({ id: `n${i}`, group: `g${i}` }))
    const links = Array.from({ length: 9 }, (_, i) => ({ source: `n${i}`, target: `n${i + 1}`, value: 1 }))
    await makeRig({ nodes, links })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartTooManySeries)
  })

  it('隐藏一组：它的节点与连着它们的流带不画，其余重新排', async () => {
    const rig = await makeRig({ ...BASE, defaultHiddenSeries: ['结果'] })
    const api = rig.api()
    expect(byPart(api, 'node').map(m => m.key)).toEqual(['node:search', 'node:ads', 'node:home', 'node:detail'])
    expect(byPart(api, 'link')).toHaveLength(4)
    expect(api.legendItems.find(i => i.id === '结果')!.hidden).toBe(true)
  })
})

describe('几何', () => {
  it('横排：四列自左而右；节点高度与流量成正比；流带两端贴着节点', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    const columns = api.model.scene!.layout.columns.map(c => c.map(g => g.node.id))
    expect(columns).toEqual([['search', 'ads'], ['home'], ['detail'], ['order', 'leave']])
    const xs = columns.map(c => node(api, c[0]!).x)
    expect([...xs].sort((a, b) => a - b)).toEqual(xs)
    expect(node(api, 'home').height / node(api, 'order').height).toBeCloseTo(500 / 250, 1)
    const link = byPart(api, 'link')[0] as AreaMark
    const home = node(api, 'home')
    const search = node(api, 'search')
    expect(link.points[0]!.x).toBeCloseTo(search.x + search.width)
    expect(link.points[1]!.x).toBeCloseTo(home.x)
    expect(link.curve).toBe('bumpX')
  })

  it('节点不贴基线，四角都圆', async () => {
    const rig = await makeRig(BASE)
    const home = node(rig.api(), 'home')
    expect(home.baseline).toBe('none')
    expect(markPath(home).match(/A/g)).toHaveLength(4)
  })

  it('名字写在列间的空当里：前半程写在节点右边，后半程写在左边', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    const labels = byPart(api, 'node-label') as TextMark[]
    const of = (id: string): TextMark => labels.find(l => l.key === `label:${id}`)!
    expect(of('search').anchor).toBe('start')
    expect(of('search').x).toBeGreaterThan(node(api, 'search').x + node(api, 'search').width)
    expect(of('order').anchor).toBe('end')
    expect(of('order').x).toBeLessThan(node(api, 'order').x)
  })

  it('竖排：各列自上而下，流带用 bumpY', async () => {
    const rig = await makeRig({ ...BASE, orientation: 'vertical' })
    const api = rig.api()
    expect(node(api, 'search').y).toBeLessThan(node(api, 'home').y)
    expect(node(api, 'home').y).toBeLessThan(node(api, 'order').y)
    expect((byPart(api, 'link')[0] as AreaMark).curve).toBe('bumpY')
  })
})

describe('命中、提示框与强调', () => {
  it('指着节点：提示框写合计、流入与流出的明细；连着它的流带换成它的颜色，其余淡出', async () => {
    const rig = await makeRig(BASE)
    const home = node(rig.api(), 'home')
    await hover(rig, home.x + home.width / 2, home.y + home.height / 2)
    const api = rig.api()
    expect(api.tooltip).toEqual({
      header: '首页',
      rows: [
        { key: 'value', name: 'Value', value: '500', slot: 2, kind: 'value' },
        { key: 'in:search', name: 'From 搜索', value: '300', slot: 1, kind: 'in' },
        { key: 'in:ads', name: 'From 广告', value: '200', slot: 1, kind: 'in' },
        { key: 'out:detail', name: 'To 详情', value: '350', slot: 2, kind: 'out' },
        { key: 'out:leave', name: 'To 离开', value: '150', slot: 3, kind: 'out' },
      ],
    })
    const links = byPart(api, 'link').map(m => api.getMarkProps(m) as Dict)
    // 0 search→home 与 1 ads→home 连着首页；2 ads→detail 不连
    expect([links[0]!['data-highlighted'], links[0]!['data-xh-chart-slot']]).toEqual(['', '2'])
    expect([links[2]!['data-dimmed'], links[2]!['data-xh-chart-slot']]).toEqual(['', undefined])
    expect((api.getMarkProps(node(api, 'order')) as Dict)['data-dimmed']).toBe('')
    expect((api.getMarkProps(node(api, 'detail')) as Dict)['data-dimmed']).toBeUndefined()
  })

  it('指着流带：提示框写两端、流量与它占两端的比例', async () => {
    const rig = await makeRig(BASE)
    const g = rig.api().model.scene!.layout.byLink.get(3)!
    await hover(rig, (g.from.x + g.to.x) / 2, (g.from.y + g.to.y) / 2)
    const api = rig.api()
    expect(api.tooltip).toEqual({
      header: '首页 → 详情',
      rows: [
        { key: 'value', name: 'Value', value: '350', slot: 2, kind: 'value' },
        { key: 'source', name: 'To 详情', value: '70.0%', slot: null, kind: 'share' },
        { key: 'target', name: 'From 首页', value: '77.8%', slot: null, kind: 'share' },
      ],
    })
    expect(api.active).toMatchObject({ seriesName: '首页 → 详情', key: 'home→detail', index: 3 })
  })

  it('细的节点沿流向放宽到最小命中尺寸', async () => {
    const rig = await makeRig(BASE)
    // 节点比最小命中尺寸细：每边放宽 (hitMin - 宽) / 2
    rig.service.send({ type: 'METRICS', metrics: { ...rig.service.context.get('metrics'), barMax: 8 } })
    await settle()
    const home = node(rig.api(), 'home')
    const pad = (rig.api().model.scene!.layout.metrics.hitMin - home.width) / 2
    expect(pad).toBeGreaterThan(2)
    await hover(rig, home.x - pad + 1, home.y + home.height / 2)
    expect(rig.api().active?.seriesId).toBe('home')
  })

  it('悬停图例项：那一组的节点与连着它们的流带留着，其余淡出', async () => {
    const rig = await makeRig(BASE)
    rig.service.send({ type: 'LEGEND.HOVER', id: '结果' })
    await settle()
    const api = rig.api()
    expect((api.getMarkProps(node(api, 'search')) as Dict)['data-dimmed']).toBe('')
    expect((api.getMarkProps(node(api, 'leave')) as Dict)['data-dimmed']).toBeUndefined()
    const links = byPart(api, 'link').map(m => (api.getMarkProps(m) as Dict)['data-dimmed'])
    expect(links).toEqual(['', '', '', '', undefined, undefined, undefined])
  })
})

describe('键盘', () => {
  it('上下键在同一列里走；右键到下游相邻的一列，取流量最大的相连节点；左键回上游', async () => {
    const rig = await makeRig(BASE)
    await focus(rig, 'search')
    await key(rig, 'ArrowDown')
    expect(focusedId(rig)).toBe('ads')
    await key(rig, 'ArrowRight')
    expect(focusedId(rig)).toBe('home')
    await key(rig, 'ArrowRight')
    expect(focusedId(rig)).toBe('detail')
    await key(rig, 'ArrowRight')
    expect(focusedId(rig)).toBe('order')
    await key(rig, 'ArrowLeft')
    expect(focusedId(rig)).toBe('detail')
    await key(rig, 'Home')
    expect(['search', 'ads']).toContain(focusedId(rig))
    await key(rig, 'End')
    expect(['order', 'leave']).toContain(focusedId(rig))
  })

  it('竖排时左右键在一行里走、上下键跨行', async () => {
    const rig = await makeRig({ ...BASE, orientation: 'vertical' })
    await focus(rig, 'search')
    await key(rig, 'ArrowRight')
    expect(focusedId(rig)).toBe('ads')
    await key(rig, 'ArrowDown')
    expect(focusedId(rig)).toBe('home')
  })

  it('回车与空格报告聚焦的节点', async () => {
    const onDatumPress = vi.fn()
    const rig = await makeRig({ ...BASE, onDatumPress })
    await focus(rig, 'detail')
    await key(rig, 'Enter')
    expect(onDatumPress).toHaveBeenLastCalledWith(expect.objectContaining({ seriesId: 'detail', values: { value: 450, inflow: 450, outflow: 450 } }))
  })
})

describe('着色、语义与无障碍', () => {
  it('linkColor：缺省中性，source / target 取两端的色槽，gradient 每条流带一个渐变', async () => {
    const neutral = await makeRig(BASE)
    expect((neutral.api().getMarkProps(byPart(neutral.api(), 'link')[4]!) as Dict)['data-xh-chart-slot']).toBeUndefined()
    const source = await makeRig({ ...BASE, linkColor: 'source' })
    expect((source.api().getMarkProps(byPart(source.api(), 'link')[4]!) as Dict)['data-xh-chart-slot']).toBe('2')
    const target = await makeRig({ ...BASE, linkColor: 'target' })
    expect((target.api().getMarkProps(byPart(target.api(), 'link')[4]!) as Dict)['data-xh-chart-slot']).toBe('3')
    const gradient = await makeRig({ ...BASE, linkColor: 'gradient' })
    const api = gradient.api()
    expect(api.gradients).toHaveLength(7)
    expect([api.gradients[4]!.from, api.gradients[4]!.to]).toEqual([2, 3])
    const props = api.getMarkProps(byPart(api, 'link')[4]!) as Dict
    expect(props.style['--xh-_sankey-gradient']).toBe(`url(#${api.gradients[4]!.id})`)
    expect((api.getGradientStopProps(api.gradients[4]!, 'to') as Dict)['data-xh-chart-slot']).toBe('3')
  })

  it('节点是数据标记：名字是「名字, 流量」，第一列最上面的节点占 Tab 位；流带对读屏隐藏', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    const props = api.getMarkProps(node(api, 'search')) as Dict
    expect([props.role, props['aria-label'], props.tabindex]).toEqual(['graphics-symbol', '搜索, 300', 0])
    expect((api.getMarkProps(node(api, 'home')) as Dict).tabindex).toBe(-1)
    expect((api.getMarkProps(byPart(api, 'link')[0]!) as Dict)['aria-hidden']).toBe(true)
  })

  it('入场：流带与节点一起淡入', async () => {
    const rig = await makeRig(BASE)
    const entry = sankeyEntryScene(rig.api().model.scene!.scene)
    expect(entry.layers.data.every(m => m.opacity === 0)).toBe(true)
  })

  it('摘要写节点数、流带数、合计与最大的一条流带；数据表每条流带一行', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect(api.summary).toBe('6 nodes, 7 flows, total 600. Largest flow: 首页 to 详情, 350.')
    expect(api.table.columns.map(c => c.label)).toEqual(['Source', 'Target', 'Value'])
    expect(api.table.rows).toHaveLength(7)
    expect(api.table.rows[3]!.cells.map(c => c.text)).toEqual(['首页', '详情', '350'])
  })
})
