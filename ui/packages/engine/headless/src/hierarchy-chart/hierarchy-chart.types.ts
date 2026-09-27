/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 hierarchy chart 类型契约。

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
  ChartPalette,
  ChartRow,
  ChartTranslations,
} from '../shared/chart'
import type { HierarchyOverlay } from './hierarchy-chart.logic'
import type { HierarchyModel, HierarchyPipeline } from './hierarchy-chart.model'

/** 空间填充的方式：treemap 矩形树图（缺省）、sunburst 旭日图、icicle 冰柱图、pack 圆堆积。 */
export type HierarchyLayout = 'treemap' | 'sunburst' | 'icicle' | 'pack'

/** 矩形树图的铺法：squarify 块尽量接近正方（缺省），binary 二分，slice-dice 按层交替横竖切。 */
export type HierarchyTile = 'squarify' | 'binary' | 'slice-dice'

/** 着色：branch 按第一层分支取分类色、后代逐层变浅（缺省），value 按值取顺序色阶，uniform 统一取色槽 1。 */
export type HierarchyColorBy = 'branch' | 'value' | 'uniform'

/** 下钻路径上的一项：从最顶层到当前的根。 */
export interface HierarchyPathItem {
  /** 节点的身份；最顶层为 null。 */
  readonly key: string | null
  readonly name: string
  readonly current: boolean
}

/** 提示框里的一行：数值与占比。 */
export interface HierarchyTooltipRow {
  readonly key: 'value' | 'parent' | 'root'
  readonly name: string
  readonly value: string
}

/** 提示框的内容：头部是从当前的根到这个节点的路径，下面是数值与两种占比。 */
export interface HierarchyTooltipModel {
  readonly header: string
  readonly rows: readonly HierarchyTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface HierarchySummary {
  /** 当前的根的名字。 */
  readonly root: string
  readonly total: string
  /** 当前的根下面一层的项数。 */
  readonly childCount: number
  /** 下面一层里最大的一项；没有时为 null。 */
  readonly largest: { readonly name: string, readonly value: string, readonly share: string } | null
}

export interface HierarchyChartTranslations extends ChartTranslations {
  /** 数据的最顶层没有名字时的叫法，也是下钻路径的第一项。 */
  rootLabel: string
  /** 下钻路径的可及名。 */
  pathLabel: string
  /** 数据表与提示框的列名 / 行名。 */
  nameLabel: string
  valueLabel: string
  parentShareLabel: string
  rootShareLabel: string
  summary: (model: HierarchySummary) => string
}

export interface HierarchyChartSchema extends MachineSchema {
  // 层级图没有图例，不接系列显隐
  props: Omit<ChartCommonProps, 'hiddenSeries' | 'defaultHiddenSeries' | 'onHiddenSeriesChange'> & {
    /** 数据：嵌套的树（子节点在 childrenField 里），或扁平的行（按 idField 与 parentField 组树）。 */
    data?: ChartRow | readonly ChartRow[]
    /** 嵌套数据的子节点字段，缺省 children。 */
    childrenField?: string
    /** 扁平数据：行的身份字段；嵌套数据写了它也用它当节点的身份。 */
    idField?: string
    /** 扁平数据：父节点的身份字段。 */
    parentField?: string
    /** 名字字段，缺省 name。 */
    nameField?: string
    /** 数值字段，缺省 value：只取叶子的值，上层的值是子孙之和。 */
    valueField?: string
    /** 空间填充的方式，缺省 treemap。 */
    layout?: HierarchyLayout
    /** 矩形树图的铺法，缺省 squarify。 */
    tile?: HierarchyTile
    /** 同时看得见的层数，缺省 2。 */
    depth?: number
    /** 着色，缺省 branch。 */
    colorBy?: HierarchyColorBy
    /** colorBy="value" 时顺序色阶的色板。 */
    palette?: ChartPalette
    /** 冰柱图的方向：vertical 层自上而下（缺省），horizontal 层自左而右。 */
    orientation?: 'vertical' | 'horizontal'
    /** 当前的根（受控）：下钻到的那个节点的身份，null 是最顶层。 */
    rootKey?: string | null
    /** 初始的根（非受控）。 */
    defaultRootKey?: string | null
    /** 下钻或上钻换了根时通知。 */
    onRootKeyChange?: (details: HierarchyRootKeyChangeDetails) => void
    /** 数值格式：标签、提示框、可及名与数据表共用。 */
    format?: NumberFormatSpec | ((value: number) => string)
    translations?: Partial<HierarchyChartTranslations>
  }
  context: ChartBaseContext & {
    /** 当前的根的身份；null 是最顶层。 */
    rootKey: string | null
  }
  computed: ChartBaseComputed
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: HierarchyPipeline
  }
  state: 'idle'
  event: ChartBaseEvent | { type: 'ROOT.SET', key: string | null }
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues' | 'setRoot'
  effect: 'trackViewport'
}

/** 换了根时报告的内容。 */
export interface HierarchyRootKeyChangeDetails {
  readonly rootKey: string | null
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type HierarchyMarkTag = 'g' | 'path' | 'text'

export interface HierarchyChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：树、布局、场景与无障碍模型。 */
  model: HierarchyModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /** 前景层：焦点环。 */
  overlay: HierarchyOverlay
  /** 视口尚未测量（服务端与首帧）。 */
  measured: boolean
  /** 没有可画的节点。 */
  empty: boolean
  /** 下钻路径：从最顶层到当前的根。 */
  path: readonly HierarchyPathItem[]
  /** 当前的根的身份；null 是最顶层。 */
  rootKey: string | null
  /** 激活的节点；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: HierarchyTooltipModel | null
  summary: string
  /** 数据表模型：全部节点，路径、数值与占上一层的比例。 */
  table: TableModel
  emptyText: string
  tableCaption: string
  activeKey: ChartKey | null
  /** 下钻到某个节点（有子节点才下得去），null 回到最顶层。 */
  drillTo: (key: string | null) => void
  /** 上钻一层。 */
  drillUp: () => void
  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  markTag: (mark: Mark) => HierarchyMarkTag
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getPathProps: () => T['element']
  getPathItemProps: (item: HierarchyPathItem) => T['button']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  getMarkProps: (mark: Mark) => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: HierarchyTooltipRow) => T['element']
  getTooltipSwatchProps: (row: HierarchyTooltipRow) => T['element']
  getTooltipValueProps: (row: HierarchyTooltipRow) => T['element']
  getTooltipNameProps: (row: HierarchyTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
