import type { Cleanup, ControlVariant, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema, Service } from '@xihan-ui/machine'
import type { CalendarApi, CalendarSchema, CalendarSelectionMode, CalendarView, CalendarViewChangeDetails } from '../calendar'
import type { DateFieldSchema, DateFieldSegmentProps, DateFieldSegmentState, DateSegmentSet } from '../date-field'
import type { TimePickerColumn, TimePickerColumnUnit } from '../time-picker'
import type { DatePickerTimeGranularity } from './date-picker.time'

/**
 * 值的来源；calendar 与 preset 两路参与「选完即收起」判定。
 * field 是起点那组段位，field-end 是终点那组（只在区间模式下有）。
 */
export type DatePickerValueSource = 'calendar' | 'preset' | 'field' | 'field-end' | 'api'

/** 读屏用的文案，默认英文。区间模式下两组段位各是一个 role=group，各要一个名字。 */
export interface DatePickerTranslations {
  /** 起点那组段位的名字。 */
  startDate: string
  /** 终点那组段位的名字。 */
  endDate: string
  /** 快捷选项那一列的名字。 */
  presets: string
  /** 清空按钮的名字。 */
  clearTrigger: string
}

/**
 * 一条快捷选项。
 *
 * value 同时是写进去的日期与这一项的身份：单日是一条 ISO 日期串，区间用 ISO 8601 的
 * 区间写法把两端拼起来（`2026-08-15/2026-08-21`）。日子由作者算好传进来，
 * `date-picker.presets` 里备了几个纯函数（`datePickerPresetDay` / `-Range` / `-Month` / `-Year`）。
 */
export interface DatePickerPreset {
  value: string
  /** 显示文案，同时是这一项的可及名字。 */
  label: string
  /** 禁用这一项：方向键仍能停上去，但按下不写值。 */
  disabled?: boolean
}

/** 一条快捷选项此刻的样子，连接层算好后透出，两个适配器照它渲染。 */
export interface DatePickerPresetState extends DatePickerPreset {
  /** 拆开的日期，长度 1 是单日、2 是区间。 */
  dates: string[]
  /**
   * 按不下去：作者标了 disabled、日期数与选择模式不配（单选给了区间）、
   * 或有哪一天落在 min/max 之外 / 被 isDateUnavailable 判掉。
   */
  disabled: boolean
  /** 当前选中集合的日期段与它逐位相同；showTime 下不看时间段。 */
  selected: boolean
}

/** 选项自报自己是哪一条（值即身份）。 */
export interface DatePickerPresetProps {
  value: string
}

/** 分段容器自报家门：区间模式下 0 是起点那组、1 是终点那组。 */
export interface DatePickerSegmentGroupProps {
  /** 默认 0。 */
  index?: 0 | 1
}

/** 内嵌时间面板的列单位：这份面板恒为 24 小时制，没有上下午那一列。 */
export type DatePickerTimeUnit = Exclude<TimePickerColumnUnit, 'dayPeriod'>

/** 时间列自报自己是哪一个单位。 */
export interface DatePickerTimeColumnProps {
  unit: DatePickerTimeUnit
}

/** 时间选项自报所属的列与自己的值（两位补零的显示串）。 */
export interface DatePickerTimeItemProps {
  unit: DatePickerTimeUnit
  value: string
}

export interface DatePickerOpenChangeDetails {
  open: boolean
}

export interface DatePickerValueChangeDetails {
  /**
   * 选中日期集合，ISO 串。单选模式下也是数组（长度 ≤ 1）。
   * 区间按位存放：只落起点时长度为 1，只落终点时是 ['', 终点]。
   */
  value: string[]
}

export interface DatePickerFocusChangeDetails {
  /** 新的聚焦日，ISO 串。它同时决定日历展示哪个月。 */
  focusedValue: string
}

// 适配器挂载前填入；保持缺省时副作用一律短路，机器状态照常转移。
export interface DatePickerRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control）。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点，同时是「找到聚焦日那一格」的查询容器。 */
  getContentEl: () => HTMLElement | null
}

export interface DatePickerSchema extends MachineSchema {
  props: {
    /**
     * 选中值，ISO 串。给定即受控：读直取 prop，写只发 onValueChange 不落内部值。
     * 单选可写裸串，内部一律归一成数组。
     */
    value?: string | string[]
    defaultValue?: string | string[]
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 可选范围下界（含当天），ISO 串。日历与分段输入共用这一条。 */
    min?: string
    /** 可选范围上界（含当天），ISO 串。 */
    max?: string
    /**
     * 决定周首日、月份文案与段位先后（zh-CN 年月日、en-US 月日年）。
     * 不给按宿主语言，宿主也没有时按 en-US。
     */
    locale?: string
    /** 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 */
    timeZone?: string
    /** 选择模式，默认 single；区间模式下两端都落定才算选完。 */
    selectionMode?: CalendarSelectionMode
    /** 不可用判定，收 ISO 串。界外与它判真的日子同等对待。 */
    isDateUnavailable?: (value: string) => boolean
    /** 整个控件禁用：trigger 转原生 disabled，段位退出 Tab 序，日历格子全转 aria-disabled。 */
    disabled?: boolean
    /** 只读：浮层照常展开、日历照常翻月浏览，但选中值改不动。 */
    readOnly?: boolean
    /** 校验失败：段位报 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 必填标注，落到每一段的 aria-required 上。 */
    required?: boolean
    /** 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。区间模式下是起点那一份。 */
    name?: string
    /** 区间终点那份隐藏输入的表单字段名；不给即终点不参与提交。 */
    endName?: string
    /**
     * 挑的粒度：天（默认）、月、季度、年。格子的值仍是 ISO 日期串
     * （那段时间的第一天），min/max 与区间逻辑因此原样复用。
     *
     * 输入行铺哪几段也跟着它走（按季度挑就出「2026-Q2」），要另铺见 segments。
     */
    view?: CalendarView
    /**
     * 面板此刻钻到了哪一层。给定即受控；缺省跟着 view，每次展开都回到 view 那一档。
     * 点标题里的年 / 月会改它。
     *
     * 没有配套的 defaultActiveView：面板每次展开都会重置这一档，非受控初值没有生效的时刻，
     * 发出去也观察不到任何效果。要改初始层级请用 view。
     */
    activeView?: CalendarView
    /**
     * 输入行铺哪几段。不给就按 view 推：按月挑出「2026-05」、按季度出「2026-Q2」、
     * 按年出「2026」、周选出「2026-33」，按天挑则按 locale 排年月日。
     */
    segments?: DateSegmentSet
    /** 周选：点任意一天选中它所在的整周。只在 view=day 且区间模式下生效。 */
    weekSelection?: boolean
    /**
     * 快捷选项（「今天」「近 7 天」这类）。给了就在浮层里多出一列，点一下整份写进选中值。
     * 日子要算好再传：连接层每帧求值，把 `today()` 放进渲染期会跨零点算出两个答案。
     * 与 selectionMode 不配（单选给了区间）、落在 min/max 之外或被 isDateUnavailable 判掉的那条
     * 自动按不下去；showTime 下写进去的日期带上此刻已挑的时间。
     */
    presets?: DatePickerPreset[]
    /**
     * 并排展示几个连续月。单选恒 1；区间按已选的两端定：同一页里放得下就 1，跨页才 2。
     * 还只落了一端时按 2 算——另一端常在下一页，一张面板得来回翻。
     */
    visibleCount?: number
    /** 日历恒渲染六行，默认开。关掉后网格按当月实际周数收，翻页时浮层高度会跟着变。 */
    fixedWeeks?: boolean
    /**
     * 初始聚焦日，ISO 串；它同时决定展开时先落在哪一页。
     * 不给就退回首个选中值，再退回今天。表单重置回到这一份。
     */
    defaultFocusedValue?: string
    /** 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，输入行与浮层里的日历格一并换档。 */
    size?: Size
    placement?: Placement
    /** 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    translations?: Partial<DatePickerTranslations>
    /** 选完即收起，默认 true。区间模式下要两端都落定才算选完。 */
    closeOnSelect?: boolean
    /**
     * 一体化时间：值升格为 'YYYY-MM-DDTHH:mm[:ss]'，面板里多出时间列，
     * 选完日子不收起、由确认按钮收口。只在单选模式下生效。
     */
    showTime?: boolean
    /** showTime 的时间段精度，默认 minute。 */
    timeGranularity?: DatePickerTimeGranularity
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: DatePickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DatePickerOpenChangeDetails) => void
    /**
     * 聚焦日变化（方向键、翻月、展开、段位输入都会发）。
     * 网格由外部渲染，不监听这条日历不会换月。
     */
    onFocusedValueChange?: (details: DatePickerFocusChangeDetails) => void
    /** 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 */
    onActiveViewChange?: (details: CalendarViewChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /**
     * 选中集合，恒为数组。受控（value 给定）时直读 prop。
     * 区间模式下段位按位写入：下标即起止两端，空缺的那一端是空串。
     */
    value: string[]
    /**
     * 聚焦日，ISO 串；同时决定日历展示哪个月。内嵌日历的聚焦日恒由这里受控。
     * null 表示还没定过，由连接层退回选中值或今天。
     */
    focusedValue: string | null
    /** 面板此刻钻到了哪一层。受控（activeView 给定）时 cell 直读 prop。 */
    activeView: CalendarView
    /** 收起时是否把焦点归还给展开前那个控件；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /**
     * 这一轮展开要不要把焦点搬进浮层。
     * 点输入行展开时为假：那一下的用意是编辑段位，抢走焦点就打不了字了。
     */
    moveFocusIn: boolean
  }
  computed: Record<string, never>
  refs: DatePickerRefs
  state: 'open' | 'closed'
  event:
    // src 记下这次是从哪儿展开的：点输入行那一路不把焦点搬进浮层（用户点段位是为了打字）
    | { type: 'OPEN', src?: 'trigger' | 'control' }
    | { type: 'TOGGLE', src?: 'trigger' | 'control' }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 整体改写选中集合。src 决定要不要顺手收起浮层。 */
    | { type: 'VALUE.SET', value: string[], src?: DatePickerValueSource }
    | { type: 'VALUE.CLEAR' }
    /** 聚焦日改写：日历里移动焦点、翻月都会经它回到编排机。 */
    | { type: 'FOCUSED.SET', value: string }
    /** 钻到另一层：点标题往上、点格子往下，都由日历经它回到编排机。 */
    | { type: 'VIEW.SET', activeView: CalendarView }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isOpenControlled' | 'closesOnSelect'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setReturnFocus'
    | 'setMoveFocusIn'
    | 'setValue'
    | 'clearValue'
    | 'setFocusedValue'
    | 'syncFocusedValue'
    | 'setActiveView'
    | 'resetActiveView'
    | 'focusSelectedDay'
    | 'resetToDefault'
  effect: 'trackPosition' | 'trackLayer'
}

/**
 * 各台机器的把手。编排机管开合与两侧值同步，
 * 选日期/翻月/键盘导航归 calendar，分段输入归 date-field。
 */
export interface DatePickerServices {
  root: Service<DatePickerSchema>
  calendar: Service<CalendarSchema>
  /** 起点那组段位。 */
  field: Service<DateFieldSchema>
  /** 终点那组段位；缺席即区间模式下没有终点输入。 */
  fieldEnd?: Service<DateFieldSchema>
}

/**
 * 内嵌分段输入对外露出的那一面。
 *
 * 不含 DateFieldApi 的 root / label / control：这三个部件由日期选择器自己的角色节点承担
 * （input 即 role=group 的分段容器）。
 */
export interface DatePickerFieldApi<T extends PropTypes = PropTypes> {
  /** ISO 串；段位没填齐时是 null。 */
  value: string | null
  /** 逐段投影，文档序即 locale 决定的段序。 */
  segments: DateFieldSegmentState[]
  /** 段位填齐了。 */
  complete: boolean
  /** 一段都没填。 */
  empty: boolean
  /** 填齐了但落在 min/max 之外。 */
  outOfRange: boolean
  /** 作者的那一句声明（按下标或按段名）落在哪一段上；没有落点时缺席。 */
  segmentOf: (props: DateFieldSegmentProps) => DateFieldSegmentState | undefined
  getSegmentProps: (props: DateFieldSegmentProps) => T['element']
  /** 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

export interface DatePickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /**
   * 选中集合，ISO 串；形状不随模式变。
   * 区间模式下按位存放，空缺的那一端是空串。
   */
  value: string[]
  /** 首个选中值（跳过空缺的那一端）；无选中时为 null。 */
  valueAsString: string | null
  selectionMode: CalendarSelectionMode
  /** 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 */
  focusedValue: string
  /** 作者要挑的粒度。 */
  view: CalendarView
  /** 面板此刻钻到了哪一层。 */
  activeView: CalendarView
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 清空按钮此刻可不可按。 */
  canClear: boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  clear: () => void
  /** 直接钻到某一层。 */
  setActiveView: (next: CalendarView) => void
  /** 快捷选项逐条的样子，数据顺序。没给 presets 时为空数组。 */
  presets: readonly DatePickerPresetState[]
  /** showTime 生效（开了且是单选模式）。 */
  showTime: boolean
  /** 时间列（时/分[/秒]）；没开 showTime 时为空数组。 */
  timeColumns: readonly TimePickerColumn<DatePickerTimeUnit>[]
  /** 当前时间段（'HH:mm[:ss]'）；还没有值时为 null。 */
  timeValue: string | null
  /** 内嵌日历：选日期、翻月、键盘导航都在它身上。 */
  calendar: CalendarApi<T>
  /** 内嵌分段输入，区间模式下是起点那一组。 */
  field: DatePickerFieldApi<T>
  /** 终点那组分段输入；非区间模式为 null。 */
  fieldEnd: DatePickerFieldApi<T> | null
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  /** role=group 的分段容器，段位挂在它里面。区间模式下 index 选起止两组，不传即起点。 */
  getSegmentGroupProps: (props?: DatePickerSegmentGroupProps) => T['element']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 快捷选项列（role=listbox）；没给 presets 时带 hidden。 */
  getPresetsProps: () => T['element']
  /** 一条快捷选项（role=option）：点按把整份日期写进选中值。 */
  getPresetProps: (props: DatePickerPresetProps) => T['element']
  /** 内嵌日历的挂载点，同时充当日历的根节点。 */
  getCalendarProps: () => T['element']
  /** 时间列容器（时/分[/秒]各一列）；没开 showTime 时带 hidden。 */
  getTimeColumnProps: (props: DatePickerTimeColumnProps) => T['element']
  /** 时间选项：点按把该单位写进值（没有日期时以聚焦日为日期段起值）。 */
  getTimeItemProps: (props: DatePickerTimeItemProps) => T['element']
  /** 确认按钮：showTime 的收口；没开 showTime 时带 hidden。 */
  getConfirmTriggerProps: () => T['button']
}
