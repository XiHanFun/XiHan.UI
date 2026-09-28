/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 直角坐标图的管线入口：对象数组走逐行的那一条（规格 → 派生 → 定义域 → 布局 → 场景 → 无障碍），
// 列式数据走大数据的那一条（规格 → 列视图 → 布局 → SVG 两层与画布图层 → 摘要与数据表）。
// 两条都只记住上一次的输入，悬停、聚焦与提示框开合不换任何一段的输入，整条管线走缓存。

import type { TableModel, TextMeasurer } from '@xihan-ui/viz'
import type { ColumnSource } from '@xihan-ui/viz/columns'
import type { ChartMetrics, ChartRow, ChartSize, ChartSpecIssue } from '../shared/chart'
import type { CartesianColumns, CartesianColumnsLayout, CartesianColumnsScene, CartesianColumnsSpec, CartesianRaster } from './cartesian-chart.columns'
import type { CartesianDerived, CartesianDomains, CartesianFormats, CartesianLayout, CartesianScene, CartesianSpec } from './cartesian-chart.model'
import type {
  CartesianAnnotation,
  CartesianAxis,
  CartesianBrush,
  CartesianChartTranslations,
  CartesianOrientation,
  CartesianRenderer,
  CartesianSeries,
  CartesianWindow,
  CartesianZoom,
} from './cartesian-chart.types'
import { isColumnSource } from '@xihan-ui/viz/columns'
import { memoizeLast } from '../shared/chart'
import {
  columnsA11y,
  columnsRaster,
  columnsScene,
  columnsValueDomain,
  createColumnsDeriver,
  layoutColumns,
  normalizeColumnsSpec,
} from './cartesian-chart.columns'
import {
  cartesianA11y,
  cartesianAnnotationIssues,
  cartesianDomains,
  cartesianFormats,
  cartesianRowIssues,
  cartesianScene,
  deriveCartesian,
  layoutCartesian,
  normalizeCartesianSpec,
} from './cartesian-chart.model'

export interface CartesianPipelineInput {
  readonly data: readonly ChartRow[] | ColumnSource | undefined
  readonly series: readonly CartesianSeries[] | undefined
  readonly xAxis: CartesianAxis | undefined
  readonly yAxis: CartesianAxis | undefined
  readonly orientation: CartesianOrientation | undefined
  readonly hiddenSeries: readonly string[]
  readonly size: ChartSize | null
  readonly metrics: ChartMetrics
  readonly measurer: TextMeasurer
  readonly measurerVersion: number
  readonly locale: string
  readonly translations: CartesianChartTranslations
  readonly totals: boolean | undefined
  readonly annotations: readonly CartesianAnnotation[] | undefined
  readonly zoom: CartesianZoom
  readonly window: CartesianWindow
  /** 列式数据要核对的两处写法：列式数据总是画在画布上、不支持刷选。 */
  readonly renderer: CartesianRenderer | undefined
  readonly brush: CartesianBrush | undefined
}

/** 列式数据的那一条管线：列视图、布局与画布图层；交互与绘制按它在原始列上算。 */
export interface CartesianColumnsModel {
  readonly spec: CartesianColumnsSpec
  readonly data: CartesianColumns
  /** 尚未测量或规格不合法时为 null。 */
  readonly layout: CartesianColumnsLayout | null
  /** 画布要画的几何（降采样后的像素坐标）；尚未测量或规格不合法时为 null。 */
  readonly raster: CartesianRaster | null
  /** 数据表按自变量区间聚合过：总行数与区间数；逐行写出时为 null。 */
  readonly aggregated: { readonly rows: number, readonly ranges: number } | null
}

export interface CartesianModel {
  readonly spec: CartesianSpec
  readonly derived: CartesianDerived
  readonly domains: CartesianDomains
  readonly formats: CartesianFormats
  /** 规格不合法的原因；非空时不画标记。 */
  readonly issues: readonly ChartSpecIssue[]
  /** 画得出来但有一部分没画的原因（注释指错了目标）：开发期提醒，不挡住整张图。 */
  readonly warnings: readonly ChartSpecIssue[]
  /** 尚未测量时为 null。列式数据时只有坐标轴、注释与系列分组（样式探针），数据画在画布上。 */
  readonly scene: CartesianScene | null
  readonly summary: string
  readonly table: TableModel
  /** 合并后的文案：详情里 K 线的四个价按它写成文字。 */
  readonly translations: CartesianChartTranslations
  /** 列式数据的那一条管线；对象数组时为 null。 */
  readonly columns: CartesianColumnsModel | null
}

export type CartesianPipeline = (input: CartesianPipelineInput) => CartesianModel

/** 没有注释：同一个空数组，管线各段的记忆不因作者没写而失效。 */
const NO_ANNOTATIONS: readonly CartesianAnnotation[] = Object.freeze([])
const NO_ISSUES: readonly ChartSpecIssue[] = Object.freeze([])
const EMPTY_MAP: ReadonlyMap<never, never> = new Map<never, never>()

/**
 * 列式数据的场景套上逐行管线的外形：绘图区、比例尺、窗口与裁剪照读；逐键的像素中心、锚点与标签表是空的，
 * 交互在原始列上按需算（见 columns 模块）。
 */
function columnsFacade(target: CartesianColumnsScene, domains: CartesianDomains, annotations: readonly CartesianAnnotation[], averageLabel: string): CartesianScene {
  const l = target.layout
  const layout: CartesianLayout = {
    domains,
    size: l.size,
    plot: l.plot,
    keyScale: l.keyScale,
    valueScale: l.valueScale,
    keyAxis: l.keyAxis,
    valueAxis: l.valueAxis,
    keyCenters: [],
    binSpans: EMPTY_MAP,
    bandwidth: 0,
    font: l.font,
    metrics: l.metrics,
    measurer: l.measurer,
    formats: l.formats,
    totals: false,
    annotations,
    averageLabel,
    window: l.window,
    clipped: l.clipped,
    keyExtent: l.keyExtent,
    keyRange: l.keyRange,
    valueExtent: l.valueExtent,
  }
  return { layout, scene: target.scene, info: EMPTY_MAP, anchors: EMPTY_MAP, placements: EMPTY_MAP, labelValues: EMPTY_MAP, annotations: target.annotations, clip: target.clip }
}

/** 建一条管线：每个图表实例一条，放在机器的 refs 里。 */
export function createCartesianPipeline(): CartesianPipeline {
  const normalize = memoizeLast(normalizeCartesianSpec)
  const derive = memoizeLast(deriveCartesian)
  const domainsOf = memoizeLast(cartesianDomains)
  const layoutOf = memoizeLast(layoutCartesian)
  let version = 0
  const sceneOf = memoizeLast((layout: CartesianLayout) => cartesianScene(layout, ++version))
  const a11yOf = memoizeLast(cartesianA11y)
  const warningsOf = memoizeLast(cartesianAnnotationIssues)
  const rowIssuesOf = memoizeLast(cartesianRowIssues)
  // 隐藏系列按内容记忆：受控时作者可能每次给一个新数组，内容没变不该重算
  const hiddenOf = memoizeLast((key: string): readonly string[] => JSON.parse(key) as string[])

  // —— 列式数据 ——
  const normalizeColumns = memoizeLast((
    source: ColumnSource,
    series: readonly CartesianSeries[] | undefined,
    xAxis: CartesianAxis | undefined,
    yAxis: CartesianAxis | undefined,
    orientation: CartesianOrientation | undefined,
    renderer: CartesianRenderer | undefined,
    brush: CartesianBrush | undefined,
    totals: boolean | undefined,
    annotations: readonly CartesianAnnotation[],
  ) => normalizeColumnsSpec(source, series, xAxis, yAxis, orientation, { renderer, brush, totals, annotations }))
  const deriveColumns = createColumnsDeriver()
  // 数据仓原地追加：同一个对象，版本号变了才重取列视图
  const columnsOf = memoizeLast((spec: CartesianColumnsSpec, dataVersion: number, hidden: readonly string[]) => deriveColumns(spec, dataVersion, hidden))
  const formatsOf = memoizeLast(cartesianFormats)
  // 定义域是否合法按全部数据核：窗口里露出哪一段不影响报不报
  const domainIssuesOf = memoizeLast((columns: CartesianColumns, annotations: readonly CartesianAnnotation[]) => columnsValueDomain(columns, annotations, 0, columns.length).issues)
  const columnsLayoutOf = memoizeLast((
    columns: CartesianColumns,
    size: ChartSize,
    metrics: ChartMetrics,
    measurer: TextMeasurer,
    measurerVersion: number,
    locale: string,
    zoom: CartesianZoom,
    window: CartesianWindow,
    annotations: readonly CartesianAnnotation[],
  ) => layoutColumns(columns, { size, metrics, measurer, measurerVersion, locale, zoom, window, annotations }))
  const columnsSceneOf = memoizeLast((columns: CartesianColumns, layout: CartesianColumnsLayout, annotations: readonly CartesianAnnotation[]) => columnsScene(columns, layout, annotations, ++version))
  const facadeOf = memoizeLast(columnsFacade)
  const rasterOf = memoizeLast(columnsRaster)
  const columnsA11yOf = memoizeLast(columnsA11y)

  const columnar = (input: CartesianPipelineInput, source: ColumnSource): CartesianModel => {
    const annotations = input.annotations ?? NO_ANNOTATIONS
    const hidden = hiddenOf(JSON.stringify([...input.hiddenSeries].sort()))
    const cspec = normalizeColumns(source, input.series, input.xAxis, input.yAxis, input.orientation, input.renderer, input.brush, input.totals, annotations)
    const data = columnsOf(cspec, source.version, hidden)
    // 逐行管线的外形：规格、派生与定义域都是没有行的那一份，只供读系列的身份与坐标轴配置
    const derived = derive(cspec.base, hidden)
    const domains = domainsOf(derived, NO_ANNOTATIONS)
    const formats = formatsOf(cspec.base, input.locale)
    const issues = cspec.issues.length > 0 || data.issues.length > 0
      ? [...cspec.issues, ...data.issues]
      : domainIssuesOf(data, annotations)
    const a11y = columnsA11yOf(data, formats, input.translations)
    const layout = input.size == null || issues.length > 0
      ? null
      : columnsLayoutOf(data, input.size, input.metrics, input.measurer, input.measurerVersion, input.locale, input.zoom, input.window, annotations)
    const target = layout ? columnsSceneOf(data, layout, annotations) : null
    return {
      spec: cspec.base,
      derived,
      domains,
      formats,
      issues: issues.length > 0 ? issues : NO_ISSUES,
      warnings: NO_ISSUES,
      scene: target ? facadeOf(target, domains, annotations, input.translations.averageLabel) : null,
      summary: a11y.summary,
      table: a11y.table,
      translations: input.translations,
      columns: { spec: cspec, data, layout, raster: layout ? rasterOf(data, layout) : null, aggregated: a11y.aggregated },
    }
  }

  return (input) => {
    if (isColumnSource(input.data))
      return columnar(input, input.data)
    const spec = normalize(input.data, input.series, input.xAxis, input.yAxis, input.orientation)
    const derived = derive(spec, hiddenOf(JSON.stringify([...input.hiddenSeries].sort())))
    const annotations = input.annotations ?? NO_ANNOTATIONS
    const domains = domainsOf(derived, annotations)
    const a11y = a11yOf(derived, input.locale, input.translations, annotations)
    const issues = [...spec.issues, ...rowIssuesOf(input.xAxis), ...derived.issues, ...domains.issues]
    const scene = input.size == null || issues.length > 0
      ? null
      : sceneOf(layoutOf(domains, input.size, input.metrics, input.measurer, input.measurerVersion, input.locale, input.totals === true, annotations, input.translations.averageLabel, input.zoom, input.window))
    return { spec, derived, domains, formats: a11y.formats, issues, warnings: warningsOf(spec, annotations), scene, summary: a11y.summary, table: a11y.table, translations: input.translations, columns: null }
  }
}
