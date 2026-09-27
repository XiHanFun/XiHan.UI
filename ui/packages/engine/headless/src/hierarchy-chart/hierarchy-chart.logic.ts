/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 层级图的交互逻辑：取模型、节点与数据引用的换算、详情载荷、激活来源、树上的键盘导航、命中测试、焦点环、提示框与下钻路径。
// 只算值，不写属性：属性字典都在连接层。数据引用的 seriesId 是节点的身份，index 是扁平数据里的行（嵌套数据为 −1）。

import type { PropFn, Scope } from '@xihan-ui/core'
import type { ChartBaseContext, ChartDatumDetails, ChartDatumRef, ChartNavIntent } from '../shared/chart'
import type { HierarchyModel, HierarchyNodeGeometry, HierarchyTreeNode } from './hierarchy-chart.model'
import type { HierarchyChartSchema, HierarchyOverlay } from './hierarchy-chart.schema'
import type { HierarchyChartTranslations, HierarchyPathItem, HierarchySummary, HierarchyTooltipModel } from './hierarchy-chart.types'
import { resolveLocale } from '@xihan-ui/core'
import { CHART_TRANSLATIONS, chartActiveSource, resolveChartTranslations } from '../shared/chart'
import { hierarchyNodeKey } from './hierarchy-chart.model'

/** 节点的可及名：名字、数值，以及占上一层的比例。 */
export function defaultHierarchyDatumLabel(details: ChartDatumDetails): string {
  const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
  return details.formatted.parentShare ? `${head}, ${details.formatted.parentShare} of ${details.formatted.parent ?? ''}` : head
}

/** 缺省摘要：当前的根、合计、下面一层的项数与最大的一项。 */
export function defaultHierarchySummary(model: HierarchySummary): string {
  if (model.childCount === 0)
    return 'No data.'
  const head = `${model.root}: ${model.childCount} ${model.childCount === 1 ? 'item' : 'items'}, total ${model.total}.`
  return model.largest ? `${head} Largest: ${model.largest.name} ${model.largest.value} (${model.largest.share}).` : head
}

export const HIERARCHY_TRANSLATIONS: HierarchyChartTranslations = Object.freeze({
  ...CHART_TRANSLATIONS,
  datumLabel: defaultHierarchyDatumLabel,
  rootLabel: 'All',
  pathLabel: 'Path',
  nameLabel: 'Path',
  valueLabel: 'Value',
  parentShareLabel: 'Share of parent',
  rootShareLabel: 'Share of total',
  summary: defaultHierarchySummary,
})

const translationsCache = new WeakMap<object, HierarchyChartTranslations>()

/** 合并作者给的文案；同一个覆盖对象只合并一次，管线的无障碍段才不会因为文案对象每次新建而重算。 */
export function hierarchyTranslations(overrides: Partial<HierarchyChartTranslations> | undefined): HierarchyChartTranslations {
  if (!overrides)
    return HIERARCHY_TRANSLATIONS
  let hit = translationsCache.get(overrides)
  if (!hit) {
    hit = resolveChartTranslations(HIERARCHY_TRANSLATIONS, overrides)
    translationsCache.set(overrides, hit)
  }
  return hit
}

/** 取模型要读的那几处：机器的参数与连接层的服务都满足它。 */
export interface HierarchyModelSource {
  prop: PropFn<HierarchyChartSchema>
  context: { get: <K extends keyof HierarchyChartSchema['context']>(key: K) => HierarchyChartSchema['context'][K] }
  refs: { get: <K extends keyof HierarchyChartSchema['refs']>(key: K) => HierarchyChartSchema['refs'][K] }
  scope: Scope
}

/** 跑一遍管线：各段按输入引用记忆，悬停与聚焦只是读缓存。 */
export function hierarchyModelOf(source: HierarchyModelSource): HierarchyModel {
  const { prop, context, refs, scope } = source
  return refs.get('pipeline')({
    data: prop('data'),
    childrenField: prop('childrenField'),
    idField: prop('idField'),
    parentField: prop('parentField'),
    nameField: prop('nameField'),
    valueField: prop('valueField'),
    layout: prop('layout'),
    tile: prop('tile'),
    depth: prop('depth'),
    colorBy: prop('colorBy'),
    orientation: prop('orientation'),
    rootKey: context.get('rootKey') ?? null,
    format: prop('format'),
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurer: refs.get('measurer'),
    measurerVersion: context.get('measurerVersion'),
    locale: resolveLocale(prop('locale'), scope),
    translations: hierarchyTranslations(prop('translations')),
  })
}

/** 引用指着的看得见的节点的几何；不在当前视图里为 undefined。 */
export function hierarchyGeometry(model: HierarchyModel, ref: ChartDatumRef | null | undefined): HierarchyNodeGeometry | undefined {
  return ref ? model.scene?.layout.byKey.get(ref.seriesId) : undefined
}

/** 节点在看得见的节点里吗（不看几何：服务端与首帧没有布局也答得上）。 */
export function hierarchyVisible(model: HierarchyModel, ref: ChartDatumRef | null | undefined): boolean {
  if (!ref)
    return false
  const node = model.spec.byKey.get(ref.seriesId)
  return node != null && model.derived.visibleSet.has(node)
}

export function hierarchyRefOf(model: HierarchyModel, node: HierarchyTreeNode): ChartDatumRef {
  const meta = model.spec.meta.get(node)!
  return { seriesId: meta.key, index: meta.row }
}

/** 数据引用 → 标记键（焦点与 data-key）。 */
export function hierarchyMarkKey(model: HierarchyModel, ref: ChartDatumRef): string | null {
  return hierarchyVisible(model, ref) ? hierarchyNodeKey(ref.seriesId) : null
}

/** 第一层的第一个节点：Tab 首次进来落在它上面。 */
export function hierarchyFirstRef(model: HierarchyModel): ChartDatumRef | null {
  const first = model.derived.current?.children?.[0]
  return first && model.derived.visibleSet.has(first) ? hierarchyRefOf(model, first) : null
}

/** 悬停、聚焦或点击到某个节点时报告的内容：数值、占上一层与占当前的根的比例。 */
export function hierarchyDetails(model: HierarchyModel, ref: ChartDatumRef): ChartDatumDetails | null {
  const node = model.spec.byKey.get(ref.seriesId)
  if (!node || !model.derived.visibleSet.has(node))
    return null
  const meta = model.spec.meta.get(node)!
  const value = node.value ?? 0
  const parent = node.parent
  const current = model.derived.current
  const parentShare = parent && (parent.value ?? 0) > 0 ? value / parent.value! : null
  const rootShare = current && (current.value ?? 0) > 0 ? value / current.value! : null
  const formatted: Record<string, string> = { key: meta.name, value: model.formats.value(value) }
  if (parent)
    formatted.parent = model.spec.meta.get(parent)!.name
  if (parentShare != null)
    formatted.parentShare = model.formats.share(parentShare)
  if (rootShare != null)
    formatted.rootShare = model.formats.share(rootShare)
  const geometry = model.scene?.layout.byKey.get(meta.key)
  return {
    seriesId: meta.key,
    seriesName: meta.name,
    slot: meta.slot,
    tone: null,
    index: meta.row,
    key: meta.key,
    values: { value, parentShare, rootShare },
    formatted,
    datum: node.data,
    point: geometry?.anchor ?? { x: 0, y: 0 },
  }
}

export interface HierarchyActive {
  readonly ref: ChartDatumRef
  /** 联动过来的键不算本图的激活：不通知、不画焦点环。 */
  readonly source: 'pointer' | 'keyboard' | 'linked'
}

/** 激活的节点：指针优先，其次键盘，都没有时看受控的 activeKey（节点的身份）。 */
export function hierarchyActive(model: HierarchyModel, context: Pick<ChartBaseContext, 'hover' | 'focused' | 'focusWithin' | 'dismissed' | 'activeKey'>): HierarchyActive | null {
  const source = chartActiveSource(context)
  if (source === 'pointer' && context.hover && hierarchyVisible(model, context.hover.ref))
    return { ref: context.hover.ref, source }
  if (source === 'keyboard' && context.focused && hierarchyVisible(model, context.focused))
    return { ref: context.focused, source }
  if (source == null && !context.dismissed && context.activeKey != null) {
    const node = model.spec.byKey.get(String(context.activeKey))
    if (node && model.derived.visibleSet.has(node))
      return { ref: hierarchyRefOf(model, node), source: 'linked' }
  }
  return null
}

/** 同一个父节点下看得见的兄弟，按画面的阅读序：矩形树图与圆堆积自上而下、自左而右，旭日与冰柱按子节点次序（顺时针、自左而右）。 */
function siblingsOf(model: HierarchyModel, node: HierarchyTreeNode): HierarchyTreeNode[] {
  const parent = node.parent
  const kids = (parent?.children ?? [node]).filter(n => model.derived.visibleSet.has(n))
  const layout = model.options.layout
  if (layout !== 'treemap' && layout !== 'pack')
    return kids
  const byKey = model.scene?.layout.byKey
  const at = (n: HierarchyTreeNode): { x: number, y: number } => byKey?.get(model.spec.meta.get(n)!.key)?.anchor ?? { x: 0, y: 0 }
  // 同一行按 1/4 行高的容差归并，免得微小的高差把阅读序打乱
  const tolerance = (model.scene?.layout.font.lineHeight ?? 16) / 4
  return [...kids].sort((a, b) => {
    const pa = at(a)
    const pb = at(b)
    return Math.abs(pa.y - pb.y) > tolerance ? pa.y - pb.y : pa.x - pb.x
  })
}

/**
 * 树上的键盘导航：左右键在同一层的兄弟之间走，下键进入第一个子节点（看得见的层内），上键回到父节点；
 * Home / End 到同一层的第一个 / 最后一个。到头原地不动（返回 null）。
 */
export function hierarchyNavTarget(model: HierarchyModel, from: ChartDatumRef, intent: ChartNavIntent | 'child' | 'parent'): ChartDatumRef | null {
  const node = model.spec.byKey.get(from.seriesId)
  if (!node || !model.derived.visibleSet.has(node))
    return null
  if (intent === 'child') {
    const child = node.children?.find(n => model.derived.visibleSet.has(n))
    return child ? hierarchyRefOf(model, siblingsOf(model, child)[0]!) : null
  }
  if (intent === 'parent')
    return node.parent && model.derived.visibleSet.has(node.parent) ? hierarchyRefOf(model, node.parent) : null
  const siblings = siblingsOf(model, node)
  const at = siblings.indexOf(node)
  const target = intent === 'next'
    ? at + 1
    : intent === 'prev'
      ? at - 1
      : intent === 'first' || intent === 'page-prev'
        ? 0
        : intent === 'last' || intent === 'page-next' ? siblings.length - 1 : at
  if (target === at || target < 0 || target >= siblings.length)
    return null
  return hierarchyRefOf(model, siblings[target]!)
}

/** 指针命中：落在哪些节点里取最深的那个；旭日图落在空洞里不算。 */
export function hierarchyHitTest(model: HierarchyModel, x: number, y: number): ChartDatumRef | null {
  const layout = model.scene?.layout
  if (!layout)
    return null
  let best: HierarchyNodeGeometry | null = null
  for (const g of layout.nodes) {
    const s = g.shape
    let inside = false
    if (s.kind === 'rect') {
      inside = x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height
    }
    else if (s.kind === 'circle') {
      inside = Math.hypot(x - s.cx, y - s.cy) <= s.r
    }
    else {
      const r = Math.hypot(x - s.cx, y - s.cy)
      const angle = (Math.atan2(x - s.cx, -(y - s.cy)) + 2 * Math.PI) % (2 * Math.PI)
      inside = r >= s.innerRadius && r <= s.outerRadius && angle >= s.startAngle && angle <= s.endAngle
    }
    if (inside && (!best || g.level > best.level))
      best = g
  }
  return best ? hierarchyRefOf(model, best.node) : null
}

/** 指针在旭日图的空洞里吗：点它上钻一层。 */
export function hierarchyInHole(model: HierarchyModel, x: number, y: number): boolean {
  const hole = model.scene?.layout.hole
  return hole != null && Math.hypot(x - hole.cx, y - hole.cy) <= hole.r
}

const EMPTY_OVERLAY: HierarchyOverlay = Object.freeze({ over: [] })

/** 前景层：键盘聚焦时在节点外画一圈焦点环，隔一道表面间隙；形状随节点。 */
export function hierarchyOverlay(model: HierarchyModel, focused: { ref: ChartDatumRef, ring: boolean } | null): HierarchyOverlay {
  const layout = model.scene?.layout
  if (!layout || !focused?.ring)
    return EMPTY_OVERLAY
  const g = layout.byKey.get(focused.ref.seriesId)
  if (!g)
    return EMPTY_OVERLAY
  const inset = layout.metrics.gap + 1
  const radius = layout.metrics.radius
  const s = g.shape
  if (s.kind === 'rect') {
    return { over: [{ kind: 'rect', key: 'focus-ring', part: 'focus-ring', x: s.x - inset, y: s.y - inset, width: s.width + inset * 2, height: s.height + inset * 2, cornerRadius: radius + inset, baseline: 'none' }] }
  }
  if (s.kind === 'circle')
    return { over: [{ kind: 'arc', key: 'focus-ring', part: 'focus-ring', cx: s.cx, cy: s.cy, innerRadius: 0, outerRadius: s.r + inset, startAngle: 0, endAngle: 2 * Math.PI }] }
  const outer = s.outerRadius + inset
  const spread = inset / Math.max(1, outer)
  return {
    over: [{
      kind: 'arc',
      key: 'focus-ring',
      part: 'focus-ring',
      cx: s.cx,
      cy: s.cy,
      innerRadius: Math.max(0, s.innerRadius - inset),
      outerRadius: outer,
      startAngle: s.startAngle - spread,
      endAngle: s.endAngle + spread,
      cornerRadius: radius + inset,
    }],
  }
}

/** 提示框的内容：头部是从当前的根往下到这个节点的路径，下面是数值与两种占比。 */
export function hierarchyTooltip(model: HierarchyModel, active: HierarchyActive | null, translations: HierarchyChartTranslations): HierarchyTooltipModel | null {
  if (!active)
    return null
  const details = hierarchyDetails(model, active.ref)
  const node = model.spec.byKey.get(active.ref.seriesId)
  if (!details || !node)
    return null
  const current = model.derived.current
  const path = node.ancestors().reverse().filter(n => current == null || n.depth > current.depth).map(n => model.spec.meta.get(n)!.name)
  const rows: HierarchyTooltipModel['rows'][number][] = [{ key: 'value', name: translations.valueLabel, value: details.formatted.value ?? '' }]
  if (details.formatted.parentShare && node.parent !== current)
    rows.push({ key: 'parent', name: translations.parentShareLabel, value: details.formatted.parentShare })
  if (details.formatted.rootShare)
    rows.push({ key: 'root', name: translations.rootShareLabel, value: details.formatted.rootShare })
  return { header: path.join(' / '), rows }
}

/** 下钻路径：从最顶层到当前的根。 */
export function hierarchyPath(model: HierarchyModel): HierarchyPathItem[] {
  const current = model.derived.current
  if (!current)
    return []
  return current.ancestors().reverse().map((node) => {
    const meta = model.spec.meta.get(node)!
    return { key: node.parent ? meta.key : null, name: meta.name, current: node === current }
  })
}
