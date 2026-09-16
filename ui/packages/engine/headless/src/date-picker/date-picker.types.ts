/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 date picker 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { CalendarPickerApi, CalendarPickerSchema, CalendarPickerSelectionMode, CalendarPickerTranslations } from '../calendar-picker'
import type { DateFieldSchema, DateFieldSegmentProps, DateFieldSegmentState, DateSegmentSet } from '../date-field'
import type { CalendarGranularity, CalendarPeriodValue, CalendarView, CalendarViewChangeDetails } from '../shared/calendar'
import type { TimePickerColumn, TimePickerColumnUnit } from '../time-picker'
import type { DatePickerTimeGranularity } from './date-picker.time'

/** 值的来源；calendar 与 preset 两路参与选完即收起的判定，field 是段位输入。 */
export type DatePickerValueSource = 'calendar' | 'preset' | 'field' | 'api'

/**
 * 读屏文案，默认英文。内嵌日历的文案（今天）原样转交给日历。
 */
export interface DatePickerTranslations extends CalendarPickerTranslations {
  /** 快捷选项列的名字。 */
  presets: string
  /** 清空按钮的名字。 */
  clearTrigger: string
  /** 小时列的名字。 */
  hour: string
  /** 分钟列的名字。 */
  minute: string
  /** 秒列的名字。 */
  second: string
}

/**
 * 一条快捷选项。
 *
 * value 同时是写入的日期与该项的身份：单日是一条 ISO 日期串，多选用 `/` 拼接多天
 * （`2026-08-15/2026-08-21`）。日期由作者计算后传入，`date-picker.presets` 中提供
 * `datePickerPresetDay`。
 */
export interface DatePickerPreset {
  value: string
  /** 显示文案，同时是该项的可及名。 */
  label: string
  /** 禁用该项：方向键仍可停留，但按下不写值。 */
  disabled?: boolean
}

/** 一条快捷选项的当前状态，连接层计算后透出，各适配器按它渲染。 */
export interface DatePickerPresetState extends DatePickerPreset {
  /** 拆开的日期，单选恒为一条，多选可以多条。 */
  dates: string[]
  /**
   * 不可按下：作者标记了 disabled、日期数与选择模式不匹配（单选提供了多条）、
   * 或有日期落在 min / max 之外 / 被 isDateUnavailable 判定不可用。
   */
  disabled: boolean
  /** 当前选中集合的日期段与它逐位相同；showTime 下不比较时间段。 */
  selected: boolean
}

/** 选项声明自身是哪一条（值即身份）。 */
export interface DatePickerPresetProps {
  value: string
}

/** 内嵌时间面板的列单位：该面板恒为 24 小时制，没有上下午列。 */
export type DatePickerTimeUnit = Exclude<TimePickerColumnUnit, 'dayPeriod'>

/** 时间列声明自身的单位。 */
export interface DatePickerTimeColumnProps {
  unit: DatePickerTimeUnit
}

/** 时间选项声明所属的列与自身的值（两位补零的显示串）。 */
export interface DatePickerTimeItemProps {
  unit: DatePickerTimeUnit
  value: string
}

export interface DatePickerOpenChangeDetails {
  open: boolean
}

export interface DatePickerValueChangeDetails {
  /** 选中日期集合，ISO 串。单选模式下也是数组（长度 ≤ 1）。 */
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

export interface DatePickerSchema extends MachineSchema {
  props: {
    /**
     * 选中值，ISO 串。提供即受控：读取直取 prop，写入只发 onValueChange 不落内部值。
     * 单选可写裸串，内部一律归一为数组。
     */
    value?: string | string[]
    defaultValue?: string | string[]
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
    /** 选择模式，默认 single。区间选择是另一个组件（日期范围选择器）。 */
    selectionMode?: CalendarPickerSelectionMode
    /** 不可用判定，接收 ISO 串。界外与判定为真的日期同等处理。 */
    isDateUnavailable?: (value: string) => boolean
    /** 整个控件禁用：trigger 为原生 disabled，段位退出 Tab 序列，日历格子全部为 aria-disabled。 */
    disabled?: boolean
    /** 只读：浮层照常展开、日历照常翻月浏览，但选中值不可修改。 */
    readOnly?: boolean
    /**
     * 校验失败：段位报告 aria-invalid，各角色节点带 data-invalid。
     * 未提供时也会自行判定：已填齐但越界。
     */
    invalid?: boolean
    /** 必填标注，写入每一段的 aria-required。 */
    required?: boolean
    /** 表单字段名；提供后隐藏输入才带 name，ISO 串随表单一并提交。 */
    name?: string
    /** 选择粒度；与 selectionMode 正交。输入行与周期网格都由它决定。 */
    granularity?: CalendarGranularity
    /**
     * 面板当前所在的层级。提供即受控；未提供时跟随 granularity，每次展开都回到目标粒度。
     * 点击标题中的年 / 月会修改它。
     *
     * 没有配套的 defaultActiveView：面板每次展开都会重置该档，非受控初值没有生效时刻，
     * 提供后也观察不到任何效果。修改初始层级使用 granularity。
     */
    activeView?: CalendarView
    /**
     * 输入行铺设的段。未提供时按 granularity 推导：按周为「2026-33」、按月为「2026-05」、
     * 按季度为「2026-Q2」、按年为「2026」，按天则按 locale 排列年月日。
     */
    segments?: DateSegmentSet
    /**
     * 快捷选项（「今天」「明天」等）。提供后浮层中多出一列，点击即整份写入选中值。
     * 日期需计算后传入：连接层每帧求值，把 `today()` 放进渲染期会跨零点得出两个结果。
     * 与 selectionMode 不匹配（单选提供了多条）、落在 min / max 之外或被 isDateUnavailable 判定不可用的选项
     * 自动不可按下；showTime 下写入的日期附带当前已选的时间。
     */
    presets?: DatePickerPreset[]
    /** 展示的连续日历面板数；默认 1。 */
    visibleCount?: number
    /** 日历恒渲染六行，默认开启。关闭后网格按当月实际周数收缩，翻页时浮层高度随之变化。 */
    fixedWeeks?: boolean
    /**
     * 初始聚焦日，ISO 串；同时决定展开时先落在哪一页。
     * 未提供时回退为首个选中值，再回退为今天。表单重置回到该值。
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
    translations?: Partial<DatePickerTranslations>
    /** 选完即收起，默认 true。多选不收起。 */
    closeOnSelect?: boolean
    /**
     * 一体化时间：值升格为 'YYYY-MM-DDTHH:mm[:ss]'，面板中多出时间列，
     * 选完日期不收起、由确认按钮收口。只在 day + single 下生效。
     */
    showTime?: boolean
    /** showTime 的时间段精度，默认 minute。 */
    timeGranularity?: DatePickerTimeGranularity
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: DatePickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DatePickerOpenChangeDetails) => void
    /**
     * 聚焦日变化（方向键、翻月、展开、段位输入都会发出）。
     * 网格由外部渲染，不监听该事件时日历不会换月。
     */
    onFocusedValueChange?: (details: DatePickerFocusChangeDetails) => void
    /** 面板所在层级变化（点击标题向上、点击格子向下都会发出）；受控时是唯一出口。 */
    onActiveViewChange?: (details: CalendarViewChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 选中集合，恒为数组。受控（value 提供）时直读 prop。 */
    value: string[]
    /**
     * 聚焦日，ISO 串；同时决定日历展示哪个月。内嵌日历的聚焦日恒由这里受控。
     * null 表示尚未确定，由连接层回退为选中值或今天。
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
    /** 整体改写选中集合。src 决定是否一并收起浮层。 */
    | { type: 'VALUE.SET', value: string[], src?: DatePickerValueSource }
    | { type: 'VALUE.CLEAR' }
    /** 聚焦日改写：日历中移动焦点、翻月都经它回到编排状态机。 */
    | { type: 'FOCUSED.SET', value: string }
    /** 切换到另一层级：点击标题向上、点击格子向下，都由日历经它回到编排状态机。 */
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
 * 各状态机的句柄。编排状态机负责开合与两侧值同步，
 * 选日期 / 翻月 / 键盘导航归 calendar，分段输入归 date-field。
 */
export interface DatePickerServices {
  root: Service<DatePickerSchema>
  calendar: Service<CalendarPickerSchema>
  /** 分段输入。 */
  field: Service<DateFieldSchema>
}

/**
 * 内嵌分段输入对外暴露的部分。
 *
 * 不含 DateFieldApi 的 root / label / control：这三个部件由日期选择器自身的角色节点承担
 * （input 即 role=group 的分段容器）。
 */
export interface DatePickerFieldApi<T extends PropTypes = PropTypes> {
  /** ISO 串；段位未填齐时为 null。 */
  value: string | null
  /** 逐段投影，文档序即 locale 决定的段序。 */
  segments: DateFieldSegmentState[]
  /** 段位已填齐。 */
  complete: boolean
  /** 没有任何段已填。 */
  empty: boolean
  /** 已填齐但落在 min / max 之外。 */
  outOfRange: boolean
  /** 作者的声明（按下标或按段名）落在哪一段上；没有落点时缺席。 */
  segmentOf: (props: DateFieldSegmentProps) => DateFieldSegmentState | undefined
  getSegmentProps: (props: DateFieldSegmentProps) => T['element']
  /** 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

export interface DatePickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 选中集合，ISO 串；形状不随模式变化。 */
  value: string[]
  /** 首个选中值；无选中时为 null。 */
  valueAsString: string | null
  selectionMode: CalendarPickerSelectionMode
  /** single 的规范化周期值；multiple 没有连续区间语义，返回 null。 */
  periodValue: CalendarPeriodValue | null
  /** 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 */
  focusedValue: string
  /** 作者选择的粒度。 */
  granularity: CalendarGranularity
  /** 面板当前所在的层级。 */
  activeView: CalendarView
  disabled: boolean
  readOnly: boolean
  /** 校验失败：作者标记的或越界。 */
  invalid: boolean
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  clear: () => void
  /** 直接切换到某一层级。 */
  setActiveView: (next: CalendarView) => void
  /** 快捷选项逐条的状态，数据顺序。未提供 presets 时为空数组。 */
  presets: readonly DatePickerPresetState[]
  /** showTime 生效（已开启且为单选模式）。 */
  showTime: boolean
  /** 时间列（时 / 分[/ 秒]）；未开启 showTime 时为空数组。 */
  timeColumns: readonly TimePickerColumn<DatePickerTimeUnit>[]
  /** 当前时间段（'HH:mm[:ss]'）；尚无值时为 null。 */
  timeValue: string | null
  /** 内嵌日历：选日期、翻月、键盘导航都在它身上。 */
  calendar: CalendarPickerApi<T>
  /** 内嵌分段输入。 */
  field: DatePickerFieldApi<T>
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  /** role=group 的分段容器，段位挂在其中。 */
  getSegmentGroupProps: () => T['element']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 快捷选项列（role=listbox）；未提供 presets 时带 hidden。 */
  getPresetGroupProps: () => T['element']
  /** 一条快捷选项（role=option）：点击把整份日期写入选中值。 */
  getPresetProps: (props: DatePickerPresetProps) => T['element']
  /** 内嵌日历的挂载点，同时充当日历的根节点。 */
  getCalendarProps: () => T['element']
  /** 时间列容器（时 / 分[/ 秒]各一列）；未开启 showTime 时带 hidden。 */
  getTimeColumnProps: (props: DatePickerTimeColumnProps) => T['element']
  /** 时间选项：点击把该单位写入值（没有日期时以聚焦日作为日期段起值）。 */
  getTimeItemProps: (props: DatePickerTimeItemProps) => T['element']
  /** 确认按钮：showTime 的收口；未开启 showTime 时带 hidden。 */
  getConfirmTriggerProps: () => T['button']
}
