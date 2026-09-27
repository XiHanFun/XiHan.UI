/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 漏斗图的交互逻辑：取模型、阶段与数据引用的换算、详情载荷、激活来源、键盘导航、命中测试、焦点环与提示框内容。
// 只算值，不写属性：属性字典都在连接层。数据引用的 seriesId 是阶段名，index 是它在数据里的行。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { ChartBaseContext, ChartDatumDetails, ChartDatumRef, ChartNavIntent } from '../shared/chart'
import type { FunnelModel, FunnelStage } from './funnel-chart.model'
import type { FunnelChartSchema, FunnelOverlay } from './funnel-chart.schema'
import type { FunnelChartTranslations, FunnelSummary, FunnelTooltipModel } from './funnel-chart.types'
import { resolveLocale } from '@xihan-ui/core'
import { CHART_TRANSLATIONS, chartActiveSource, chartPageSize, resolveChartTranslations } from '../shared/chart'
import { funnelStageKey } from './funnel-chart.model'

/** 阶段的可及名：名字、数值，以及相对上一阶段的转化率（第一阶段没有）。 */
export function defaultFunnelDatumLabel(details: ChartDatumDetails): string {
  const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
  return details.formatted.previous ? `${head}, ${details.formatted.previous} of previous` : head
}

/** 缺省摘要：阶段数、首尾两个阶段、总转化率与流失最多的一步。 */
export function defaultFunnelSummary(model: FunnelSummary): string {
  if (model.stageCount === 0 || !model.first)
    return 'No data.'
  if (model.stageCount === 1)
    return `1 stage: ${model.first.name} ${model.first.value}.`
  const parts = [`${model.stageCount} stages from ${model.first.name} (${model.first.value}) to ${model.last!.name} (${model.last!.value}).`]
  if (model.overall)
    parts.push(`Overall conversion ${model.overall}.`)
  if (model.steepest)
    parts.push(`Largest drop: ${model.steepest.from} to ${model.steepest.to}, ${model.steepest.rate} kept.`)
  return parts.join(' ')
}

export const FUNNEL_TRANSLATIONS: FunnelChartTranslations = Object.freeze({
  ...CHART_TRANSLATIONS,
  datumLabel: defaultFunnelDatumLabel,
  nameLabel: 'Stage',
  valueLabel: 'Value',
  previousLabel: 'From previous',
  firstLabel: 'From first',
  summary: defaultFunnelSummary,
})

const translationsCache = new WeakMap<object, FunnelChartTranslations>()

/** 合并作者给的文案；同一个覆盖对象只合并一次，管线的无障碍段才不会因为文案对象每次新建而重算。 */
export function funnelTranslations(overrides: Partial<FunnelChartTranslations> | undefined): FunnelChartTranslations {
  if (!overrides)
    return FUNNEL_TRANSLATIONS
  let hit = translationsCache.get(overrides)
  if (!hit) {
    hit = resolveChartTranslations(FUNNEL_TRANSLATIONS, overrides)
    translationsCache.set(overrides, hit)
  }
  return hit
}

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface FunnelModelSource {
  prop: PropFn<FunnelChartSchema>
  context: { get: <K extends keyof ChartBaseContext>(key: K) => ChartBaseContext[K] }
  refs: { get: <K extends keyof FunnelChartSchema['refs']>(key: K) => FunnelChartSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，悬停与聚焦只是读缓存。 */
export function funnelModelOf(source: FunnelModelSource): FunnelModel {
  const { prop, context, refs, scope } = source
  return refs.get('pipeline')({
    data: prop('data'),
    nameField: prop('nameField'),
    valueField: prop('valueField'),
    shape: prop('shape'),
    align: prop('align'),
    direction: prop('direction'),
    conversion: prop('conversion'),
    labels: prop('labels'),
    format: prop('format'),
    hiddenSeries: context.get('hiddenSeries'),
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurer: refs.get('measurer'),
    measurerVersion: context.get('measurerVersion'),
    locale: resolveLocale(prop('locale'), scope),
    translations: funnelTranslations(prop('translations')),
  })
}

/** 引用在可见阶段里的次序；隐藏或已不在数据里的阶段返回 −1。 */
export function funnelStageIndex(model: FunnelModel, ref: ChartDatumRef | null | undefined): number {
  if (!ref)
    return -1
  return model.derived.visible.findIndex(s => s.spec.id === ref.seriesId)
}

function refOf(stage: FunnelStage): ChartDatumRef {
  return { seriesId: stage.spec.id, index: stage.spec.row }
}

/** 数据引用 → 标记键（焦点与 data-key）。 */
export function funnelMarkKey(model: FunnelModel, ref: ChartDatumRef): string | null {
  return funnelStageIndex(model, ref) >= 0 ? funnelStageKey(ref.seriesId) : null
}

/** 第一个可见阶段：Tab 首次进来落在它上面。 */
export function funnelFirstRef(model: FunnelModel): ChartDatumRef | null {
  const first = model.derived.visible[0]
  return first ? refOf(first) : null
}

/** 悬停、聚焦或点击到某个阶段时报告的内容：数值与两种转化率。 */
export function funnelDetails(model: FunnelModel, ref: ChartDatumRef): ChartDatumDetails | null {
  const at = funnelStageIndex(model, ref)
  if (at < 0)
    return null
  const stage = model.derived.visible[at]!
  const anchor = model.scene?.geometry.get(stage.spec.id)?.anchor ?? { x: 0, y: 0 }
  const formatted: Record<string, string> = { key: stage.spec.name, value: model.formats.value(stage.spec.value) }
  if (stage.previous != null)
    formatted.previous = model.formats.rate(stage.previous)
  if (stage.first != null)
    formatted.first = model.formats.rate(stage.first)
  return {
    seriesId: stage.spec.id,
    seriesName: stage.spec.name,
    slot: null,
    tone: null,
    index: stage.spec.row,
    key: stage.spec.name,
    values: { value: stage.spec.value, previous: stage.previous, first: stage.first },
    formatted,
    datum: model.spec.data[stage.spec.row] ?? {},
    point: anchor,
  }
}

export interface FunnelActive {
  readonly ref: ChartDatumRef
  /** 联动过来的键不算本图的激活：不通知、不画焦点环。 */
  readonly source: 'pointer' | 'keyboard' | 'linked'
}

/** 激活的阶段：指针优先，其次键盘，都没有时看受控的 activeKey（另一张图联动过来的阶段名）。 */
export function funnelActive(model: FunnelModel, context: Pick<ChartBaseContext, 'hover' | 'focused' | 'focusWithin' | 'dismissed' | 'activeKey'>): FunnelActive | null {
  const source = chartActiveSource(context)
  if (source === 'pointer' && context.hover && funnelStageIndex(model, context.hover.ref) >= 0)
    return { ref: context.hover.ref, source }
  if (source === 'keyboard' && context.focused && funnelStageIndex(model, context.focused) >= 0)
    return { ref: context.focused, source }
  if (source == null && !context.dismissed && context.activeKey != null) {
    const stage = model.derived.visible.find(s => s.spec.name === String(context.activeKey))
    if (stage)
      return { ref: refOf(stage), source: 'linked' }
  }
  return null
}

/**
 * 键盘导航：沿阶段的先后走。右键总是下一阶段、左键上一阶段；上下键按画面：
 * 漏斗往下排时下键是下一阶段，金字塔往上排时上键是下一阶段。到头原地不动（返回 null）。
 */
export function funnelNavTarget(model: FunnelModel, from: ChartDatumRef, intent: ChartNavIntent): ChartDatumRef | null {
  const visible = model.derived.visible
  const at = funnelStageIndex(model, from)
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
  return refOf(visible[target]!)
}

/** 指针命中：落在哪个阶段的那一行里就是哪个阶段，窄的阶段两侧的空白也算，指着那一行就能读。 */
export function funnelHitTest(model: FunnelModel, _x: number, y: number): ChartDatumRef | null {
  const scene = model.scene
  if (!scene)
    return null
  const gap = scene.layout.metrics.gap
  for (const g of scene.layout.stages) {
    if (y >= g.y - gap / 2 && y <= g.y + g.height + gap / 2)
      return refOf(g.stage)
  }
  return null
}

const EMPTY_OVERLAY: FunnelOverlay = Object.freeze({ over: [] })

/** 前景层：键盘聚焦时在阶段外画一圈焦点环，隔一道表面间隙；形状随阶段。 */
export function funnelOverlay(model: FunnelModel, focused: { ref: ChartDatumRef, ring: boolean } | null): FunnelOverlay {
  const scene = model.scene
  if (!scene || !focused?.ring)
    return EMPTY_OVERLAY
  const g = scene.geometry.get(focused.ref.seriesId)
  if (!g)
    return EMPTY_OVERLAY
  const inset = scene.layout.metrics.gap + 1
  const [tl, tr, br, bl] = g.corners
  return {
    over: [{
      kind: 'line',
      key: 'focus-ring',
      part: 'focus-ring',
      curve: 'linearClosed',
      points: [
        { key: 'tl', x: tl.x - inset, y: tl.y - inset },
        { key: 'tr', x: tr.x + inset, y: tr.y - inset },
        { key: 'br', x: br.x + inset, y: br.y + inset },
        { key: 'bl', x: bl.x - inset, y: bl.y + inset },
      ],
    }],
  }
}

/** 提示框的内容：头部是阶段名，下面是数值与两种转化率（第一阶段只有数值）。 */
export function funnelTooltip(model: FunnelModel, active: FunnelActive | null, translations: FunnelChartTranslations): FunnelTooltipModel | null {
  if (!active)
    return null
  const at = funnelStageIndex(model, active.ref)
  if (at < 0)
    return null
  const stage = model.derived.visible[at]!
  const rows: FunnelTooltipModel['rows'][number][] = [{ key: 'value', name: translations.valueLabel, value: model.formats.value(stage.spec.value) }]
  if (stage.previous != null)
    rows.push({ key: 'previous', name: translations.previousLabel, value: model.formats.rate(stage.previous) })
  if (stage.first != null)
    rows.push({ key: 'first', name: translations.firstLabel, value: model.formats.rate(stage.first) })
  return { header: stage.spec.name, rows }
}
