/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 直角坐标图的交互逻辑：取模型、数据引用与键位的换算、详情载荷、激活来源、键盘导航、命中测试、前景层与提示框内容。
// 只算值，不写属性：属性字典都在连接层。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { Mark } from '@xihan-ui/viz'
import type { ChartBaseContext, ChartDatumDetails, ChartDatumRef, ChartKey, ChartNavIntent } from '../shared/chart'
import type { CartesianSeriesValues } from './cartesian-chart.model'
import type { CartesianModel } from './cartesian-chart.pipeline'
import type { CartesianChartSchema, CartesianOverlay } from './cartesian-chart.schema'
import type { CartesianAnnotationSummary, CartesianBrushing, CartesianBrushSelection, CartesianChartTranslations, CartesianLegendScale, CartesianRenderer, CartesianTooltipModel, CartesianTooltipOrder, CartesianTrigger, CartesianWindow, CartesianWindowRatio } from './cartesian-chart.types'
import { resolveLocale } from '@xihan-ui/core'
import { createPicker, domainToWindow, FULL_WINDOW, isFullWindow, lttb } from '@xihan-ui/viz'
import { nearestIndex } from '@xihan-ui/viz/columns'
import { CHART_TRANSLATIONS, chartActiveSource, chartPageSize, defaultChartSummary, memoizeLast, resolveChartTranslations } from '../shared/chart'
import {
  columnsAnchorAt,
  columnsColorDomain,
  columnsDetails,
  columnsFirstRef,
  columnsHitTest,
  columnsKeyAt,
  columnsKeyNumber,
  columnsMarkKey,
  columnsNavTarget,
  columnsOverlay,
  columnsPositionOf,
  columnsProxyMark,
  columnsRefAtKey,
  columnsSeriesOf,
  columnsZoomPreview,
} from './cartesian-chart.columns'
import { cartesianDatumId, cartesianKeyId, colorPosition } from './cartesian-chart.model'
import { cartesianProbesOf } from './cartesian-chart.probe'

export { CARTESIAN_SEQUENTIAL_ANCHORS, cartesianProbeDescriptor, isCartesianProbe } from './cartesian-chart.probe'
export type { CartesianProbeDescriptor } from './cartesian-chart.probe'

/** 缺省的注释摘要：每条一句「名字（系列）：值。」。 */
export function defaultCartesianAnnotationSummary(items: readonly CartesianAnnotationSummary[]): string {
  return items.map(item => `${item.label}${item.series ? ` (${item.series})` : ''}: ${item.value}.`).join(' ')
}

/** 缺省的开高低收写法：四个价依次写出。 */
function defaultOhlcLabel({ open, high, low, close }: { open: string, high: string, low: string, close: string }): string {
  return `Open ${open}, High ${high}, Low ${low}, Close ${close}`
}

/** 缺省的聚合表题：原表题后注明多少行聚合成了多少个区间。 */
function defaultAggregatedCaption({ caption, rows, ranges }: { caption: string, rows: string, ranges: string }): string {
  return `${caption} (${rows} rows in ${ranges} ranges)`
}

/** 整条轴：两个方向都没缩放。 */
export const FULL_CARTESIAN_WINDOW: CartesianWindow = Object.freeze({ x: null, y: null })

/** 整条轴的比例：两个方向都是 0–1。 */
export const FULL_CARTESIAN_RATIO: CartesianWindowRatio = Object.freeze({ x: FULL_WINDOW, y: FULL_WINDOW })

function sameEnd(a: ChartKey, b: ChartKey): boolean {
  return a instanceof Date || b instanceof Date ? a.valueOf() === b.valueOf() : a === b
}

function sameRange(a: readonly [ChartKey, ChartKey] | null | undefined, b: readonly [ChartKey, ChartKey] | null | undefined): boolean {
  if (a == null || b == null)
    return a == null && b == null
  return sameEnd(a[0], b[0]) && sameEnd(a[1], b[1])
}

/** 两个窗口是否相同：受控时作者每次给新对象，内容没变不该当成变化；日期按时间值比。 */
export function sameWindow(a: CartesianWindow, b: CartesianWindow | undefined): boolean {
  return b != null && sameRange(a.x, b.x) && sameRange(a.y, b.y)
}

/** 两个刷选范围是否相同：都没有刷选也算相同。 */
export function sameSelection(a: CartesianBrushSelection | null | undefined, b: CartesianBrushSelection | null | undefined): boolean {
  if (a == null || b == null)
    return a == null && b == null
  return sameWindow(a, b)
}

/** 缺省的五数写法：须线两端、四分位与中位数依次写出。 */
function defaultBoxLabel({ min, q1, median, q3, max }: { min: string, q1: string, median: string, q3: string, max: string }): string {
  return `Min ${min}, Q1 ${q1}, Median ${median}, Q3 ${q3}, Max ${max}`
}

export const CARTESIAN_TRANSLATIONS: CartesianChartTranslations = Object.freeze({
  ...CHART_TRANSLATIONS,
  keyLabel: 'Category',
  seriesLabel: 'Series',
  valueLabel: 'Value',
  sizeLabel: 'Size',
  colorLabel: 'Color',
  zoomLabel: 'Zoom',
  zoomStartLabel: 'Window start',
  zoomEndLabel: 'Window end',
  ohlcLabel: defaultOhlcLabel,
  ohlcColumns: { open: 'Open', high: 'High', low: 'Low', close: 'Close' },
  boxLabel: defaultBoxLabel,
  boxColumns: { min: 'Min', q1: 'Q1', median: 'Median', q3: 'Q3', max: 'Max', outliers: 'Outliers' },
  aggregatedCaption: defaultAggregatedCaption,
  referenceLabel: 'Reference',
  averageLabel: 'Average',
  annotationSummary: defaultCartesianAnnotationSummary,
  summary: defaultChartSummary,
})

const translationsCache = new WeakMap<object, CartesianChartTranslations>()

/** 合并作者给的文案；同一个覆盖对象只合并一次，管线的无障碍段才不会因为文案对象每次新建而重算。 */
export function cartesianTranslations(overrides: Partial<CartesianChartTranslations> | undefined): CartesianChartTranslations {
  if (!overrides)
    return CARTESIAN_TRANSLATIONS
  let hit = translationsCache.get(overrides)
  if (!hit) {
    hit = resolveChartTranslations(CARTESIAN_TRANSLATIONS, overrides)
    translationsCache.set(overrides, hit)
  }
  return hit
}

/** 数据表的列名换成轴标题时，同一组输入只合并一次。 */
const axisLabelled = memoizeLast((translations: CartesianChartTranslations, keyLabel: string, valueLabel: string): CartesianChartTranslations => ({ ...translations, keyLabel, valueLabel }))

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface CartesianModelSource {
  prop: PropFn<CartesianChartSchema>
  context: { get: <K extends keyof CartesianChartSchema['context']>(key: K) => CartesianChartSchema['context'][K] }
  refs: { get: <K extends keyof CartesianChartSchema['refs']>(key: K) => CartesianChartSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，悬停与聚焦只是读缓存。 */
export function cartesianModelOf(source: CartesianModelSource): CartesianModel {
  const { prop, context, refs, scope } = source
  const translations = cartesianTranslations(prop('translations'))
  // 数据表的列名缺省取轴标题：键列取 x 轴，长表的数值列取 y 轴
  const keyLabel = prop('translations')?.keyLabel ?? prop('xAxis')?.title ?? translations.keyLabel
  const valueLabel = prop('translations')?.valueLabel ?? prop('yAxis')?.title ?? translations.valueLabel
  const labelled = keyLabel !== translations.keyLabel || valueLabel !== translations.valueLabel
  return refs.get('pipeline')({
    data: prop('data'),
    series: prop('series'),
    xAxis: prop('xAxis'),
    yAxis: prop('yAxis'),
    orientation: prop('orientation'),
    totals: prop('totals'),
    annotations: prop('annotations'),
    renderer: prop('renderer'),
    brush: prop('brush'),
    // 没开缩放时窗口不进管线：作者写了窗口也不裁轴
    zoom: prop('zoom') ?? 'none',
    window: context.get('window'),
    hiddenSeries: context.get('hiddenSeries'),
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurer: refs.get('measurer'),
    measurerVersion: context.get('measurerVersion'),
    dataVersion: context.get('dataVersion'),
    locale: resolveLocale(prop('locale'), scope),
    translations: labelled ? axisLabelled(translations, keyLabel, valueLabel) : translations,
  })
}

/** 提示框汇报什么：缺省按系列推断，只有散点时 item（一个 x 上的点不成一列），否则 axis。 */
export function cartesianTrigger(trigger: CartesianTrigger | undefined, model: CartesianModel): CartesianTrigger {
  if (trigger)
    return trigger
  const { series } = model.spec
  return series.length > 0 && series.every(s => s.mark === 'scatter') ? 'item' : 'axis'
}

function seriesOf(model: CartesianModel, id: string): CartesianSeriesValues | undefined {
  return model.derived.visible.find(s => s.spec.id === id)
}

/** 数据引用在系列里的位置；引用失效（系列隐藏、行没有值、数据换了）时为 −1。 */
export function cartesianPositionOf(model: CartesianModel, ref: ChartDatumRef | null): number {
  if (!ref)
    return -1
  const columns = model.columns?.data
  if (columns)
    return columnsPositionOf(columns, columnsSeriesOf(columns, ref.seriesId), ref)
  return model.derived.keyOfRow.get(ref.seriesId)?.get(ref.index) ?? -1
}

/** 位置上的数据的 x 在 keys 里的位置：柱与折线就是位置本身。 */
function keyIndexAt(s: CartesianSeriesValues, position: number): number {
  return s.keyAt ? s.keyAt[position] ?? -1 : position
}

/** 数据引用的 x 在 keys 里的位置；引用失效时为 −1。 */
export function cartesianKeyIndexOf(model: CartesianModel, ref: ChartDatumRef | null): number {
  // 列式数据：共用的有序自变量上的位置就是下标；散点自己的 x 不在上面
  const columns = model.columns?.data
  if (columns) {
    const s = ref ? columnsSeriesOf(columns, ref.seriesId) : undefined
    return s && s.x === columns.key ? columnsPositionOf(columns, s, ref) : -1
  }
  const p = cartesianPositionOf(model, ref)
  const s = p < 0 || !ref ? undefined : seriesOf(model, ref.seriesId)
  return s ? keyIndexAt(s, p) : -1
}

/** 数据引用的自变量（键）；引用失效时为 null。 */
export function cartesianKeyOf(model: CartesianModel, ref: ChartDatumRef | null): ChartKey | null {
  const columns = model.columns?.data
  if (columns) {
    const s = ref ? columnsSeriesOf(columns, ref.seriesId) : undefined
    const p = columnsPositionOf(columns, s, ref)
    return s && p >= 0 ? columnsKeyAt(columns, s, p) : null
  }
  const j = cartesianKeyIndexOf(model, ref)
  return j < 0 ? null : model.spec.keys[j]!
}

/** 数据在绘图区里的锚点；尚未测量或引用失效时为 null。 */
export function cartesianAnchorOf(model: CartesianModel, ref: ChartDatumRef | null): { x: number, y: number } | null {
  const p = cartesianPositionOf(model, ref)
  if (!ref || p < 0)
    return null
  const c = model.columns
  if (c) {
    const s = columnsSeriesOf(c.data, ref.seriesId)
    return c.layout && s ? columnsAnchorAt(c.data, c.layout, s, p) : null
  }
  return model.scene?.anchors.get(ref.seriesId)?.[p] ?? null
}

/** 系列在某个键上的位置：柱与折线即键的位置，散点取这个 x 上的第一个点；没有时为 −1。 */
function positionAtKey(s: CartesianSeriesValues, keyIndex: number): number {
  return s.keyAt ? s.keyAt.indexOf(keyIndex) : keyIndex
}

/** 某个系列在某个位置上的数据引用；没有值时为 null。 */
export function cartesianRefAt(model: CartesianModel, seriesId: string, position: number): ChartDatumRef | null {
  const columns = model.columns?.data
  if (columns) {
    const c = columnsSeriesOf(columns, seriesId)
    return c && position >= 0 && position < columns.length && Number.isFinite(c.y[position] as number) ? { seriesId, index: columns.start + position } : null
  }
  const s = seriesOf(model, seriesId)
  if (!s || position < 0 || s.values[position] == null)
    return null
  return { seriesId, index: s.rows[position]! }
}

/** 标记在场景里的键，也是写在 data-key 上的身份：系列 id 加上数据身份（散点是点的身份，其余是 x 的身份）。 */
function markKeyAt(model: CartesianModel, s: CartesianSeriesValues, position: number): string {
  return `${s.spec.id}:${s.pointIds?.[position] ?? cartesianDatumId(model.spec.keys[position]!)}`
}

/** 标记与焦点代理写在 data-key 上的身份。 */
export function cartesianMarkKey(model: CartesianModel, ref: ChartDatumRef): string | null {
  const columns = model.columns?.data
  if (columns) {
    const c = columnsSeriesOf(columns, ref.seriesId)
    const at = columnsPositionOf(columns, c, ref)
    return c && at >= 0 ? columnsMarkKey(columns, c, at) : null
  }
  const p = cartesianPositionOf(model, ref)
  const s = seriesOf(model, ref.seriesId)
  return p < 0 || !s ? null : markKeyAt(model, s, p)
}

/** 第一个可见系列的第一个有值的数据：键盘首次进入时的落点。 */
export function cartesianFirstRef(model: CartesianModel): ChartDatumRef | null {
  if (model.columns)
    return columnsFirstRef(model.columns.data)
  for (const s of model.derived.visible) {
    const p = s.values.findIndex(v => v != null)
    if (p >= 0)
      return { seriesId: s.spec.id, index: s.rows[p]! }
  }
  return null
}

const firstVisible = new WeakMap<object, ChartDatumRef | null>()

/**
 * 自变量方向放大后，窗口里的第一个数据（第一个可见系列里锚点落在绘图区里的第一个）；没放大、还没测量或窗口里没有数据时为 null。
 * 按布局记忆：没有焦点时每次连接都要问它，百万点也只找一遍。
 */
function firstVisibleRef(model: CartesianModel): ChartDatumRef | null {
  const scene = model.scene
  if (!scene || isFullWindow(scene.layout.window.x))
    return null
  const owner = model.columns?.layout ?? scene
  const hit = firstVisible.get(owner)
  if (hit !== undefined)
    return hit
  const { plot } = scene.layout
  const vertical = model.spec.orientation === 'vertical'
  const lo = vertical ? plot.x : plot.y
  const hi = vertical ? plot.x + plot.width : plot.y + plot.height
  const along = (a: { x: number, y: number }): number => (vertical ? a.x : a.y)
  let ref: ChartDatumRef | null = null
  const c = model.columns
  if (c?.layout) {
    const { data, layout } = c
    for (const s of data.visible) {
      const sorted = s.x === data.key
      for (let p = sorted ? Math.max(0, layout.from) : 0; p < data.length && !ref; p++) {
        const a = columnsAnchorAt(data, layout, s, p)
        if (a && along(a) >= lo - 0.5 && along(a) <= hi + 0.5)
          ref = { seriesId: s.spec.id, index: data.start + p }
        else if (a && sorted && along(a) > hi)
          break
      }
      if (ref)
        break
    }
  }
  else if (!c) {
    for (const s of model.derived.visible) {
      const p = scene.anchors.get(s.spec.id)?.findIndex(a => a != null && along(a) >= lo - 0.5 && along(a) <= hi + 0.5) ?? -1
      if (p >= 0 && s.values[p] != null) {
        ref = { seriesId: s.spec.id, index: s.rows[p]! }
        break
      }
    }
  }
  firstVisible.set(owner, ref)
  return ref
}

/** roving 锚点：锚点还有效就用它，否则退回第一个数据；放大后退回窗口里的第一个数据，Tab 进来不落在窗外。 */
export function cartesianAnchor(model: CartesianModel, focused: ChartDatumRef | null): ChartDatumRef | null {
  return cartesianPositionOf(model, focused) >= 0 ? focused : firstVisibleRef(model) ?? cartesianFirstRef(model)
}

function detailsOf(model: CartesianModel, s: CartesianSeriesValues, position: number): ChartDatumDetails {
  const key = model.spec.keys[keyIndexAt(s, position)]!
  const value = s.values[position] ?? null
  const row = s.rows[position]!
  const size = s.sizes?.[position]
  const color = s.colors?.[position]
  const anchor = model.scene?.anchors.get(s.spec.id)?.[position] ?? null
  const formatted: Record<string, string> = { key: model.formats.key(key), value: value == null ? '' : model.formats.value(value) }
  const values: Record<string, unknown> = { key, value }
  // 区间：写成「下 – 上」
  const low = s.lows?.[position]
  if (low != null && value != null) {
    values.low = low
    formatted.value = `${model.formats.value(low)} – ${model.formats.value(value)}`
  }
  // K 线：主值是收盘，写成文字时四个价一起写
  const ohlc = s.ohlc?.[position]
  if (ohlc) {
    Object.assign(values, ohlc)
    const text = { open: model.formats.value(ohlc.open), high: model.formats.value(ohlc.high), low: model.formats.value(ohlc.low), close: model.formats.value(ohlc.close) }
    formatted.value = model.translations.ohlcLabel(text)
  }
  // 箱线：主值是中位数，写成文字时五个数一起写
  const box = s.boxes?.[position]
  if (box) {
    Object.assign(values, { min: box.min, q1: box.q1, median: box.median, q3: box.q3, max: box.max, outliers: box.outliers })
    const f = model.formats.value
    formatted.value = model.translations.boxLabel({ min: f(box.min), q1: f(box.q1), median: f(box.median), q3: f(box.q3), max: f(box.max) })
  }
  if (size != null) {
    values.size = size
    formatted.size = model.formats.measure(size)
  }
  if (color != null) {
    values.color = color
    formatted.color = model.formats.measure(color)
  }
  return {
    seriesId: s.spec.id,
    seriesName: s.spec.name,
    slot: s.spec.slot,
    tone: s.spec.tone,
    index: row,
    key,
    values,
    formatted,
    datum: model.spec.rows[row] ?? {},
    point: anchor ?? { x: 0, y: 0 },
  }
}

/**
 * 详情载荷。axis 模式下带上同一个键上的全部可见系列（按图例次序，缺失值的系列也列出、数值为空；
 * 散点取这个 x 上的第一个点，这个 x 上没有点的散点系列不列），提示框与联动据此显示；item 模式只报这一个。
 */
export function cartesianDetails(model: CartesianModel, ref: ChartDatumRef, trigger: CartesianTrigger): ChartDatumDetails | null {
  const c = model.columns
  if (c)
    return columnsDetails(c.data, c.layout, model.formats, model.translations, ref, trigger)
  const p = cartesianPositionOf(model, ref)
  const s = seriesOf(model, ref.seriesId)
  if (p < 0 || !s)
    return null
  const own = detailsOf(model, s, p)
  if (trigger === 'item')
    return own
  const j = keyIndexAt(s, p)
  const items = model.derived.visible.flatMap((v) => {
    if (v === s)
      return [own]
    const at = positionAtKey(v, j)
    return at < 0 ? [] : [detailsOf(model, v, at)]
  })
  return { ...own, items }
}

/** 第一个在该键上有值的可见系列：联动（受控 activeKey）时的落点。 */
function refAtKey(model: CartesianModel, key: ChartKey): ChartDatumRef | null {
  if (model.columns)
    return columnsRefAtKey(model.columns.data, key)
  const id = cartesianKeyId(key)
  const j = id == null ? undefined : model.spec.keyIndex.get(id)
  if (j == null)
    return null
  for (const s of model.derived.visible) {
    const ref = cartesianRefAt(model, s.spec.id, positionAtKey(s, j))
    if (ref)
      return ref
  }
  return null
}

export interface CartesianActive {
  readonly ref: ChartDatumRef
  /** pointer / keyboard 来自本图；linked 来自受控的 activeKey（联动的另一张图）。 */
  readonly source: 'pointer' | 'keyboard' | 'linked'
}

/** 激活的数据：指针压过键盘，二者都没有时退回受控的 activeKey；Escape 收起后都不取。 */
export function cartesianActive(model: CartesianModel, context: Pick<ChartBaseContext, 'hover' | 'focused' | 'focusWithin' | 'dismissed' | 'activeKey'>): CartesianActive | null {
  const source = chartActiveSource(context)
  if (source === 'pointer' && context.hover && cartesianPositionOf(model, context.hover.ref) >= 0)
    return { ref: context.hover.ref, source }
  if (source === 'keyboard' && context.focused && cartesianPositionOf(model, context.focused) >= 0)
    return { ref: context.focused, source }
  if (source == null && !context.dismissed && context.activeKey != null) {
    const ref = refAtKey(model, context.activeKey)
    if (ref)
      return { ref, source: 'linked' }
  }
  return null
}

/**
 * 键盘导航：沿自变量方向走键（散点按点的次序走）、在同一个键上换系列；到头原地不动（返回 null）。缺失值跳过。
 * 换到散点系列时落在 x 最近的那个点上。
 */
export function cartesianNavTarget(model: CartesianModel, from: ChartDatumRef, intent: ChartNavIntent): ChartDatumRef | null {
  if (model.columns)
    return columnsNavTarget(model.columns.data, from, intent)
  const visible = model.derived.visible
  const at = visible.findIndex(s => s.spec.id === from.seriesId)
  const j = cartesianPositionOf(model, from)
  if (at < 0 || j < 0)
    return null
  const s = visible[at]!
  const present = s.values.map((v, k) => (v == null ? -1 : k)).filter(k => k >= 0)
  const pos = present.indexOf(j)
  const step = (target: number): ChartDatumRef | null => (target === j ? null : cartesianRefAt(model, s.spec.id, target))
  switch (intent) {
    case 'next':
      return pos + 1 < present.length ? step(present[pos + 1]!) : null
    case 'prev':
      return pos > 0 ? step(present[pos - 1]!) : null
    case 'first':
      return step(present[0]!)
    case 'last':
      return step(present.at(-1)!)
    case 'page-next':
      return step(present[Math.min(present.length - 1, pos + chartPageSize(present.length))]!)
    case 'page-prev':
      return step(present[Math.max(0, pos - chartPageSize(present.length))]!)
    case 'series-next':
    case 'series-prev': {
      const dir = intent === 'series-next' ? 1 : -1
      const key = keyIndexAt(s, j)
      for (let k = at + dir; k >= 0 && k < visible.length; k += dir) {
        const other = visible[k]!
        const ref = cartesianRefAt(model, other.spec.id, other.keyAt ? nearestPosition(other, key) : key)
        if (ref)
          return ref
      }
      return null
    }
    default:
      return null
  }
}

/** 散点系列里 x 离这个键最近的点；系列没有点时为 −1。 */
function nearestPosition(s: CartesianSeriesValues, keyIndex: number): number {
  let best = -1
  let distance = Number.POSITIVE_INFINITY
  s.keyAt!.forEach((k, p) => {
    const d = Math.abs(k - keyIndex)
    if (s.values[p] != null && d < distance) {
      best = p
      distance = d
    }
  })
  return best
}

const pickerCache = new WeakMap<object, ReturnType<typeof createPicker>>()

/**
 * 命中：指针在绘图区里的坐标换成数据引用。
 * axis 模式先按自变量方向找最近的键（类目轴落在哪条带、连续轴最近的点），再在这个键上取离指针最近的系列；
 * item 模式用引擎的拾取器，柱按柱本身外扩命中半径、折线按最近点，粗指针取 44px 命中区。
 */
export function cartesianHitTest(
  model: CartesianModel,
  x: number,
  y: number,
  trigger: CartesianTrigger,
  pointerType: string,
): { ref: ChartDatumRef, key: ChartKey } | null {
  const c = model.columns
  if (c)
    return c.layout && c.raster ? columnsHitTest(c.data, c.layout, c.raster, x, y, trigger, pointerType) : null
  const scene = model.scene
  if (!scene)
    return null
  const { plot } = scene.layout
  const vertical = model.spec.orientation === 'vertical'
  if (x < plot.x || x > plot.x + plot.width || y < plot.y || y > plot.y + plot.height)
    return null
  if (trigger === 'item') {
    let picker = pickerCache.get(scene)
    if (!picker) {
      picker = createPicker(scene.scene, { radius: scene.layout.metrics.hitMin / 2, rectHit: 'mark', axis: vertical ? 'x' : 'y' })
      pickerCache.set(scene, picker)
    }
    const hit = picker.pick(x, y, { mode: 'item', pointerType })[0]
    const s = hit?.datum ? seriesOf(model, hit.datum.seriesId) : undefined
    if (!hit || !s)
      return null
    // 折线命中的是线上的点：点的键就是 x 的身份；柱与散点命中的是标记本身
    const p = hit.pointKey != null ? model.spec.keyIndex.get(hit.pointKey) ?? -1 : scene.info.get(hit.key)?.position ?? -1
    const ref = cartesianRefAt(model, s.spec.id, p)
    return ref ? { ref, key: model.spec.keys[keyIndexAt(s, p)]! } : null
  }
  const along = vertical ? x : y
  let best = -1
  let bestDistance = Number.POSITIVE_INFINITY
  scene.layout.keyCenters.forEach((center, j) => {
    const d = Math.abs(center - along)
    if (Number.isFinite(d) && d < bestDistance) {
      best = j
      bestDistance = d
    }
  })
  if (best < 0)
    return null
  const across = vertical ? y : x
  let ref: ChartDatumRef | null = null
  let nearest = Number.POSITIVE_INFINITY
  for (const s of model.derived.visible) {
    const p = positionAtKey(s, best)
    const anchor = p < 0 ? null : scene.anchors.get(s.spec.id)?.[p]
    if (!anchor)
      continue
    const d = Math.abs((vertical ? anchor.y : anchor.x) - across)
    if (d < nearest) {
      nearest = d
      ref = { seriesId: s.spec.id, index: s.rows[p]! }
    }
  }
  return ref ? { ref, key: model.spec.keys[best]! } : null
}

const EMPTY_OVERLAY: CartesianOverlay = Object.freeze({ under: [], over: [] })

/**
 * 前景层：随激活、聚焦与刷选变化，不进场景、不参与记忆。
 * focus 为真时（键盘聚焦）焦点代理带 Tab 位并画焦点环；ring 为真时画焦点环（:focus-visible）。
 */
export function cartesianOverlay(
  model: CartesianModel,
  active: CartesianActive | null,
  trigger: CartesianTrigger,
  focused: { ref: ChartDatumRef, ring: boolean } | null,
  brush: PlotBox | null = null,
): CartesianOverlay {
  const c = model.columns
  if (c) {
    // 列式数据不刷选：只有准线、激活的点与焦点环
    return c.layout && (active || focused) ? columnsOverlay(c.data, c.layout, active, trigger, focused) : EMPTY_OVERLAY
  }
  const scene = model.scene
  if (!scene || (!active && !focused && !brush))
    return EMPTY_OVERLAY
  const { plot, metrics } = scene.layout
  const vertical = model.spec.orientation === 'vertical'
  const under: Mark[] = []
  const over: Mark[] = []
  const pointSize = Math.PI * (metrics.pointSize / 2) ** 2
  const lineSeries = new Set(model.derived.visible.filter(s => s.spec.mark === 'line').map(s => s.spec.id))
  const barOnly = model.derived.visible.every(s => s.spec.mark === 'bar')

  // 刷选框垫在最底下：框里的数据照常可读，边框标出范围
  if (brush)
    under.push({ kind: 'rect', key: 'brush', part: 'brush', ...brush })

  const activeKey = active ? cartesianKeyIndexOf(model, active.ref) : -1
  if (activeKey >= 0 && trigger === 'axis') {
    const center = scene.layout.keyCenters[activeKey]!
    if (barOnly && scene.layout.bandwidth > 0) {
      // 柱图的准线是整条类目带：一条细线落在柱缝里看不出指的是哪一组
      const step = (scene.layout.keyScale as { step?: number }).step ?? scene.layout.bandwidth
      under.push(vertical
        ? { kind: 'rect', key: 'crosshair', part: 'crosshair', x: center - step / 2, y: plot.y, width: step, height: plot.height }
        : { kind: 'rect', key: 'crosshair', part: 'crosshair', x: plot.x, y: center - step / 2, width: plot.width, height: step })
    }
    else {
      const at = Math.round(center) + 0.5
      under.push({ kind: 'path', key: 'crosshair', part: 'crosshair', d: vertical ? `M${at},${plot.y}L${at},${plot.y + plot.height}` : `M${plot.x},${at}L${plot.x + plot.width},${at}` })
    }
  }

  // 激活的点：axis 模式每条折线在这个键上一个，item 模式只有命中的那一个
  const points = new Map<string, number>()
  if (activeKey >= 0 && active) {
    if (trigger === 'axis') {
      for (const id of lineSeries)
        points.set(id, activeKey)
    }
    else if (lineSeries.has(active.ref.seriesId)) {
      points.set(active.ref.seriesId, activeKey)
    }
  }
  // 折线的位置就是键的位置；散点的点本身可聚焦，不要焦点代理
  const focusKey = focused ? cartesianPositionOf(model, focused.ref) : -1
  if (focused && focusKey >= 0 && lineSeries.has(focused.ref.seriesId))
    points.set(focused.ref.seriesId, focusKey)
  for (const [id, j] of points) {
    const anchor = scene.anchors.get(id)?.[j]
    const s = model.derived.visible.find(v => v.spec.id === id)
    if (!anchor || !s)
      continue
    const paint = { ...(s.spec.slot != null ? { slot: s.spec.slot } : {}), ...(s.spec.tone != null ? { tone: s.spec.tone } : {}) }
    over.push({
      kind: 'symbol',
      key: `${id}:${cartesianDatumId(model.spec.keys[j]!)}`,
      part: 'point',
      x: anchor.x,
      y: anchor.y,
      size: pointSize,
      symbol: 'circle',
      datum: { seriesId: id, index: s.rows[j]! },
      paint,
      a11y: { label: '', focusable: focused != null && focusKey === j && focused.ref.seriesId === id },
    })
  }

  // 焦点环：画在标记外，隔一道表面间隙；形状随标记（柱是圆角矩形，点是圆）
  if (focused?.ring && focusKey >= 0) {
    const inset = metrics.gap + 1
    const key = cartesianMarkKey(model, focused.ref) ?? ''
    const bar = findMark(scene.scene.layers.data, key)
    if (bar?.kind === 'rect') {
      // 立在基线上的那一端不外扩：环越过基线会压到坐标轴与刻度标签
      const valueScale = scene.layout.valueScale
      const zero = valueScale.map(model.spec.valueScale === 'log' ? valueScale.domain[0]! : 0)
      const flush = (edge: number): boolean => zero != null && Math.abs(edge - zero) < 0.5
      const [lo, hi] = vertical ? [bar.y, bar.y + bar.height] : [bar.x, bar.x + bar.width]
      const from = flush(lo) ? lo : lo - inset
      const to = flush(hi) ? hi : hi + inset
      over.push(vertical
        ? { kind: 'rect', key: 'focus-ring', part: 'focus-ring', x: bar.x - inset, y: from, width: bar.width + inset * 2, height: to - from, cornerRadius: (bar.cornerRadius ?? 0) + inset, orientation: bar.orientation, baseline: bar.baseline }
        : { kind: 'rect', key: 'focus-ring', part: 'focus-ring', x: from, y: bar.y - inset, width: to - from, height: bar.height + inset * 2, cornerRadius: (bar.cornerRadius ?? 0) + inset, orientation: bar.orientation, baseline: bar.baseline })
    }
    else {
      // 散点的环按点本身的大小外扩：气泡大小不一
      const anchor = scene.anchors.get(focused.ref.seriesId)?.[focusKey]
      if (anchor) {
        const own = bar?.kind === 'symbol' ? Math.sqrt(bar.size / Math.PI) : metrics.pointSize / 2
        const r = own + inset
        over.push({ kind: 'symbol', key: 'focus-ring', part: 'focus-ring', x: anchor.x, y: anchor.y, size: Math.PI * r * r, symbol: 'circle' })
      }
    }
  }
  return { under, over }
}

/** 绘图区里的一块矩形（px）。 */
interface PlotBox { readonly x: number, readonly y: number, readonly width: number, readonly height: number }

function isCategoryKeys(model: CartesianModel): boolean {
  return model.spec.keyScale === 'band' || model.spec.keyScale === 'point'
}

/** 类目轴上一个键的下标；不在数据里为 −1。 */
function keyIndexOfKey(model: CartesianModel, key: ChartKey): number {
  return model.spec.keys.findIndex(k => sameEnd(k, key))
}

/** 刷选范围在自变量方向上盖到的像素段（沿自变量轴，未排序前的两端）；没刷这个方向为 null。 */
function brushKeyPixels(model: CartesianModel, x: readonly [ChartKey, ChartKey]): [number, number] | null {
  const layout = model.scene!.layout
  if (isCategoryKeys(model)) {
    // 类目取首尾类目的整条带；窗外的类目夹到露出的那一段
    const a = keyIndexOfKey(model, x[0])
    const b = keyIndexOfKey(model, x[1])
    if (a < 0 || b < 0)
      return null
    const [first, last] = layout.keyRange
    const lo = Math.max(Math.min(a, b), first)
    const hi = Math.min(Math.max(a, b), last)
    if (lo > hi)
      return null
    const step = (layout.keyScale as { step?: number }).step ?? layout.bandwidth
    const c0 = layout.keyCenters[lo]!
    const c1 = layout.keyCenters[hi]!
    return [Math.min(c0, c1) - step / 2, Math.max(c0, c1) + step / 2]
  }
  const map = layout.keyScale.map as (v: unknown) => number | undefined
  const p0 = map(model.spec.keyScale === 'time' || model.spec.keyScale === 'utc' ? new Date(x[0].valueOf()) : x[0])
  const p1 = map(model.spec.keyScale === 'time' || model.spec.keyScale === 'utc' ? new Date(x[1].valueOf()) : x[1])
  return p0 == null || p1 == null || !Number.isFinite(p0) || !Number.isFinite(p1) ? null : [Math.min(p0, p1), Math.max(p0, p1)]
}

/**
 * 刷选范围画在绘图区里的矩形：没刷的方向铺满绘图区，类目取首尾类目的整条带，越出绘图区的部分夹掉；
 * 没有刷选或范围整个在窗外时为 null。
 */
export function cartesianBrushRect(model: CartesianModel, selection: CartesianBrushSelection | null): PlotBox | null {
  const scene = model.scene
  if (!scene || model.columns || !selection || (selection.x == null && selection.y == null))
    return null
  const { plot, valueScale } = scene.layout
  const vertical = model.spec.orientation === 'vertical'
  const keySpan = vertical ? [plot.x, plot.x + plot.width] : [plot.y, plot.y + plot.height]
  const valueSpan = vertical ? [plot.y, plot.y + plot.height] : [plot.x, plot.x + plot.width]
  let k: [number, number] = [keySpan[0]!, keySpan[1]!]
  let v: [number, number] = [valueSpan[0]!, valueSpan[1]!]
  if (selection.x) {
    const pixels = brushKeyPixels(model, selection.x)
    if (!pixels)
      return null
    k = [Math.max(k[0], pixels[0]), Math.min(k[1], pixels[1])]
  }
  if (selection.y) {
    const a = valueScale.map(selection.y[0])
    const b = valueScale.map(selection.y[1])
    if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b))
      return null
    v = [Math.max(v[0], Math.min(a, b)), Math.min(v[1], Math.max(a, b))]
  }
  if (k[1] <= k[0] || v[1] <= v[0])
    return null
  return vertical
    ? { x: k[0], y: v[0], width: k[1] - k[0], height: v[1] - v[0] }
    : { x: v[0], y: k[0], width: v[1] - v[0], height: k[1] - k[0] }
}

/**
 * 绘图区里拖出的一块矩形换成刷选范围（定义域里的值）：类目取中心落在框里的首尾类目，连续轴与数值轴按比例尺反算；
 * 只刷 dirs 里的方向，另一个方向为 null。自变量方向一个类目也没框到时为 null。
 */
export function cartesianBrushSelectionOf(
  model: CartesianModel,
  box: { readonly x0: number, readonly y0: number, readonly x1: number, readonly y1: number },
  dirs: { readonly x: boolean, readonly y: boolean },
): CartesianBrushSelection | null {
  const scene = model.scene
  if (!scene || model.columns)
    return null
  const { plot, keyScale, valueScale, keyCenters } = scene.layout
  const vertical = model.spec.orientation === 'vertical'
  const clampX = (v: number): number => Math.min(plot.x + plot.width, Math.max(plot.x, v))
  const clampY = (v: number): number => Math.min(plot.y + plot.height, Math.max(plot.y, v))
  const xs = [clampX(box.x0), clampX(box.x1)].sort((a, b) => a - b) as [number, number]
  const ys = [clampY(box.y0), clampY(box.y1)].sort((a, b) => a - b) as [number, number]
  const [k0, k1] = vertical ? xs : ys
  const [v0, v1] = vertical ? ys : xs
  let x: CartesianBrushSelection['x'] = null
  if (dirs.x) {
    if (isCategoryKeys(model)) {
      const inside = keyCenters.flatMap((c, j) => (Number.isFinite(c) && c >= k0 && c <= k1 ? [j] : []))
      if (inside.length === 0)
        return null
      x = [model.spec.keys[Math.min(...inside)]!, model.spec.keys[Math.max(...inside)]!]
    }
    else {
      const invert = (keyScale as { invert: (px: number) => number | Date }).invert
      const ends = [invert(k0), invert(k1)].map(v => v.valueOf()).sort((a, b) => a - b)
      x = model.spec.keyScale === 'time' || model.spec.keyScale === 'utc' ? [new Date(ends[0]!), new Date(ends[1]!)] : [ends[0]!, ends[1]!]
    }
  }
  let y: CartesianBrushSelection['y'] = null
  if (dirs.y) {
    const ends = [valueScale.invert(v0), valueScale.invert(v1)].sort((a, b) => a - b)
    y = [ends[0]!, ends[1]!]
  }
  return { x, y }
}

/** 落在刷选范围里的可见数据的引用：锚点落在框里即算，按图例次序、再按位置排。 */
export function cartesianBrushedRefs(model: CartesianModel, selection: CartesianBrushSelection | null): ChartDatumRef[] {
  const scene = model.scene
  if (!scene || model.columns || !selection || (selection.x == null && selection.y == null))
    return []
  const vertical = model.spec.orientation === 'vertical'
  const category = isCategoryKeys(model)
  // 自变量按值判（窗外的数据也算），数值按锚点的像素判（堆叠、区间、K 线都以画出来的那一点为准）
  let keyIn: (j: number) => boolean = () => true
  if (selection.x) {
    if (category) {
      const a = keyIndexOfKey(model, selection.x[0])
      const b = keyIndexOfKey(model, selection.x[1])
      if (a < 0 || b < 0)
        return []
      keyIn = j => j >= Math.min(a, b) && j <= Math.max(a, b)
    }
    else {
      const lo = Math.min(selection.x[0].valueOf() as number, selection.x[1].valueOf() as number)
      const hi = Math.max(selection.x[0].valueOf() as number, selection.x[1].valueOf() as number)
      keyIn = (j) => {
        const v = model.spec.keys[j]!.valueOf() as number
        return v >= lo && v <= hi
      }
    }
  }
  let valueIn: (at: { x: number, y: number }) => boolean = () => true
  if (selection.y) {
    const a = scene.layout.valueScale.map(selection.y[0])
    const b = scene.layout.valueScale.map(selection.y[1])
    if (a == null || b == null)
      return []
    const [lo, hi] = [Math.min(a, b), Math.max(a, b)]
    valueIn = (at) => {
      const px = vertical ? at.y : at.x
      return px >= lo - 0.5 && px <= hi + 0.5
    }
  }
  const out: ChartDatumRef[] = []
  for (const s of model.derived.visible) {
    const anchors = scene.anchors.get(s.spec.id)
    s.values.forEach((value, p) => {
      const at = anchors?.[p]
      if (value != null && at && keyIn(keyIndexAt(s, p)) && valueIn(at))
        out.push({ seriesId: s.spec.id, index: s.rows[p]! })
    })
  }
  return out
}

/** 落在刷选范围里的可见数据：报给 onBrushSelectionChange。 */
export function cartesianBrushedData(model: CartesianModel, selection: CartesianBrushSelection | null): ChartDatumDetails[] {
  return cartesianBrushedRefs(model, selection).flatMap((ref) => {
    const details = cartesianDetails(model, ref, 'item')
    return details ? [details] : []
  })
}

/** 缩放条缩略线最多取几个点：轨道只有几百像素宽，再多也画不出来。 */
const PREVIEW_POINTS = 240

const previews = new WeakMap<object, { extent: string, d: string | null }>()

/**
 * 缩放条轨道里的缩略线：第一个按键排的可见系列在整条自变量轴上的走势，写在 0–1 的单位框里
 * （横向是整条轴上的位置，纵向上下各留一成）；点多时降采样。没有这样的系列时为 null。
 */
export function cartesianZoomPreview(model: CartesianModel): string | null {
  const c = model.columns
  if (c) {
    const hit = previews.get(c.data)
    if (hit)
      return hit.d
    const d = columnsZoomPreview(c.data)
    previews.set(c.data, { extent: '', d })
    return d
  }
  const layout = model.scene?.layout
  if (!layout)
    return null
  const extent = String(layout.keyExtent)
  const cached = previews.get(model.derived)
  if (cached && cached.extent === extent)
    return cached.d
  const keys = model.spec.keys
  const s = model.derived.visible.find(v => v.keyAt == null && v.spec.mark !== 'scatter')
  const values = s?.values ?? []
  const finite = values.filter((v): v is number => v != null && Number.isFinite(v))
  let d: string | null = null
  if (s && keys.length > 1 && finite.length > 1) {
    const lo = Math.min(...finite)
    const span = Math.max(...finite) - lo
    const kind = model.spec.keyScale === 'log' ? 'log' : 'linear'
    const at = (j: number): number => {
      if (!layout.keyExtent)
        return (j + 0.5) / keys.length
      const v = keys[j]!.valueOf() as number
      return domainToWindow([v, v], layout.keyExtent, kind).start
    }
    const points = values.flatMap((v, j) => (v == null || !Number.isFinite(v) ? [] : [{ x: at(j), y: 0.9 - (span > 0 ? (v - lo) / span : 0.5) * 0.8 }]))
    const sampled = points.length > PREVIEW_POINTS ? lttb(points, PREVIEW_POINTS, p => p.x, p => p.y) : points
    d = `M${sampled.map(p => `${p.x.toFixed(4)},${p.y.toFixed(4)}`).join('L')}`
  }
  previews.set(model.derived, { extent, d })
  return d
}

function findMark(marks: readonly Mark[], key: string): Mark | null {
  for (const mark of marks) {
    if (mark.key === key)
      return mark
    if (mark.kind === 'group') {
      const hit = findMark(mark.children, key)
      if (hit)
        return hit
    }
  }
  return null
}

/** 数值之外的量：气泡大小与按值着色的值，各带名字，依次写出。 */
function extraMeasures(details: ChartDatumDetails, translations: CartesianChartTranslations): string[] {
  const out: string[] = []
  if (details.formatted.size != null)
    out.push(`${translations.sizeLabel} ${details.formatted.size}`)
  if (details.formatted.color != null)
    out.push(`${translations.colorLabel} ${details.formatted.color}`)
  return out
}

/**
 * 数据标记的可及名。缺省文案在气泡与按值着色的点上补上大小与颜色对应的值；
 * 作者整条替换了 datumLabel 时由作者自己从 formatted.size / formatted.color 取。
 */
export function cartesianDatumLabel(details: ChartDatumDetails, translations: CartesianChartTranslations): string {
  const label = translations.datumLabel(details)
  if (translations.datumLabel !== CARTESIAN_TRANSLATIONS.datumLabel)
    return label
  return [label, ...extraMeasures(details, translations)].join(', ')
}

const colorDomains = new WeakMap<object, readonly [number, number] | null>()

/** 按值着色的值域：全部可见的按值着色系列共用一把尺；没有按值着色为 null。 */
export function cartesianColorDomain(model: CartesianModel): readonly [number, number] | null {
  const columns = model.columns?.data
  if (!columns)
    return model.domains.color
  let domain = colorDomains.get(columns)
  if (domain === undefined) {
    domain = columnsColorDomain(columns)
    colorDomains.set(columns, domain)
  }
  return domain
}

/** 色阶图例：名字与两端的值；没有按值着色的系列时为 null。 */
export function cartesianLegendScale(model: CartesianModel, translations: CartesianChartTranslations): CartesianLegendScale | null {
  const domain = cartesianColorDomain(model)
  if (!domain)
    return null
  return { name: translations.colorLabel, min: model.formats.measure(domain[0]), max: model.formats.measure(domain[1]) }
}

/** 提示框内容：头部是自变量，每个系列一行；缺失值写 missingValue。 */
export function cartesianTooltip(
  model: CartesianModel,
  details: ChartDatumDetails,
  translations: CartesianChartTranslations,
  order: CartesianTooltipOrder = 'series',
): CartesianTooltipModel {
  // 按数值排序只改提示框里的行序；缺失值排在最后。回调里的 items 仍按图例次序
  const value = (item: ChartDatumDetails): number | null => (typeof item.values.value === 'number' ? item.values.value : null)
  const rows = order === 'series'
    ? details.items ?? [details]
    : [...(details.items ?? [details])].sort((a, b) => {
        const [x, y] = [value(a), value(b)]
        if (x == null || y == null)
          return x == null ? (y == null ? 0 : 1) : -1
        return order === 'descending' ? y - x : x - y
      })
  return {
    header: details.formatted.key ?? '',
    rows: rows.map((item) => {
      const spec = model.spec.series.find(s => s.id === item.seriesId)
      // 气泡的大小、按值着色的值跟在数值后面：同一个点的几个量，一行读完
      const extra = extraMeasures(item, translations).map(text => ` · ${text}`).join('')
      return {
        seriesId: item.seriesId,
        name: item.seriesName,
        value: item.values.value == null ? translations.missingValue : `${item.formatted.value ?? ''}${extra}`,
        slot: item.slot,
        tone: item.tone,
        mark: spec?.mark ?? 'bar',
        area: spec?.area ?? false,
        symbol: spec?.symbol ?? null,
        t: colorPosition(cartesianColorDomain(model), typeof item.values.color === 'number' ? item.values.color : null),
      }
    }),
  }
}

/** 数据层逐个成节点的标记超过它就改用画布：与单图 SVG 节点预算同一个数。 */
export const CARTESIAN_SVG_MARK_BUDGET = 3000

const nodeCounts = new WeakMap<object, number>()

/** 数据层要逐个生成的节点数：分组不算，折线与面积各算一条路径。 */
function dataNodeCount(marks: readonly Mark[]): number {
  let count = 0
  for (const mark of marks)
    count += mark.kind === 'group' ? dataNodeCount(mark.children) : 1
  return count
}

/** 解析渲染器：svg 与 canvas 原样；auto（缺省）在数据层逐个成节点的标记超过预算时用画布，还没测量时按 svg。 */
export function cartesianRenderer(renderer: CartesianRenderer | undefined, model: CartesianModel): 'svg' | 'canvas' {
  // 列式数据总是画在画布上（写 svg 是规格错误，由管线报出）
  if (model.columns)
    return 'canvas'
  if (renderer === 'svg' || renderer === 'canvas')
    return renderer
  const scene = model.scene
  if (!scene)
    return 'svg'
  let count = nodeCounts.get(scene)
  if (count === undefined) {
    count = dataNodeCount(scene.scene.layers.data)
    nodeCounts.set(scene, count)
  }
  return count > CARTESIAN_SVG_MARK_BUDGET ? 'canvas' : 'svg'
}

/** 没有可画的数据：规格合法、但每个可见系列都没有值。 */
export function cartesianIsEmpty(model: CartesianModel): boolean {
  const columns = model.columns?.data
  if (columns)
    return model.issues.length === 0 && columns.visible.every(s => s.extent.extent(0, columns.length) == null)
  return model.issues.length === 0 && model.derived.visible.every(s => s.values.every(v => v == null))
}

/** 拖出刷选框的最短距离（px）：更短的算点击，清掉刷选。 */
export const CARTESIAN_BRUSH_MIN_DRAG = 3

/** 正在拖的框换成范围：拖得太短（点一下）为 null。 */
export function cartesianBrushingSelection(
  model: CartesianModel,
  brushing: CartesianBrushing,
  dirs: { readonly x: boolean, readonly y: boolean },
): CartesianBrushSelection | null {
  return Math.hypot(brushing.to.x - brushing.from.x, brushing.to.y - brushing.from.y) < CARTESIAN_BRUSH_MIN_DRAG
    ? null
    : cartesianBrushSelectionOf(model, { x0: brushing.from.x, y0: brushing.from.y, x1: brushing.to.x, y1: brushing.to.y }, dirs)
}

const probeGroups = new WeakMap<object, readonly Mark[]>()

/**
 * 画布模式下绘图区里的系列分组：分组照常输出（可及名、色槽、淡出都在它上面），子标记换成样式探针。
 * 列式数据的场景里分组本来就只有探针。
 */
export function cartesianProbeGroups(model: CartesianModel): readonly Mark[] {
  const scene = model.scene
  if (!scene)
    return []
  if (model.columns)
    return scene.scene.layers.data
  let groups = probeGroups.get(scene)
  if (!groups) {
    groups = scene.scene.layers.data.map(mark => (mark.kind === 'group' ? { ...mark, children: cartesianProbesOf(mark.children, mark.key) } : mark))
    probeGroups.set(scene, groups)
  }
  return groups
}

/** 自变量轴按什么缩放：类目轴与等距排列的列式数据按下标，连续轴按取整后的整条定义域。 */
export interface CartesianKeyDomain {
  /** 按下标：窗口取整到键，缩放条一步走一个键。 */
  readonly indexed: boolean
  /** 键的个数：类目数，或列式数据的行数。 */
  readonly count: number
  /** 第 j 个键。 */
  readonly keyAt: (j: number) => ChartKey
  readonly kind: 'linear' | 'log'
  /** 键是日期：窗口两端写 Date。 */
  readonly time: boolean
  /** 窗口一端的键落在第几个键上（按下标缩放时用）：不在数据里时取最近的那个；没有键为 −1。 */
  readonly indexOf: (key: ChartKey) => number
  /** 连续轴上键的两端（日期取时间值）；按下标缩放或没有键时为 null。 */
  readonly extent: readonly [number, number] | null
  /** 最后一个键：按下标是末位的那个，连续轴是最大的那个；没有键为 null。 */
  readonly last: ChartKey | null
}

const keyDomains = new WeakMap<object, CartesianKeyDomain>()

export function cartesianKeyDomain(model: CartesianModel): CartesianKeyDomain {
  const owner = model.columns?.data ?? model.spec
  let domain = keyDomains.get(owner)
  if (!domain) {
    const c = model.columns
    const { keys, keyScale } = model.spec
    if (c) {
      const key = c.data.key
      const n = c.data.length
      let extent: [number, number] | null = key && n > 0 ? [key[0]!, key[n - 1]!] : null
      for (const s of c.data.visible) {
        const e = s.xExtent?.extent(0, n)
        if (e)
          extent = extent ? [Math.min(extent[0], e.min), Math.max(extent[1], e.max)] : [e.min, e.max]
      }
      domain = {
        indexed: c.spec.ordinal,
        count: n,
        keyAt: j => columnsKeyAt(c.data, null, j),
        kind: 'linear',
        time: c.spec.time,
        indexOf: k => (key && n > 0 ? nearestIndex(key, columnsKeyNumber(k)) : -1),
        extent: c.spec.ordinal ? null : extent,
        last: c.spec.ordinal ? (n > 0 ? columnsKeyAt(c.data, null, n - 1) : null) : extent && (c.spec.time ? new Date(extent[1]) : extent[1]),
      }
    }
    else {
      const indexed = keyScale === 'band' || keyScale === 'point'
      const numbers = indexed ? [] : keys.map(k => (k instanceof Date ? k.valueOf() : Number(k))).filter(Number.isFinite)
      domain = {
        indexed,
        count: keys.length,
        keyAt: j => keys[j]!,
        kind: keyScale === 'log' ? 'log' : 'linear',
        time: keyScale === 'time' || keyScale === 'utc',
        indexOf: (k) => {
          const i = keys.findIndex(key => sameEnd(key, k))
          return i >= 0 || keys.length === 0 ? i : keys.length - 1
        },
        extent: numbers.length > 0 ? [Math.min(...numbers), Math.max(...numbers)] : null,
        last: null,
      }
      if (indexed)
        domain = { ...domain, last: keys.at(-1) ?? null }
      else if (domain.extent)
        domain = { ...domain, last: domain.time ? new Date(domain.extent[1]) : domain.extent[1] }
    }
    keyDomains.set(owner, domain)
  }
  return domain
}

/**
 * 画布模式下聚焦的那个数据在 SVG 里的替身（焦点代理）与它所属的系列分组：同部件、同画法，叠在画布上同一处。
 * 折线没有逐点的标记（代理是前景里的点）、引用失效时为 null。
 */
export function cartesianProxyMark(model: CartesianModel, ref: ChartDatumRef): { mark: Mark, group: string } | null {
  const c = model.columns
  if (c)
    return c.layout ? columnsProxyMark(c.data, c.layout, ref) : null
  const key = cartesianMarkKey(model, ref)
  const scene = model.scene
  if (key == null || !scene)
    return null
  for (const group of scene.scene.layers.data) {
    if (group.kind !== 'group')
      continue
    const mark = group.children.find(child => child.key === key)
    if (mark && mark.kind !== 'line' && mark.kind !== 'area')
      return { mark, group: group.key }
  }
  return null
}

/**
 * 标记的 data-key 换回数据引用：对象数组按场景的归属表；列式数据只有聚焦的那个数据有 SVG 替身，
 * 对上它的键即是。对不上时为 null。
 */
export function cartesianRefOfMark(model: CartesianModel, key: string, focused: ChartDatumRef | null): ChartDatumRef | null {
  if (model.columns)
    return focused && cartesianMarkKey(model, focused) === key ? focused : null
  const info = model.scene?.info.get(key)
  const s = info && info.position >= 0 ? seriesOf(model, info.seriesId) : undefined
  return s ? { seriesId: s.spec.id, index: s.rows[info!.position]! } : null
}

function keyValue(key: ChartKey): number {
  return key instanceof Date ? key.valueOf() : Number(key)
}

/**
 * 窗口右端是否贴着数据末端：按下标缩放时右端就是最后一个键，连续轴差不到半个平均键距。
 * 没放大（整条轴）、没有数据时也算在末端。
 */
export function cartesianWindowAtEnd(model: CartesianModel, window: CartesianWindow): boolean {
  const x = window.x
  const d = cartesianKeyDomain(model)
  if (!x || d.count === 0)
    return true
  if (d.indexed)
    return Math.max(d.indexOf(x[0]), d.indexOf(x[1])) >= d.count - 1
  if (!d.extent)
    return true
  const [first, last] = d.extent
  const half = d.count > 1 ? (last - first) / (d.count - 1) / 2 : 0
  return Math.max(keyValue(x[0]), keyValue(x[1])) >= last - half
}

/**
 * 跟随：窗口右端移到数据末端、宽度不变——按下标缩放时按键的个数，连续轴按自变量的差。
 * reached 给了时只在窗口右端够到它（上一次数据的最后一个键）时才跟：没贴着末端的窗口不因数据变了而跳。
 * 没放大、没有数据或右端已经在末端（及更远）时为 null。
 */
export function cartesianFollowWindow(model: CartesianModel, window: CartesianWindow, reached?: ChartKey | null): CartesianWindow | null {
  const x = window.x
  const d = cartesianKeyDomain(model)
  if (!x || d.count === 0)
    return null
  if (reached !== undefined) {
    if (reached == null)
      return null
    const end = d.indexed
      ? Math.max(d.indexOf(x[0]), d.indexOf(x[1])) >= d.indexOf(reached)
      : Math.max(keyValue(x[0]), keyValue(x[1])) >= keyValue(reached)
    if (!end)
      return null
  }
  if (d.indexed) {
    const a = d.indexOf(x[0])
    const b = d.indexOf(x[1])
    const last = d.count - 1
    if (Math.max(a, b) >= last)
      return null
    return { ...window, x: [d.keyAt(Math.max(0, last - Math.abs(b - a))), d.keyAt(last)] }
  }
  if (!d.extent)
    return null
  const end = d.extent[1]
  const lo = Math.min(keyValue(x[0]), keyValue(x[1]))
  const hi = Math.max(keyValue(x[0]), keyValue(x[1]))
  if (hi >= end)
    return null
  const width = hi - lo
  return { ...window, x: d.time ? [new Date(end - width), new Date(end)] : [end - width, end] }
}
