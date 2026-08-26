import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { CalendarDay, CalendarPeriodCell, CalendarView, CalendarWeekDay } from './calendar.grid'

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

export interface CalendarViewChangeDetails {
  /** 面板此刻铺的是哪一档格子。 */
  activeView: CalendarView
}

/**
 * 格子自报家门：哪一天由作者在部件上声明，connect 据此产出属性。
 * connect 在 render 期求值，此时 DOM 尚不存在，不得读 DOM。
 */
export interface CalendarCellProps {
  /** ISO 日期串。 */
  value: string
  /**
   * 这一格属于第几个面板，默认 0。多面板时必须给：
   * 同一天会同时出现在两个面板里（8 月末那几天也铺在 9 月的首行），
   * 「是不是本月」只有连着面板一起看才判得出来。
   */
  index?: number
}

/** 周序号格自报它是哪一行：值取那一行行首那天的 ISO 串。 */
export interface CalendarWeekNumberProps {
  value: string
}

/** 表头列自报身份：列序号 0-6，行首为 0。 */
export interface CalendarWeekDayProps {
  value: number
}

/** 面板自报自己是第几个，默认 0。 */
export interface CalendarPanelProps {
  index?: number
}

/** 并排展示的一个面板。单面板时就是 panels[0]。 */
export interface CalendarPanel {
  /** 第几个，0 起。 */
  index: number
  year: number
  /** 1-12；粗粒度视图下是这一页跨度的首月。 */
  month: number
  /** 这一页跨度首日的 ISO 串。 */
  startValue: string
  /** 日期矩阵；view 不是 day 时为空数组。 */
  weeks: CalendarDay[][]
  /**
   * 与 weeks 逐行对应的 ISO 周序号（周一起算）。view 不是 day 时为空数组。
   * 周选时把它渲染成行首那一列，人才看得出挑的是第几周。
   */
  weekNumbers: number[]
  /** 月 / 季度 / 年的格子；view 是 day 时为空数组。 */
  cells: CalendarPeriodCell[]
  /** 这个面板的标题文案（2024年2月 / 2024年 / 2020-2029）。 */
  headingLabel: string
  /**
   * 标题里年那一截（2026年 / 2026）。年视图下是整个十年跨度（2020年-2029年）——
   * 那一层已经到顶，钻不上去了。
   */
  headingYear: string
  /** 标题里月那一截（2月 / February）。不在日视图时是空串。 */
  headingMonth: string
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
    /** 决定周首日与月份/星期几的文案，不给按宿主语言，宿主也没有时按 en-US。 */
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
    /**
     * 挑的粒度：天（默认）、月、季度、年。这一档也是「点一格就是选中」的那一档。
     *
     * 格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态——
     * min/max 比较、区间逻辑、不可用判定、表单出口于是全都原样复用。
     */
    view?: CalendarView
    /**
     * 面板此刻铺的是哪一档格子。给定即受控（date-picker 就是这么持有它的）。
     *
     * 它与 view 是两件事：view 是作者要挑的粒度，这个是人钻到了哪一层。
     * 点标题里的年会把它抬到 year，再点一格就往 view 那一档钻回去；到了 view 那一档，
     * 点一格才是选中。缺省即等于 view。
     */
    activeView?: CalendarView
    /** 非受控初值，缺省同 view。 */
    defaultActiveView?: CalendarView
    /**
     * 周选：点任意一天选中它所在的整周，值落成 [周首日, 周末日]。
     * 只在 view=day 且 selectionMode=range 下生效。
     */
    weekSelection?: boolean
    /**
     * 并排展示几个连续月，默认 1。区间选择给 2 才好挑——起止常跨月，
     * 一个面板要来回翻页。翻页时整窗一起走一个月，不是各翻各的。
     * 小于 1 的写法回落到 1。
     */
    visibleCount?: number
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: CalendarValueChangeDetails) => void
    /** 聚焦日变化（方向键、翻页、点了邻月的日子都会发）；受控时是唯一出口。 */
    onFocusedValueChange?: (details: CalendarFocusChangeDetails) => void
    /** 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 */
    onActiveViewChange?: (details: CalendarViewChangeDetails) => void
  }
  context: {
    /** 选中集合，恒为数组。受控（value 给定）时 cell 直读 prop。 */
    value: string[]
    /** 聚焦日。受控（focusedValue 给定）时 cell 直读 prop；为空时由 connect 兜底。 */
    focusedValue: string | null
    /**
     * 视窗最左那个面板的月首日 ISO 串；null 表示还没定过，由连接层按聚焦日反推。
     *
     * 它与聚焦日是两件事：聚焦日只在走出视窗时才把视窗拽过去。多面板下这条尤其要紧——
     * 点第二个面板里的日子，聚焦日落到了下个月，若视窗跟着走，整窗就会往后推一格，
     * 看着就像「点一下翻一页、选不中」。
     */
    visibleStart: string | null
    /** 面板此刻铺哪一档格子。受控（activeView 给定）时 cell 直读 prop。 */
    activeView: CalendarView
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
    | { type: 'FOCUS.SET', value: string, months?: number, restoreFocus?: boolean }
    /** 钻到另一层：点标题往上、点格子往下。restoreFocus 表示这一下是键盘/指针操作，焦点要跟到新格子上。 */
    | { type: 'VIEW.SET', activeView: CalendarView, restoreFocus?: boolean }
    | { type: 'HOVER.SET', value: string }
    | { type: 'HOVER.CLEAR' }
  tag: never
  guard: never
  action: 'setValue' | 'selectCell' | 'setFocusedValue' | 'setActiveView' | 'syncActiveView' | 'dropStaleRangeAnchor' | 'pageVisibleStart' | 'setHoveredValue' | 'clearHoveredValue' | 'focusVisibleCell'
  effect: 'trackLiveness'
}

export interface CalendarApi<T extends PropTypes = PropTypes> {
  /** 选中集合，ISO 串；形状不随模式变。 */
  value: string[]
  selectionMode: CalendarSelectionMode
  /** 生效的聚焦日（三路收口后的结果），恒非空。 */
  focusedValue: string
  /** 并排展示的面板，长度即 visibleCount。作者照它渲染几张网格。 */
  panels: CalendarPanel[]
  /** 首个面板的展示月：年、月（1-12）、月首日 ISO。多面板时是最左那个。 */
  visibleMonth: { year: number, month: number, startValue: string }
  /** 首个面板的日期矩阵。多面板请改用 panels。 */
  weeks: CalendarDay[][]
  /** 七列表头，作者照它渲染 week-day。 */
  weekDays: CalendarWeekDay[]
  /** 首个面板的标题文案（如 2024年2月）。多面板请改用 panels。 */
  headingLabel: string
  /** 作者要挑的粒度。 */
  view: CalendarView
  /** 面板此刻铺的是哪一档格子。等于 view 时点一格就是选中，粗过 view 时点一格是往下钻。 */
  activeView: CalendarView
  /**
   * 标题里年与月在这个语言里的先后（zh-CN 是年在前，en-US 是月在前）。
   * 手写标记时照它摆两个钮的顺序，标题读起来才顺。
   */
  headingOrder: readonly ('year' | 'month')[]
  /** 点标题里的年钻不钻得上去：年视图已到顶，钻不上去。 */
  canZoomOutYear: boolean
  /** 点标题里的月钻不钻得上去：只有日视图有月这一截。 */
  canZoomOutMonth: boolean
  disabled: boolean
  readOnly: boolean
  isSelected: (value: string) => boolean
  /** 界外或作者判定不可用。禁用的日历下恒为真。 */
  isUnavailable: (value: string) => boolean
  /** 上一页是否还有可看的日子（整张禁用或整页都在 min 之前即为假）。 */
  canGoPrev: boolean
  canGoNext: boolean
  /** 大步翻（« / »）此刻能不能按。判据同上，只是步长换成大步。 */
  canGoPrevYear: boolean
  canGoNextYear: boolean
  setValue: (next: string[]) => void
  select: (value: string) => void
  /** 改写聚焦日；跨月会连带换掉展示月。 */
  focus: (value: string) => void
  /** 直接钻到某一层。 */
  setActiveView: (next: CalendarView) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  /** 大步翻：日视图走一年，月/季度走十年，年视图走一百年。 */
  goToPrevYear: () => void
  goToNextYear: () => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  getPrevYearTriggerProps: () => T['button']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getNextYearTriggerProps: () => T['button']
  getHeadingProps: (props?: CalendarPanelProps) => T['element']
  /** 标题里年那一截，点它钻到十年格。年视图下已到顶，转原生 disabled。 */
  getHeadingYearTriggerProps: (props?: CalendarPanelProps) => T['button']
  /** 标题里月那一截，点它钻到月格。不在日视图时带 hidden（那一层没有月这一截）。 */
  getHeadingMonthTriggerProps: (props?: CalendarPanelProps) => T['button']
  getGridProps: (props?: CalendarPanelProps) => T['element']
  getGridHeadProps: () => T['element']
  getWeekDayProps: (props: CalendarWeekDayProps) => T['element']
  getGridBodyProps: () => T['element']
  getWeekRowProps: () => T['element']
  /** 周序号格：行首那一列，语义上是这一行的表头（role=rowheader）。 */
  getWeekNumberProps: (props: CalendarWeekNumberProps) => T['element']
  /** 这一行该显示的周序号文字。两个适配器都拿它填文本，保证同构。 */
  getWeekNumberText: (props: CalendarWeekNumberProps) => string
  getCellProps: (props: CalendarCellProps) => T['element']
  getCellTriggerProps: (props: CalendarCellProps) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface CalendarTranslations {}
