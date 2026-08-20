import type { Direction, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { HeatmapCellMeta, HeatmapDatum, HeatmapGrid } from './heatmap.grid'

/** 聚焦到某一天时报出去的信息：日期加上它的计数与档位，提示条直接拿去用。 */
export interface HeatmapCellFocusDetails {
  date: string
  count: number
  /** 0 到 levels-1；0 表示当天没有数据。 */
  level: number
}

/**
 * 格子自报家门：日期必报。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface HeatmapCellProps {
  /** ISO 日期串 YYYY-MM-DD。 */
  date: string
}

/** 一行自报家门。 */
export interface HeatmapRowProps {
  /** 行序 0-6，相对周首日；不给即网格之外那条月份行。 */
  weekDay?: number
}

/** 星期名自报家门。 */
export interface HeatmapWeekDayLabelProps {
  /** 行序 0-6；不给即月份行行首那个占位，它只负责让月份与格子对齐。 */
  weekDay?: number
}

/** 月份名自报家门。 */
export interface HeatmapMonthLabelProps {
  /** 月份身份 YYYY-MM，与网格给出的月份段对应。 */
  value: string
}

/** 图例的一格自报家门。 */
export interface HeatmapLegendItemProps {
  /** 该格代表第几档。 */
  level: number
}

/** 读屏用的文案，默认英文。 */
export interface HeatmapTranslations {
  /** 网格的可及名字：一片方格子自己说不出这是什么图。 */
  gridLabel: string
  /** 每格的可及名字：格子里没有文字，日期与数值只能从这里念出来。 */
  cellLabel: (details: HeatmapCellFocusDetails) => string
}

export interface HeatmapSchema extends MachineSchema {
  props: {
    /** 数据，一天一条；同一天出现多次即累加，日期串不合法的条目丢掉。 */
    value?: HeatmapDatum[]
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
     * DOM 焦点落到某一天时通知一次；同一天重复聚焦不重复通知。
     * 只由真实的聚焦触发，程序化挪锚点（`setFocusedDate`）不派这个回调。
     */
    onCellFocus?: (details: HeatmapCellFocusDetails) => void
  }
  context: {
    /**
     * roving 锚点：最后一次被聚焦的那一天，一直留着。
     * 焦点离开网格也不清空，Tab 回来才落回原处；从没聚焦过时为 null。
     */
    focusedDate: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 焦点锚点不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    | { type: 'CELL.FOCUS', date: string }
    | { type: 'FOCUS.SET', date: string | null }
  tag: never
  guard: never
  action: 'setFocusedDate'
  effect: never
}

export interface HeatmapApi<T extends PropTypes = PropTypes> {
  /** 网格模型：行是星期几、列是周次，另带月份段、星期名与档位标尺。 */
  grid: HeatmapGrid
  /** 最后一次被聚焦的那一天；从没聚焦过时为 null。 */
  focusedDate: string | null
  /** 当下占着 Tab 位的那一格：锚点还在区间里就是它，否则退回文档序头一格。 */
  anchorDate: string | null
  /** 按日期取一格；不在区间内给 null。 */
  cellAt: (date: string) => HeatmapCellMeta | null
  /**
   * 挪动锚点。只改锚点不搬 DOM 焦点，也不派 `onCellFocus`；
   * 需要焦点跟着走的自行调用元素的 focus()。
   */
  setFocusedDate: (date: string | null) => void
  getRootProps: () => T['element']
  getGridProps: () => T['element']
  getRowProps: (props: HeatmapRowProps) => T['element']
  getWeekDayLabelProps: (props: HeatmapWeekDayLabelProps) => T['element']
  getMonthLabelProps: (props: HeatmapMonthLabelProps) => T['element']
  getCellProps: (props: HeatmapCellProps) => T['element']
  getLegendProps: () => T['element']
  getLegendItemProps: (props: HeatmapLegendItemProps) => T['element']
}
