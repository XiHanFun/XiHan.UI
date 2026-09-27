/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 graph chart 类型契约。

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
import type { GraphOverlay } from './graph-chart.logic'
import type { GraphModel, GraphPipeline, GraphSimulationRef } from './graph-chart.model'

/** 一个节点：身份、名字、分组与数值；分组决定颜色与图例，数值决定面积。 */
export interface GraphNodeDatum {
  readonly id: string
  /** 显示的名字，缺省同 id。 */
  readonly name?: string
  readonly group?: string
  /** 数值：经平方根比例尺决定节点面积；不写时节点一样大。 */
  readonly value?: number
}

/** 一条连线：两端节点的身份，可选的权重决定线的粗细。 */
export interface GraphLinkDatum {
  readonly source: string
  readonly target: string
  readonly value?: number
}

/** 布局：force 力导（缺省），circular 环形，tree 树（根在左、自左而右），radial-tree 径向树（根在中间）。 */
export type GraphLayout = 'force' | 'circular' | 'tree' | 'radial-tree'

/** 画布的平移缩放：k 是缩放倍数，(x, y) 是平移；节点的位置跟着变，大小与文字不变。 */
export interface GraphView {
  readonly k: number
  readonly x: number
  readonly y: number
}

/** 图例里的一项：一个分组一项。 */
export interface GraphLegendItem {
  readonly id: string
  readonly name: string
  /** 分类色槽 1–8。 */
  readonly slot: number
  readonly hidden: boolean
}

/** 提示框里的一行：数值、连线数，有向时分出入。 */
export interface GraphTooltipRow {
  readonly key: string
  readonly name: string
  readonly value: string
}

export interface GraphTooltipModel {
  readonly header: string
  readonly rows: readonly GraphTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface GraphSummary {
  readonly nodeCount: number
  readonly linkCount: number
  /** 连线最多的节点；没有连线时为 null。 */
  readonly hub: { readonly name: string, readonly degree: number } | null
}

export interface GraphChartTranslations extends ChartTranslations {
  /** 数据表与提示框里「源」「目标」「权重」的写法。 */
  sourceLabel: string
  targetLabel: string
  valueLabel: string
  /** 提示框里连线数一行的名字。 */
  linksLabel: string
  /** 有向时入边与出边的名字。 */
  incomingLabel: string
  outgoingLabel: string
  summary: (model: GraphSummary) => string
}

/** 拖着的节点或平移中的画布。 */
export interface GraphDrag {
  readonly pointerId: number
  /** 拖着的节点；平移画布时为 null。 */
  readonly id: string | null
  /** 平移：按下时的指针位置与视图。 */
  readonly from: { readonly x: number, readonly y: number }
  readonly view: GraphView
}

export interface GraphChartSchema extends MachineSchema {
  props: ChartCommonProps & {
    nodes?: readonly GraphNodeDatum[]
    links?: readonly GraphLinkDatum[]
    /** 布局，缺省 force。 */
    layout?: GraphLayout
    /** 树与径向树的根；不写时取没有入边的那个节点。 */
    root?: string
    /** 有向：连线的目标一端画箭头，提示框分出入。 */
    directed?: boolean
    /** 力导布局下可以拖动节点，缺省 true。叫 draggableNodes 不叫 draggable：后者是 HTML 的原生属性，写在宿主上会让整张图可以被拖走。 */
    draggableNodes?: boolean
    /** 画布可以平移缩放（Ctrl / ⌘ 加滚轮、拖动空白处、+ / − 键），缺省 false。 */
    zoom?: boolean
    /** 数值格式：提示框、可及名与数据表共用。 */
    format?: NumberFormatSpec | ((value: number) => string)
    translations?: Partial<GraphChartTranslations>
  }
  context: ChartBaseContext & {
    /** 拖动之后的位置（布局坐标）；没拖过为 null，数据、布局或尺寸一变就作废。 */
    positions: Readonly<Record<string, { readonly x: number, readonly y: number }>> | null
    view: GraphView
    drag: GraphDrag | null
  }
  computed: ChartBaseComputed
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: GraphPipeline
    /** 拖动时活着的模拟；拖完、松手后跑到收敛才撤掉。 */
    simulation: GraphSimulationRef | null
    /** 拖完之后逐帧推进模拟的循环。 */
    settle: VoidFunction | null
    /** 这一次按下之后拖动过：松手后浏览器补派的 click 不算按下。 */
    dragMoved: boolean
    /** 过渡的「不播」输入：拖动后的位置与画布视图没变时给同一个引用。 */
    extent: (positions: GraphChartSchema['context']['positions'], view: GraphView) => unknown
  }
  state: 'idle'
  event: ChartBaseEvent
    | { type: 'DRAG.START', drag: GraphDrag, at: { x: number, y: number } }
    | { type: 'DRAG.MOVE', at: { x: number, y: number } }
    | { type: 'DRAG.END' }
    | { type: 'SIM.FRAME' }
    | { type: 'VIEW.SET', view: GraphView }
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues' | 'startDrag' | 'moveDrag' | 'endDrag' | 'advanceSimulation' | 'setView' | 'resetPositions'
  effect: 'trackViewport' | 'stopSimulation'
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type GraphMarkTag = 'g' | 'path' | 'text'

export interface GraphChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：图、布局、场景与无障碍模型。 */
  model: GraphModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /** 前景层：焦点环。 */
  overlay: GraphOverlay
  /** 视口尚未测量（服务端与首帧）。 */
  measured: boolean
  /** 没有可画的节点。 */
  empty: boolean
  legendItems: readonly GraphLegendItem[]
  /** 激活的节点；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: GraphTooltipModel | null
  summary: string
  /** 数据表模型：每条连线一行。 */
  table: TableModel
  emptyText: string
  tableCaption: string
  activeKey: ChartKey | null
  hiddenSeries: string[]
  view: GraphView
  /** 切换某个分组的显隐。 */
  toggleSeries: (id: string) => void
  /** 按倍数缩放，锚点缺省是绘图区中心；zoom 关掉时不动。 */
  zoomBy: (factor: number, at?: { x: number, y: number }) => void
  /** 回到不缩放、不平移。 */
  resetView: () => void
  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  markTag: (mark: Mark) => GraphMarkTag
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendItemProps: (item: GraphLegendItem) => T['button']
  getLegendSwatchProps: (item: GraphLegendItem) => T['element']
  getLegendLabelProps: (item: GraphLegendItem) => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  getMarkProps: (mark: Mark) => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: GraphTooltipRow) => T['element']
  getTooltipValueProps: (row: GraphTooltipRow) => T['element']
  getTooltipNameProps: (row: GraphTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
