/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 雷达图的交互逻辑：取模型、数据引用的换算、详情载荷、激活来源、键盘导航、命中测试、前景层与提示框内容。
// 只算值，不写属性：属性字典都在连接层。数据引用的 index 是指标的下标，系列 id 是实体名。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { Mark } from '@xihan-ui/viz'
import type { ChartBaseContext, ChartDatumDetails, ChartDatumRef, ChartNavIntent } from '../shared/chart'
import type { RadarModel, RadarSeriesSpec } from './radar-chart.model'
import type { RadarChartSchema, RadarOverlay } from './radar-chart.schema'
import type { RadarChartTranslations, RadarSummary, RadarTooltipModel } from './radar-chart.types'
import { resolveLocale } from '@xihan-ui/core'
import { CHART_TRANSLATIONS, chartActiveSource, resolveChartTranslations } from '../shared/chart'
import { radarPointKey } from './radar-chart.model'

/** 缺省摘要：实体数与指标数，每个实体最高与最低的指标。 */
export function defaultRadarSummary(model: RadarSummary): string {
  if (model.seriesCount === 0)
    return 'No data.'
  const head = `${model.seriesCount} ${model.seriesCount === 1 ? 'series' : 'series'} across ${model.indicatorCount} indicators.`
  const parts = model.series.map((s) => {
    if (!s.highest)
      return `${s.name}: no values.`
    return s.lowest
      ? `${s.name}: highest ${s.highest.indicator} ${s.highest.value}, lowest ${s.lowest.indicator} ${s.lowest.value}.`
      : `${s.name}: ${s.highest.indicator} ${s.highest.value}.`
  })
  return [head, ...parts].join(' ')
}

export const RADAR_TRANSLATIONS: RadarChartTranslations = Object.freeze({
  ...CHART_TRANSLATIONS,
  nameLabel: 'Name',
  summary: defaultRadarSummary,
})

const translationsCache = new WeakMap<object, RadarChartTranslations>()

/** 合并作者给的文案；同一个覆盖对象只合并一次，管线的无障碍段才不会因为文案对象每次新建而重算。 */
export function radarTranslations(overrides: Partial<RadarChartTranslations> | undefined): RadarChartTranslations {
  if (!overrides)
    return RADAR_TRANSLATIONS
  let hit = translationsCache.get(overrides)
  if (!hit) {
    hit = resolveChartTranslations(RADAR_TRANSLATIONS, overrides)
    translationsCache.set(overrides, hit)
  }
  return hit
}

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface RadarModelSource {
  prop: PropFn<RadarChartSchema>
  context: { get: <K extends keyof ChartBaseContext>(key: K) => ChartBaseContext[K] }
  refs: { get: <K extends keyof RadarChartSchema['refs']>(key: K) => RadarChartSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，悬停与聚焦只是读缓存。 */
export function radarModelOf(source: RadarModelSource): RadarModel {
  const { prop, context, refs, scope } = source
  return refs.get('pipeline')({
    data: prop('data'),
    nameField: prop('nameField'),
    indicators: prop('indicators'),
    shape: prop('shape'),
    area: prop('area'),
    scale: prop('scale'),
    curve: prop('curve'),
    format: prop('format'),
    hiddenSeries: context.get('hiddenSeries'),
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurer: refs.get('measurer'),
    measurerVersion: context.get('measurerVersion'),
    locale: resolveLocale(prop('locale'), scope),
    translations: radarTranslations(prop('translations')),
  })
}

function seriesOf(model: RadarModel, id: string): RadarSeriesSpec | undefined {
  return model.derived.visible.find(s => s.id === id)
}

/** 引用是否还指着一个画出来的顶点：系列可见、指标在、值不缺。 */
export function radarHasDatum(model: RadarModel, ref: ChartDatumRef | null | undefined): ref is ChartDatumRef {
  if (!ref)
    return false
  const s = seriesOf(model, ref.seriesId)
  return s != null && ref.index >= 0 && ref.index < model.spec.indicators.length && s.values[ref.index] != null
}

/** 数据引用 → 标记键（焦点与 data-key）。 */
export function radarMarkKey(model: RadarModel, ref: ChartDatumRef): string | null {
  return radarHasDatum(model, ref) ? radarPointKey(ref.seriesId, model.spec.indicators[ref.index]!.key) : null
}

/** 第一个可见系列在第一个有值的指标上：Tab 首次进来落在它上面。 */
export function radarFirstRef(model: RadarModel): ChartDatumRef | null {
  for (const s of model.derived.visible) {
    const j = s.values.findIndex(v => v != null)
    if (j >= 0)
      return { seriesId: s.id, index: j }
  }
  return null
}

/** 悬停、聚焦或点击到某个顶点时报告的内容：键是指标，值是这个实体在它上面的值。 */
export function radarDetails(model: RadarModel, ref: ChartDatumRef): ChartDatumDetails | null {
  if (!radarHasDatum(model, ref))
    return null
  const s = seriesOf(model, ref.seriesId)!
  const indicator = model.spec.indicators[ref.index]!
  const value = s.values[ref.index]!
  const point = model.scene?.layout.points.get(s.id)?.[ref.index] ?? { x: 0, y: 0 }
  return {
    seriesId: s.id,
    seriesName: s.name,
    slot: s.slot,
    tone: null,
    index: s.row,
    key: indicator.key,
    values: { key: indicator.key, value },
    formatted: { key: indicator.label, value: model.formats.value(value) },
    datum: model.spec.data[s.row] ?? {},
    point,
  }
}

export interface RadarActive {
  readonly ref: ChartDatumRef
  /** 联动过来的键不算本图的激活：不通知、不画焦点环。 */
  readonly source: 'pointer' | 'keyboard' | 'linked'
}

/** 激活的顶点：指针优先，其次键盘，都没有时看受控的 activeKey（另一张图联动过来的指标）。 */
export function radarActive(model: RadarModel, context: Pick<ChartBaseContext, 'hover' | 'focused' | 'focusWithin' | 'dismissed' | 'activeKey'>): RadarActive | null {
  const source = chartActiveSource(context)
  if (source === 'pointer' && context.hover && radarHasDatum(model, context.hover.ref))
    return { ref: context.hover.ref, source }
  if (source === 'keyboard' && radarHasDatum(model, context.focused))
    return { ref: context.focused!, source }
  if (source == null && !context.dismissed && context.activeKey != null) {
    const j = model.spec.indicators.findIndex(ind => ind.key === String(context.activeKey))
    const s = j < 0 ? undefined : model.derived.visible.find(v => v.values[j] != null)
    if (s)
      return { ref: { seriesId: s.id, index: j }, source: 'linked' }
  }
  return null
}

/**
 * 键盘导航：左右键沿顺时针在同一个实体的指标之间走，上下键在同一个指标上换实体；
 * 跳过缺失的值，到头原地不动（返回 null）。
 */
export function radarNavTarget(model: RadarModel, from: ChartDatumRef, intent: ChartNavIntent): ChartDatumRef | null {
  const s = seriesOf(model, from.seriesId)
  if (!s)
    return null
  const n = model.spec.indicators.length
  const defined = (series: RadarSeriesSpec, j: number): boolean => series.values[j] != null
  if (intent === 'series-next' || intent === 'series-prev') {
    const visible = model.derived.visible
    const at = visible.indexOf(s)
    const step = intent === 'series-next' ? 1 : -1
    for (let k = at + step; k >= 0 && k < visible.length; k += step) {
      if (defined(visible[k]!, from.index))
        return { seriesId: visible[k]!.id, index: from.index }
    }
    return null
  }
  const order = Array.from({ length: n }, (_, j) => j).filter(j => defined(s, j))
  const at = order.indexOf(from.index)
  const target = intent === 'next'
    ? at + 1
    : intent === 'prev'
      ? at - 1
      : intent === 'first'
        ? 0
        : intent === 'last'
          ? order.length - 1
          : intent === 'page-next'
            ? order.length - 1
            : intent === 'page-prev' ? 0 : at
  if (target === at || target < 0 || target >= order.length)
    return null
  return { seriesId: s.id, index: order[target]! }
}

/**
 * 指针命中：先按角度落到最近的指标轴，再在这根轴上取离指针最近的顶点；
 * 指针在网格外一圈之外不算命中。
 */
export function radarHitTest(model: RadarModel, x: number, y: number): ChartDatumRef | null {
  const scene = model.scene
  if (!scene)
    return null
  const { cx, cy, radius, angles, metrics } = scene.layout
  const n = angles.length
  const r = Math.hypot(x - cx, y - cy)
  if (n === 0 || r > radius + metrics.hitMin)
    return null
  // 角度 0 在 12 点、顺时针为正，与指标轴同一套
  const angle = (Math.atan2(x - cx, -(y - cy)) + 2 * Math.PI) % (2 * Math.PI)
  const j = Math.round(angle / ((2 * Math.PI) / n)) % n
  let best: ChartDatumRef | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  for (const s of model.derived.visible) {
    const p = scene.layout.points.get(s.id)?.[j]
    if (!p || s.values[j] == null)
      continue
    const d = Math.hypot(p.x - x, p.y - y)
    if (d < bestDistance) {
      bestDistance = d
      best = { seriesId: s.id, index: j }
    }
  }
  return best
}

const EMPTY_OVERLAY: RadarOverlay = Object.freeze({ under: [], over: [] })

/** 前景层：激活的指标那根轴加粗成准线；键盘聚焦时在顶点外画一圈焦点环，隔一道表面间隙。 */
export function radarOverlay(model: RadarModel, active: RadarActive | null, focused: { ref: ChartDatumRef, ring: boolean } | null): RadarOverlay {
  const scene = model.scene
  if (!scene || (!active && !focused?.ring))
    return EMPTY_OVERLAY
  const { cx, cy, radius, angles, metrics, points } = scene.layout
  const under: Mark[] = []
  const over: Mark[] = []
  if (active) {
    const angle = angles[active.ref.index]
    if (angle != null) {
      under.push({
        kind: 'line',
        key: 'crosshair',
        part: 'crosshair',
        curve: 'linear',
        points: [{ key: 'center', x: cx, y: cy }, { key: 'end', x: cx + Math.sin(angle) * radius, y: cy - Math.cos(angle) * radius }],
      })
    }
  }
  if (focused?.ring && radarHasDatum(model, focused.ref)) {
    const p = points.get(focused.ref.seriesId)?.[focused.ref.index]
    if (p) {
      const r = metrics.pointSize / 2 + metrics.gap + 1
      over.push({ kind: 'symbol', key: 'focus-ring', part: 'focus-ring', x: p.x, y: p.y, size: Math.PI * r * r, symbol: 'circle' })
    }
  }
  return { under, over }
}

/** 提示框的内容：头部是指标名，每个可见系列一行，没有值的写缺失值。 */
export function radarTooltip(model: RadarModel, active: RadarActive | null, translations: RadarChartTranslations): RadarTooltipModel | null {
  if (!active)
    return null
  const indicator = model.spec.indicators[active.ref.index]
  if (!indicator)
    return null
  return {
    header: indicator.label,
    rows: model.derived.visible.map(s => ({
      seriesId: s.id,
      name: s.name,
      value: s.values[active.ref.index] == null ? translations.missingValue : model.formats.value(s.values[active.ref.index]!),
      slot: s.slot,
    })),
  }
}
