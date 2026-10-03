/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 cartesian chart 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { Mark, Scene, TableModel } from '@xihan-ui/viz'
import type { ColumnSource } from '@xihan-ui/viz/columns'
import type {
  ChartBaseAction,
  ChartBaseComputed,
  ChartBaseContext,
  ChartBaseEvent,
  ChartBaseRefs,
  ChartCanvasHost,
  ChartCommonProps,
  ChartDatumDetails,
  ChartKey,
  ChartPalette,
  ChartPattern,
  ChartRow,
} from '../shared/chart'
import type { CartesianModel, CartesianPipeline } from './cartesian-chart.pipeline'
import type {
  CartesianAnnotation,
  CartesianAxis,
  CartesianBrush,
  CartesianBrushing,
  CartesianBrushSelection,
  CartesianBrushSelectionChangeDetails,
  CartesianChartTranslations,
  CartesianDrag,
  CartesianFollowChangeDetails,
  CartesianLegendItem,
  CartesianLegendScale,
  CartesianMarkTag,
  CartesianOrientation,
  CartesianRenderer,
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
    /** 数据：对象数组，系列用字段名把列映射到通道；或 createColumnStore 建的列式数据，走大数据的管线、总是画在画布上。 */
    data?: readonly ChartRow[] | ColumnSource
    series?: readonly CartesianSeries[]
    xAxis?: CartesianAxis
    yAxis?: CartesianAxis
    /** 朝向，缺省 vertical。 */
    orientation?: CartesianOrientation
    /**
     * 数据层画在哪：svg、canvas，或 auto（缺省）——数据层逐个成节点的标记超过节点预算时改用画布。
     * 画布只画数据层：坐标轴、网格、注释、焦点代理、摘要与数据表仍是 SVG / DOM。
     */
    renderer?: CartesianRenderer
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
     * 缩放窗口跟随最新的数据（受控）：窗口右端贴着数据末端时，新数据到来窗口随之右移、宽度不变。
     * 拖动、滚轮或键盘让窗口右端离开数据末端即变为 false，回到末端变回 true；写成 true 时窗口一步跳到末端。
     */
    follow?: boolean
    /** 初始是否跟随（非受控），缺省 true。 */
    defaultFollow?: boolean
    /** 跟随的开关变了：用户把窗口拖离或拖回数据末端时通知。 */
    onFollowChange?: (details: CartesianFollowChangeDetails) => void
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
    /**
     * 最近一次窗口变化是一步到位的（键盘缩放、滚轮一格、点缩放条空处、焦点移出窗口时跟过去）：
     * 场景按 move 补间过去。拖着平移、捏合与刷选跟手，为假。
     */
    windowStep: boolean
    /** 正在拖的是什么：绘图区平移、缩放条的一端或整个窗口；没在拖为 null。 */
    drag: CartesianDrag | null
    /** 刷选的范围；没有刷选为 null。 */
    brushSelection: CartesianBrushSelection | null
    /** 正在拖出的刷选框；没在刷为 null。 */
    brushing: CartesianBrushing | null
    /** 键盘刷选的锚点：按下 Shift + 方向键那一刻焦点所在的键（下标）；松开 Shift 移动焦点后清掉。 */
    brushAnchor: number | null
    /** 缩放窗口是否跟着最新的数据走。 */
    follow: boolean
    /** 列式数据仓刷新的次数：数据仓原地追加时靠它让连接层与场景跟着重算，同一帧里的多次推送只加一次。 */
    dataVersion: number
  }
  computed: ChartBaseComputed & {
    /** 列式数据自己的问题（自变量列乱序）写成的串：追加数据后出现或消失时再报一遍。 */
    dataIssues: string
  }
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
    /** 画布节点，由适配器注入；svg 渲染或还没挂上时返回 null。 */
    getCanvasEl: () => HTMLCanvasElement | null
    /** 画布宿主：机器在状态变化后经它排重绘；未挂载为 null。 */
    canvas: ChartCanvasHost | null
    /** 撤掉对列式数据仓的订阅与排着的那一帧；没有订阅为 null。 */
    sourceStop: (() => void) | null
    /** 上一次数据的最后一个键：新数据到来时窗口右端贴着它才跟过去；没有数据为 null。 */
    lastKey: ChartKey | null
  }
  state: 'idle'
  event: ChartBaseEvent
    /** step：一步到位的离散变化，场景补间过去；缺省为连续的操作，场景直接跟到终态。 */
    | { type: 'WINDOW.SET', window: CartesianWindow, step?: boolean }
    | { type: 'DRAG.START', drag: CartesianDrag }
    | { type: 'DRAG.END' }
    | { type: 'BRUSH.START', brushing: CartesianBrushing }
    | { type: 'BRUSH.MOVE', to: { x: number, y: number } }
    | { type: 'BRUSH.END' }
    | { type: 'BRUSH.SET', selection: CartesianBrushSelection | null, data: readonly ChartDatumDetails[] }
    | { type: 'BRUSH.ANCHOR', index: number | null }
    /** 列式数据仓在这一帧里刷新过：合成一次，重算场景、跟随窗口、按指针位置重新拾取。 */
    | { type: 'DATA.TICK' }
  tag: never
  guard: never
  action: ChartBaseAction | 'notifyActive' | 'reportIssues' | 'setWindow' | 'startDrag' | 'endDrag' | 'startBrush' | 'moveBrush' | 'endBrush' | 'setBrush' | 'setBrushAnchor' | 'requestPaint' | 'syncSource' | 'tickData' | 'followData' | 'repick' | 'syncFollow'
  effect: 'trackViewport' | 'trackCanvas' | 'trackSource'
}

export interface CartesianOverlay {
  /** 画在数据之下：十字准线（折线）或整条类目带的淡底（柱）。 */
  readonly under: readonly Mark[]
  /** 画在数据之上：激活数据上的点（焦点代理）与焦点环。 */
  readonly over: readonly Mark[]
}

/** 按渲染器分好的两层 SVG 标记：画布模式下网格、坐标轴、参考带与准线在垫层（数据之下），其余在绘图区。 */
export interface CartesianLayers {
  /** 垫层：只在画布模式下有内容。 */
  readonly underlay: readonly Mark[]
  /** 绘图区：svg 模式是全部标记；画布模式是系列分组与样式探针、前景层、焦点代理与焦点环。 */
  readonly plot: readonly Mark[]
}

export interface CartesianChartApi<T extends PropTypes = PropTypes> {
  /** 管线产物：比例尺、布局、场景与无障碍模型。 */
  model: CartesianModel
  /** 解析后的渲染器：数据层画在 SVG 还是画布上。 */
  renderer: 'svg' | 'canvas'
  /** 按渲染器分好层的标记：适配器照它画垫层与绘图区，不自己拼层序。 */
  layers: CartesianLayers
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
  /** 垫层：画布模式下垫在画布之下的 svg，网格、坐标轴、参考带与准线画在这里。 */
  getUnderlayProps: () => T['element']
  /** 画布：画布模式下的数据层；后备尺寸由机器按视口与 DPR 设。 */
  getCanvasProps: () => T['element']
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
  /** 数据表的视觉隐藏区域：块级、1px、裁掉，表格放在里面；隐藏不写在表格上，表格的高度收不住。 */
  getTableRegionProps: () => T['element']
  getTableProps: () => T['element']
}
