/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 heatmap 类型契约。

import type { Direction, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'
import type {
  HeatmapAxisInput,
  HeatmapCellDetails,
  HeatmapCellMeta,
  HeatmapCellRef,
  HeatmapGrid,
  HeatmapMatrixGrid,
  HeatmapMonthGrid,
  HeatmapTipRect,
  HeatmapValue,
  HeatmapVariant,
} from './heatmap.grid'

/**
 * 聚焦或悬停到某一格时报出的信息。
 * 名字保留给早先只有聚焦一条路径的写法，形状与 `HeatmapCellDetails` 相同。
 */
export type HeatmapCellFocusDetails = HeatmapCellDetails

/**
 * 色板：直接按颜色命名，决定色阶满档一端的实心底色。
 * 它是装饰性的一条轴，不是第四条语义轴：取值即颜色本身，
 * 与 tone 的六个语气词不同源，也不参与语气层的悬停 / 淡底 / 前景派生。
 * 两者都提供时以色板为准：色板指定了具体颜色，语气只能推导出一个颜色。
 */
export type HeatmapPalette = 'blue' | 'gray' | 'green' | 'orange' | 'purple' | 'red'

/**
 * 格子的声明：日期形态提供 date，矩阵形态提供 row 与 column。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface HeatmapCellProps {
  /** ISO 日期串 YYYY-MM-DD。 */
  date?: string
  /** 矩阵形态：行身份。 */
  row?: string
  /** 矩阵形态：列身份。 */
  column?: string
}

/** 一行的声明；三种形态各用其中一组，都不提供即坐标轴行。 */
export interface HeatmapRowProps {
  /** 日历形态：行序 0-6，相对周首日。 */
  weekDay?: number
  /** 月历形态：所属月份 YYYY-MM。 */
  month?: string
  /** 月历形态：月内第几周，0 起。 */
  week?: number
  /** 矩阵形态：行身份。 */
  row?: string
}

/** 一个月块的声明。 */
export interface HeatmapMonthBlockProps {
  /** 月份身份 YYYY-MM。 */
  value: string
}

/** 星期名的声明。 */
export interface HeatmapWeekDayProps {
  /** 行序 0-6；未提供时是坐标轴行行首的占位，只负责使月份与格子对齐。 */
  weekDay?: number
}

/** 月份名的声明。 */
export interface HeatmapMonthLabelProps {
  /** 月份身份 YYYY-MM，与网格给出的月份段对应。 */
  value: string
}

/** 矩阵行名的声明。 */
export interface HeatmapRowLabelProps {
  /** 行身份；未提供时是表头行行首的角落占位。 */
  value?: string
}

/** 矩阵列名的声明。 */
export interface HeatmapColumnLabelProps {
  /** 列身份。 */
  value: string
}

/** 图例中一格的声明。 */
export interface HeatmapLegendItemProps {
  /** 该格代表第几档。 */
  level: number
}

/** 对照条的哪一端：low 是色阶起点（少），high 是终点（多）。 */
export type HeatmapLegendBound = 'high' | 'low'

/** 对照条两端文字的声明。 */
export interface HeatmapLegendLabelProps {
  /** 挂在哪一端。 */
  bound: HeatmapLegendBound
}

/**
 * 文案。
 * 内建文案一律英文，与其余组件口径一致：
 * 只读给读屏的条目如此，写入界面的可见文字（对照条两端的文字）也如此。
 *
 * 两条名字不收在这里，因为它们朗读的就是坐标轴上的词，与轴上书写的必须逐字一致：
 * 星期行的可及名（`星期一` 等）与月块的可及名（`一月` 等）都由 `locale` 决定，
 * 修改 `locale` 两处一起变化，修改 `translations` 两处都不变。
 */
export interface HeatmapTranslations {
  /** 网格的可及名：一片方格无法自行表达图表含义。 */
  gridLabel: string
  /** 日期形态每格的可及名：格内没有文字，日期与数值只能从这里朗读。 */
  cellLabel: (details: HeatmapCellDetails) => string
  /** 矩阵形态每格的可及名：行列身份与数值都需要朗读。 */
  matrixCellLabel: (details: HeatmapCellDetails) => string
  /** 对照条整体的可及名：一排色块无法自行表达用途。 */
  legendLabel: string
  /** 对照条起点一端的可见文字，默认 Less。 */
  legendLow: string
  /** 对照条终点一端的可见文字，默认 More。 */
  legendHigh: string
}

export interface HeatmapSchema extends MachineSchema {
  props: {
    /** 形态：calendar 连续周列、month 按自然月分块、matrix 行列由作者提供；默认 calendar。 */
    variant?: HeatmapVariant
    /** 数据。日期形态接受 { date, count }，矩阵形态接受 { row, column, value }；同一格出现多次即累加。 */
    value?: HeatmapValue[]
    /** 矩阵的行，顺序即渲染顺序；只写身份或身份与文本分开写均可。 */
    rows?: HeatmapAxisInput[]
    /** 矩阵的列，顺序即渲染顺序。 */
    columns?: HeatmapAxisInput[]
    /** 区间起点（含），ISO YYYY-MM-DD。未提供或非法时为空网格。 */
    startDate?: string
    /** 区间终点（含）。早于起点即空网格。 */
    endDate?: string
    /** 档数，默认 5；提供 thresholds 时档数由它决定。 */
    levels?: number
    /** 各档的下界，升序；提供后 levels 不再生效。 */
    thresholds?: number[]
    /** 周首日，0 = 星期日，默认 1。 */
    firstDayOfWeek?: number
    /** 月份名与星期名的书写 locale，未提供时按宿主语言，宿主也没有时按 en-US。 */
    locale?: string
    /**
     * 文字方向。只作显式覆盖：未提供时方向从 DOM 读取，
     * 左右方向键的语义跟随视觉次序，上下键与它无关。
     */
    dir?: Direction
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 色板：green / blue / orange / purple / red / gray，直接指定色阶满档一端的颜色；同时提供 tone 时以色板为准。 */
    palette?: HeatmapPalette
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<HeatmapTranslations>
    /**
     * DOM 焦点落到某一格时通知一次；同一格重复聚焦不重复通知。
     * 只由真实的聚焦触发，程序化移动锚点（`setFocusedCell`）不派发该回调。
     */
    onCellFocus?: (details: HeatmapCellFocusDetails) => void
    /**
     * 详情应显示哪一格：指针悬停或键盘聚焦都会走到这里，收起时为 null。
     * 详情条的内容由作者决定，组件只报告是哪一格、数值多少。
     */
    onCellActive?: (details: HeatmapCellDetails | null) => void
  }
  context: {
    /**
     * roving 锚点：最后一次被聚焦的格，持续保留。
     * 焦点离开网格也不清空，Tab 回来时落回原处；从未聚焦过时为 null。
     */
    focusedCell: HeatmapCellRef | null
    /** 焦点当前是否实际落在某一格上；离开网格即为假，锚点不受影响。 */
    focusWithin: boolean
    /** 指针悬停的格；指针离开即为 null。 */
    hoveredCell: HeatmapCellRef | null
    /** Escape 收起过详情：收起状态保留到下一次进入或聚焦其他格子。 */
    dismissed: boolean
    /** 悬停格的落点，由事件处理器测量后写回；指针离开即清空。 */
    hoverTip: HeatmapTipRect | null
    /** 聚焦格的落点，由事件处理器测量后写回；未聚焦过时为 null。 */
    focusTip: HeatmapTipRect | null
    /** 上一次通知过的详情身份与数值；只用于去重，不对外。 */
    activeKey: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 焦点锚点与悬停都不编码进状态，状态机因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    | { type: 'CELL.FOCUS', cell: HeatmapCellRef, tip: HeatmapTipRect | null }
    | { type: 'CELL.BLUR' }
    | { type: 'CELL.ENTER', cell: HeatmapCellRef, tip: HeatmapTipRect | null }
    | { type: 'CELL.LEAVE' }
    | { type: 'DETAIL.DISMISS' }
    | { type: 'FOCUS.SET', cell: HeatmapCellRef | null }
  tag: never
  guard: never
  action: 'setFocusedCell' | 'clearFocusWithin' | 'setHoveredCell' | 'clearHoveredCell' | 'dismissDetail' | 'notifyActive'
  effect: never
}

export interface HeatmapApi<T extends PropTypes = PropTypes> {
  /** 当前形态。 */
  variant: HeatmapVariant
  /** 日历网格：行是星期几、列是周次，另带月份段、星期名与档位标尺。其余形态下是一张空网格。 */
  grid: HeatmapGrid
  /** 月历网格：按自然月分块；不是 month 形态时为 null。 */
  monthGrid: HeatmapMonthGrid | null
  /** 矩阵网格：行列由作者提供；不是 matrix 形态时为 null。 */
  matrixGrid: HeatmapMatrixGrid | null
  /** 最后一次被聚焦的格；从未聚焦过时为 null。 */
  focusedCell: HeatmapCellRef | null
  /** 最后一次被聚焦的日期；矩阵形态下恒为 null。 */
  focusedDate: string | null
  /** 当前占据 Tab 位的格：锚点仍在网格中即为它，否则回退为文档序首格。 */
  anchorCell: HeatmapCellRef | null
  /** 当前占据 Tab 位的日期；矩阵形态下恒为 null。 */
  anchorDate: string | null
  /** 详情应显示的格的数据：身份、原始值、档位与色阶位置；不显示时为 null。 */
  activeCell: HeatmapCellDetails | null
  /** 详情条当前是否显示。 */
  detailOpen: boolean
  /**
   * 对照条两端的文字，作者按它渲染 legend-label 部件。
   * 与 `getLegendLabelProps` 同源，修改 translations 两处一起变化。
   */
  legendText: { low: string, high: string }
  /** 按日期取一格；不在区间内时为 null。矩阵形态下恒为 null。 */
  cellAt: (date: string) => HeatmapCellMeta | null
  /**
   * 移动锚点。只改锚点不移动 DOM 焦点，也不派发 `onCellFocus`；
   * 需要焦点跟随时自行调用元素的 focus()。
   */
  setFocusedCell: (cell: HeatmapCellRef | null) => void
  /** 按日期移动锚点，等同于 `setFocusedCell({ date })`。 */
  setFocusedDate: (date: string | null) => void
  getRootProps: () => T['element']
  getGridProps: () => T['element']
  getMonthBlockProps: (props: HeatmapMonthBlockProps) => T['element']
  getRowProps: (props: HeatmapRowProps) => T['element']
  getWeekDayProps: (props: HeatmapWeekDayProps) => T['element']
  getMonthLabelProps: (props: HeatmapMonthLabelProps) => T['element']
  getRowLabelProps: (props: HeatmapRowLabelProps) => T['element']
  getColumnLabelProps: (props: HeatmapColumnLabelProps) => T['element']
  getCellProps: (props: HeatmapCellProps) => T['element']
  getTooltipProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendLabelProps: (props: HeatmapLegendLabelProps) => T['element']
  getLegendItemProps: (props: HeatmapLegendItemProps) => T['element']
}
