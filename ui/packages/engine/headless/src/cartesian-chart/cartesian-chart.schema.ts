/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 cartesian chart 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { Mark, Scene, TableModel } from '@xihan-ui/viz'
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
  ChartPattern,
  ChartRow,
} from '../shared/chart'
import type { CartesianModel, CartesianPipeline } from './cartesian-chart.model'
import type {
  CartesianAnnotation,
  CartesianAxis,
  CartesianBrush,
  CartesianBrushing,
  CartesianBrushSelection,
  CartesianBrushSelectionChangeDetails,
  CartesianChartTranslations,
  CartesianDrag,
  CartesianLegendItem,
  CartesianLegendScale,
  CartesianMarkTag,
  CartesianOrientation,
  CartesianSeries,
  CartesianTooltipModel,
  CartesianTooltipOrder,
  CartesianTooltipRow,
  CartesianTrigger,
  CartesianWindow,
  CartesianWindowChangeDetails,
  CartesianWindowRatio,
  CartesianZoom,
} from './cartesian-chart.types'

export interface CartesianChartSchema extends MachineSchema {
  props: ChartCommonProps & {
    /** 数据：对象数组，系列用字段名把列映射到通道。 */
    data?: readonly ChartRow[]
    series?: readonly CartesianSeries[]
    xAxis?: CartesianAxis
    yAxis?: CartesianAxis
    /** 朝向，缺省 vertical。 */
    orientation?: CartesianOrientation
    /** 提示框汇报什么；缺省含柱或折线时 axis，只有散点时 item。 */
    trigger?: CartesianTrigger
    /** 堆叠柱的合计：每个堆叠组在最外端写出合计，含负值时正负两端各写一个；百分比堆叠不写。缺省 false。 */
    totals?: boolean
    /** 提示框里各系列的行序，缺省 series（按图例次序）；系列多、要一眼找到最大的时按数值排。 */
    tooltipOrder?: CartesianTooltipOrder
    /** 顺序色阶的色板：按值着色的点与色阶图例换到这个色相上；不写时取顺序色阶令牌。 */
    palette?: ChartPalette
    /** 注释：参考线、参考带、标出的数据、平均线与趋势线；只给眼睛看，摘要写出参考线、参考带与平均线。 */
    annotations?: readonly CartesianAnnotation[]
    /**
     * 缩放：x 沿自变量轴、y 沿数值轴、xy 两个方向，缺省 none。开启后按住 Ctrl（⌘）滚轮、触屏捏合、键盘 + / − 缩放，
     * 放大后拖动绘图区平移；自变量方向可缩放时缩放条（zoom-slider）可用。
     */
    zoom?: CartesianZoom
    /** 缩放窗口（受控）：两根轴各露出的一段，写定义域里的值；不写或写 null 的轴是整条。 */
    window?: CartesianWindow
    /** 初始缩放窗口（非受控）。 */
    defaultWindow?: CartesianWindow
    /** 滚轮、捏合、拖动、键盘或缩放条改了窗口时通知。 */
    onWindowChange?: (details: CartesianWindowChangeDetails) => void
    /**
     * 刷选：x 沿自变量轴、y 沿数值轴、xy 框矩形，缺省 none。开启后在绘图区拖动即刷选（放大后改用缩放条或键盘平移），
     * Shift + 方向键从锚点起沿自变量扩展或收缩，Escape 清掉。
     */
    brush?: CartesianBrush
    /** 刷选的范围（受控）：定义域里的值，写法同缩放窗口；null 为没有刷选。 */
    brushSelection?: CartesianBrushSelection | null
    /** 初始刷选范围（非受控）。 */
    defaultBrushSelection?: CartesianBrushSelection | null
    /** 刷选的范围变了：指针松手时派发一次，键盘每按一次派发一次。 */
    onBrushSelectionChange?: (details: CartesianBrushSelectionChangeDetails) => void
    translations?: Partial<CartesianChartTranslations>
  }
  context: ChartBaseContext & {
    /** 缩放窗口。 */
    window: CartesianWindow
    /** 正在拖的是什么：绘图区平移、缩放条的一端或整个窗口；没在拖为 null。 */
    drag: CartesianDrag | null
    /** 刷选的范围；没有刷选为 null。 */
    brushSelection: CartesianBrushSelection | null
    /** 正在拖出的刷选框；没在刷为 null。 */
    brushing: CartesianBrushing | null
    /** 键盘刷选的锚点：按下 Shift + 方向键那一刻焦点所在的键（下标）；松开 Shift 移动焦点后清掉。 */
    brushAnchor: number | null
  }
  computed: ChartBaseComputed
  refs: ChartBaseRefs & {
    /** 管线：按输入引用分段记忆，悬停与聚焦不会让它重算。 */
    pipeline: CartesianPipeline
    /** 触屏捏合：按下着的触点（pointerId → 绘图区里的坐标）。 */
    touches: Map<number, { x: number, y: number }>
    /**
     * 手势上一次算出的窗口比例与它写成的窗口：类目轴的窗口取整到类目，连续几次细小的滚轮若都从取整后的
     * 窗口起算会原地不动；窗口还是那一份时从这里接着算。
     */
    zoomRatio: { ratio: CartesianWindowRatio, window: CartesianWindow } | null
  }
  state: 'idle'
  event: ChartBaseEvent
    | { type: 'WINDOW.SET', window: CartesianWindow }
    | { type: 'DRAG.START', drag: CartesianDrag }
    | { type: 'DRAG.END' }
    | { type: 'BRUSH.START', brushing: CartesianBrushing }
    | { type: 'BRUSH.MOVE', to: { x: number, y: number } }
    | { type: 'BRUSH.END' }
    | { type: 'BRUSH.SET', selection: CartesianBrushSelection | null, data: readonly ChartDatumDetails[] }
    | { type: 'BRUSH.ANCHOR', index: number | null }
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues' | 'setWindow' | 'startDrag' | 'endDrag' | 'startBrush' | 'moveBrush' | 'endBrush' | 'setBrush' | 'setBrushAnchor'
  effect: 'trackViewport'
}

export interface CartesianOverlay {
  /** 画在数据之下：十字准线（折线）或整条类目带的淡底（柱）。 */
  readonly under: readonly Mark[]
  /** 画在数据之上：激活数据上的点（焦点代理）与焦点环。 */
  readonly over: readonly Mark[]
}

export interface CartesianChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：比例尺、布局、场景与无障碍模型。 */
  model: CartesianModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /**
   * 前景层：随激活与聚焦变化的标记。绘图区按 back → under → data → over 的次序画：
   * 十字准线与类目带淡底在数据之下，激活的点与焦点环在数据之上。
   */
  overlay: CartesianOverlay
  /** 视口尚未测量（服务端与首帧）：绘图区只输出空的 svg。 */
  measured: boolean
  /** 没有可画的数据：空态部件据此显示。 */
  empty: boolean
  legendItems: readonly CartesianLegendItem[]
  /** 按值着色时图例里的色阶；没有按值着色的系列时为 null。 */
  legendScale: CartesianLegendScale | null
  /** 各系列的纹理：画在绘图区的 defs 里，强制色、打印与环境开启纹理时柱与面积用它填充。 */
  patterns: readonly ChartPattern[]
  /** 激活的数据；没有时为 null。 */
  active: ChartDatumDetails | null
  /** 提示框内容；收起时为 null。 */
  tooltip: CartesianTooltipModel | null
  /** 摘要文字。 */
  summary: string
  /** 数据表模型：视觉隐藏的数据表用它，也可以喂给 Table 组件做可见的表格视图。 */
  table: TableModel
  /** 空态文字。 */
  emptyText: string
  /** 数据表的标题。 */
  tableCaption: string
  /** 激活的自变量键。 */
  activeKey: ChartKey | null
  hiddenSeries: string[]
  /** 切换某个系列的显隐。 */
  toggleSeries: (id: string) => void
  /**
   * 移动键盘锚点。只改锚点不移动 DOM 焦点，也不派发回调；
   * 需要焦点跟随时自行调用元素的 focus()。
   */
  setFocusedDatum: (ref: { seriesId: string, index: number } | null) => void
  /** 标记画成什么元素。 */
  markTag: (mark: Mark) => CartesianMarkTag
  /** 缩放：两个方向能不能缩放、当前的窗口，与它在两根轴上的比例（不能缩放的方向是整条轴）。 */
  zoom: { readonly x: boolean, readonly y: boolean, readonly window: CartesianWindow, readonly ratio: CartesianWindowRatio }
  /** 缩放后要裁到的矩形（绘图区）与它在 defs 里的 clipPath id；没缩放连续轴与数值轴时为 null。 */
  clip: { readonly id: string, readonly x: number, readonly y: number, readonly width: number, readonly height: number } | null
  /** 设置缩放窗口（定义域里的值）；不能缩放的方向保持整条轴。 */
  setWindow: (window: CartesianWindow) => void
  /** 刷选：两个方向能不能刷、当前的范围，与它在绘图区里的矩形（没有刷选为 null）。 */
  brush: {
    readonly x: boolean
    readonly y: boolean
    readonly selection: CartesianBrushSelection | null
    readonly rect: { readonly x: number, readonly y: number, readonly width: number, readonly height: number } | null
  }
  /** 设置刷选范围（定义域里的值），null 清掉；派发 onBrushSelectionChange。 */
  setBrushSelection: (selection: CartesianBrushSelection | null) => void
  getRootProps: () => T['element']
  getCaptionProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendItemProps: (item: CartesianLegendItem) => T['button']
  getLegendSwatchProps: (item: CartesianLegendItem) => T['element']
  getLegendLabelProps: (item: CartesianLegendItem) => T['element']
  /** 色阶图例：名字、低端的值、渐变条、高端的值依次排开，只给眼睛看。 */
  getLegendScaleProps: () => T['element']
  getLegendScaleNameProps: () => T['element']
  getLegendScaleBarProps: () => T['element']
  getLegendScaleValueProps: (edge: 'min' | 'max') => T['element']
  getViewportProps: () => T['element']
  getPlotProps: () => T['element']
  /** 绘图区的第一个子节点：各系列的纹理定义在这里。 */
  getDefsProps: () => T['element']
  getPatternProps: (pattern: ChartPattern) => T['element']
  getPatternLineProps: (pattern: ChartPattern) => T['element']
  /** 场景里一个标记的属性（含 path 的 d、文字的坐标）。 */
  getMarkProps: (mark: Mark) => T['element']
  getTooltipProps: () => T['element']
  getTooltipHeaderProps: () => T['element']
  getTooltipRowProps: (row: CartesianTooltipRow) => T['element']
  getTooltipSwatchProps: (row: CartesianTooltipRow) => T['element']
  getTooltipValueProps: (row: CartesianTooltipRow) => T['element']
  getTooltipNameProps: (row: CartesianTooltipRow) => T['element']
  getEmptyProps: () => T['element']
  /** 裁剪区：画在绘图区的 defs 里，clip 为 null 时不画。 */
  getClipPathProps: () => T['element']
  getClipRectProps: () => T['element']
  /** 缩放条：作者放置，轨道、窗口与两端的手柄由组件生成；自变量方向不能缩放时收起。 */
  getZoomSliderProps: () => T['element']
  getZoomTrackProps: () => T['element']
  getZoomWindowProps: () => T['element']
  getZoomHandleProps: (edge: 'start' | 'end') => T['element']
  /** 缩放条轨道里的缩略线：整条轴上的走势，只给眼睛看；轨道里跟在窗口后面，一个 svg 里一条 path。 */
  getZoomPreviewProps: () => T['element']
  getZoomPreviewLineProps: () => T['element']
  getSummaryProps: () => T['element']
  getTableProps: () => T['element']
}
