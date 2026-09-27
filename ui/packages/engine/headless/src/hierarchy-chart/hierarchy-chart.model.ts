/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 层级图的管线：规格归一（组树、身份、聚合、分支色槽）→ 派生（当前的根、看得见的层）→ 布局（矩形树图 / 旭日 / 冰柱 / 圆堆积，
// 标签先量再放）→ 场景 → 无障碍。每段只记住上一次的输入，悬停与聚焦不换任何一段的输入。

import type { ArcMark, FontSpec, Mark, NumberFormatSpec, RectMark, Scene, TableModel, TextMark, TextMeasurer } from '@xihan-ui/viz'
import type { HierarchyNode } from '@xihan-ui/viz/hierarchy'
import type { ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type { HierarchyChartTranslations, HierarchyColorBy, HierarchyLayout, HierarchySummary, HierarchyTile } from './hierarchy-chart.types'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'
import { createNumberFormat, createScene, ellipsize, isVizError } from '@xihan-ui/viz'
import { hierarchy, pack, partition, stratify, treemap } from '@xihan-ui/viz/hierarchy'
import { CHART_SLOT_COUNT, memoizeLast } from '../shared/chart'

/** 旭日图中间留的空洞占半径的比例：点它上钻一层。 */
const SUNBURST_HOLE = 0.22

/** 标签离节点边缘的内距（px）。 */
const LABEL_PAD = 4

/* ---------- 规格 ---------- */

/** 一个节点的身份：身份字段的值，或从最顶层往下的名字路径。 */
export interface HierarchyMeta {
  readonly key: string
  readonly name: string
  /** 扁平数据里的行；嵌套数据为 −1。 */
  readonly row: number
  /** 第一层分支的色槽 1–8；最顶层为 null。 */
  readonly slot: number | null
}

export type HierarchyTreeNode = HierarchyNode<ChartRow>

export interface HierarchySpec {
  readonly root: HierarchyTreeNode | null
  readonly meta: ReadonlyMap<HierarchyTreeNode, HierarchyMeta>
  readonly byKey: ReadonlyMap<string, HierarchyTreeNode>
  readonly issues: readonly ChartSpecIssue[]
}

const EMPTY_SPEC: HierarchySpec = Object.freeze({ root: null, meta: new Map(), byKey: new Map(), issues: [] })

function toNumber(value: unknown): number | null {
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** 规格归一：组树（嵌套或按父 id）、定身份、从叶子聚合数值并按值从大到小排兄弟、给第一层分支分色槽。 */
export function normalizeHierarchySpec(
  data: ChartRow | readonly ChartRow[] | undefined,
  childrenField: string,
  idField: string | undefined,
  parentField: string | undefined,
  nameField: string,
  valueField: string,
  colorBy: HierarchyColorBy,
  rootLabel: string,
): HierarchySpec {
  if (data == null || (Array.isArray(data) && data.length === 0))
    return EMPTY_SPEC
  const issues: ChartSpecIssue[] = []
  let root: HierarchyTreeNode
  try {
    if (Array.isArray(data)) {
      if (!idField || !parentField)
        return { ...EMPTY_SPEC, issues: [{ code: DIAGNOSTIC_CODES.chartHierarchyShape, message: '扁平的行要写 idField 与 parentField 才组得成树', detail: { idField, parentField } }] }
      root = stratify(data as readonly ChartRow[], {
        id: row => (row[idField] == null ? null : String(row[idField])),
        parentId: row => (row[parentField] == null || row[parentField] === '' ? null : String(row[parentField])),
      })
    }
    else {
      root = hierarchy(data as ChartRow, (row) => {
        const kids = row[childrenField]
        return Array.isArray(kids) ? (kids as ChartRow[]) : null
      })
    }
  }
  catch (error) {
    if (isVizError(error))
      return { ...EMPTY_SPEC, issues: [{ code: DIAGNOSTIC_CODES.chartHierarchyShape, message: error.message, detail: { ...error.detail } }] }
    throw error
  }

  // 聚合：叶子取自己的值，上层是子孙之和（上层行里写的值不计，免得算两遍）；负值报错
  let negative: { name: string, value: number } | null = null
  root.eachAfter((node) => {
    if (node.children) {
      node.value = node.children.reduce((sum, child) => sum + (child.value ?? 0), 0)
      return
    }
    const value = toNumber(node.data[valueField]) ?? 0
    if (value < 0 && !negative)
      negative = { name: String(node.data[nameField] ?? ''), value }
    node.value = Math.max(0, value)
  })
  if (negative)
    return { ...EMPTY_SPEC, issues: [{ code: DIAGNOSTIC_CODES.chartNegativeShare, message: '层级图的值不能为负', detail: negative }] }
  // 色槽跟着分支走、不跟着名次走：按数据次序分，排序之前先记下来
  const branches = [...(root.children ?? [])]
  // 兄弟按值从大到小：大的块铺在前面、角度从 12 点起，同值保持数据次序
  const order = new Map<HierarchyTreeNode, number>()
  root.each((node, i) => order.set(node, i))
  root.sort((a, b) => (b.value ?? 0) - (a.value ?? 0) || order.get(a)! - order.get(b)!)

  const rowIndex = Array.isArray(data) ? new Map((data as readonly ChartRow[]).map((row, i) => [row, i])) : null
  const meta = new Map<HierarchyTreeNode, HierarchyMeta>()
  const byKey = new Map<string, HierarchyTreeNode>()
  if (colorBy === 'branch' && branches.length > CHART_SLOT_COUNT)
    issues.push({ code: DIAGNOSTIC_CODES.chartTooManySeries, message: `第一层分支有 ${branches.length} 个，分类色只有 ${CHART_SLOT_COUNT} 个：改用 colorBy="value"（顺序色阶）或 "uniform"（统一色槽，靠标签区分）`, detail: { count: branches.length } })
  root.eachBefore((node) => {
    const parent = node.parent
    const name = node === root && node.data[nameField] == null ? rootLabel : String(node.data[nameField] ?? '')
    let key: string
    if (idField && node.data[idField] != null) {
      key = String(node.data[idField])
    }
    else if (!parent) {
      key = ''
    }
    else {
      // 名字路径；同一个父节点下重名的兄弟加上次序
      const base = parent === root ? name : `${meta.get(parent)!.key}/${name}`
      key = byKey.has(base) ? `${base}#${parent.children!.indexOf(node)}` : base
    }
    const slot = !parent ? null : parent === root ? (branches.indexOf(node) % CHART_SLOT_COUNT) + 1 : meta.get(parent)!.slot
    meta.set(node, { key, name, row: rowIndex?.get(node.data) ?? -1, slot })
    byKey.set(key, node)
  })
  return { root, meta, byKey, issues }
}

/* ---------- 派生 ---------- */

export interface HierarchyDerived {
  readonly spec: HierarchySpec
  /** 当前的根：rootKey 指着的节点；指着叶子时取它的父节点，找不到时取最顶层。 */
  readonly current: HierarchyTreeNode | null
  /** 看得见的节点：当前的根下面 1–depth 层，先根次序。 */
  readonly visible: readonly HierarchyTreeNode[]
  /** 同一批节点：连接层逐个标记问「看不看得见」，查集合不查数组。 */
  readonly visibleSet: ReadonlySet<HierarchyTreeNode>
  readonly depth: number
}

export function deriveHierarchy(spec: HierarchySpec, rootKey: string | null, depth: number): HierarchyDerived {
  const root = spec.root
  if (!root)
    return { spec, current: null, visible: [], visibleSet: new Set(), depth }
  let current = rootKey == null ? root : spec.byKey.get(rootKey) ?? root
  if (!current.children && current.parent)
    current = current.parent
  const visible: HierarchyTreeNode[] = []
  const limit = current.depth + depth
  current.eachBefore((node) => {
    if (node !== current && node.depth <= limit)
      visible.push(node)
  })
  return { spec, current, visible, visibleSet: new Set(visible), depth }
}

/* ---------- 格式 ---------- */

export interface HierarchyFormats {
  readonly value: (value: number) => string
  readonly share: (share: number) => string
}

export function hierarchyFormats(locale: string, format: NumberFormatSpec | ((value: number) => string) | undefined): HierarchyFormats {
  return {
    value: typeof format === 'function' ? format : createNumberFormat(locale, format ?? {}),
    share: createNumberFormat(locale, { style: 'percent', precision: { type: 'fixed', digits: 1 } }),
  }
}

/* ---------- 布局 ---------- */

export interface HierarchyLayoutOptions {
  readonly layout: HierarchyLayout
  readonly tile: HierarchyTile
  readonly orientation: 'vertical' | 'horizontal'
}

export type HierarchyShape
  = | { readonly kind: 'rect', readonly x: number, readonly y: number, readonly width: number, readonly height: number }
    | { readonly kind: 'arc', readonly cx: number, readonly cy: number, readonly innerRadius: number, readonly outerRadius: number, readonly startAngle: number, readonly endAngle: number, readonly padAngle: number }
    | { readonly kind: 'circle', readonly cx: number, readonly cy: number, readonly r: number }

export interface HierarchyLabelLayout {
  readonly text: string
  readonly x: number
  readonly y: number
  readonly anchor: 'start' | 'middle'
  readonly baseline: 'top' | 'middle'
  /** 写在分组顶部的标题，还是写在节点里的名字。 */
  readonly part: 'group-header' | 'node-label'
}

export interface HierarchyNodeGeometry {
  readonly node: HierarchyTreeNode
  readonly key: string
  /** 相对当前的根的层：1 起。 */
  readonly level: number
  /** 子节点也看得见：画成容器，名字写在顶部。 */
  readonly group: boolean
  readonly shape: HierarchyShape
  /** 提示框与焦点的锚点。 */
  readonly anchor: { readonly x: number, readonly y: number }
  readonly label: HierarchyLabelLayout | null
}

export interface HierarchyLayoutResult {
  readonly derived: HierarchyDerived
  readonly options: HierarchyLayoutOptions
  readonly size: ChartSize
  readonly nodes: readonly HierarchyNodeGeometry[]
  readonly byKey: ReadonlyMap<string, HierarchyNodeGeometry>
  /** 旭日图的圆心与空洞半径：点空洞上钻。 */
  readonly hole: { readonly cx: number, readonly cy: number, readonly r: number } | null
  readonly metrics: ChartMetrics
  readonly font: FontSpec
}

export function layoutHierarchy(
  derived: HierarchyDerived,
  options: HierarchyLayoutOptions,
  size: ChartSize,
  metrics: ChartMetrics,
  measurer: TextMeasurer,
  _measurerVersion: number,
): HierarchyLayoutResult {
  const { width, height } = size
  const font = metrics.font
  const current = derived.current
  const meta = derived.spec.meta
  const empty: HierarchyLayoutResult = { derived, options, size, nodes: [], byKey: new Map(), hole: null, metrics, font }
  if (!current || derived.visible.length === 0 || (current.value ?? 0) <= 0)
    return empty
  const limit = derived.depth
  const levelOf = (node: HierarchyTreeNode): number => node.depth - current.depth
  const isGroup = (node: HierarchyTreeNode): boolean => node.children != null && levelOf(node) < limit
  const gap = metrics.gap
  const headerHeight = font.lineHeight + LABEL_PAD
  const fits = (text: string, room: number): boolean => measurer.measure(text, font).width + LABEL_PAD * 2 <= room
  const out: HierarchyNodeGeometry[] = []

  if (options.layout === 'treemap') {
    treemap(current, {
      size: [width, height],
      tile: options.tile,
      paddingInner: gap,
      paddingOuter: node => (node !== current && isGroup(node) ? gap : 0),
      paddingTop: node => (node !== current && isGroup(node) ? headerHeight : 0),
    })
    for (const node of derived.visible) {
      const w = node.x1 - node.x0
      const h = node.y1 - node.y0
      const group = isGroup(node)
      const name = meta.get(node)!.name
      let label: HierarchyLabelLayout | null = null
      if (group && h >= headerHeight && w > LABEL_PAD * 2)
        label = { text: ellipsize(name, w - LABEL_PAD * 2, font, measurer), x: node.x0 + LABEL_PAD, y: node.y0 + headerHeight / 2, anchor: 'start', baseline: 'middle', part: 'group-header' }
      else if (!group && fits(name, w) && h >= font.lineHeight + LABEL_PAD * 2)
        label = { text: name, x: node.x0 + LABEL_PAD, y: node.y0 + LABEL_PAD, anchor: 'start', baseline: 'top', part: 'node-label' }
      out.push({ node, key: meta.get(node)!.key, level: levelOf(node), group, shape: { kind: 'rect', x: node.x0, y: node.y0, width: w, height: h }, anchor: { x: (node.x0 + node.x1) / 2, y: (node.y0 + node.y1) / 2 }, label })
    }
  }
  else if (options.layout === 'pack') {
    pack(current, { size: [width, height], padding: gap * 2 })
    for (const node of derived.visible) {
      const group = isGroup(node)
      const name = meta.get(node)!.name
      const label: HierarchyLabelLayout | null = !group && fits(name, node.r * 2) && node.r * 2 >= font.lineHeight + LABEL_PAD
        ? { text: name, x: node.x, y: node.y, anchor: 'middle', baseline: 'middle', part: 'node-label' }
        : null
      out.push({ node, key: meta.get(node)!.key, level: levelOf(node), group, shape: { kind: 'circle', cx: node.x, cy: node.y, r: node.r }, anchor: { x: node.x, y: node.y }, label })
    }
  }
  else {
    // 冰柱与旭日共用一份分区：横向的比例（x0 / x1）来自分区，每层一条带
    partition(current, { size: [1, current.height + 1] })
    if (options.layout === 'icicle') {
      const horizontal = options.orientation === 'horizontal'
      const band = (horizontal ? width : height) / limit
      const span = horizontal ? height : width
      for (const node of derived.visible) {
        const level = levelOf(node)
        const a0 = node.x0 * span
        const a1 = Math.max(a0, node.x1 * span - gap)
        const b0 = (level - 1) * band
        const b1 = b0 + Math.max(0, band - gap)
        const rect = horizontal ? { x: b0, y: a0, width: b1 - b0, height: a1 - a0 } : { x: a0, y: b0, width: a1 - a0, height: b1 - b0 }
        const name = meta.get(node)!.name
        const label: HierarchyLabelLayout | null = fits(name, rect.width) && rect.height >= font.lineHeight + LABEL_PAD * 2
          ? { text: name, x: rect.x + LABEL_PAD, y: rect.y + LABEL_PAD, anchor: 'start', baseline: 'top', part: 'node-label' }
          : null
        out.push({ node, key: meta.get(node)!.key, level, group: isGroup(node), shape: { kind: 'rect', ...rect }, anchor: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, label })
      }
    }
    else {
      const cx = width / 2
      const cy = height / 2
      const outer = Math.max(0, Math.min(width, height) / 2 - gap)
      const hole = outer * SUNBURST_HOLE
      const ring = (outer - hole) / limit
      for (const node of derived.visible) {
        const level = levelOf(node)
        const inner = hole + (level - 1) * ring
        const startAngle = node.x0 * 2 * Math.PI
        const endAngle = node.x1 * 2 * Math.PI
        const mid = (startAngle + endAngle) / 2
        const r = inner + ring / 2
        const name = meta.get(node)!.name
        // 名字横着写：文字框在这一点沿弧与沿半径各占多少，两头都要放得下
        const width = measurer.measure(name, font).width + LABEL_PAD * 2
        const along = Math.abs(Math.cos(mid))
        const across = Math.abs(Math.sin(mid))
        const arcLength = (endAngle - startAngle) * r
        const label: HierarchyLabelLayout | null = width * along + font.lineHeight * across <= arcLength
          && width * across + font.lineHeight * along <= ring - gap
          ? { text: name, x: cx + Math.sin(mid) * r, y: cy - Math.cos(mid) * r, anchor: 'middle', baseline: 'middle', part: 'node-label' }
          : null
        out.push({
          node,
          key: meta.get(node)!.key,
          level,
          group: isGroup(node),
          shape: { kind: 'arc', cx, cy, innerRadius: inner, outerRadius: inner + Math.max(0, ring - gap), startAngle, endAngle, padAngle: r > 0 ? gap / r : 0 },
          anchor: { x: cx + Math.sin(mid) * r, y: cy - Math.cos(mid) * r },
          label,
        })
      }
      return { derived, options, size, nodes: out, byKey: new Map(out.map(g => [g.key, g])), hole: { cx, cy, r: hole }, metrics, font }
    }
  }
  return { derived, options, size, nodes: out, byKey: new Map(out.map(g => [g.key, g])), hole: null, metrics, font }
}

/* ---------- 场景 ---------- */

export interface HierarchyScene {
  readonly layout: HierarchyLayoutResult
  readonly scene: Scene
}

/** 节点的标记键：焦点、按键复用节点都靠它。 */
export function hierarchyNodeKey(key: string): string {
  return `node:${key}`
}

export function hierarchyScene(layout: HierarchyLayoutResult, version: number): HierarchyScene {
  const data: Mark[] = []
  const front: Mark[] = []
  const radius = layout.metrics.radius
  // 浅的层先画：容器垫在它的子节点下面
  const ordered = [...layout.nodes].sort((a, b) => a.level - b.level)
  for (const g of ordered) {
    const meta = layout.derived.spec.meta.get(g.node)!
    const base = { key: hierarchyNodeKey(g.key), part: 'node', datum: { seriesId: g.key, index: meta.row }, paint: meta.slot == null ? {} : { slot: meta.slot }, a11y: { label: '', focusable: true } }
    if (g.shape.kind === 'rect') {
      // 块不贴基线：四角都圆
      const mark: RectMark = { kind: 'rect', ...base, x: g.shape.x, y: g.shape.y, width: g.shape.width, height: g.shape.height, cornerRadius: Math.min(radius, g.shape.width / 2, g.shape.height / 2), baseline: 'none' }
      data.push(mark)
    }
    else if (g.shape.kind === 'arc') {
      const mark: ArcMark = { kind: 'arc', ...base, cx: g.shape.cx, cy: g.shape.cy, innerRadius: g.shape.innerRadius, outerRadius: g.shape.outerRadius, startAngle: g.shape.startAngle, endAngle: g.shape.endAngle, padAngle: g.shape.padAngle, cornerRadius: radius }
      data.push(mark)
    }
    else {
      // 圆画成一整圈的弧：过渡里按圆心与半径插值
      const mark: ArcMark = { kind: 'arc', ...base, cx: g.shape.cx, cy: g.shape.cy, innerRadius: 0, outerRadius: g.shape.r, startAngle: 0, endAngle: 2 * Math.PI }
      data.push(mark)
    }
    if (g.label) {
      const text: TextMark = { kind: 'text', key: `label:${g.key}`, part: g.label.part, x: g.label.x, y: g.label.y, text: g.label.text, anchor: g.label.anchor, baseline: g.label.baseline }
      front.push(text)
    }
  }
  const scene = createScene({ version, layers: { data, front }, bounds: { x: 0, y: 0, width: layout.size.width, height: layout.size.height } })
  return { layout, scene }
}

/**
 * 首次出现从哪一帧起跑：矩形只淡入（嵌套的矩形各自长出会互相穿插）；旭日的扇区顺着扫开，与饼图同一手势；
 * 圆堆积的圆从圆心长出。标签淡入。
 */
export function hierarchyEntryScene(target: Scene): Scene {
  const data = target.layers.data.map((mark): Mark => {
    if (mark.kind === 'rect')
      return { ...mark, opacity: 0 }
    if (mark.kind === 'arc') {
      const circle = mark.innerRadius === 0 && mark.endAngle - mark.startAngle >= 2 * Math.PI - 1e-9
      return circle ? { ...mark, outerRadius: 0 } : { ...mark, endAngle: mark.startAngle }
    }
    return { ...mark, opacity: 0 }
  })
  return createScene({ version: 0, layers: { data }, bounds: target.bounds })
}

/* ---------- 无障碍 ---------- */

export function hierarchyA11y(
  derived: HierarchyDerived,
  formats: HierarchyFormats,
  translations: HierarchyChartTranslations,
): { summary: string, table: TableModel } {
  const { spec, current } = derived
  const share = (node: HierarchyTreeNode, of: HierarchyTreeNode | null): number | null => {
    const total = of?.value ?? 0
    return total > 0 ? (node.value ?? 0) / total : null
  }
  const kids = current?.children ?? []
  const largest = kids[0]
  const model: HierarchySummary = {
    root: current ? spec.meta.get(current)!.name : translations.rootLabel,
    total: formats.value(current?.value ?? 0),
    childCount: kids.length,
    largest: largest ? { name: spec.meta.get(largest)!.name, value: formats.value(largest.value ?? 0), share: formats.share(share(largest, current) ?? 0) } : null,
  }
  // 数据表列出整棵树：路径让读屏分得清同名的节点
  const rows: TableModel['rows'][number][] = []
  spec.root?.eachBefore((node) => {
    if (node === spec.root)
      return
    const path = node.ancestors().reverse().slice(1).map(n => spec.meta.get(n)!.name).join(' / ')
    const s = share(node, node.parent)
    rows.push({
      key: spec.meta.get(node)!.key,
      cells: [
        { value: path, text: path },
        { value: node.value ?? 0, text: formats.value(node.value ?? 0) },
        { value: s, text: s == null ? translations.missingValue : formats.share(s) },
      ],
    })
  })
  const table: TableModel = {
    columns: [
      { id: 'name', label: translations.nameLabel },
      { id: 'value', label: translations.valueLabel },
      { id: 'share', label: translations.parentShareLabel },
    ],
    rows,
  }
  return { summary: translations.summary(model), table }
}

/* ---------- 管线 ---------- */

export interface HierarchyPipelineInput {
  readonly data: ChartRow | readonly ChartRow[] | undefined
  readonly childrenField: string | undefined
  readonly idField: string | undefined
  readonly parentField: string | undefined
  readonly nameField: string | undefined
  readonly valueField: string | undefined
  readonly layout: HierarchyLayout | undefined
  readonly tile: HierarchyTile | undefined
  readonly depth: number | undefined
  readonly colorBy: HierarchyColorBy | undefined
  readonly orientation: 'vertical' | 'horizontal' | undefined
  readonly rootKey: string | null
  readonly format: NumberFormatSpec | ((value: number) => string) | undefined
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  readonly translations: HierarchyChartTranslations
}

export interface HierarchyModel {
  readonly spec: HierarchySpec
  readonly derived: HierarchyDerived
  readonly formats: HierarchyFormats
  readonly options: HierarchyLayoutOptions
  readonly colorBy: HierarchyColorBy
  readonly issues: readonly ChartSpecIssue[]
  /** 尚未测量或规格不合法时为 null。 */
  readonly scene: HierarchyScene | null
  readonly summary: string
  readonly table: TableModel
}

export type HierarchyPipeline = (input: HierarchyPipelineInput) => HierarchyModel

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createHierarchyPipeline(): HierarchyPipeline {
  const normalize = memoizeLast(normalizeHierarchySpec)
  const derive = memoizeLast(deriveHierarchy)
  const formatsOf = memoizeLast(hierarchyFormats)
  const optionsOf = memoizeLast((layout: HierarchyLayout, tile: HierarchyTile, orientation: 'vertical' | 'horizontal'): HierarchyLayoutOptions => ({ layout, tile, orientation }))
  const layoutOf = memoizeLast(layoutHierarchy)
  let version = 0
  const sceneOf = memoizeLast((layout: HierarchyLayoutResult) => hierarchyScene(layout, ++version))
  const a11yOf = memoizeLast(hierarchyA11y)
  return (input) => {
    const colorBy = input.colorBy ?? 'branch'
    const spec = normalize(input.data, input.childrenField ?? 'children', input.idField, input.parentField, input.nameField ?? 'name', input.valueField ?? 'value', colorBy, input.translations.rootLabel)
    const depth = Math.max(1, Math.floor(Number.isFinite(input.depth) ? input.depth! : 2))
    const derived = derive(spec, input.rootKey, depth)
    const formats = formatsOf(input.locale, input.format)
    const a11y = a11yOf(derived, formats, input.translations)
    const options = optionsOf(input.layout ?? 'treemap', input.tile ?? 'squarify', input.orientation ?? 'vertical')
    const scene = input.size == null || spec.issues.length > 0
      ? null
      : sceneOf(layoutOf(derived, options, input.size, input.metrics, input.measurer, input.measurerVersion))
    return { spec, derived, formats, options, colorBy, issues: spec.issues, scene, summary: a11y.summary, table: a11y.table }
  }
}
