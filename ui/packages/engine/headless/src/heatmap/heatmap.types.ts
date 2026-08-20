import type { Direction, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
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
 * 聚焦或悬停到某一格时报出去的信息。
 * 名字保留给早先只有聚焦一条路的写法，形状与 `HeatmapCellDetails` 是同一个。
 */
export type HeatmapCellFocusDetails = HeatmapCellDetails

/**
 * 格子自报家门：日期形态给 date，矩阵形态给 row 与 column。
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

/** 一行自报家门；三种形态各用其中一组，一组都不给即坐标轴那一行。 */
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

/** 一个月块自报家门。 */
export interface HeatmapMonthBlockProps {
  /** 月份身份 YYYY-MM。 */
  value: string
}

/** 星期名自报家门。 */
export interface HeatmapWeekDayLabelProps {
  /** 行序 0-6；不给即坐标轴那一行行首的占位，它只负责让月份与格子对齐。 */
  weekDay?: number
}

/** 月份名自报家门。 */
export interface HeatmapMonthLabelProps {
  /** 月份身份 YYYY-MM，与网格给出的月份段对应。 */
  value: string
}

/** 矩阵的行名自报家门。 */
export interface HeatmapRowLabelProps {
  /** 行身份；不给即表头行行首那个角落占位。 */
  value?: string
}

/** 矩阵的列名自报家门。 */
export interface HeatmapColumnLabelProps {
  /** 列身份。 */
  value: string
}

/** 图例的一格自报家门。 */
export interface HeatmapLegendItemProps {
  /** 该格代表第几档。 */
  level: number
}

/** 对照条的哪一端：low 是色阶起点（少），high 是终点（多）。 */
export type HeatmapLegendBound = 'high' | 'low'

/** 对照条两端那两个字自报家门。 */
export interface HeatmapLegendLabelProps {
  /** 挂在哪一端。 */
  bound: HeatmapLegendBound
}

/**
 * 文案。
 * 只念给读屏的那几条默认英文，与其余组件同一口径；
 * 写进界面的可见文字（对照条两端的那两个字）跟月份名、星期名一样，按缺省 locale（zh-CN）写。
 *
 * 两条名字不收在这里，因为它们念的就是坐标轴上那几个词，与轴上写的必须逐字一致：
 * 星期行的可及名字（`星期一` 这种）与月块的可及名字（`一月` 这种）都由 `locale` 定，
 * 改 `locale` 两处一起变，改 `translations` 一处都不变。
 */
export interface HeatmapTranslations {
  /** 网格的可及名字：一片方格子自己说不出这是什么图。 */
  gridLabel: string
  /** 日期形态每格的可及名字：格子里没有文字，日期与数值只能从这里念出来。 */
  cellLabel: (details: HeatmapCellDetails) => string
  /** 矩阵形态每格的可及名字：行列身份与数值都要念出来。 */
  matrixCellLabel: (details: HeatmapCellDetails) => string
  /** 对照条整体的可及名字：一排色块自己说不出这是干什么用的。 */
  legendLabel: string
  /** 对照条起点那一端的可见文字，缺省「少」。 */
  legendLow: string
  /** 对照条终点那一端的可见文字，缺省「多」。 */
  legendHigh: string
}

export interface HeatmapSchema extends MachineSchema {
  props: {
    /** 形态：calendar 连续周列、month 按自然月分块、matrix 行列由作者给；缺省 calendar。 */
    variant?: HeatmapVariant
    /** 数据。日期形态收 { date, count }，矩阵形态收 { row, column, value }；同一格出现多次即累加。 */
    value?: HeatmapValue[]
    /** 矩阵的行，顺序即渲染顺序；只写身份或身份与文本分开写都行。 */
    rows?: HeatmapAxisInput[]
    /** 矩阵的列，顺序即渲染顺序。 */
    columns?: HeatmapAxisInput[]
    /** 区间起点（含），ISO YYYY-MM-DD。缺省或非法即空网格。 */
    startDate?: string
    /** 区间终点（含）。早于起点即空网格。 */
    endDate?: string
    /** 档数，缺省 5；给了 thresholds 则档数由它定。 */
    levels?: number
    /** 各档的下界，升序；给了它 levels 不再起作用。 */
    thresholds?: number[]
    /** 周首日，0 = 星期日，缺省 1。 */
    firstDayOfWeek?: number
    /** 月份名与星期名的书写 locale，缺省 zh-CN。 */
    locale?: string
    /**
     * 文字方向。只作显式覆盖：不写时方向从 DOM 现读，
     * 左右方向键的语义跟着视觉次序走，上下键与它无关。
     */
    dir?: Direction
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<HeatmapTranslations>
    /**
     * DOM 焦点落到某一格时通知一次；同一格重复聚焦不重复通知。
     * 只由真实的聚焦触发，程序化挪锚点（`setFocusedCell`）不派这个回调。
     */
    onCellFocus?: (details: HeatmapCellFocusDetails) => void
    /**
     * 详情该显示哪一格：指针悬停或键盘聚焦都会走到这里，收起时给 null。
     * 详情条里写什么由作者决定，组件只报是哪一格、数值多少。
     */
    onCellActive?: (details: HeatmapCellDetails | null) => void
  }
  context: {
    /**
     * roving 锚点：最后一次被聚焦的那一格，一直留着。
     * 焦点离开网格也不清空，Tab 回来才落回原处；从没聚焦过时为 null。
     */
    focusedCell: HeatmapCellRef | null
    /** 焦点此刻是不是真落在某一格上；离开网格即为假，锚点不受影响。 */
    focusWithin: boolean
    /** 指针悬停的那一格；指针离开即为 null。 */
    hoveredCell: HeatmapCellRef | null
    /** Escape 收起过详情：收起状态一直留到下一次进入或聚焦别的格子。 */
    dismissed: boolean
    /** 悬停那一格的落点，由事件处理器量好写回来；指针离开即清空。 */
    hoverTip: HeatmapTipRect | null
    /** 聚焦那一格的落点，由事件处理器量好写回来；没聚焦过时为 null。 */
    focusTip: HeatmapTipRect | null
    /** 上一次通知过的详情身份与数值；只服务去重，不对外。 */
    activeKey: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 焦点锚点与悬停都不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
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
  /** 矩阵网格：行列由作者给；不是 matrix 形态时为 null。 */
  matrixGrid: HeatmapMatrixGrid | null
  /** 最后一次被聚焦的那一格；从没聚焦过时为 null。 */
  focusedCell: HeatmapCellRef | null
  /** 最后一次被聚焦的那一天；矩阵形态下恒为 null。 */
  focusedDate: string | null
  /** 当下占着 Tab 位的那一格：锚点还在网格里就是它，否则退回文档序头一格。 */
  anchorCell: HeatmapCellRef | null
  /** 当下占着 Tab 位的那一天；矩阵形态下恒为 null。 */
  anchorDate: string | null
  /** 详情该显示哪一格的数据：身份、原始值、档位与色阶位置；不显示时为 null。 */
  activeCell: HeatmapCellDetails | null
  /** 详情条此刻是不是显示着。 */
  detailOpen: boolean
  /**
   * 对照条两端要写的那两个字，作者照它渲染 legend-label 部件。
   * 与 `getLegendLabelProps` 同源，改 translations 两处一起变。
   */
  legendText: { low: string, high: string }
  /** 按日期取一格；不在区间内给 null。矩阵形态下恒为 null。 */
  cellAt: (date: string) => HeatmapCellMeta | null
  /**
   * 挪动锚点。只改锚点不搬 DOM 焦点，也不派 `onCellFocus`；
   * 需要焦点跟着走的自行调用元素的 focus()。
   */
  setFocusedCell: (cell: HeatmapCellRef | null) => void
  /** 按日期挪动锚点，等同于 `setFocusedCell({ date })`。 */
  setFocusedDate: (date: string | null) => void
  getRootProps: () => T['element']
  getGridProps: () => T['element']
  getMonthBlockProps: (props: HeatmapMonthBlockProps) => T['element']
  getRowProps: (props: HeatmapRowProps) => T['element']
  getWeekDayLabelProps: (props: HeatmapWeekDayLabelProps) => T['element']
  getMonthLabelProps: (props: HeatmapMonthLabelProps) => T['element']
  getRowLabelProps: (props: HeatmapRowLabelProps) => T['element']
  getColumnLabelProps: (props: HeatmapColumnLabelProps) => T['element']
  getCellProps: (props: HeatmapCellProps) => T['element']
  getTooltipProps: () => T['element']
  getLegendProps: () => T['element']
  getLegendLabelProps: (props: HeatmapLegendLabelProps) => T['element']
  getLegendItemProps: (props: HeatmapLegendItemProps) => T['element']
}
