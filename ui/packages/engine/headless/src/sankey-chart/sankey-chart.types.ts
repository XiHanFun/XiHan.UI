/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 sankey chart 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { Mark, NumberFormatSpec, Scene, TableModel } from '@xihan-ui/viz'
import type {
  ChartBaseAction,
  ChartBaseComputed,
  ChartBaseContext,
  ChartBaseEvent,
  ChartBaseRefs,
  ChartCommonProps,
  ChartDatumDetails,
  ChartKey,
  ChartTranslations,
} from '../shared/chart'
import type { SankeyOverlay } from './sankey-chart.logic'
import type { SankeyModel, SankeyPipeline } from './sankey-chart.model'

/** 一个节点：身份、显示的名字与分组；分组决定颜色与图例。 */
export interface SankeyNodeDatum {
  readonly id: string
  /** 显示的名字，缺省同 id。 */
  readonly name?: string
  /** 分组：同一组的节点同一个颜色，图例按组显隐。 */
  readonly group?: string
}

/** 一条流带：从源节点流到目标节点的量。 */
export interface SankeyLinkDatum {
  readonly source: string
  readonly target: string
  readonly value: number
}

/** 流向：horizontal 自左而右（缺省），vertical 自上而下。 */
export type SankeyOrientation = 'horizontal' | 'vertical'

/** 节点分到哪一列：justify 两端对齐（缺省），start 靠源头，end 靠汇点，center 居中。 */
export type SankeyNodeAlign = 'justify' | 'start' | 'end' | 'center'

/** 流带的颜色：neutral 中性色（缺省），source / target 取源 / 目标节点的颜色，gradient 从源节点渐变到目标节点。 */
export type SankeyLinkColor = 'neutral' | 'source' | 'target' | 'gradient'

/** 列内次序：auto 由布局按相连节点的位置排（缺省），input 保持数据次序。 */
export type SankeyNodeSort = 'auto' | 'input'

/** 图例里的一项：一个分组一项。 */
export interface SankeyLegendItem {
  readonly id: string
  readonly name: string
  /** 分类色槽 1–8。 */
  readonly slot: number
  readonly hidden: boolean
}

/** 提示框里的一行：节点的合计、一条流入或流出，或流带占两端的比例。 */
export interface SankeyTooltipRow {
  readonly key: string
  readonly name: string
  readonly value: string
  /** 这一行画哪个色槽的色标；不画时为 null。 */
  readonly slot: number | null
  /** value 合计，in 流入，out 流出，share 占比。 */
  readonly kind: 'value' | 'in' | 'out' | 'share'
}

/** 提示框的内容：节点写名字与流入流出的明细，流带写两端与流量。 */
export interface SankeyTooltipModel {
  readonly header: string
  readonly rows: readonly SankeyTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface SankeySummary {
  readonly nodeCount: number
  readonly linkCount: number
  /** 源头（没有流入的节点）的流出合计。 */
  readonly total: string
  /** 最大的一条流带；没有流带时为 null。 */
  readonly largest: { readonly source: string, readonly target: string, readonly value: string } | null
}

export interface SankeyChartTranslations extends ChartTranslations {
  /** 数据表与提示框里「源」的写法。 */
  sourceLabel: string
  /** 数据表与提示框里「目标」的写法。 */
  targetLabel: string
  /** 数据表与提示框里「流量」的写法。 */
  valueLabel: string
  /** 提示框里流入明细的前缀。 */
  inflowLabel: string
  /** 提示框里流出明细的前缀。 */
  outflowLabel: string
  summary: (model: SankeySummary) => string
}

export interface SankeyChartSchema extends MachineSchema {
  props: ChartCommonProps & {
    /** 节点：身份、名字与分组；缺省按流带里出现的先后推断，没有名字与分组。 */
    nodes?: readonly SankeyNodeDatum[]
    /** 流带：源、目标与流量。成环、自环、负值与不存在的节点都报错。 */
    links?: readonly SankeyLinkDatum[]
    /** 流向，缺省 horizontal。 */
    orientation?: SankeyOrientation
    /** 节点分列的方式，缺省 justify。 */
    nodeAlign?: SankeyNodeAlign
    /** 流带的颜色，缺省 neutral。 */
    linkColor?: SankeyLinkColor
    /** 列内次序，缺省 auto。 */
    nodeSort?: SankeyNodeSort
    /** 数值格式：提示框、可及名与数据表共用。 */
    format?: NumberFormatSpec | ((value: number) => string)
    translations?: Partial<SankeyChartTranslations>
  }
  context: ChartBaseContext
  computed: ChartBaseComputed
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: SankeyPipeline
  }
  state: 'idle'
  event: ChartBaseEvent
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues'
  effect: 'trackViewport'
}

/** 流带渐变：从源节点的颜色过渡到目标节点的颜色，画在绘图区的 defs 里。 */
export interface SankeyGradient {
  readonly id: string
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly from: number
  readonly to: number
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type SankeyMarkTag = 'g' | 'path' | 'text'

export interface SankeyChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：图、布局、场景与无障碍模型。 */
  model: SankeyModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /** 前景层：焦点环。 */
  overlay: SankeyOverlay
  /** 视口尚未测量（服务端与首帧）。 */
  measured: boolean
  /** 没有可画的流带。 */
  empty: boolean
  legendItems: readonly SankeyLegendItem[]
  /** linkColor="gradient" 时每条流带一个渐变；其余时候为空。 */
  gradients: readonly SankeyGradient[]
  /** 激活的节点或流带；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: SankeyTooltipModel | null
  summary: string
  /** 数据表模型：每条流带一行，源、目标与流量三列。 */
  table: TableModel
  emptyText: string
  tableCaption: string
  activeKey: ChartKey | null
  hiddenSeries: string[]
  /** 切换某个分组的显隐。 */
  toggleSeries: (id: string) => void
  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  markTag: (mark: Mark) => SankeyMarkTag
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendItemProps: (item: SankeyLegendItem) => T['button']
  getLegendSwatchProps: (item: SankeyLegendItem) => T['element']
  getLegendLabelProps: (item: SankeyLegendItem) => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  /** 绘图区的第一个子节点：流带渐变定义在这里。 */
  getDefsProps: () => T['element']
  getGradientProps: (gradient: SankeyGradient) => T['element']
  getGradientStopProps: (gradient: SankeyGradient, at: 'from' | 'to') => T['element']
  getMarkProps: (mark: Mark) => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: SankeyTooltipRow) => T['element']
  getTooltipSwatchProps: (row: SankeyTooltipRow) => T['element']
  getTooltipValueProps: (row: SankeyTooltipRow) => T['element']
  getTooltipNameProps: (row: SankeyTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
