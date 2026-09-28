// @vitest-environment jsdom
// 关系图：规格与诊断、阅读序与图例显隐、五种布局的几何、节点面积、有向箭头、连线上的字、命中与强调、按方向的键盘、拖动、平移缩放与受控视图、入场、无障碍。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { ArcMark, LineMark, Mark, TextMark } from '@xihan-ui/viz'
import type { GraphChartApi, GraphChartSchema } from '../src/graph-chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectGraphChart, graphChartMachine } from '../src/graph-chart'
import { graphEntryScene } from '../src/graph-chart/graph-chart.model'

type Dict = Record<string, any>
type Props = Partial<GraphChartSchema['props']>

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise<void>(r => queueMicrotask(r))
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.innerHTML = ''
})

// 三组：甲组三角形 a-b-c，乙组 d-e，丙组 f；c-d、e-f 把它们串起来
const NODES = [
  { id: 'a', name: 'Alpha', group: '甲' },
  { id: 'b', name: 'Beta', group: '甲' },
  { id: 'c', name: 'Gamma', group: '甲' },
  { id: 'd', name: 'Delta', group: '乙' },
  { id: 'e', name: 'Epsilon', group: '乙' },
  { id: 'f', name: 'Zeta', group: '丙' },
]
const LINKS = [
  { source: 'a', target: 'b' },
  { source: 'a', target: 'c' },
  { source: 'b', target: 'c' },
  { source: 'c', target: 'd' },
  { source: 'd', target: 'e' },
  { source: 'e', target: 'f' },
]
const BASE: Props = { nodes: NODES, links: LINKS }

// 一棵树：r → x, y；x → x1, x2；y → y1
const TREE_NODES = ['r', 'x', 'y', 'x1', 'x2', 'y1'].map(id => ({ id }))
const TREE_LINKS = [
  { source: 'r', target: 'x' },
  { source: 'r', target: 'y' },
  { source: 'x', target: 'x1' },
  { source: 'x', target: 'x2' },
  { source: 'y', target: 'y1' },
]

interface Rig {
  service: Service<GraphChartSchema>
  api: () => GraphChartApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size = { width: 640, height: 400 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(graphChartMachine, { props: () => props.get(), runtime })
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
    api: () => connectGraphChart(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

function byPart(api: GraphChartApi, part: string): Mark[] {
  return [...api.scene.layers.data, ...api.scene.layers.front].filter(m => m.part === part)
}

function node(api: GraphChartApi, id: string): ArcMark {
  return byPart(api, 'node').find(m => m.key === `node:${id}`) as ArcMark
}

function plotRect(api: GraphChartApi): { getBoundingClientRect: () => Dict } {
  const { width, height } = api.model.scene!.layout.size
  return { getBoundingClientRect: () => ({ left: 0, top: 0, width, height }) }
}

async function key(rig: Rig, name: string): Promise<void> {
  ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault: vi.fn() })
  await settle()
}

async function focus(rig: Rig, id: string, nodes = NODES as readonly { id: string }[]): Promise<void> {
  const index = nodes.findIndex(n => n.id === id)
  rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'node', index }, key: id, focus: true, visible: true })
  await settle()
}

function focusedId(rig: Rig, nodes = NODES as readonly { id: string }[]): string | undefined {
  const ref = rig.service.context.get('focused')
  return ref?.seriesId === 'node' ? nodes[ref.index]?.id : undefined
}

describe('规格与派生', () => {
  it('分组按第一次出现的先后分色槽；节点的阅读序按分组再按名字', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect(api.legendItems.map(i => [i.id, i.slot])).toEqual([['甲', 1], ['乙', 2], ['丙', 3]])
    expect(byPart(api, 'node').map(m => m.key)).toEqual(['node:a', 'node:b', 'node:c', 'node:d', 'node:e', 'node:f'])
    const shuffled = await makeRig({ nodes: [NODES[2]!, NODES[5]!, NODES[0]!], links: [] })
    expect(byPart(shuffled.api(), 'node').map(m => m.key)).toEqual(['node:a', 'node:c', 'node:f'])
  })

  it('节点重复、端点不存在与自环报 chart.graph-shape，根上写 data-state="error"', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const dup = await makeRig({ nodes: [{ id: 'a' }, { id: 'a' }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartGraphShape)
    expect((dup.api().getRootProps() as Dict)['data-state']).toBe('error')
    seen.length = 0
    await makeRig({ nodes: [{ id: 'a' }], links: [{ source: 'a', target: 'x' }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartGraphShape)
    seen.length = 0
    await makeRig({ nodes: [{ id: 'a' }], links: [{ source: 'a', target: 'a' }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartGraphShape)
  })

  it('树布局下不是树报 chart.graph-shape：两个父节点、根有父节点、走不到的节点', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    await makeRig({ nodes: TREE_NODES, links: [...TREE_LINKS, { source: 'y', target: 'x1' }], layout: 'tree' })
    expect(seen.at(-1)?.message).toMatch(/两个父节点/)
    await makeRig({ nodes: TREE_NODES, links: TREE_LINKS, layout: 'tree', root: 'x' })
    expect(seen.at(-1)?.message).toMatch(/不能有父节点/)
    await makeRig({ nodes: [...TREE_NODES, { id: 'z' }], links: TREE_LINKS, layout: 'tree', root: 'r' })
    expect(seen.at(-1)?.message).toMatch(/走不到/)
    expect(seen.every(r => r.code === DIAGNOSTIC_CODES.chartGraphShape)).toBe(true)
  })

  it('多于 500 个节点按提醒报 chart.graph-size 照常画；多于 2000 个报错不画', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const many = await makeRig({ nodes: Array.from({ length: 501 }, (_, i) => ({ id: `n${i}` })), layout: 'circular' })
    expect(seen.find(r => r.code === DIAGNOSTIC_CODES.chartGraphSize)?.level).toBe('warn')
    expect(byPart(many.api(), 'node')).toHaveLength(501)
    seen.length = 0
    const huge = await makeRig({ nodes: Array.from({ length: 2001 }, (_, i) => ({ id: `n${i}` })), layout: 'circular' })
    expect(seen.find(r => r.code === DIAGNOSTIC_CODES.chartGraphSize)?.level).toBe('error')
    expect((huge.api().getRootProps() as Dict)['data-state']).toBe('error')
  })

  it('隐藏一组：它的节点与连着它们的线不画；树布局下连同子孙一起不画', async () => {
    const rig = await makeRig({ ...BASE, defaultHiddenSeries: ['乙'] })
    expect(byPart(rig.api(), 'node').map(m => m.key)).toEqual(['node:a', 'node:b', 'node:c', 'node:f'])
    expect(byPart(rig.api(), 'link')).toHaveLength(3)
    const nodes = TREE_NODES.map(n => ({ ...n, group: n.id === 'x' ? 'hide' : 'keep' }))
    const tree = await makeRig({ nodes, links: TREE_LINKS, layout: 'tree', defaultHiddenSeries: ['hide'] })
    expect(byPart(tree.api(), 'node').map(m => m.key)).toEqual(['node:r', 'node:y', 'node:y1'])
  })
})

describe('几何', () => {
  it('力导：同样的数据得到同样的布局，节点都在绘图区里，名字写在节点下面', async () => {
    const a = await makeRig(BASE)
    const b = await makeRig(BASE)
    const pa = byPart(a.api(), 'node').map(m => [(m as ArcMark).cx, (m as ArcMark).cy])
    expect(byPart(b.api(), 'node').map(m => [(m as ArcMark).cx, (m as ArcMark).cy])).toEqual(pa)
    for (const [x, y] of pa) {
      expect(x).toBeGreaterThan(0)
      expect(x).toBeLessThan(640)
      expect(y).toBeGreaterThan(0)
      expect(y).toBeLessThan(400)
    }
    const label = byPart(a.api(), 'node-label').find(m => m.key === 'label:a') as TextMark
    const n = node(a.api(), 'a')
    expect(label.y).toBeGreaterThan(n.cy + n.outerRadius)
    expect(label.anchor).toBe('middle')
  })

  it('力导的形状跟着视口的宽高比走：宽视口里横着铺开，窄高视口里竖着铺开', async () => {
    const extent = (api: GraphChartApi): number => {
      const ns = byPart(api, 'node') as ArcMark[]
      const xs = ns.map(n => n.cx)
      const ys = ns.map(n => n.cy)
      return (Math.max(...xs) - Math.min(...xs)) / (Math.max(...ys) - Math.min(...ys))
    }
    const wide = await makeRig(BASE, { width: 900, height: 320 })
    const tall = await makeRig(BASE, { width: 320, height: 640 })
    expect(extent(wide.api())).toBeGreaterThan(1.5)
    expect(extent(tall.api())).toBeLessThan(1)
  })

  it('环形：节点到圆心等距；同组相邻，组间多留一份空当', async () => {
    const rig = await makeRig({ ...BASE, layout: 'circular' })
    const api = rig.api()
    const center = api.model.base!.center!
    const ds = byPart(api, 'node').map(m => Math.hypot((m as ArcMark).cx - center.x, (m as ArcMark).cy - center.y))
    for (const d of ds) expect(d).toBeCloseTo(ds[0]!, 6)
    const angle = (id: string): number => {
      const m = node(api, id)
      return (Math.atan2(m.cx - center.x, center.y - m.cy) + 2 * Math.PI) % (2 * Math.PI)
    }
    const step = angle('b') - angle('a')
    expect(angle('d') - angle('c')).toBeCloseTo(step * 2)
  })

  it('树：根在最左，同一层的节点横坐标相同，叶子在最右；名字叶子写右边、中间节点写左边', async () => {
    const rig = await makeRig({ nodes: TREE_NODES, links: TREE_LINKS, layout: 'tree' })
    const api = rig.api()
    const x = (id: string): number => node(api, id).cx
    expect(x('r')).toBeLessThan(x('x'))
    expect(x('x')).toBeCloseTo(x('y'))
    expect(x('x1')).toBeCloseTo(x('y1'))
    expect(byPart(api, 'node').map(m => m.key)).toEqual(['node:r', 'node:x', 'node:x1', 'node:x2', 'node:y', 'node:y1'])
    const labels = byPart(api, 'node-label') as TextMark[]
    expect(labels.find(l => l.key === 'label:x1')!.anchor).toBe('start')
    expect(labels.find(l => l.key === 'label:x')!.anchor).toBe('end')
    expect((byPart(api, 'link')[0] as LineMark).curve).toBe('bumpX')
  })

  it('径向树：根在圆心，同一层到圆心等距', async () => {
    const rig = await makeRig({ nodes: TREE_NODES, links: TREE_LINKS, layout: 'radial-tree' })
    const api = rig.api()
    const center = api.model.base!.center!
    const d = (id: string): number => Math.hypot(node(api, id).cx - center.x, node(api, id).cy - center.y)
    expect(d('r')).toBeCloseTo(0)
    expect(d('x')).toBeCloseTo(d('y'))
    expect(d('x1')).toBeCloseTo(d('y1'))
    expect(d('x1')).toBeGreaterThan(d('x'))
  })

  it('预设：按节点上的 x / y 等比缩放进绘图区，纵轴向下；名字写在节点下面，节点不能拖', async () => {
    const nodes = [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 100, y: 0 }, { id: 'c', x: 0, y: 50 }]
    const rig = await makeRig({ nodes, links: [{ source: 'a', target: 'b' }], layout: 'preset' })
    const api = rig.api()
    const [a, b, c] = ['a', 'b', 'c'].map(id => node(api, id))
    expect(a!.cy).toBeCloseTo(b!.cy)
    expect(a!.cx).toBeCloseTo(c!.cx)
    expect(c!.cy).toBeGreaterThan(a!.cy)
    // 等比：横向 100、纵向 50 的跨度画出来仍是 2 比 1
    expect((b!.cx - a!.cx) / (c!.cy - a!.cy)).toBeCloseTo(2)
    for (const m of [a!, b!, c!]) {
      expect(m.cx).toBeGreaterThan(0)
      expect(m.cx).toBeLessThan(640)
      expect(m.cy).toBeGreaterThan(0)
      expect(m.cy).toBeLessThan(400)
    }
    const label = byPart(api, 'node-label').find(m => m.key === 'label:a') as TextMark
    expect(label.y).toBeGreaterThan(a!.cy + a!.outerRadius)
    expect((api.getPlotProps() as Dict)['data-draggable']).toBeUndefined()
  })

  it('预设：只有一个点时摆在正中；有节点缺 x / y 报 chart.graph-shape', async () => {
    const one = await makeRig({ nodes: [{ id: 'a', x: 7, y: 9 }], layout: 'preset' })
    const a = node(one.api(), 'a')
    expect(a.cx).toBeCloseTo(320)
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const bad = await makeRig({ nodes: [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 1 }], layout: 'preset' })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartGraphShape)
    expect(seen.at(-1)?.message).toMatch(/b/)
    expect((bad.api().getRootProps() as Dict)['data-state']).toBe('error')
  })

  it('数值按平方根比例尺定面积：大的节点半径大', async () => {
    const rig = await makeRig({ nodes: [{ id: 'a', value: 100 }, { id: 'b', value: 25 }, { id: 'c' }], links: [], layout: 'circular' })
    const api = rig.api()
    expect(node(api, 'a').outerRadius).toBeGreaterThan(node(api, 'b').outerRadius)
    expect(node(api, 'b').outerRadius).toBeGreaterThan(node(api, 'c').outerRadius)
  })

  it('有向：每条线一个箭头，线停在箭头的底边；提示框分出入', async () => {
    const rig = await makeRig({ ...BASE, directed: true, layout: 'circular' })
    const api = rig.api()
    expect(byPart(api, 'arrow')).toHaveLength(6)
    const link = byPart(api, 'link')[3] as LineMark
    const target = node(api, 'd')
    expect(Math.hypot(link.points[1]!.x - target.cx, link.points[1]!.y - target.cy)).toBeGreaterThan(target.outerRadius)
    await focus(rig, 'c')
    expect(rig.api().tooltip).toEqual({ header: 'Gamma', rows: [{ key: 'incoming', name: 'Incoming', value: '2' }, { key: 'outgoing', name: 'Outgoing', value: '1' }] })
  })
})

describe('连线上的字', () => {
  const FAR = [{ id: 'a', name: 'A', x: 0, y: 0 }, { id: 'b', name: 'B', x: 400, y: 0 }, { id: 'c', name: 'C', x: 0, y: 300 }]

  it('写在两端圆心连线的中点，压在节点之上，对读屏隐藏', async () => {
    const rig = await makeRig({ nodes: FAR, links: [{ source: 'a', target: 'b', label: 'owns' }, { source: 'a', target: 'c' }], layout: 'preset' })
    const api = rig.api()
    const labels = byPart(api, 'link-label') as TextMark[]
    expect(labels.map(l => l.text)).toEqual(['owns'])
    const [a, b] = [node(api, 'a'), node(api, 'b')]
    expect(labels[0]!.x).toBeCloseTo((a.cx + b.cx) / 2)
    expect(labels[0]!.y).toBeCloseTo((a.cy + b.cy) / 2)
    expect(api.scene.layers.front).toContain(labels[0])
    expect((api.getMarkProps(labels[0]!) as Dict)['aria-hidden']).toBe(true)
  })

  it('中点压在别的节点上时不写：节点优先', async () => {
    const nodes = [{ id: 'a', x: 0, y: 0 }, { id: 'm', x: 100, y: 0 }, { id: 'b', x: 200, y: 0 }]
    const rig = await makeRig({ nodes, links: [{ source: 'a', target: 'b', label: 'across' }], layout: 'preset' })
    expect(byPart(rig.api(), 'link-label')).toHaveLength(0)
  })

  it('随它那条线淡出：指着别的节点时不连着它的线上的字淡出', async () => {
    const links = [{ source: 'a', target: 'b', label: 'ab' }, { source: 'a', target: 'c', label: 'ac' }]
    const rig = await makeRig({ nodes: [...FAR, { id: 'd', x: 400, y: 300 }], links: [...links, { source: 'b', target: 'd' }], layout: 'preset' })
    const b = node(rig.api(), 'b')
    ;(rig.api().getPlotProps() as Dict).onPointerMove({ clientX: b.cx, clientY: b.cy, currentTarget: plotRect(rig.api()), pointerId: 1 })
    await settle()
    const api = rig.api()
    const dim = (text: string): unknown => (api.getMarkProps(byPart(api, 'link-label').find(m => (m as TextMark).text === text)!) as Dict)['data-dimmed']
    expect([dim('ab'), dim('ac')]).toEqual([undefined, ''])
  })

  it('数据表多一列关系，没写的格写缺失', async () => {
    const rig = await makeRig({ nodes: FAR, links: [{ source: 'a', target: 'b', label: 'owns' }, { source: 'a', target: 'c' }], layout: 'preset' })
    const { table } = rig.api()
    expect(table.columns.map(c => c.label)).toEqual(['Source', 'Target', 'Label'])
    expect(table.rows.map(r => r.cells[2]!.text)).toEqual(['owns', 'No value'])
  })
})

describe('命中、强调与键盘', () => {
  it('指着节点：提示框写连线数；它、邻居与连着它的线留着，线换成它的颜色，其余淡出', async () => {
    const rig = await makeRig({ ...BASE, layout: 'circular' })
    const c = node(rig.api(), 'c')
    ;(rig.api().getPlotProps() as Dict).onPointerMove({ clientX: c.cx, clientY: c.cy, currentTarget: plotRect(rig.api()), pointerId: 1 })
    await settle()
    const api = rig.api()
    expect(api.tooltip).toEqual({ header: 'Gamma', rows: [{ key: 'links', name: 'Links', value: '3' }] })
    const dim = (id: string): unknown => (api.getMarkProps(node(api, id)) as Dict)['data-dimmed']
    expect([dim('a'), dim('c'), dim('d'), dim('e')]).toEqual([undefined, undefined, undefined, ''])
    const links = byPart(api, 'link').map(m => api.getMarkProps(m) as Dict)
    expect([links[3]!['data-highlighted'], links[3]!['data-xh-chart-slot']]).toEqual(['', '1'])
    expect(links[5]!['data-dimmed']).toBe('')
  })

  it('方向键朝那个方向 45° 锥形里找最近的节点；Home / End 到阅读序的头尾', async () => {
    // 阅读序按名字：四个节点依次排在上、右、下、左
    const four = ['n', 'e', 's', 'w'].map((id, i) => ({ id, name: `${i + 1} ${id}` }))
    const rig = await makeRig({ nodes: four, links: [], layout: 'circular' })
    await focus(rig, 'n', four)
    await key(rig, 'ArrowDown')
    expect(focusedId(rig, four)).toBe('s')
    await key(rig, 'ArrowRight')
    expect(focusedId(rig, four)).toBe('e')
    await key(rig, 'ArrowRight')
    expect(focusedId(rig, four)).toBe('e')
    await key(rig, 'End')
    expect(focusedId(rig, four)).toBe('w')
    await key(rig, 'Home')
    expect(focusedId(rig, four)).toBe('n')
  })

  it('节点是数据标记：名字写名字、数值与连线数；阅读序第一个节点占 Tab 位', async () => {
    const rig = await makeRig({ nodes: [{ id: 'a', name: 'Alpha', value: 5 }, { id: 'b' }], links: [{ source: 'a', target: 'b' }] })
    const api = rig.api()
    const props = api.getMarkProps(node(api, 'a')) as Dict
    expect([props.role, props['aria-label'], props.tabindex]).toEqual(['graphics-symbol', 'Alpha, 5, 1 link', 0])
    expect((api.getMarkProps(byPart(api, 'link')[0]!) as Dict)['aria-hidden']).toBe(true)
  })
})

describe('拖动与平移缩放', () => {
  it('拖动节点：它跟着指针走，邻居跟着动；松手后位置留着，补派的 click 不算按下', async () => {
    const onDatumPress = vi.fn()
    const rig = await makeRig({ ...BASE, onDatumPress })
    const a = node(rig.api(), 'a')
    const b0 = node(rig.api(), 'b')
    const plot = (): Dict => rig.api().getPlotProps() as Dict
    const target = { ...plotRect(rig.api()), setPointerCapture: vi.fn() }
    plot().onPointerDown({ button: 0, pointerId: 1, clientX: a.cx, clientY: a.cy, currentTarget: target, preventDefault: vi.fn() })
    await settle()
    expect((plot())['data-dragging']).toBe('')
    for (let i = 1; i <= 5; i++) {
      plot().onPointerMove({ pointerId: 1, clientX: a.cx + i * 20, clientY: a.cy, currentTarget: target })
      await settle()
    }
    const moved = node(rig.api(), 'a')
    expect(moved.cx).toBeCloseTo(a.cx + 100)
    expect(node(rig.api(), 'b').cx).not.toBe(b0.cx)
    plot().onPointerUp({ pointerId: 1 })
    await settle()
    expect(rig.service.context.get('drag')).toBeNull()
    expect(rig.service.context.get('positions')).not.toBeNull()
    plot().onClick({})
    await settle()
    expect(onDatumPress).not.toHaveBeenCalled()
  })

  it('换数据后拖动的位置作废', async () => {
    const rig = await makeRig(BASE)
    const a = node(rig.api(), 'a')
    const target = { ...plotRect(rig.api()), setPointerCapture: vi.fn() }
    ;(rig.api().getPlotProps() as Dict).onPointerDown({ button: 0, pointerId: 1, clientX: a.cx, clientY: a.cy, currentTarget: target, preventDefault: vi.fn() })
    ;(rig.api().getPlotProps() as Dict).onPointerMove({ pointerId: 1, clientX: a.cx + 40, clientY: a.cy, currentTarget: target })
    ;(rig.api().getPlotProps() as Dict).onPointerUp({ pointerId: 1 })
    await settle()
    rig.setProps({ links: LINKS.slice(0, 3) })
    await settle()
    expect(rig.service.context.get('positions')).toBeNull()
  })

  it('zoom：以锚点缩放，节点位置跟着变、大小不变；0 回到原样；zoom 关着时不动', async () => {
    const rig = await makeRig({ ...BASE, layout: 'circular', zoom: true })
    const before = node(rig.api(), 'a')
    rig.api().zoomBy(2, { x: 320, y: 200 })
    await settle()
    const after = node(rig.api(), 'a')
    expect(after.cx - 320).toBeCloseTo((before.cx - 320) * 2)
    expect(after.outerRadius).toBe(before.outerRadius)
    await key(rig, '0')
    expect(rig.api().view).toEqual({ k: 1, x: 0, y: 0 })
    await key(rig, '+')
    expect(rig.api().view.k).toBeCloseTo(1.25)
    const off = await makeRig({ ...BASE, layout: 'circular' })
    off.api().zoomBy(2)
    await settle()
    expect(off.api().view.k).toBe(1)
  })
})

describe('受控视图', () => {
  it('给了 view 即受控：缩放只发 onViewChange，宿主写回才生效', async () => {
    const onViewChange = vi.fn()
    const rig = await makeRig({ ...BASE, layout: 'circular', zoom: true, view: { k: 1, x: 0, y: 0 }, onViewChange })
    const before = node(rig.api(), 'a')
    rig.api().zoomBy(2, { x: 320, y: 200 })
    await settle()
    expect(onViewChange).toHaveBeenCalledWith({ view: { k: 2, x: -320, y: -200 } })
    expect(rig.api().view).toEqual({ k: 1, x: 0, y: 0 })
    expect(node(rig.api(), 'a').cx).toBe(before.cx)
    rig.setProps({ view: { k: 2, x: -320, y: -200 } })
    await settle()
    expect(rig.api().view.k).toBe(2)
    expect(node(rig.api(), 'a').cx - 320).toBeCloseTo((before.cx - 320) * 2)
  })

  it('宿主每次给新对象、值没变时不算变化；defaultView 是初始视图', async () => {
    const onViewChange = vi.fn()
    const rig = await makeRig({ ...BASE, layout: 'circular', zoom: true, view: { k: 2, x: 0, y: 0 }, onViewChange })
    rig.setProps({ view: { k: 2, x: 0, y: 0 } })
    await settle()
    expect(onViewChange).not.toHaveBeenCalled()
    const initial = await makeRig({ ...BASE, layout: 'circular', zoom: true, defaultView: { k: 1.5, x: -10, y: 0 } })
    expect(initial.api().view).toEqual({ k: 1.5, x: -10, y: 0 })
  })

  it('zoom 关着时受控视图不生效，画面按原样', async () => {
    const plain = await makeRig({ ...BASE, layout: 'circular' })
    const rig = await makeRig({ ...BASE, layout: 'circular', view: { k: 3, x: -50, y: 0 } })
    expect(rig.api().view).toEqual({ k: 1, x: 0, y: 0 })
    expect(node(rig.api(), 'a').cx).toBeCloseTo(node(plain.api(), 'a').cx)
  })
})

describe('入场与无障碍', () => {
  it('入场：节点从圆心长出，连线淡入', async () => {
    const rig = await makeRig(BASE)
    const entry = graphEntryScene(rig.api().model.scene!.scene)
    expect(entry.layers.data.filter(m => m.kind === 'arc').every(m => (m as ArcMark).outerRadius === 0)).toBe(true)
    expect(entry.layers.data.filter(m => m.kind === 'line').every(m => m.opacity === 0)).toBe(true)
  })

  it('摘要写节点数、连线数与连线最多的节点；数据表每条线一行，有权重时多一列', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect(api.summary).toBe('6 nodes, 6 links. Most connected: Gamma (3 links).')
    expect(api.table.columns.map(c => c.label)).toEqual(['Source', 'Target'])
    expect(api.table.rows[3]!.cells.map(c => c.text)).toEqual(['Gamma', 'Delta'])
    const weighted = await makeRig({ nodes: NODES, links: LINKS.map((l, i) => ({ ...l, value: i + 1 })) })
    expect(weighted.api().table.columns.map(c => c.label)).toEqual(['Source', 'Target', 'Value'])
  })
})
