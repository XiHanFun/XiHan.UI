import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { CalendarDay, CalendarWeekDay } from './calendar.grid'

/**
 * 焦点模型：roving tabindex，不做 aria-activedescendant 变体。
 * 焦点落在 cell-trigger 上，聚焦日那一格 tabindex=0，其余为 -1。
 */
export type CalendarFocusModel = 'roving-tabindex'

/**
 * 选择模式：
 * - single：一次只中一天，点击与确认键都是「替换」；
 * - multiple：多天复选，点击与确认键都是「切换」，选中集合按日期升序；
 * - range：先点起点再点终点，中间态只有起点一个值，落终点时收成两端。
 */
export type CalendarSelectionMode = 'single' | 'multiple' | 'range'

/** 表头缩写的粒度：narrow 是单字（一 / S），short 是短写（周一 / Sun）。 */
export type CalendarWeekdayFormat = 'narrow' | 'short'

export interface CalendarValueChangeDetails {
  /**
   * 选中日期集合，ISO 串。单选模式下也是数组（长度 ≤ 1），形状不随模式变；
   * range 挑到一半时长度为 1（只有起点）。
   */
  value: string[]
}

export interface CalendarFocusChangeDetails {
  /** 新的聚焦日，ISO 串。它同时决定展示哪个月。 */
  focusedValue: string
}

/**
 * 格子自报家门：哪一天由作者在部件上声明，connect 据此产出属性。
 * connect 在 render 期求值，此时 DOM 尚不存在，不得读 DOM。
 */
export interface CalendarCellProps {
  /** ISO 日期串。 */
  value: string
}

/** 表头列自报身份：列序号 0-6，行首为 0。 */
export interface CalendarWeekDayProps {
  value: number
}

export interface CalendarRefs {
  /** 网格容器，由适配器注入；无 DOM 环境返回 null，机器照常跑、只是不搬焦点。 */
  getGridEl: () => HTMLElement | null
  /** 机器是否还活着：搬焦点的延迟回调撤不回，卸载后仍会跑，据此认账。 */
  alive: boolean
}

export interface CalendarSchema extends MachineSchema {
  props: {
    /**
     * 选中值，ISO 串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     * 单选写成裸串是简写，内部一律归一成数组。
     */
    value?: string | string[]
    defaultValue?: string | string[]
    selectionMode?: CalendarSelectionMode
    /**
     * 当前聚焦的那天，ISO 串；它同时决定展示哪个月。给定即受控。
     * 缺省时退回首个选中值，再退回今天。
     */
    focusedValue?: string
    defaultFocusedValue?: string
    /** 可选范围下界（含当天），ISO 串。界外的日子转 aria-disabled，但仍可聚焦。 */
    min?: string
    /** 可选范围上界（含当天），ISO 串。 */
    max?: string
    /** 作者给的不可用判定，收 ISO 串。返回真的日子与界外日子同等对待。 */
    isDateUnavailable?: (value: string) => boolean
    /** 决定周首日与月份/星期几的文案，默认 zh-CN。 */
    locale?: string
    /** 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 */
    timeZone?: string
    /** 整张日历禁用：翻月按钮转原生 disabled，格子全转 aria-disabled，键盘与点击都不改值。 */
    disabled?: boolean
    /** 只读：翻月与移动焦点照常，只是选不动值。 */
    readOnly?: boolean
    /** 表头缩写粒度，默认 short。 */
    weekdayFormat?: CalendarWeekdayFormat
    /** 恒渲染六行，默认按当月实际周数。开着能让翻月时网格高度不跳。 */
    fixedWeeks?: boolean
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: CalendarValueChangeDetails) => void
    /** 聚焦日变化（方向键、翻页、点了邻月的日子都会发）；受控时是唯一出口。 */
    onFocusedValueChange?: (details: CalendarFocusChangeDetails) => void
  }
  context: {
    /** 选中集合，恒为数组。受控（value 给定）时 cell 直读 prop。 */
    value: string[]
    /** 聚焦日。受控（focusedValue 给定）时 cell 直读 prop；为空时由 connect 兜底。 */
    focusedValue: string | null
    /** 区间挑选的起点：已落下起点、还没落终点时非空。 */
    rangeAnchor: string | null
    /** 指针悬停的那天，只在挑区间时用来预览；不受控、不对外通知。 */
    hoveredValue: string | null
  }
  computed: Record<string, never>
  refs: CalendarRefs
  /** 选中值与聚焦日不编码进状态，机器只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写选中集合（外部 setValue 走它），不动区间起点。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 选中某一天：单选替换、多选切换、区间落点。 */
    | { type: 'CELL.SELECT', value: string }
    /**
     * 聚焦日改写（方向键、翻页、点格子、格子获得焦点都会发）。
     * restoreFocus 表示这一下是网格内的键盘操作，机器据此把 DOM 焦点搬到落点那一格。
     * 只能用事件自带的这个意图，不能事后回读 activeElement：跨月重渲后旧格子已被摘掉、焦点早退回 body，
     * 而重渲发生在读 DOM 之前还是之后取决于宿主调度。
     */
    | { type: 'FOCUS.SET', value: string, restoreFocus?: boolean }
    | { type: 'HOVER.SET', value: string }
    | { type: 'HOVER.CLEAR' }
  tag: never
  guard: never
  action: 'setValue' | 'selectCell' | 'setFocusedValue' | 'setHoveredValue' | 'clearHoveredValue' | 'focusVisibleCell'
  effect: 'trackLiveness'
}

export interface CalendarApi<T extends PropTypes = PropTypes> {
  /** 选中集合，ISO 串；形状不随模式变。 */
  value: string[]
  selectionMode: CalendarSelectionMode
  /** 生效的聚焦日（三路收口后的结果），恒非空。 */
  focusedValue: string
  /** 展示月：年、月（1-12）、月首日 ISO。 */
  visibleMonth: { year: number, month: number, startValue: string }
  /** 日期矩阵，作者照它渲染 week-row / cell / cell-trigger。 */
  weeks: CalendarDay[][]
  /** 七列表头，作者照它渲染 week-day。 */
  weekDays: CalendarWeekDay[]
  /** 展示月的标题文案（如 2024年2月），作者写进 heading 部件。 */
  headingLabel: string
  disabled: boolean
  readOnly: boolean
  isSelected: (value: string) => boolean
  /** 界外或作者判定不可用。禁用的日历下恒为真。 */
  isUnavailable: (value: string) => boolean
  /** 上一月是否还有可看的日子（整张禁用或整月都在 min 之前即为假）。 */
  canGoPrev: boolean
  canGoNext: boolean
  setValue: (next: string[]) => void
  select: (value: string) => void
  /** 改写聚焦日；跨月会连带换掉展示月。 */
  focus: (value: string) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getHeadingProps: () => T['element']
  getGridProps: () => T['element']
  getGridHeadProps: () => T['element']
  getWeekDayProps: (props: CalendarWeekDayProps) => T['element']
  getGridBodyProps: () => T['element']
  getWeekRowProps: () => T['element']
  getCellProps: (props: CalendarCellProps) => T['element']
  getCellTriggerProps: (props: CalendarCellProps) => T['element']
}
