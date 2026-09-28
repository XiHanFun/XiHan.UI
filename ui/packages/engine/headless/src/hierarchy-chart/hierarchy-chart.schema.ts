/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 hierarchy chart 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

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
} from '../shared/chart'
import type { HierarchyModel, HierarchyPipeline } from './hierarchy-chart.model'
import type {
  HierarchyChartTranslations,
  HierarchyColorBy,
  HierarchyLayout,
  HierarchyLegendScale,
  HierarchyMarkTag,
  HierarchyPathItem,
  HierarchyRootKeyChangeDetails,
  HierarchyTile,
  HierarchyTooltipModel,
  HierarchyTooltipRow,
} from './hierarchy-chart.types'

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

export interface HierarchyOverlay {
  /** 画在节点之上：焦点环。 */
  readonly over: readonly Mark[]
}

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
  /** 按值着色时图例里的色阶，每个看得见的层一条；不按值着色时为空。 */
  legendScales: readonly HierarchyLegendScale[]
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
  getLegendProps: () => T['element']
  getLegendScaleProps: (scale: HierarchyLegendScale) => T['element']
  getLegendScaleNameProps: () => T['element']
  getLegendScaleBarProps: () => T['element']
  getLegendScaleValueProps: (edge: 'min' | 'max') => T['element']
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
