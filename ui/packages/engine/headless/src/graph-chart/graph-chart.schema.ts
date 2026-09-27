/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 graph chart 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

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
} from '../shared/chart'
import type { GraphModel, GraphPipeline, GraphSimulationRef } from './graph-chart.model'
import type {
  GraphChartTranslations,
  GraphDrag,
  GraphLayout,
  GraphLegendItem,
  GraphLinkDatum,
  GraphMarkTag,
  GraphNodeDatum,
  GraphTooltipModel,
  GraphTooltipRow,
  GraphView,
} from './graph-chart.types'

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

export interface GraphOverlay {
  /** 画在节点之上：焦点环。 */
  readonly over: readonly Mark[]
}

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
