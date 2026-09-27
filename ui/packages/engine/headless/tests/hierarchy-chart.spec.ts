// @vitest-environment jsdom
// 层级图：组树与身份、聚合与色槽、诊断、四种空间填充的几何、下钻与路径、命中与键盘、树的语义、着色、入场、无障碍。
import type { DiagnosticRecord, Service } from '@xihan-ui/core'
import type { ArcMark, Mark, RectMark } from '@xihan-ui/viz'
import type { HierarchyChartApi, HierarchyChartSchema } from '../src/hierarchy-chart'
import { createService, DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectHierarchyChart, hierarchyChartMachine } from '../src/hierarchy-chart'
import { hierarchyEntryScene } from '../src/hierarchy-chart/hierarchy-chart.model'

type Dict = Record<string, any>
type Props = Partial<HierarchyChartSchema['props']>

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise<void>(r => queueMicrotask(r))
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.innerHTML = ''
})

// 按数据次序：华东、华南、华北；按值：华南 100、华东 80、华北 20
const TREE = {
  name: '全国',
  children: [
    { name: '华东', children: [{ name: '上海', value: 50 }, { name: '杭州', value: 30 }] },
    { name: '华南', children: [{ name: '广州', value: 40 }, { name: '深圳', value: 60 }] },
    { name: '华北', children: [{ name: '北京', value: 20 }] },
  ],
}
const BASE: Props = { data: TREE }

interface Rig {
  service: Service<HierarchyChartSchema>
  api: () => HierarchyChartApi
  setProps: (next: Props) => void
}

async function makeRig(initial: Props, size = { width: 480, height: 320 }): Promise<Rig> {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ animated: false, ...initial })
  const service = createService(hierarchyChartMachine, { props: () => props.get(), runtime })
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
    api: () => connectHierarchyChart(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

function nodes(api: HierarchyChartApi): Mark[] {
  return api.scene.layers.data.filter(m => m.part === 'node')
}

function nodeOf(api: HierarchyChartApi, key: string): Mark {
  return nodes(api).find(m => m.datum?.seriesId === key)!
}

function geometry(api: HierarchyChartApi, key: string): NonNullable<ReturnType<NonNullable<HierarchyChartApi['model']['scene']>['layout']['byKey']['get']>> {
  return api.model.scene!.layout.byKey.get(key)!
}

function plotRect(api: HierarchyChartApi): { getBoundingClientRect: () => Dict } {
  const { width, height } = api.model.scene!.layout.size
  return { getBoundingClientRect: () => ({ left: 0, top: 0, width, height }) }
}

async function key(rig: Rig, name: string): Promise<void> {
  ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault: vi.fn() })
  await settle()
}

async function focus(rig: Rig, id: string): Promise<void> {
  rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: id, index: -1 }, key: id, focus: true, visible: true })
  await settle()
}

describe('规格与派生', () => {
  it('上层的值是子孙之和；兄弟按值从大到小；身份是名字路径', async () => {
    const rig = await makeRig(BASE)
    const { spec, derived } = rig.api().model
    expect(spec.root!.value).toBe(200)
    expect(spec.root!.children!.map(n => spec.meta.get(n)!.key)).toEqual(['华南', '华东', '华北'])
    expect(spec.byKey.get('华东/上海')!.value).toBe(50)
    // 缺省看得见两层：3 个分支加 5 个叶子
    expect(derived.visible).toHaveLength(8)
  })

  it('色槽按数据次序分给第一层分支，后代继承；不随按值排序换色', async () => {
    const rig = await makeRig(BASE)
    const { spec } = rig.api().model
    expect(['华东', '华南', '华北', '华南/深圳'].map(k => spec.meta.get(spec.byKey.get(k)!)!.slot)).toEqual([1, 2, 3, 2])
  })

  it('同一个父节点下重名的兄弟，身份后面加上次序', async () => {
    const rig = await makeRig({ data: { name: 'r', children: [{ name: 'a', value: 2 }, { name: 'a', value: 1 }] } })
    expect([...rig.api().model.spec.byKey.keys()]).toEqual(['', 'a', 'a#1'])
  })

  it('扁平的行按 idField 与 parentField 组树，身份取 idField；数据引用的 index 是行号', async () => {
    const rows = [
      { id: 'all', parent: null, name: '全部' },
      { id: 'x', parent: 'all', name: 'X' },
      { id: 'x1', parent: 'x', name: 'X1', value: 3 },
      { id: 'y', parent: 'all', name: 'Y', value: 5 },
    ]
    const rig = await makeRig({ data: rows, idField: 'id', parentField: 'parent' })
    const api = rig.api()
    expect(api.model.spec.root!.value).toBe(8)
    expect(nodeOf(api, 'x1').datum).toEqual({ seriesId: 'x1', index: 2 })
  })

  it('扁平的行缺 idField、多根或成环报 chart.hierarchy-shape；负值报 chart.negative-share；根上写 data-state="error"', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const flat = await makeRig({ data: [{ id: 'a' }, { id: 'b' }] })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartHierarchyShape)
    expect((flat.api().getRootProps() as Dict)['data-state']).toBe('error')
    seen.length = 0
    await makeRig({ data: [{ id: 'a', p: null }, { id: 'b', p: null }], idField: 'id', parentField: 'p' })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartHierarchyShape)
    seen.length = 0
    await makeRig({ data: { name: 'r', children: [{ name: 'a', value: -1 }] } })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartNegativeShare)
  })

  it('按分支着色时第一层多于 8 个报 chart.too-many-series；按值着色不报', async () => {
    const seen: DiagnosticRecord[] = []
    stops.push(onDiagnostic(r => seen.push(r)))
    const wide = { name: 'r', children: Array.from({ length: 9 }, (_, i) => ({ name: `n${i}`, value: i + 1 })) }
    const rig = await makeRig({ data: wide })
    expect(seen.map(r => r.code)).toContain(DIAGNOSTIC_CODES.chartTooManySeries)
    expect((rig.api().getRootProps() as Dict)['data-state']).toBe('error')
    seen.length = 0
    const value = await makeRig({ data: wide, colorBy: 'value' })
    expect(seen).toHaveLength(0)
    expect(nodes(value.api())).toHaveLength(9)
  })

  it('depth 控制看得见的层数', async () => {
    const rig = await makeRig({ ...BASE, depth: 1 })
    expect(rig.api().model.derived.visible.map(n => rig.api().model.spec.meta.get(n)!.key)).toEqual(['华南', '华东', '华北'])
  })
})

describe('几何', () => {
  it('矩形树图：子节点落在父节点里，分组顶部留出标题的高度；面积与值成正比', async () => {
    const rig = await makeRig({ ...BASE, depth: 1 })
    const api = rig.api()
    const area = (k: string): number => {
      const s = geometry(api, k).shape as { width: number, height: number }
      return s.width * s.height
    }
    expect(area('华南') / area('华北')).toBeCloseTo(5, 0)
    const deep = await makeRig(BASE)
    const d = deep.api()
    const parent = geometry(d, '华南').shape as { x: number, y: number, width: number, height: number }
    const child = geometry(d, '华南/深圳').shape as { x: number, y: number, width: number, height: number }
    expect(child.x).toBeGreaterThanOrEqual(parent.x)
    expect(child.x + child.width).toBeLessThanOrEqual(parent.x + parent.width + 1e-6)
    expect(child.y - parent.y).toBeGreaterThanOrEqual(d.model.scene!.layout.font.lineHeight)
    expect(geometry(d, '华南').label?.part).toBe('group-header')
  })

  it('旭日图：第一层从空洞外起，自 12 点顺时针，按值从大到小；第二层在外圈', async () => {
    const rig = await makeRig({ ...BASE, layout: 'sunburst' })
    const api = rig.api()
    const south = nodeOf(api, '华南') as ArcMark
    const east = nodeOf(api, '华东') as ArcMark
    const hole = api.model.scene!.layout.hole!
    expect(south.kind).toBe('arc')
    expect(south.startAngle).toBeCloseTo(0)
    expect(south.endAngle).toBeCloseTo(Math.PI)
    expect(east.startAngle).toBeCloseTo(Math.PI)
    expect(south.innerRadius).toBeCloseTo(hole.r)
    expect((nodeOf(api, '华南/深圳') as ArcMark).innerRadius).toBeGreaterThan(south.outerRadius)
  })

  it('冰柱图：一层一条带；horizontal 时层自左而右', async () => {
    const rig = await makeRig({ ...BASE, layout: 'icicle' })
    const v = rig.api()
    expect((nodeOf(v, '华南/深圳') as RectMark).y).toBeGreaterThan((nodeOf(v, '华南') as RectMark).y)
    rig.setProps({ orientation: 'horizontal' })
    await settle()
    const h = rig.api()
    expect((nodeOf(h, '华南/深圳') as RectMark).x).toBeGreaterThan((nodeOf(h, '华南') as RectMark).x)
  })

  it('圆堆积：子节点的圆落在父节点的圆里', async () => {
    const rig = await makeRig({ ...BASE, layout: 'pack' })
    const api = rig.api()
    const parent = geometry(api, '华南').shape as { cx: number, cy: number, r: number }
    for (const k of ['华南/深圳', '华南/广州']) {
      const child = geometry(api, k).shape as { cx: number, cy: number, r: number }
      expect(Math.hypot(child.cx - parent.cx, child.cy - parent.cy) + child.r).toBeLessThanOrEqual(parent.r + 1e-6)
    }
  })

  it('标签只在放得下时写：窄的节点不写', async () => {
    const rig = await makeRig({ ...BASE, depth: 1 }, { width: 120, height: 80 })
    const labels = rig.api().scene.layers.front.filter(m => m.part === 'node-label' || m.part === 'group-header')
    expect(labels.map(l => l.key)).not.toContain('label:华北')
  })
})

describe('下钻', () => {
  it('drillTo 换根：路径从最顶层到当前的根，看得见的换成它的子孙；报 onRootKeyChange', async () => {
    const onRootKeyChange = vi.fn()
    const rig = await makeRig({ ...BASE, onRootKeyChange })
    expect((rig.api().getPathProps() as Dict).hidden).toBe(true)
    rig.api().drillTo('华南')
    await settle()
    const api = rig.api()
    expect(onRootKeyChange).toHaveBeenCalledWith({ rootKey: '华南' })
    expect(api.rootKey).toBe('华南')
    expect(api.path).toEqual([{ key: null, name: '全国', current: false }, { key: '华南', name: '华南', current: true }])
    expect((api.getPathProps() as Dict).hidden).toBeUndefined()
    expect(nodes(api).map(m => m.datum?.seriesId)).toEqual(['华南/深圳', '华南/广州'])
    // 下钻之后第一层照样是满色
    expect((api.getMarkProps(nodeOf(api, '华南/深圳')) as Dict)['data-level']).toBe('1')
  })

  it('路径项：当前项 aria-current、不可按；按上层的项回到那一层', async () => {
    const rig = await makeRig({ ...BASE, defaultRootKey: '华南' })
    const api = rig.api()
    const [top, here] = api.path
    const currentProps = api.getPathItemProps(here!) as Dict
    expect([currentProps['aria-current'], currentProps['aria-disabled'], currentProps['data-xh-collection-context']]).toEqual(['location', 'true', 'nav'])
    ;(api.getPathItemProps(top!) as Dict).onClick()
    await settle()
    expect(rig.api().rootKey).toBeNull()
  })

  it('受控 rootKey：宿主不写回就不动', async () => {
    const onRootKeyChange = vi.fn()
    const rig = await makeRig({ ...BASE, rootKey: null, onRootKeyChange })
    rig.api().drillTo('华东')
    await settle()
    expect(onRootKeyChange).toHaveBeenCalledWith({ rootKey: '华东' })
    expect(rig.api().rootKey).toBeNull()
    rig.setProps({ rootKey: '华东' })
    await settle()
    expect(rig.api().model.derived.current!.data.name).toBe('华东')
  })

  it('根指着叶子时取它的父节点；找不到的身份回到最顶层', async () => {
    const leaf = await makeRig({ ...BASE, defaultRootKey: '华南/深圳' })
    expect(leaf.api().model.derived.current!.data.name).toBe('华南')
    const missing = await makeRig({ ...BASE, defaultRootKey: 'nope' })
    expect(missing.api().model.derived.current!.data.name).toBe('全国')
  })

  it('点有子节点的节点下钻，点叶子报告按下；旭日图点空洞上钻', async () => {
    const onDatumPress = vi.fn()
    const rig = await makeRig({ ...BASE, layout: 'sunburst', onDatumPress })
    const at = (k: string): { x: number, y: number } => geometry(rig.api(), k).anchor
    const pointer = async (x: number, y: number, click: boolean): Promise<void> => {
      const plot = rig.api().getPlotProps() as Dict
      plot.onPointerMove({ clientX: x, clientY: y, currentTarget: plotRect(rig.api()) })
      await settle()
      if (click) {
        ;(rig.api().getPlotProps() as Dict).onClick({ clientX: x, clientY: y, currentTarget: plotRect(rig.api()) })
        await settle()
      }
    }
    const leaf = at('华南/深圳')
    await pointer(leaf.x, leaf.y, true)
    expect(onDatumPress).toHaveBeenCalledWith(expect.objectContaining({ seriesId: '华南/深圳' }))
    const group = at('华南')
    await pointer(group.x, group.y, true)
    expect(rig.api().rootKey).toBe('华南')
    const hole = rig.api().model.scene!.layout.hole!
    await pointer(hole.cx, hole.cy, true)
    expect(rig.api().rootKey).toBeNull()
  })
})

describe('命中、提示框与键盘', () => {
  it('命中取最深的节点；提示框头部是路径，下面是数值、占上一层与占总体；与它不在一条祖孙链上的节点淡出', async () => {
    const rig = await makeRig(BASE)
    const at = geometry(rig.api(), '华南/深圳').anchor
    ;(rig.api().getPlotProps() as Dict).onPointerMove({ clientX: at.x, clientY: at.y, currentTarget: plotRect(rig.api()) })
    await settle()
    const api = rig.api()
    expect(api.tooltip).toEqual({
      header: '华南 / 深圳',
      rows: [
        { key: 'value', name: 'Value', value: '60' },
        { key: 'parent', name: 'Share of parent', value: '60.0%' },
        { key: 'root', name: 'Share of total', value: '30.0%' },
      ],
    })
    const dim = (k: string): unknown => (api.getMarkProps(nodeOf(api, k)) as Dict)['data-dimmed']
    expect([dim('华南'), dim('华南/深圳'), dim('华南/广州'), dim('华东')]).toEqual([undefined, undefined, '', ''])
  })

  it('左右键在同一层的兄弟之间走，下键进入第一个子节点，上键回到父节点；Home / End 到头尾', async () => {
    const rig = await makeRig({ ...BASE, layout: 'sunburst' })
    await focus(rig, '华南')
    await key(rig, 'ArrowRight')
    expect(rig.service.context.get('focused')?.seriesId).toBe('华东')
    await key(rig, 'End')
    expect(rig.service.context.get('focused')?.seriesId).toBe('华北')
    await key(rig, 'Home')
    await key(rig, 'ArrowDown')
    expect(rig.service.context.get('focused')?.seriesId).toBe('华南/深圳')
    await key(rig, 'ArrowRight')
    expect(rig.service.context.get('focused')?.seriesId).toBe('华南/广州')
    await key(rig, 'ArrowUp')
    expect(rig.service.context.get('focused')?.seriesId).toBe('华南')
  })

  it('矩形树图的兄弟按阅读序：自上而下、自左而右', async () => {
    const rig = await makeRig({ ...BASE, depth: 1 })
    const api = rig.api()
    const order = ['华南', '华东', '华北'].sort((a, b) => {
      const pa = geometry(api, a).anchor
      const pb = geometry(api, b).anchor
      return Math.abs(pa.y - pb.y) > 4 ? pa.y - pb.y : pa.x - pb.x
    })
    await focus(rig, order[0]!)
    await key(rig, 'ArrowRight')
    expect(rig.service.context.get('focused')?.seriesId).toBe(order[1])
  })

  it('回车下钻、焦点落到第一个子节点；Backspace 上钻、焦点落回刚才的根；Space 与叶子上的 Enter 报告按下', async () => {
    const onDatumPress = vi.fn()
    const rig = await makeRig({ ...BASE, layout: 'sunburst', onDatumPress })
    await focus(rig, '华南')
    await key(rig, 'Enter')
    expect(rig.api().rootKey).toBe('华南')
    expect(rig.service.context.get('focused')?.seriesId).toBe('华南/深圳')
    await key(rig, 'Enter')
    expect(onDatumPress).toHaveBeenLastCalledWith(expect.objectContaining({ seriesId: '华南/深圳' }))
    await key(rig, 'Backspace')
    expect(rig.api().rootKey).toBeNull()
    expect(rig.service.context.get('focused')?.seriesId).toBe('华南')
    await key(rig, ' ')
    expect(onDatumPress).toHaveBeenLastCalledWith(expect.objectContaining({ seriesId: '华南' }))
  })
})

describe('语义与着色', () => {
  it('绘图区是 tree，节点是 treeitem，带层级、组内位置与展开态；锚点节点占 Tab 位', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect((api.getPlotProps() as Dict).role).toBe('tree')
    const south = api.getMarkProps(nodeOf(api, '华南')) as Dict
    expect([south.role, south['aria-level'], south['aria-setsize'], south['aria-posinset'], south['aria-expanded'], south.tabindex]).toEqual(['treeitem', 1, 3, 1, 'true', 0])
    expect(south['aria-label']).toBe('华南, 100, 50.0% of 全国')
    const leaf = api.getMarkProps(nodeOf(api, '华东/杭州')) as Dict
    expect([leaf['aria-level'], leaf['aria-posinset'], leaf['aria-expanded'], leaf.tabindex]).toEqual([2, 2, undefined, -1])
    // 到了可见层数的底、还有子节点：收起的
    const shallow = await makeRig({ ...BASE, depth: 1 })
    expect((shallow.api().getMarkProps(nodeOf(shallow.api(), '华南')) as Dict)['aria-expanded']).toBe('false')
  })

  it('branch 写色槽与层；uniform 全是色槽 1；value 写段号与段内百分比，根上写色板', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    const props = api.getMarkProps(nodeOf(api, '华南/深圳')) as Dict
    expect([props['data-xh-chart-slot'], props['data-level']]).toEqual(['2', '2'])
    expect((api.getMarkProps(nodeOf(api, '华南')) as Dict)['data-level']).toBe('1')
    const uniform = await makeRig({ ...BASE, colorBy: 'uniform' })
    expect((uniform.api().getMarkProps(nodeOf(uniform.api(), '华北')) as Dict)['data-xh-chart-slot']).toBe('1')
    const value = await makeRig({ ...BASE, colorBy: 'value', palette: 'teal' })
    const v = value.api()
    const top = v.getMarkProps(nodeOf(v, '华南')) as Dict
    expect([top['data-seg'], top.style['--xh-_chart-p'], top['data-xh-chart-slot']]).toEqual(['high', '100.0%', undefined])
    expect((v.getRootProps() as Dict)['data-palette']).toBe('teal')
  })
})

describe('入场与无障碍', () => {
  it('入场：矩形淡入，旭日的扇区从起始角扫开，圆堆积的圆从圆心长出', async () => {
    const treemap = await makeRig(BASE)
    const rects = hierarchyEntryScene(treemap.api().model.scene!.scene).layers.data
    expect(rects.every(m => m.opacity === 0)).toBe(true)
    const sunburst = await makeRig({ ...BASE, layout: 'sunburst' })
    const arcs = hierarchyEntryScene(sunburst.api().model.scene!.scene).layers.data as ArcMark[]
    expect(arcs.every(a => a.endAngle === a.startAngle)).toBe(true)
    const pack = await makeRig({ ...BASE, layout: 'pack' })
    const circles = hierarchyEntryScene(pack.api().model.scene!.scene).layers.data as ArcMark[]
    expect(circles.every(c => c.outerRadius === 0)).toBe(true)
  })

  it('摘要写当前的根、项数、合计与最大的一项；数据表列出整棵树的路径', async () => {
    const rig = await makeRig(BASE)
    const api = rig.api()
    expect(api.summary).toBe('全国: 3 items, total 200. Largest: 华南 100 (50.0%).')
    expect(api.table.columns.map(c => c.label)).toEqual(['Path', 'Value', 'Share of parent'])
    expect(api.table.rows).toHaveLength(8)
    expect(api.table.rows.find(r => r.key === '华东/上海')!.cells.map(c => c.text)).toEqual(['华东 / 上海', '50', '62.5%'])
    rig.api().drillTo('华东')
    await settle()
    expect(rig.api().summary).toBe('华东: 2 items, total 80. Largest: 上海 50 (62.5%).')
  })
})
