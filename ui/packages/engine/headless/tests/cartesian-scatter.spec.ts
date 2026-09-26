// @vitest-environment jsdom
// 直角坐标图的散点与气泡：按点寻址、形状随色槽、气泡面积、类目轴抖动、命中、键盘、提示框与长表。
import type { Service } from '@xihan-ui/core'
import type { Mark, SymbolMark } from '@xihan-ui/viz'
import type { CartesianChartApi, CartesianChartSchema } from '../src/cartesian-chart'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cartesianChartMachine, connectCartesianChart } from '../src/cartesian-chart'
import { CHART_METRICS } from '../src/shared/chart'

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

function points(api: CartesianChartApi): SymbolMark[] {
  return walk(api.scene.layers.data).filter((m): m is SymbolMark => m.part === 'point')
}

function radius(mark: SymbolMark): number {
  return Math.sqrt(mark.size / Math.PI)
}

/** 指针移到绘图区里的 (x, y)：绘图区按视口尺寸 1:1 显示。 */
function pointer(rig: Rig, x: number, y: number): void {
  const size = rig.service.context.get('size')!
  const currentTarget = { getBoundingClientRect: () => ({ left: 0, top: 0, width: size.width, height: size.height }) }
  ;(rig.api().getPlotProps() as Dict).onPointerMove({ clientX: x, clientY: y, currentTarget, pointerType: 'mouse' })
}

function key(rig: Rig, name: string): void {
  ;(rig.api().getPlotProps() as Dict).onKeyDown({ key: name, preventDefault: vi.fn() })
}

const HEIGHTS = [
  { age: 20, height: 170, weight: 60, city: 'A' },
  { age: 20, height: 176, weight: 68, city: 'B' },
  { age: 35, height: 165, weight: 55, city: 'A' },
  { age: 50, height: 180, weight: 90, city: 'B' },
]

const SCATTER: Props = {
  data: HEIGHTS,
  series: [{ mark: 'scatter', x: 'age', y: 'height', name: '身高' }],
  xAxis: { title: '年龄' },
  yAxis: { title: '身高' },
}

describe('散点', () => {
  it('只有散点时自变量按数值推断为连续轴，两端取整，两个方向都画网格，提示框缺省按 item 汇报', async () => {
    const rig = await makeRig(SCATTER)
    const api = rig.api()
    expect(api.model.spec.keyScale).toBe('linear')
    const [lo, hi] = api.model.scene!.layout.keyScale.domain as number[]
    expect(lo).toBeLessThanOrEqual(20)
    expect(hi).toBeGreaterThanOrEqual(50)
    expect(Number.isInteger(lo! / 10) && Number.isInteger(hi! / 10)).toBe(true)
    const grid = walk(api.scene.layers.back).filter(m => m.part === 'grid-line').map(m => m.key)
    expect(grid.some(k => k.startsWith('grid:k:'))).toBe(true)
    expect(grid.some(k => k.startsWith('grid:v:'))).toBe(true)
    const first = points(api)[0]!
    pointer(rig, first.x, first.y)
    await settle()
    expect(rig.api().tooltip?.rows).toHaveLength(1)
    expect(rig.api().overlay.under).toEqual([])
  })

  it('同一个 x 上的多个点各是一个标记：身份取「x#出现次序」，按 x 的次序排，本身可聚焦、roving 取 Tab 位', async () => {
    const rig = await makeRig(SCATTER)
    const api = rig.api()
    const marks = points(api)
    expect(marks.map(m => m.key)).toEqual(['height:n20#0', 'height:n20#1', 'height:n35#0', 'height:n50#0'])
    expect(marks.every(m => m.symbol === 'circle')).toBe(true)
    const props = marks.map(m => api.getMarkProps(m) as Dict)
    expect(props.map(p => p.tabindex)).toEqual([0, -1, -1, -1])
    expect(props[0]!.role).toBe('graphics-symbol')
    expect(props[0]!['aria-label']).toBe('20, 身高 170')
    expect((api.getPlotProps() as Dict).tabindex).toBe(-1)
  })

  it('往后追加数据、改某个点的 y：已有的点保持身份', async () => {
    const rig = await makeRig(SCATTER)
    rig.setProps({ data: [...HEIGHTS.map((row, i) => (i === 0 ? { ...row, height: 172 } : row)), { age: 20, height: 160, weight: 50, city: 'C' }] })
    await settle()
    expect(points(rig.api()).map(m => m.key)).toEqual(['height:n20#0', 'height:n20#1', 'height:n20#2', 'height:n35#0', 'height:n50#0'])
  })

  it('datumId 给出身份字段：标记键取它', async () => {
    const rig = await makeRig({ ...SCATTER, data: HEIGHTS.map((row, i) => ({ ...row, id: `p${i}` })), series: [{ mark: 'scatter', x: 'age', y: 'height', datumId: 'id' }] })
    expect(points(rig.api()).map(m => m.key)).toEqual(['height:sp0', 'height:sp1', 'height:sp2', 'height:sp3'])
  })

  it('缺省形状随色槽轮换，写了 symbol 就用它；图例与提示框的色标带同一个形状', async () => {
    const rig = await makeRig({
      data: HEIGHTS,
      series: [
        { mark: 'scatter', x: 'age', y: 'height', id: 'a' },
        { mark: 'scatter', x: 'age', y: 'weight', id: 'b' },
        { mark: 'scatter', x: 'age', y: 'height', id: 'c', symbol: 'star' },
      ],
    })
    const api = rig.api()
    const bySeries = (id: string): string => points(api).find(m => m.datum?.seriesId === id)!.symbol
    expect([bySeries('a'), bySeries('b'), bySeries('c')]).toEqual(['circle', 'square', 'star'])
    const swatch = api.getLegendSwatchProps(api.legendItems[1]!) as Dict
    expect([swatch['data-mark'], swatch['data-symbol']]).toEqual(['point', 'square'])
  })

  it('命中：指针离点在命中半径内就算，取最近的那个点', async () => {
    const rig = await makeRig(SCATTER)
    const target = points(rig.api())[2]!
    pointer(rig, target.x + 3, target.y - 2)
    await settle()
    expect(rig.service.context.get('hover')?.ref).toEqual({ seriesId: 'height', index: 2 })
    expect(rig.api().tooltip?.header).toBe('35')
  })

  it('键盘：左右按点的次序走，上下换到另一个散点系列里 x 最近的点', async () => {
    const rig = await makeRig({
      data: HEIGHTS,
      series: [{ mark: 'scatter', x: 'age', y: 'height' }, { mark: 'scatter', x: 'age', y: 'weight' }],
    })
    rig.service.send({ type: 'DATUM.FOCUS', ref: { seriesId: 'height', index: 0 }, key: 20 })
    await settle()
    key(rig, 'ArrowRight')
    await settle()
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'height', index: 1 })
    key(rig, 'ArrowRight')
    await settle()
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'height', index: 2 })
    key(rig, 'ArrowUp')
    await settle()
    expect(rig.service.context.get('focused')).toEqual({ seriesId: 'weight', index: 2 })
  })

  it('数据表改成每个数据一行：系列、x、y 各一列，列名取轴标题', async () => {
    const rig = await makeRig(SCATTER)
    const { table } = rig.api()
    expect(table.columns.map(c => c.label)).toEqual(['Series', '年龄', '身高'])
    expect(table.rows).toHaveLength(4)
    expect(table.rows[1]!.cells.map(c => c.text)).toEqual(['身高', '20', '176'])
  })

  it('与折线同图、按 axis 汇报：散点在这个 x 上有点才列一行', async () => {
    const rig = await makeRig({
      data: [
        { x: 1, trend: 10, obs: 11 },
        { x: 2, trend: 20 },
        { x: 3, trend: 30, obs: 29 },
      ],
      series: [{ mark: 'line', x: 'x', y: 'trend' }, { mark: 'scatter', x: 'x', y: 'obs' }],
    })
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'trend', index: 1 }, x: 0, y: 0 }, key: 2 })
    await settle()
    expect(rig.api().tooltip?.rows.map(r => r.seriesId)).toEqual(['trend'])
    rig.service.send({ type: 'HOVER', hover: { ref: { seriesId: 'trend', index: 2 }, x: 0, y: 0 }, key: 3 })
    await settle()
    expect(rig.api().tooltip?.rows.map(r => [r.seriesId, r.value])).toEqual([['trend', '30'], ['obs', '29']])
  })
})

describe('气泡', () => {
  const BUBBLES: Props = {
    data: [
      { x: 1, y: 1, pop: 100 },
      { x: 2, y: 2, pop: 25 },
      { x: 3, y: 3, pop: 0 },
      { x: 4, y: 4 },
      { x: 5, y: 5, pop: 400 },
    ],
    series: [{ mark: 'scatter', x: 'x', y: 'y', size: 'pop', name: '城市' }],
  }

  it('面积与大小成正比：最大的半径是柱厚上限，大的先画；大小缺失或不是正数的行不画', async () => {
    const rig = await makeRig(BUBBLES)
    const marks = points(rig.api())
    expect(marks.map(m => m.key)).toEqual(['y:n5#0', 'y:n1#0', 'y:n2#0'])
    expect(radius(marks[0]!)).toBeCloseTo(CHART_METRICS.barMax)
    // 面积之比等于大小之比
    expect(marks[0]!.size / marks[1]!.size).toBeCloseTo(4)
    expect(marks[1]!.size / marks[2]!.size).toBeCloseTo(4)
  })

  it('气泡整个落在绘图区里：两端各收进最大半径', async () => {
    const rig = await makeRig(BUBBLES)
    const { plot } = rig.api().model.scene!.layout
    for (const m of points(rig.api())) {
      const r = radius(m)
      expect(m.x - r).toBeGreaterThanOrEqual(plot.x - 0.5)
      expect(m.x + r).toBeLessThanOrEqual(plot.x + plot.width + 0.5)
      expect(m.y - r).toBeGreaterThanOrEqual(plot.y - 0.5)
      expect(m.y + r).toBeLessThanOrEqual(plot.y + plot.height + 0.5)
    }
  })

  it('提示框与可及名带上大小，数据表多一列', async () => {
    const rig = await makeRig(BUBBLES)
    const api = rig.api()
    const big = points(api)[0]!
    expect((api.getMarkProps(big) as Dict)['aria-label']).toBe('5, 城市 5, Size 400')
    rig.service.send({ type: 'HOVER', hover: { ref: big.datum!, x: big.x, y: big.y }, key: 5 })
    await settle()
    expect(rig.api().tooltip?.rows[0]!.value).toBe('5 · Size 400')
    expect(api.table.columns.map(c => c.id)).toEqual(['series', 'key', 'value', 'size'])
    expect(api.table.rows).toHaveLength(3)
  })
})

describe('类目轴上的抖动', () => {
  const DOTS: Props = {
    data: [
      { id: 'a', day: '周一', ms: 10 },
      { id: 'b', day: '周一', ms: 12 },
      { id: 'c', day: '周一', ms: 14 },
      { id: 'd', day: '周二', ms: 20 },
    ],
    series: [{ mark: 'scatter', x: 'day', y: 'ms', jitter: 0.6, datumId: 'id' }],
    xAxis: { domain: ['周一', '周二'] },
  }

  it('点在类目中心左右散开，偏移不超过步长乘抖动比例的一半，重渲染与换序都落在同一处', async () => {
    const rig = await makeRig(DOTS)
    const api = rig.api()
    expect(api.model.spec.keyScale).toBe('point')
    const layout = api.model.scene!.layout
    const step = (layout.keyScale as { step: number }).step
    const center = layout.keyCenters[0]!
    const monday = points(api).filter(m => m.datum!.index < 3)
    expect(new Set(monday.map(m => m.x)).size).toBe(3)
    for (const m of monday)
      expect(Math.abs(m.x - center)).toBeLessThanOrEqual(step * 0.3)
    const before = new Map(points(api).map(m => [m.key, m.x]))
    rig.setProps({ data: [...DOTS.data!].reverse() })
    await settle()
    for (const m of points(rig.api()))
      expect(m.x).toBeCloseTo(before.get(m.key)!, 6)
  })
})

describe('折线的 item 汇报', () => {
  it('trigger="item"：指针落在线上的点附近命中那个点', async () => {
    const rig = await makeRig({
      data: [{ m: 'a', v: 1 }, { m: 'b', v: 5 }, { m: 'c', v: 3 }],
      series: [{ mark: 'line', x: 'm', y: 'v' }],
      trigger: 'item',
    })
    const anchor = rig.api().model.scene!.anchors.get('v')![1]!
    pointer(rig, anchor.x + 2, anchor.y + 2)
    await settle()
    expect(rig.service.context.get('hover')?.ref).toEqual({ seriesId: 'v', index: 1 })
  })
})

describe('按值着色', () => {
  const HEAT: Props = {
    data: [
      { x: 1, y: 1, temp: 10 },
      { x: 2, y: 2, temp: 20 },
      { x: 3, y: 3, temp: 30 },
      { x: 4, y: 4, temp: 40 },
      { x: 5, y: 5 },
    ],
    series: [{ mark: 'scatter', x: 'x', y: 'y', color: 'temp', name: '站点' }],
    translations: { colorLabel: '气温' },
  }

  it('点按值落在顺序色阶上：写段号与段内百分比，缺失值的点不写（取系列色，即色阶中点）', async () => {
    const rig = await makeRig(HEAT)
    const api = rig.api()
    const props = points(api).map(m => api.getMarkProps(m) as Dict)
    // 点只用色阶上 0.3–1 这一段：最小值落在 0.3（低段的 60%），最大值落在终点
    expect(props.map(p => p['data-seg'])).toEqual(['low', 'high', 'high', 'high', undefined])
    expect(props.map(p => p.style?.['--xh-_chart-p'])).toEqual(['60.0%', '6.7%', '53.3%', '100.0%', undefined])
  })

  it('系列不取分类色：分组、图例项与提示框的行标上顺序色阶；色标画成数据自己的颜色', async () => {
    const rig = await makeRig(HEAT)
    const api = rig.api()
    const group = walk(api.scene.layers.data).find(m => m.part === 'series')!
    expect((api.getMarkProps(group) as Dict)['data-xh-chart-scale']).toBe('sequential')
    expect((api.getLegendItemProps(api.legendItems[0]!) as Dict)['data-xh-chart-scale']).toBe('sequential')
    const hot = points(api)[3]!
    rig.service.send({ type: 'HOVER', hover: { ref: hot.datum!, x: hot.x, y: hot.y }, key: 4 })
    await settle()
    const next = rig.api()
    const row = next.tooltip!.rows[0]!
    expect(row.value).toBe('4 · 气温 40')
    expect((next.getTooltipSwatchProps(row) as Dict)['data-seg']).toBe('high')
    expect((next.getMarkProps(hot) as Dict)['aria-label']).toBe('4, 站点 4, 气温 40')
  })

  it('色阶图例：只有一个系列也显示，两端写值域；色板写在根上', async () => {
    const rig = await makeRig({ ...HEAT, palette: 'teal' })
    const api = rig.api()
    expect(api.legendScale).toEqual({ name: '气温', min: '10', max: '40' })
    expect((api.getLegendProps() as Dict).hidden).toBeUndefined()
    expect((api.getLegendScaleProps() as Dict).hidden).toBeUndefined()
    expect((api.getLegendScaleValueProps('max') as Dict)['data-edge']).toBe('max')
    expect((api.getRootProps() as Dict)['data-palette']).toBe('teal')
  })

  it('没有按值着色时色阶收起；数据表多一列颜色对应的值', async () => {
    const plain = await makeRig(SCATTER)
    expect(plain.api().legendScale).toBeNull()
    expect((plain.api().getLegendScaleProps() as Dict).hidden).toBe(true)
    const rig = await makeRig(HEAT)
    const { table } = rig.api()
    expect(table.columns.map(c => c.id)).toEqual(['series', 'key', 'value', 'color'])
    expect(table.rows.map(r => r.cells[3]!.text)).toEqual(['10', '20', '30', '40', 'No value'])
  })
})
