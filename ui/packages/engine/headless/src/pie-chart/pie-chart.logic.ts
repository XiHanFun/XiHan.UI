/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 饼图的交互逻辑：取模型、扇区与数据引用的换算、详情载荷、激活来源、键盘导航、命中测试、焦点环与提示框内容。
// 只算值，不写属性：属性字典都在连接层。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { Mark } from '@xihan-ui/viz'
import type { ChartBaseContext, ChartDatumDetails, ChartDatumRef, ChartKey, ChartNavIntent } from '../shared/chart'
import type { PieModel, PieSliceSpec } from './pie-chart.model'
import type { PieChartSchema, PieChartTranslations, PieSummary, PieTooltipModel } from './pie-chart.types'
import { resolveLocale } from '@xihan-ui/core'
import { CHART_TRANSLATIONS, chartActiveSource, chartPageSize, resolveChartTranslations } from '../shared/chart'
import { PIE_OTHER_ID, pieRefOf, pieSliceKey } from './pie-chart.model'

/** 扇区的可及名：名字、数值、占比。 */
export function defaultPieDatumLabel(details: ChartDatumDetails): string {
  return `${details.seriesName}, ${details.formatted.value ?? ''}, ${details.formatted.share ?? ''}`
}

/** 缺省摘要：扇区数与合计，最大与最小的扇区。 */
export function defaultPieSummary(model: PieSummary): string {
  if (model.sliceCount === 0)
    return 'No data.'
  const head = `${model.sliceCount} ${model.sliceCount === 1 ? 'slice' : 'slices'}, total ${model.total}.`
  const first = model.slices[0]!
  const last = model.slices.at(-1)!
  if (model.sliceCount === 1)
    return `${head} ${first.name}: ${first.share}.`
  return `${head} Largest: ${first.name} ${first.share}. Smallest: ${last.name} ${last.share}.`
}

export const PIE_TRANSLATIONS: PieChartTranslations = Object.freeze({
  ...CHART_TRANSLATIONS,
  datumLabel: defaultPieDatumLabel,
  centerLabel: 'Total',
  nameLabel: 'Name',
  valueLabel: 'Value',
  shareLabel: 'Share',
  summary: defaultPieSummary,
})

const translationsCache = new WeakMap<object, PieChartTranslations>()

/** 合并作者给的文案；同一个覆盖对象只合并一次，管线的无障碍段才不会因为文案对象每次新建而重算。 */
export function pieTranslations(overrides: Partial<PieChartTranslations> | undefined): PieChartTranslations {
  if (!overrides)
    return PIE_TRANSLATIONS
  let hit = translationsCache.get(overrides)
  if (!hit) {
    hit = resolveChartTranslations(PIE_TRANSLATIONS, overrides)
    translationsCache.set(overrides, hit)
  }
  return hit
}

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface PieModelSource {
  prop: PropFn<PieChartSchema>
  context: { get: <K extends keyof ChartBaseContext>(key: K) => ChartBaseContext[K] }
  refs: { get: <K extends keyof PieChartSchema['refs']>(key: K) => PieChartSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，悬停与聚焦只是读缓存。 */
export function pieModelOf(source: PieModelSource): PieModel {
  const { prop, context, refs, scope } = source
  return refs.get('pipeline')({
    data: prop('data'),
    name: prop('nameField'),
    value: prop('valueField'),
    maxSlices: prop('maxSlices'),
    sort: prop('sort'),
    variant: prop('variant'),
    rose: prop('rose'),
    sweep: prop('sweep'),
    labels: prop('labels'),
    format: prop('format'),
    hiddenSeries: context.get('hiddenSeries'),
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurer: refs.get('measurer'),
    measurerVersion: context.get('measurerVersion'),
    locale: resolveLocale(prop('locale'), scope),
    translations: pieTranslations(prop('translations')),
  })
}

/** 扇区显示的名字：「其他」取文案。 */
export function pieNameOf(slice: PieSliceSpec, translations: PieChartTranslations): string {
  return slice.other ? translations.otherLabel : slice.name
}

/** 扇区的键：联动时与别的图对齐用；「其他」不与任何类目对齐。 */
export function pieKeyOf(slice: PieSliceSpec): ChartKey {
  return slice.other ? PIE_OTHER_ID : slice.name
}

/** 引用在角度次序里的位置；隐藏或值为 0 的扇区返回 −1。 */
export function pieSliceIndex(model: PieModel, ref: ChartDatumRef | null | undefined): number {
  if (!ref)
    return -1
  return model.derived.visible.findIndex(s => s.id === ref.seriesId)
}

/** 数据引用 → 标记键（焦点代理与 data-key）。 */
export function pieMarkKey(model: PieModel, ref: ChartDatumRef): string | null {
  return pieSliceIndex(model, ref) >= 0 ? pieSliceKey(ref.seriesId) : null
}

/** 第一个可见扇区：Tab 首次进来落在它上面。 */
export function pieFirstRef(model: PieModel): ChartDatumRef | null {
  const first = model.derived.visible[0]
  return first ? pieRefOf(first) : null
}

/** 悬停、聚焦或点击到某个扇区时报告的内容。 */
export function pieDetails(model: PieModel, ref: ChartDatumRef, translations: PieChartTranslations): ChartDatumDetails | null {
  const at = pieSliceIndex(model, ref)
  if (at < 0)
    return null
  const slice = model.derived.visible[at]!
  const share = model.derived.total > 0 ? slice.value / model.derived.total : 0
  const anchor = model.scene?.geometry.get(slice.id)?.anchor ?? { x: 0, y: 0 }
  const name = pieNameOf(slice, translations)
  return {
    seriesId: slice.id,
    seriesName: name,
    slot: slice.slot,
    tone: null,
    index: pieRefOf(slice).index,
    key: pieKeyOf(slice),
    values: { value: slice.value, share },
    formatted: { key: name, value: model.formats.value(slice.value), share: model.formats.share(share) },
    datum: slice.other ? {} : model.spec.data[slice.rows[0]!] ?? {},
    point: anchor,
  }
}

export interface PieActive {
  readonly ref: ChartDatumRef
  /** 联动过来的键不算本图的激活：不通知、不画焦点环。 */
  readonly source: 'pointer' | 'keyboard' | 'linked'
}

/** 激活的扇区：指针优先，其次键盘，都没有时看受控的 activeKey（另一张图联动过来的键）。 */
export function pieActive(model: PieModel, context: Pick<ChartBaseContext, 'hover' | 'focused' | 'focusWithin' | 'dismissed' | 'activeKey'>): PieActive | null {
  const source = chartActiveSource(context)
  if (source === 'pointer' && context.hover && pieSliceIndex(model, context.hover.ref) >= 0)
    return { ref: context.hover.ref, source }
  if (source === 'keyboard' && context.focused && pieSliceIndex(model, context.focused) >= 0)
    return { ref: context.focused, source }
  if (source == null && !context.dismissed && context.activeKey != null) {
    const slice = model.derived.visible.find(s => !s.other && s.name === String(context.activeKey))
    if (slice)
      return { ref: pieRefOf(slice), source: 'linked' }
  }
  return null
}

/** 键盘导航：沿顺时针在可见扇区之间走；到头原地不动（返回 null）。 */
export function pieNavTarget(model: PieModel, from: ChartDatumRef, intent: ChartNavIntent): ChartDatumRef | null {
  const visible = model.derived.visible
  const at = pieSliceIndex(model, from)
  if (at < 0)
    return null
  const page = chartPageSize(visible.length)
  const target = intent === 'next'
    ? at + 1
    : intent === 'prev'
      ? at - 1
      : intent === 'first'
        ? 0
        : intent === 'last'
          ? visible.length - 1
          : intent === 'page-next'
            ? Math.min(visible.length - 1, at + page)
            : intent === 'page-prev'
              ? Math.max(0, at - page)
              : at
  if (target === at || target < 0 || target >= visible.length)
    return null
  return pieRefOf(visible[target]!)
}

/** 指针命中：换成相对圆心的角度与半径，落在哪个扇区的角度范围与环厚里。 */
export function pieHitTest(model: PieModel, x: number, y: number): ChartDatumRef | null {
  const scene = model.scene
  if (!scene)
    return null
  const { cx, cy, metrics } = scene.layout
  const dx = x - cx
  const dy = y - cy
  const r = Math.hypot(dx, dy)
  // 角度 0 在 12 点、顺时针为正，与扇区同一套
  const angle = Math.atan2(dx, -dy)
  const tolerance = metrics.hitMin / 4
  for (const g of scene.layout.slices) {
    let a = angle
    while (a < g.startAngle)
      a += 2 * Math.PI
    while (a >= g.startAngle + 2 * Math.PI)
      a -= 2 * Math.PI
    if (a <= g.endAngle && r >= Math.max(0, g.innerRadius - tolerance) && r <= g.outerRadius + tolerance)
      return pieRefOf(g.slice)
  }
  return null
}

export interface PieOverlay {
  /** 画在扇区之上：焦点环。 */
  readonly over: readonly Mark[]
}

const EMPTY_OVERLAY: PieOverlay = Object.freeze({ over: [] })

/** 前景层：键盘聚焦时在扇区外画一圈焦点环，隔一道表面间隙；形状随扇区。 */
export function pieOverlay(model: PieModel, focused: { ref: ChartDatumRef, ring: boolean } | null): PieOverlay {
  const scene = model.scene
  if (!scene || !focused?.ring)
    return EMPTY_OVERLAY
  const g = scene.geometry.get(focused.ref.seriesId)
  if (!g)
    return EMPTY_OVERLAY
  const inset = scene.layout.metrics.gap + 1
  const outer = g.outerRadius + inset
  const spread = inset / Math.max(1, outer)
  return {
    over: [{
      kind: 'arc',
      key: 'focus-ring',
      part: 'focus-ring',
      cx: scene.layout.cx,
      cy: scene.layout.cy,
      innerRadius: Math.max(0, g.innerRadius - inset),
      outerRadius: outer,
      startAngle: g.startAngle + g.padAngle / 2 - spread,
      endAngle: g.endAngle - g.padAngle / 2 + spread,
      // 环隔着一道间隙套在扇区外，圆角跟着放大同样的量，两条轮廓才平行
      cornerRadius: scene.layout.metrics.radius + inset,
    }],
  }
}

/** 提示框的内容：头部是扇区名，一行数值与占比；「其他」另列出被合并的各项。 */
export function pieTooltip(model: PieModel, active: PieActive | null, translations: PieChartTranslations): PieTooltipModel | null {
  if (!active)
    return null
  const at = pieSliceIndex(model, active.ref)
  if (at < 0)
    return null
  const slice = model.derived.visible[at]!
  const share = model.derived.total > 0 ? slice.value / model.derived.total : 0
  const rows = [{
    key: slice.id,
    name: model.formats.share(share),
    value: model.formats.value(slice.value),
    slot: slice.slot,
    other: slice.other,
  }]
  // 「其他」另列出被合并的各项：只列名字与数值，色标同「其他」
  if (slice.other) {
    for (const i of slice.rows)
      rows.push({ key: `${slice.id}:${i}`, name: model.spec.names[i] ?? '', value: model.formats.value(model.spec.values[i] ?? 0), slot: null, other: true })
  }
  return { header: pieNameOf(slice, translations), rows }
}
