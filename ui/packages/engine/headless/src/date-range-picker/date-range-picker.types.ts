/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 date range picker 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { CalendarRangePickerApi, CalendarRangePickerSchema, CalendarRangePickerTranslations } from '../calendar-range-picker'
import type { DateFieldSchema, DateSegmentSet } from '../date-field'
import type { DatePickerFieldApi, DatePickerPreset, DatePickerPresetProps, DatePickerPresetState } from '../date-picker'
import type { CalendarGranularity, CalendarPeriodValue, CalendarView, CalendarViewChangeDetails } from '../shared/calendar'

/**
 * 值的来源；calendar 与 preset 两路参与「选完即收起」判定。
 * field 是起点那组段位，field-end 是终点那组。
 */
export type DateRangePickerValueSource = 'calendar' | 'preset' | 'field' | 'field-end' | 'api'

/**
 * 读屏用的文案，默认英文。两组段位各是一个 role=group，各要一个名字；
 * 内嵌日历那几句（挑区间的提示、区间两端的名字、今天）原样转交给日历。
 */
export interface DateRangePickerTranslations extends CalendarRangePickerTranslations {
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
 * 一条快捷选项：value 用 ISO 8601 的区间写法把两端拼起来（`2026-08-15/2026-08-21`），
 * 同时是这一项的身份。`date-range-picker.presets` 里备了 `dateRangePickerPresetRange` / `-Month` / `-Year`。
 */
export type DateRangePickerPreset = DatePickerPreset
export type DateRangePickerPresetState = DatePickerPresetState
export type DateRangePickerPresetProps = DatePickerPresetProps

/** 分段容器自报家门：0 是起点那组、1 是终点那组。 */
export interface DateRangePickerSegmentGroupProps {
  /** 默认 0。 */
  index?: 0 | 1
}

export interface DateRangePickerOpenChangeDetails {
  open: boolean
}

export interface DateRangePickerValueChangeDetails {
  /**
   * 区间两端，ISO 串，按位存放：只落起点时长度为 1，只落终点时是 ['', 终点]，
   * 两端都在时长度为 2。
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
  /** 视觉退场与行为资源共享的 Presence；缺省时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control）。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点，同时是「找到聚焦日那一格」的查询容器。 */
  getContentEl: () => HTMLElement | null
}

export interface DateRangePickerSchema extends MachineSchema {
  props: {
    /**
     * 区间两端，ISO 串。给定即受控：读直取 prop，写只发 onValueChange 不落内部值。
     * 按位存放，空缺的那一端是空串。
     */
    value?: string[]
    defaultValue?: string[]
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
    /**
     * 不可用判定，收 ISO 串。界外与它判真的日子同等对待。
     * 第二个参数是区间挑到一半时的起点，其余时候为 null。
     */
    isDateUnavailable?: (value: string, anchor: string | null) => boolean
    /** 区间允许跨过不可用的日子，默认关；关着时落了起点之后只能挑到两侧最近的不可用日为止。 */
    allowsNonContiguousRanges?: boolean
    /** 整个控件禁用：trigger 转原生 disabled，段位退出 Tab 序，日历格子全转 aria-disabled。 */
    disabled?: boolean
    /** 只读：浮层照常展开、日历照常翻月浏览，但选中值改不动。 */
    readOnly?: boolean
    /**
     * 校验失败：段位报 aria-invalid，各角色节点带 data-invalid。
     * 不给也会自己判：任一端越界、或终点早于起点。
     */
    invalid?: boolean
    /** 必填标注，落到每一段的 aria-required 上。 */
    required?: boolean
    /** 起点那份隐藏输入的表单字段名；给了才带 name，ISO 串随表单一并提交。 */
    name?: string
    /** 终点那份隐藏输入的表单字段名；不给即终点不参与提交。 */
    endName?: string
    /** 选择粒度。输入行与周期网格都由它决定。 */
    granularity?: CalendarGranularity
    /**
     * 面板此刻钻到了哪一层。给定即受控；缺省跟着 granularity，每次展开都回到目标粒度。
     * 点标题里的年 / 月会改它。
     */
    activeView?: CalendarView
    /**
     * 输入行铺哪几段。不给就按 granularity 推：按周出「2026-33」、按月出「2026-05」、
     * 按季度出「2026-Q2」、按年出「2026」，按天则按 locale 排年月日。
     */
    segments?: DateSegmentSet
    /**
     * 快捷选项（「近 7 天」「本月」这类）。给了就在浮层里多出一列，点一下整份写进两端。
     * 日子要算好再传：连接层每帧求值，把 `today()` 放进渲染期会跨零点算出两个答案。
     * 不是恰好两端、落在 min/max 之外或被 isDateUnavailable 判掉的那条自动按不下去。
     */
    presets?: DateRangePickerPreset[]
    /** 展示几个连续日历面板；默认 1。起止常跨月，并排两页时显式给 2。 */
    visibleCount?: number
    /** 日历恒渲染六行，默认开。关掉后网格按当月实际周数收，翻页时浮层高度会跟着变。 */
    fixedWeeks?: boolean
    /**
     * 初始聚焦日，ISO 串；它同时决定展开时先落在哪一页。
     * 不给就退回起点，再退回今天。表单重置回到这一份。
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
    translations?: Partial<DateRangePickerTranslations>
    /** 选完即收起，默认 true。要两端都落定才算选完。 */
    closeOnSelect?: boolean
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: DateRangePickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DateRangePickerOpenChangeDetails) => void
    /**
     * 聚焦日变化（方向键、翻月、展开、段位输入都会发）。
     * 网格由外部渲染，不监听这条日历不会换月。
     */
    onFocusedValueChange?: (details: DateRangePickerFocusChangeDetails) => void
    /** 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 */
    onActiveViewChange?: (details: CalendarViewChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /**
     * 区间两端，恒为数组。受控（value 给定）时直读 prop。
     * 段位按位写入：下标即起止两端，空缺的那一端是空串。
     */
    value: string[]
    /**
     * 聚焦日，ISO 串；同时决定日历展示哪个月。内嵌日历的聚焦日恒由这里受控。
     * null 表示还没定过，由连接层退回起点或今天。
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
  refs: DateRangePickerRefs
  state: 'open' | 'closed'
  event:
    // src 记下这次是从哪儿展开的：点输入行那一路不把焦点搬进浮层（用户点段位是为了打字）
    | { type: 'OPEN', src?: 'trigger' | 'control' }
    | { type: 'TOGGLE', src?: 'trigger' | 'control' }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 整体改写两端。src 决定要不要顺手收起浮层。 */
    | { type: 'VALUE.SET', value: string[], src?: DateRangePickerValueSource }
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
 * 选区间/翻月/键盘导航归 calendar-range-picker，两组分段输入各归一台 date-field。
 */
export interface DateRangePickerServices {
  root: Service<DateRangePickerSchema>
  calendar: Service<CalendarRangePickerSchema>
  /** 起点那组段位。 */
  field: Service<DateFieldSchema>
  /** 终点那组段位。 */
  fieldEnd: Service<DateFieldSchema>
}

/** 内嵌分段输入对外露出的那一面，与日期选择器同一形状。 */
export type DateRangePickerFieldApi<T extends PropTypes = PropTypes> = DatePickerFieldApi<T>

export interface DateRangePickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 区间两端，ISO 串；按位存放，空缺的那一端是空串。 */
  value: string[]
  /** 起点；没填时为 null。 */
  start: string | null
  /** 终点；没填时为 null。 */
  end: string | null
  /** 两端都落定时的规范化周期值；缺一端为 null。 */
  periodValue: CalendarPeriodValue | null
  /** 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 */
  focusedValue: string
  /** 作者要挑的粒度。 */
  granularity: CalendarGranularity
  /** 面板此刻钻到了哪一层。 */
  activeView: CalendarView
  disabled: boolean
  readOnly: boolean
  /** 校验失败：作者标的、任一端越界、或终点早于起点。 */
  invalid: boolean
  /** 清空按钮此刻可不可按。 */
  canClear: boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  clear: () => void
  /** 直接钻到某一层。 */
  setActiveView: (next: CalendarView) => void
  /** 快捷选项逐条的样子，数据顺序。没给 presets 时为空数组。 */
  presets: readonly DateRangePickerPresetState[]
  /** 内嵌日历：选区间、翻月、键盘导航都在它身上。 */
  calendar: CalendarRangePickerApi<T>
  /** 起点那组分段输入。 */
  field: DateRangePickerFieldApi<T>
  /** 终点那组分段输入。 */
  fieldEnd: DateRangePickerFieldApi<T>
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  /** role=group 的分段容器，段位挂在它里面。index 选起止两组，不传即起点。 */
  getSegmentGroupProps: (props?: DateRangePickerSegmentGroupProps) => T['element']
  /** 起止输入之间的视觉分隔。 */
  getRangeSeparatorProps: () => T['element']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 快捷选项列（role=listbox）；没给 presets 时带 hidden。 */
  getPresetGroupProps: () => T['element']
  /** 一条快捷选项（role=option）：点按把整段区间写进两端。 */
  getPresetProps: (props: DateRangePickerPresetProps) => T['element']
  /** 内嵌日历的挂载点，同时充当日历的根节点。 */
  getCalendarProps: () => T['element']
}
