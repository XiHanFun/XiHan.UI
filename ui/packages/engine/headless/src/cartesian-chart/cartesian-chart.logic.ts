/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 直角坐标图的交互逻辑：取模型、数据引用与键位的换算、详情载荷、激活来源、键盘导航、命中测试、前景层与提示框内容。
// 只算值，不写属性：属性字典都在连接层。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { Mark } from '@xihan-ui/viz'
import type { ChartBaseContext, ChartDatumDetails, ChartDatumRef, ChartKey, ChartNavIntent } from '../shared/chart'
import type { CartesianModel, CartesianSeriesValues } from './cartesian-chart.model'
import type { CartesianChartSchema, CartesianChartTranslations, CartesianTooltipModel, CartesianTrigger } from './cartesian-chart.types'
import { resolveLocale } from '@xihan-ui/core'
import { createPicker } from '@xihan-ui/viz'
import { CHART_TRANSLATIONS, chartActiveSource, chartPageSize, defaultChartSummary, memoizeLast, resolveChartTranslations } from '../shared/chart'
import { cartesianDatumId, cartesianKeyId } from './cartesian-chart.model'

export const CARTESIAN_TRANSLATIONS: CartesianChartTranslations = Object.freeze({
  ...CHART_TRANSLATIONS,
  keyLabel: 'Category',
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

/** 数据表首列的列名换成 x 轴标题时，同一对输入只合并一次。 */
const keyLabelled = memoizeLast((translations: CartesianChartTranslations, keyLabel: string): CartesianChartTranslations => ({ ...translations, keyLabel }))

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface CartesianModelSource {
  prop: PropFn<CartesianChartSchema>
  context: { get: <K extends keyof ChartBaseContext>(key: K) => ChartBaseContext[K] }
  refs: { get: <K extends keyof CartesianChartSchema['refs']>(key: K) => CartesianChartSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，悬停与聚焦只是读缓存。 */
export function cartesianModelOf(source: CartesianModelSource): CartesianModel {
  const { prop, context, refs, scope } = source
  const translations = cartesianTranslations(prop('translations'))
  // 键盘提示条的键名缺省取 x 轴标题
  const keyLabel = prop('translations')?.keyLabel ?? prop('xAxis')?.title
  return refs.get('pipeline')({
    data: prop('data'),
    series: prop('series'),
    xAxis: prop('xAxis'),
    yAxis: prop('yAxis'),
    orientation: prop('orientation'),
    hiddenSeries: context.get('hiddenSeries'),
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurer: refs.get('measurer'),
    measurerVersion: context.get('measurerVersion'),
    locale: resolveLocale(prop('locale'), scope),
    translations: keyLabel && keyLabel !== translations.keyLabel ? keyLabelled(translations, keyLabel) : translations,
  })
}

/** 提示框汇报什么：缺省 axis。 */
export function cartesianTrigger(trigger: CartesianTrigger | undefined): CartesianTrigger {
  return trigger ?? 'axis'
}

function seriesOf(model: CartesianModel, id: string): CartesianSeriesValues | undefined {
  return model.derived.visible.find(s => s.spec.id === id)
}

/** 数据引用在 keys 里的位置；引用失效（系列隐藏、行没有值、数据换了）时为 −1。 */
export function cartesianKeyIndexOf(model: CartesianModel, ref: ChartDatumRef | null): number {
  if (!ref)
    return -1
  return model.derived.keyOfRow.get(ref.seriesId)?.get(ref.index) ?? -1
}

/** 某个系列在某个键上的数据引用；没有值时为 null。 */
export function cartesianRefAt(model: CartesianModel, seriesId: string, keyIndex: number): ChartDatumRef | null {
  const s = seriesOf(model, seriesId)
  if (!s || s.values[keyIndex] == null)
    return null
  return { seriesId, index: s.rows[keyIndex]! }
}

/** 标记与焦点代理写在 data-key 上的身份。 */
export function cartesianMarkKey(model: CartesianModel, ref: ChartDatumRef): string | null {
  const j = cartesianKeyIndexOf(model, ref)
  return j < 0 ? null : `${ref.seriesId}:${cartesianDatumId(model.spec.keys[j]!)}`
}

/** 第一个可见系列的第一个有值的数据：键盘首次进入时的落点。 */
export function cartesianFirstRef(model: CartesianModel): ChartDatumRef | null {
  for (const s of model.derived.visible) {
    const j = s.values.findIndex(v => v != null)
    if (j >= 0)
      return { seriesId: s.spec.id, index: s.rows[j]! }
  }
  return null
}

/** roving 锚点：锚点还有效就用它，否则退回第一个数据。 */
export function cartesianAnchor(model: CartesianModel, focused: ChartDatumRef | null): ChartDatumRef | null {
  return cartesianKeyIndexOf(model, focused) >= 0 ? focused : cartesianFirstRef(model)
}

function detailsOf(model: CartesianModel, s: CartesianSeriesValues, j: number): ChartDatumDetails {
  const key = model.spec.keys[j]!
  const value = s.values[j] ?? null
  const row = s.rows[j]!
  const anchor = model.scene?.anchors.get(s.spec.id)?.[j] ?? null
  return {
    seriesId: s.spec.id,
    seriesName: s.spec.name,
    slot: s.spec.slot,
    tone: s.spec.tone,
    index: row,
    key,
    values: { key, value },
    formatted: { key: model.formats.key(key), value: value == null ? '' : model.formats.value(value) },
    datum: model.spec.rows[row] ?? {},
    point: anchor ?? { x: 0, y: 0 },
  }
}

/**
 * 详情载荷。axis 模式下带上同一个键上的全部可见系列（按图例次序，缺失值的系列也列出、数值为空），
 * 提示框与联动据此显示；item 模式只报这一个。
 */
export function cartesianDetails(model: CartesianModel, ref: ChartDatumRef, trigger: CartesianTrigger): ChartDatumDetails | null {
  const j = cartesianKeyIndexOf(model, ref)
  const s = seriesOf(model, ref.seriesId)
  if (j < 0 || !s)
    return null
  const own = detailsOf(model, s, j)
  if (trigger === 'item')
    return own
  return { ...own, items: model.derived.visible.map(v => detailsOf(model, v, j)) }
}

/** 第一个在该键上有值的可见系列：联动（受控 activeKey）时的落点。 */
function refAtKey(model: CartesianModel, key: ChartKey): ChartDatumRef | null {
  const id = cartesianKeyId(key)
  const j = id == null ? undefined : model.spec.keyIndex.get(id)
  if (j == null)
    return null
  for (const s of model.derived.visible) {
    if (s.values[j] != null)
      return { seriesId: s.spec.id, index: s.rows[j]! }
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
  if (source === 'pointer' && context.hover && cartesianKeyIndexOf(model, context.hover.ref) >= 0)
    return { ref: context.hover.ref, source }
  if (source === 'keyboard' && context.focused && cartesianKeyIndexOf(model, context.focused) >= 0)
    return { ref: context.focused, source }
  if (source == null && !context.dismissed && context.activeKey != null) {
    const ref = refAtKey(model, context.activeKey)
    if (ref)
      return { ref, source: 'linked' }
  }
  return null
}

/** 键盘导航：沿自变量方向走键、在同一个键上换系列；到头原地不动（返回 null）。缺失值跳过。 */
export function cartesianNavTarget(model: CartesianModel, from: ChartDatumRef, intent: ChartNavIntent): ChartDatumRef | null {
  const visible = model.derived.visible
  const at = visible.findIndex(s => s.spec.id === from.seriesId)
  const j = cartesianKeyIndexOf(model, from)
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
      for (let k = at + dir; k >= 0 && k < visible.length; k += dir) {
        const ref = cartesianRefAt(model, visible[k]!.spec.id, j)
        if (ref)
          return ref
      }
      return null
    }
    default:
      return null
  }
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
    if (!hit?.datum)
      return null
    const j = hit.pointKey != null ? Number(hit.pointKey) : scene.info.get(hit.key)?.keyIndex ?? -1
    const ref = j >= 0 ? cartesianRefAt(model, hit.datum.seriesId, j) : null
    return ref ? { ref, key: model.spec.keys[j]! } : null
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
    const anchor = scene.anchors.get(s.spec.id)?.[best]
    if (!anchor)
      continue
    const d = Math.abs((vertical ? anchor.y : anchor.x) - across)
    if (d < nearest) {
      nearest = d
      ref = { seriesId: s.spec.id, index: s.rows[best]! }
    }
  }
  return ref ? { ref, key: model.spec.keys[best]! } : null
}

export interface CartesianOverlay {
  /** 画在数据之下：十字准线（折线）或整条类目带的淡底（柱）。 */
  readonly under: readonly Mark[]
  /** 画在数据之上：激活数据上的点（焦点代理）与焦点环。 */
  readonly over: readonly Mark[]
}

const EMPTY_OVERLAY: CartesianOverlay = Object.freeze({ under: [], over: [] })

/**
 * 前景层：随激活与聚焦变化，不进场景、不参与记忆。
 * focus 为真时（键盘聚焦）焦点代理带 Tab 位并画焦点环；ring 为真时画焦点环（:focus-visible）。
 */
export function cartesianOverlay(
  model: CartesianModel,
  active: CartesianActive | null,
  trigger: CartesianTrigger,
  focused: { ref: ChartDatumRef, ring: boolean } | null,
): CartesianOverlay {
  const scene = model.scene
  if (!scene || (!active && !focused))
    return EMPTY_OVERLAY
  const { plot, metrics } = scene.layout
  const vertical = model.spec.orientation === 'vertical'
  const under: Mark[] = []
  const over: Mark[] = []
  const pointSize = Math.PI * (metrics.pointSize / 2) ** 2
  const lineSeries = new Set(model.derived.visible.filter(s => s.spec.mark === 'line').map(s => s.spec.id))
  const barOnly = model.derived.visible.every(s => s.spec.mark === 'bar')

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
  const focusKey = focused ? cartesianKeyIndexOf(model, focused.ref) : -1
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
      const anchor = scene.anchors.get(focused.ref.seriesId)?.[focusKey]
      if (anchor) {
        const r = metrics.pointSize / 2 + inset
        over.push({ kind: 'symbol', key: 'focus-ring', part: 'focus-ring', x: anchor.x, y: anchor.y, size: Math.PI * r * r, symbol: 'circle' })
      }
    }
  }
  return { under, over }
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

/** 提示框内容：头部是自变量，每个系列一行；缺失值写 missingValue。 */
export function cartesianTooltip(model: CartesianModel, details: ChartDatumDetails, translations: CartesianChartTranslations): CartesianTooltipModel {
  const rows = details.items ?? [details]
  return {
    header: details.formatted.key ?? '',
    rows: rows.map((item) => {
      const spec = model.derived.visible.find(s => s.spec.id === item.seriesId)?.spec
      return {
        seriesId: item.seriesId,
        name: item.seriesName,
        value: item.values.value == null ? translations.missingValue : (item.formatted.value ?? ''),
        slot: item.slot,
        tone: item.tone,
        mark: spec?.mark ?? 'bar',
        area: spec?.area ?? false,
      }
    }),
  }
}
