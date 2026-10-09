/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 date range picker 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { CalendarRangePickerApi, CalendarRangePickerSchema, CalendarRangePickerTranslations } from '../calendar-range-picker/calendar-range-picker.types'
import type { DateFieldSchema, DateSegmentPlaceholders, DateSegmentSet } from '../date-field/date-field.types'
import type { DatePickerTimeGranularity } from '../date-picker/date-picker.time'
import type { DatePickerFieldApi, DatePickerPreset, DatePickerPresetProps, DatePickerPresetState, DatePickerTimeUnit } from '../date-picker/date-picker.types'
import type { CalendarGranularity, CalendarPeriodValue, CalendarView, CalendarViewChangeDetails } from '../shared/calendar'
import type { ResolvedTimeStep, TimeStep, TimeUnavailablePredicate } from '../shared/time-constraint'
import type { TimeHourCycle } from '../time-field/time-field.types'
import type { TimePickerColumn } from '../time-picker/time-picker.types'

/**
 * 值的来源；calendar 与 preset 两路参与选完即收起的判定。
 * field 是起点段位组，field-end 是终点段位组，time 是 showTime 的时间列（按位写一端的时刻）。
 */
export type DateRangePickerValueSource = 'calendar' | 'preset' | 'field' | 'field-end' | 'time' | 'api'

/** 区间的哪一端：0 起点、1 终点。段位组、时间组与表单出口都按它归属。 */
export type DateRangePickerEndIndex = 0 | 1

/**
 * 读屏文案，默认英文。两组段位各是一个 role=group，各需要一个名字；
 * 内嵌日历的文案（选择区间的提示、区间两端的名字、今天）原样转交给日历。
 */
export interface DateRangePickerTranslations extends CalendarRangePickerTranslations {
  /** 起点段位组的名字。 */
  startDate: string
  /** 终点段位组的名字。 */
  endDate: string
  /** 快捷选项列的名字。 */
  presets: string
  /** 清空按钮的名字。 */
  clearTrigger: string
  /** showTime 下起点那组时间列的名字，也是那一组的小标题。 */
  startTime: string
  /** showTime 下终点那组时间列的名字，也是那一组的小标题。 */
  endTime: string
  /** 小时列的名字。 */
  hour: string
  /** 分钟列的名字。 */
  minute: string
  /** 秒列的名字。 */
  second: string
  /** 上下午列的名字（12 小时制下才有这一列）。 */
  dayPeriod: string
}

/**
 * 一条快捷选项：value 用 ISO 8601 的区间写法拼接两端（`2026-08-15/2026-08-21`），
 * 同时是该项的身份。`date-range-picker.presets` 中提供 `dateRangePickerPresetRange` / `-Month` / `-Year`。
 */
export type DateRangePickerPreset = DatePickerPreset
export type DateRangePickerPresetState = DatePickerPresetState
export type DateRangePickerPresetProps = DatePickerPresetProps

/**
 * 接了按压通道的部件，按 key 记住正被按住的那一个：清空钮、触发钮、确认钮各一，快捷选项按其值、
 * 时间格按「端:列:值」。日历里的部件由 calendar-range-picker 自己的机器记。
 */
export type DateRangePickerPressedKey
  = | 'clear'
    | 'trigger'
    | 'confirm'
    | `preset:${string}`
    | `time-item:${DateRangePickerEndIndex}:${DatePickerTimeUnit}:${string}`

/** 时间组声明自己是哪一端。 */
export interface DateRangePickerColumnGroupProps {
  index: DateRangePickerEndIndex
}

/** 时间列声明所属的端与单位。 */
export interface DateRangePickerTimeColumnProps {
  index: DateRangePickerEndIndex
  unit: DatePickerTimeUnit
}

/** 时间选项声明所属的端、列与自身的值（两位补零的显示串；上下午列写 '00' / '01'）。 */
export interface DateRangePickerTimeItemProps {
  index: DateRangePickerEndIndex
  unit: DatePickerTimeUnit
  value: string
}

/** 格子上显示的内容与端无关，只取决于单位与值。 */
export interface DateRangePickerTimeItemTextProps {
  unit: DatePickerTimeUnit
  value: string
}

/** 一端的时间列：起点组与终点组各自成组并排在浮层中。 */
export interface DateRangePickerTimeColumnGroup {
  readonly index: DateRangePickerEndIndex
  /** 这一组的小标题，取 translations.startTime / endTime。 */
  readonly label: string
  /** 时 / 分[/ 秒][/ 上下午]，格按步进取样；未开启 showTime 时为空数组。 */
  readonly columns: readonly TimePickerColumn<DatePickerTimeUnit>[]
}

export interface DateRangePickerActiveIndexChangeDetails {
  activeIndex: DateRangePickerEndIndex
}

/** 分段容器声明身份：0 是起点组、1 是终点组。 */
export interface DateRangePickerSegmentGroupProps {
  /** 默认 0。 */
  index?: 0 | 1
}

export interface DateRangePickerOpenChangeDetails {
  open: boolean
}

export interface DateRangePickerValueChangeDetails {
  /**
   * 区间两端，ISO 串，按位存放：只落下起点时长度为 1，只落下终点时为 ['', 终点]，
   * 两端都存在时长度为 2。
   */
  value: string[]
}

export interface DateRangePickerFocusChangeDetails {
  /** 新的聚焦日，ISO 串。它同时决定日历展示哪个月。 */
  focusedValue: string
}

// 适配器挂载前填入；保持缺省时副作用一律短路，机器状态照常转移。
export interface DateRangePickerRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control）。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点，同时是查找聚焦日格子的查询容器。 */
  getContentEl: () => HTMLElement | null
}

export interface DateRangePickerSchema extends MachineSchema {
  props: {
    /**
     * 区间两端，ISO 串。提供即受控：读取直取 prop，写入只发 onValueChange 不落内部值。
     * 按位存放，空缺的一端为空串。
     */
    value?: string[]
    defaultValue?: string[]
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 可选范围下界（含当天），ISO 串。日历与分段输入共用这一条。 */
    min?: string
    /** 可选范围上界（含当天），ISO 串。 */
    max?: string
    /**
     * 决定周首日、月份文案与段位先后（zh-CN 年月日、en-US 月日年）。
     * 未提供时按宿主语言，宿主也没有时按 en-US。
     */
    locale?: string
    /** 判定今天与格式化文案使用的时区，默认取宿主本地时区。 */
    timeZone?: string
    /**
     * 周首日，0 = 星期日 … 6 = 星期六（与日历选择器同一套写法）；不给按 locale。
     * 只改浮层日历的表头、每一行的行首与 Home / End，月份名、星期名与段位先后仍按 locale。
     */
    firstDayOfWeek?: number
    /**
     * 不可用判定，接收 ISO 串。界外与判定为真的日期同等处理。
     * 第二个参数是区间选到一半时的起点，其余时候为 null。
     */
    isDateUnavailable?: (value: string, anchor: string | null) => boolean
    /** 区间允许跨过不可用的日期，默认关闭；关闭时落下起点之后只能选到两侧最近的不可用日为止。 */
    allowsNonContiguousRanges?: boolean
    /** 整个控件禁用：trigger 为原生 disabled，段位退出 Tab 序列，日历格子全部为 aria-disabled。 */
    disabled?: boolean
    /** 只读：浮层照常展开、日历照常翻月浏览，但选中值不可修改。 */
    readOnly?: boolean
    /**
     * 校验失败：段位报告 aria-invalid，各角色节点带 data-invalid。
     * 未提供时也会自行判定：任一端越界，或终点早于起点。
     */
    invalid?: boolean
    /** 必填标注，写入每一段的 aria-required。 */
    required?: boolean
    /** 起点隐藏输入的表单字段名；提供后才带 name，ISO 串随表单一并提交。 */
    name?: string
    /** 终点隐藏输入的表单字段名；未提供时终点不参与提交。 */
    endName?: string
    /** 逐段的占位串，两组段位共用，覆盖内置的 yyyy / mm / dd。 */
    placeholder?: DateSegmentPlaceholders
    /** 起点那组段位的整条占位：一段都没填、焦点也不在段上时显示这句文字（「开始日期」），焦点进到段上即换回段位。 */
    startPlaceholder?: string
    /** 终点那组段位的整条占位，规则同 startPlaceholder。 */
    endPlaceholder?: string
    /** 选择粒度。输入行与周期网格都由它决定。 */
    granularity?: CalendarGranularity
    /**
     * 面板当前所在的层级。提供即受控；未提供时跟随 granularity，每次展开都回到目标粒度。
     * 点击标题中的年 / 月会修改它。
     */
    activeView?: CalendarView
    /**
     * 输入行铺设的段。未提供时按 granularity 推导：按周为「2026-33」、按月为「2026-05」、
     * 按季度为「2026-Q2」、按年为「2026」，按天则按 locale 排列年月日。
     */
    segments?: DateSegmentSet
    /**
     * 快捷选项（「近 7 天」「本月」等）。提供后浮层中多出一列，点击即整份写入两端。
     * 日期需计算后传入：连接层每帧求值，把 `today()` 放进渲染期会跨零点得出两个结果。
     * 不是恰好两端、落在 min / max 之外或被 isDateUnavailable 判定不可用的选项自动不可按下。
     */
    presets?: DateRangePickerPreset[]
    /** 展示的连续日历面板数；默认 1。起止常跨月，并排两页时显式提供 2。 */
    visibleCount?: number
    /** 日历恒渲染六行，默认开启。关闭后网格按当月实际周数收缩，翻页时浮层高度随之变化。 */
    fixedWeeks?: boolean
    /**
     * 初始聚焦日，ISO 串；同时决定展开时先落在哪一页。
     * 未提供时回退为起点，再回退为今天。表单重置回到该值。
     */
    defaultFocusedValue?: string
    /** 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，输入行与浮层中的日历格一并换档。 */
    size?: Size
    placement?: Placement
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    translations?: Partial<DateRangePickerTranslations>
    /** 选完即收起，默认 true。两端都落定才视为选完；showTime 下不收，由确认按钮收口。 */
    closeOnSelect?: boolean
    /**
     * 一体化时间：两端都升格为 'YYYY-MM-DDTHH:mm[:ss]'（不带时区），输入行两组段位带上时刻段，
     * 浮层里起止各多出一组时间列，选完日期不收起、由确认按钮收口。只在 granularity=day 下生效。
     * 此时 min / max 可以带时间段：日历按日期段收，时间列在与它同一天时按时间段标不可选。
     */
    showTime?: boolean
    /** showTime 的时间段精度，默认 minute。 */
    timeGranularity?: DatePickerTimeGranularity
    /** showTime 的小时制，缺省按 locale 推断（与 TimePicker 同一口径，没给 locale 时 24）。12 时两组时间列多出上下午列、两组段位多出上下午段。 */
    hourCycle?: TimeHourCycle
    /** showTime 时间列按单位的步进：`{ hour?, minute?, second? }`，各单位缺省 1。 */
    timeStep?: TimeStep
    /**
     * showTime 时间列的逐格可选性。value 是两位补零的格值，时列恒按 24 小时制给出；
     * context 带这一端已选的时（24 小时制）与分、这一端所属的日期与端号（index）。
     * 判定为真的格子仍可聚焦，只是按不下去。起止同一天时，终点列早于起点的时刻另由组件自己标不可选。
     */
    isTimeUnavailable?: TimeUnavailablePredicate
    /**
     * showTime 下只点日期时两端各补的时刻，例如 `['00:00:00', '23:59:59']`（区间查询最常用）。
     * 只补还没有时刻的那一端：已挑过时刻的一端换日期时时刻原样留着。按 timeGranularity 归一，写坏的一端按零点补。
     */
    defaultTime?: [string, string]
    /**
     * 当前编辑区间的哪一端。提供即受控；未提供时每次展开都重新定：从终点那组段位展开为 1，其余为 0。
     * 聚焦某一组段位、点某一端的时间格时随之改写。为 1 且已有起点时日历只改终点：
     * 点在起点那一天或之后即落终点、起点不动，点在起点之前从那一天重新开始挑。
     *
     * 没有配套的 defaultActiveIndex：它每次展开都会重定，非受控初值没有生效时刻。
     */
    activeIndex?: DateRangePickerEndIndex
    /** 当前编辑的一端变化；受控时是唯一出口。 */
    onActiveIndexChange?: (details: DateRangePickerActiveIndexChangeDetails) => void
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: DateRangePickerValueChangeDetails) => void
    /** 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。 */
    onClear?: () => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DateRangePickerOpenChangeDetails) => void
    /**
     * 聚焦日变化（方向键、翻月、展开、段位输入都会发出）。
     * 网格由外部渲染，不监听该事件时日历不会换月。
     */
    onFocusedValueChange?: (details: DateRangePickerFocusChangeDetails) => void
    /** 面板所在层级变化（点击标题向上、点击格子向下都会发出）；受控时是唯一出口。 */
    onActiveViewChange?: (details: CalendarViewChangeDetails) => void
  }
  context: {
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，content 投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /**
     * 区间两端，恒为数组。受控（value 提供）时直读 prop。
     * 段位按位写入：下标即起止两端，空缺的一端为空串。
     */
    value: string[]
    /**
     * 聚焦日，ISO 串；同时决定日历展示哪个月。内嵌日历的聚焦日恒由这里受控。
     * null 表示尚未确定，由连接层回退为起点或今天。
     */
    focusedValue: string | null
    /** 面板当前所在的层级。受控（activeView 提供）时 cell 直读 prop。 */
    activeView: CalendarView
    /** 收起时是否把焦点归还给展开前的控件；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /**
     * 本轮展开是否把焦点移入浮层。
     * 点击输入行展开时为假：该操作的意图是编辑段位，移走焦点后无法输入。
     */
    moveFocusIn: boolean
    /**
     * 按压通道：Space / Enter 或触屏手指按下到松开之间正被按住的那一个，该部件投影 data-pressed；
     * 没有按住时为 null。抬起、失焦、指针取消或浮层收起时即撤下。
     */
    pressed: DateRangePickerPressedKey | null
    /** 当前编辑区间的哪一端。受控（activeIndex 提供）时 cell 直读 prop。 */
    activeIndex: DateRangePickerEndIndex
    /** 最近一次写值的来源；时间列只改时刻，交给日历的日期不跟着换数组。 */
    writeSource: DateRangePickerValueSource | null
  }
  computed: Record<string, never>
  refs: DateRangePickerRefs
  state: 'open' | 'closed'
  event:
    // src 记下这次是从哪儿展开的：点输入行那一路不把焦点搬进浮层（用户点段位是为了打字）；
    // index 是从哪一组段位展开的，定下本轮先编辑哪一端
    | { type: 'OPEN', src?: 'trigger' | 'control', index?: DateRangePickerEndIndex }
    | { type: 'TOGGLE', src?: 'trigger' | 'control', index?: DateRangePickerEndIndex }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 整体改写两端。src 决定是否一并收起浮层。 */
    | { type: 'VALUE.SET', value: string[], src?: DateRangePickerValueSource }
    | { type: 'VALUE.CLEAR' }
    /** 聚焦日改写：日历中移动焦点、翻月都经它回到编排状态机。 */
    | { type: 'FOCUSED.SET', value: string }
    /** 切换到另一层级：点击标题向上、点击格子向下，都由日历经它回到编排状态机。 */
    | { type: 'VIEW.SET', activeView: CalendarView }
    /** 改写当前编辑的一端：聚焦段位组、点时间格都经它。 */
    | { type: 'ACTIVE_INDEX.SET', activeIndex: DateRangePickerEndIndex }
    | { type: 'FORM.RESET' }
    /**
     * 按压通道（shared/press）：某个部件被 Space / Enter 或触屏按住，key 说的是哪一个；
     * disabled 是 connect 按该部件自己的可按性（快捷选项的逐条禁用、清空钮的可清）带来的事实。
     */
    | { type: 'PRESS.START', key: DateRangePickerPressedKey, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只收自己那一下。 */
    | { type: 'PRESS.END', key: DateRangePickerPressedKey }
  tag: never
  guard: 'isOpenControlled' | 'closesOnSelect' | 'canPress'
  action:
    | 'followColumnSelection'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
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
    | 'setActiveIndex'
    | 'setEntryIndex'
    | 'focusSelectedDay'
    | 'resetToDefault'
    | 'clearOpenedAtMount'
  effect: 'trackPosition' | 'trackLayer' | 'trackColumnScroll'
}

/**
 * 各状态机的句柄。编排状态机负责开合与两侧值同步，
 * 选区间 / 翻月 / 键盘导航归 calendar-range-picker，两组分段输入各归一台 date-field。
 */
export interface DateRangePickerServices {
  root: Service<DateRangePickerSchema>
  calendar: Service<CalendarRangePickerSchema>
  /** 起点段位组。 */
  field: Service<DateFieldSchema>
  /** 终点段位组。 */
  fieldEnd: Service<DateFieldSchema>
}

/** 内嵌分段输入对外暴露的部分，与日期选择器同一形状。 */
export type DateRangePickerFieldApi<T extends PropTypes = PropTypes> = DatePickerFieldApi<T>

export interface DateRangePickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 区间两端，ISO 串；按位存放，空缺的一端为空串。 */
  value: string[]
  /** 起点；未填时为 null。 */
  start: string | null
  /** 终点；未填时为 null。 */
  end: string | null
  /** 两端都落定时的规范化周期值；缺少一端时为 null。 */
  periodValue: CalendarPeriodValue | null
  /** 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 */
  focusedValue: string
  /** 作者选择的粒度。 */
  granularity: CalendarGranularity
  /** 面板当前所在的层级。 */
  activeView: CalendarView
  disabled: boolean
  readOnly: boolean
  /** 校验失败：作者标记的、任一端越界，或终点早于起点。 */
  invalid: boolean
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  clear: () => void
  /** 直接切换到某一层级。 */
  setActiveView: (next: CalendarView) => void
  /** 快捷选项逐条的状态，数据顺序。未提供 presets 时为空数组。 */
  presets: readonly DateRangePickerPresetState[]
  /** 当前编辑区间的哪一端。 */
  activeIndex: DateRangePickerEndIndex
  /** 直接改写当前编辑的一端。 */
  setActiveIndex: (next: DateRangePickerEndIndex) => void
  /** showTime 生效（已开启且 granularity=day）。 */
  showTime: boolean
  /** 起止两组时间列；未开启 showTime 时两组的列都是空数组。 */
  timeColumnGroups: readonly [DateRangePickerTimeColumnGroup, DateRangePickerTimeColumnGroup]
  /** 两端各自的时间段（'HH:mm[:ss]'）；那一端还没有时刻时为 null。 */
  timeValues: readonly [string | null, string | null]
  /** 时间列与时刻段实际生效的小时制。 */
  hourCycle: TimeHourCycle
  /** 实际生效的按单位步进。 */
  timeStep: ResolvedTimeStep
  /** 某一格显示的文字：数字列即格值，上下午列按 locale 给出「上午 / 下午」。各适配器都用它填字。 */
  getTimeItemText: (props: DateRangePickerTimeItemTextProps) => string
  /** 某一格按不下去：界外、被 isTimeUnavailable 判为不可用、终点早于同一天的起点，或整个控件禁用。 */
  isTimeItemDisabled: (props: DateRangePickerTimeItemProps) => boolean
  /** 内嵌日历：选区间、翻月、键盘导航都在它身上。 */
  calendar: CalendarRangePickerApi<T>
  /** 起点分段输入。 */
  field: DateRangePickerFieldApi<T>
  /** 终点分段输入。 */
  fieldEnd: DateRangePickerFieldApi<T>
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  /** role=group 的分段容器，段位挂在其中。index 选择起止两组，不传即起点。 */
  getSegmentGroupProps: (props?: DateRangePickerSegmentGroupProps) => T['element']
  /** 起止输入之间的视觉分隔。 */
  getRangeSeparatorProps: () => T['element']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 快捷选项列（role=listbox）；未提供 presets 时带 hidden。 */
  getPresetGroupProps: () => T['element']
  /** 一条快捷选项（role=option）：点击把整段区间写入两端。 */
  getPresetProps: (props: DateRangePickerPresetProps) => T['element']
  /** 内嵌日历的挂载点，同时充当日历的根节点。 */
  getCalendarProps: () => T['element']
  /** 一端的时间列外壳（role=group）：起止各一个并排，data-index 区分，各报「开始时间」「结束时间」；未开启 showTime 时带 hidden。 */
  getColumnGroupProps: (props: DateRangePickerColumnGroupProps) => T['element']
  /** 时间组顶部的小标题，纯视觉，退出可访问树。 */
  getColumnGroupLabelProps: (props: DateRangePickerColumnGroupProps) => T['element']
  /** 一端的一列（role=listbox）：时 / 分[/ 秒][/ 上下午]。 */
  getTimeColumnProps: (props: DateRangePickerTimeColumnProps) => T['element']
  /** 时间选项：点击把该单位写进这一端的时刻（那一端还没有日期时借另一端的日期，再没有就用聚焦日）。 */
  getTimeItemProps: (props: DateRangePickerTimeItemProps) => T['element']
  /** 浮层底部的操作区：放在 content 中、排在面板主体之后，确认按钮通常写在这里；不进入任何集合的拥有关系，方向键也无法到达。 */
  getFooterProps: () => T['element']
  /** 确认按钮：showTime 的收口；未开启 showTime 时带 hidden。 */
  getConfirmTriggerProps: () => T['button']
}
