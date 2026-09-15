/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 time range picker 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { TimeDayPeriod, TimeDraft, TimeGranularity, TimeHourCycle, TimeSegmentType } from '../time-field'
import type { TimePickerColumn, TimePickerColumnUnit, TimePickerFocusIntent } from '../time-picker'

/** 区间的哪一端：0 起点、1 终点。两组段位、两组时列、两份表单出口都按它归属。 */
export type TimeRangePickerEndIndex = 0 | 1

/** 段的声明：所属的端与段。 */
export interface TimeRangePickerSegmentProps {
  index: TimeRangePickerEndIndex
  segment: TimeSegmentType
}

/** 起止各一组段位容器与各一份表单出口，依靠它归属到对应的端。 */
export interface TimeRangePickerEndProps {
  index: TimeRangePickerEndIndex
}

/** 列声明所属的端与单位。 */
export interface TimeRangePickerColumnProps {
  index: TimeRangePickerEndIndex
  unit: TimePickerColumnUnit
}

/** 选项声明所属的端、列与自身的值（两位补零的显示串）。 */
export interface TimeRangePickerItemProps {
  index: TimeRangePickerEndIndex
  unit: TimePickerColumnUnit
  value: string
}

/** 格子上显示的内容与端无关，只取决于单位与值。 */
export interface TimeRangePickerItemTextProps {
  unit: TimePickerColumnUnit
  value: string
}

/** 一端的时列：起点组与终点组各自成组并排在浮层中。 */
export interface TimeRangePickerColumnGroup {
  readonly index: TimeRangePickerEndIndex
  readonly columns: readonly TimePickerColumn[]
}

/** 焦点所在的段：哪一端的哪一段。 */
export interface TimeRangePickerSegmentRef {
  index: TimeRangePickerEndIndex
  segment: TimeSegmentType
}

/** 焦点所在的列：哪一端的哪一列。 */
export interface TimeRangePickerColumnRef {
  index: TimeRangePickerEndIndex
  unit: TimePickerColumnUnit
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface TimeRangePickerRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control），浮层因此与输入框对齐而不是只贴近某一组段位。 */
  getAnchorEl: () => HTMLElement | null
  /** 盒内可聚焦的触发按钮。锚点取的是整个输入行（不可聚焦），归还焦点需要落到它身上。 */
  getTriggerEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是列组、列与选项的查询容器。 */
  getContentEl: () => HTMLElement | null
}

export interface TimeRangePickerOpenChangeDetails {
  open: boolean
}

export interface TimeRangePickerValueChangeDetails {
  /**
   * 区间两端 `[start, end]`，每端是 ISO 时间串（'13:45' 或 '13:45:30'，形状随 granularity）。
   * 按位存放：只填终点时为 `['', '18:00']`；尾部的空缺裁掉，只填起点时为 `['09:00']`；两端都空时为 `[]`。
   */
  value: string[]
}

/**
 * 一条快捷选项。value 用 ISO 8601 的区间写法拼接两端（`'09:00/18:00'`），同时是该项的身份。
 * 时刻由作者计算后传入，`timeRangePickerPresetValue` 用于拼接。
 */
export interface TimeRangePickerPreset {
  value: string
  /** 显示文案，同时是该项的可及名。 */
  label: string
  /** 禁用该项：方向键仍可停留，但按下不写值。 */
  disabled?: boolean
}

/** 一条快捷选项的当前状态，连接层计算后透出，各适配器按它渲染。 */
export interface TimeRangePickerPresetState extends TimeRangePickerPreset {
  /** 归一为组件值形状的两端（'9:00/18:00' → ['09:00', '18:00']）；不是恰好两端或无法解析时为 null。 */
  times: readonly [string, string] | null
  /** 不可按下：作者标记了 disabled、无法解析、任一端落在 min / max 之外、或终点早于起点。step 只裁剪列表，不限制它。 */
  disabled: boolean
  /** 当前两端与它相同（按归一后的串比较）。 */
  selected: boolean
}

/** 选项声明自身是哪一条（值即身份）。 */
export interface TimeRangePickerPresetProps {
  value: string
}

export interface TimeRangePickerSchema extends MachineSchema {
  props: {
    /** 受控的区间两端 `[start, end]`；空缺的一端用空串占位。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 */
    value?: string[]
    defaultValue?: string[]
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 下界（含）。把浮层中落在界外的选项标为禁用，并把已填的越界值标注出来（不改写它）。终点组还以起点为下界。 */
    min?: string
    /** 上界（含）。同上。起点组还以终点为上界。 */
    max?: string
    /** BCP 47 语言标记。决定上午 / 下午的文字，以及未显式提供 hourCycle 时的小时制。 */
    locale?: string
    /** 小时制。未提供时按 locale 推断，locale 也没有时使用 24。 */
    hourCycle?: TimeHourCycle
    /** 值精确到哪一段，默认 minute。它同时决定两组分段输入各显示几段、浮层中各排几列。 */
    granularity?: TimeGranularity
    /** 分列的步进（分钟），默认 1。只影响浮层中的可选值，不限制手动输入的分钟数。 */
    step?: number
    /**
     * 快捷选项（「上午」「全天」等）。提供后浮层中多出一列，点击即两端整份写入值并收起。
     * 时刻需计算后传入：连接层每帧求值，把当前时刻放进渲染期会每帧得出一个新结果。
     * 无法解析、不是恰好两端、任一端落在 min / max 之外或终点早于起点的选项自动不可按下。
     */
    presets?: TimeRangePickerPreset[]
    /** 禁用：两组分段输入整组退出 Tab 序列、触发器使用原生 disabled，隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：浮层照常展开、列表照常浏览，但值不可修改也不可清空。 */
    readOnly?: boolean
    /** 校验失败标注。未提供时也会自行判定：任一端越界，或终点早于起点。 */
    invalid?: boolean
    /** 必填标注（写入每段的 aria-required）。 */
    required?: boolean
    /** 起点隐藏输入的表单字段名；提供后才带 name。 */
    name?: string
    /** 终点隐藏输入的表单字段名；未提供时终点不参与提交。 */
    endName?: string
    /** 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，输入行与浮层中的格子一并换档。 */
    size?: Size
    placement?: Placement
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    /**
     * 逐值可选性。接收两位补零的值、所属的列与端：同一个 '30' 在分钟列与秒列含义不同，
     * 起点与终点也可以各有规则。与 min / max 的界外值同等处理：判定为真的格子仍可聚焦，只是不可选中。
     */
    isTimeUnavailable?: (value: string, unit: TimePickerColumnUnit, index: TimeRangePickerEndIndex) => boolean
    /** 段位与两端读屏名的覆盖；未提供时使用内置英文语义名。 */
    translations?: Partial<TimeRangePickerTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: TimeRangePickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TimeRangePickerOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 区间两端，按位存放，空缺的一端为空串。受控（value 提供）时 cell 直读 prop。 */
    value: string[]
    /**
     * 两端各自的逐段编辑缓冲，分段输入与浮层选中写入的是同一份。
     * 只在该端的值不是可解析的时间时才用它显示。
     */
    drafts: readonly [TimeDraft, TimeDraft]
    /** 焦点所在的段（哪一端的哪一段）；焦点在分段输入之外时为 null。同时是段间 roving tabindex 的锚点。 */
    focusedSegment: TimeRangePickerSegmentRef | null
    /** 当前段已输入的数字串。换段、加减、清段、在浮层中选中都会清除它。 */
    typeBuffer: string
    /** 焦点所在的列（哪一端的哪一列）；浮层收起时为 null。 */
    focusedColumn: TimeRangePickerColumnRef | null
    /** 焦点所在列中的选项值；浮层收起时为 null。 */
    focusedItem: string | null
    /** 本轮展开的入口，决定是否预落锚点。指针与命令式入口都是 selected。 */
    focusIntent: TimePickerFocusIntent
    /** 关闭时是否把焦点归还触发器；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /**
     * 本轮展开是否把焦点移入浮层。
     * 点击输入行展开时为假：该操作的意图是编辑段位，移走焦点后无法输入。
     */
    moveFocusIn: boolean
  }
  computed: Record<string, never>
  refs: TimeRangePickerRefs
  state: 'open' | 'closed'
  event:
    // focus 是本次展开的落点意图，缺省 selected（指针与命令式入口都走它）；
    // src 记下这次是从哪儿展开的：点输入行那一路不把焦点搬进浮层（用户点段位是为了打字）
    | { type: 'OPEN', focus?: TimePickerFocusIntent, src?: 'trigger' | 'control' }
    | { type: 'TOGGLE', focus?: TimePickerFocusIntent, src?: 'trigger' | 'control' }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 整份替换两端（外部 setValue 与快捷选项）；无法解析的一端等同于清空。src 为 preset 时一并收起浮层。 */
    | { type: 'VALUE.SET', value: string[], src?: 'preset' }
    /** 清空两端所有段。 */
    | { type: 'VALUE.CLEAR' }
    /** 上下键：把某一端的某一段加减一格，越界回绕。 */
    | { type: 'SEGMENT.STEP', index: TimeRangePickerEndIndex, segment: TimeSegmentType, delta: 1 | -1 }
    /** 数字直输：把一位数字并入当前段的输入缓冲。 */
    | { type: 'SEGMENT.DIGIT', index: TimeRangePickerEndIndex, segment: TimeSegmentType, digit: string }
    /** 清除某一端的某一段。 */
    | { type: 'SEGMENT.CLEAR', index: TimeRangePickerEndIndex, segment: TimeSegmentType }
    /** 直接指定某一端的上午 / 下午（按 a/p 键）。 */
    | { type: 'SEGMENT.PERIOD', index: TimeRangePickerEndIndex, period: TimeDayPeriod }
    | { type: 'SEGMENT.FOCUS', index: TimeRangePickerEndIndex, segment: TimeSegmentType }
    | { type: 'SEGMENT.BLUR' }
    /** 焦点落到某个选项上（roving tabindex 的锚点随之移动）。 */
    | { type: 'OPTION.FOCUS', index: TimeRangePickerEndIndex, unit: TimePickerColumnUnit, value: string }
    /** 选中某一端某列的一个值：只修改该段，浮层不收起（其余列仍需继续选择）。 */
    | { type: 'ITEM.SELECT', index: TimeRangePickerEndIndex, unit: TimePickerColumnUnit, value: string }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isOpenControlled' | 'canEdit' | 'closesOnPreset'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setReturnFocus'
    | 'setFocusIntent'
    | 'setMoveFocusIn'
    | 'setInitialFocusedItem'
    | 'setFocusedItem'
    | 'clearFocusedItem'
    | 'selectItem'
    | 'setValue'
    | 'clearValue'
    | 'stepSegment'
    | 'typeDigit'
    | 'clearSegment'
    | 'setPeriod'
    | 'setFocusedSegment'
    | 'clearFocusedSegment'
    | 'syncDrafts'
    | 'resetToDefault'
  effect: 'trackPosition' | 'trackLayer'
}

export interface TimeRangePickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 区间两端，按位存放；空缺的一端为空串，尾部的空缺裁掉。 */
  value: string[]
  /** 起点的 ISO 时间串；尚未填全时为 null。 */
  start: string | null
  /** 终点的 ISO 时间串；尚未填全时为 null。 */
  end: string | null
  /** 两端都尚未填全。 */
  empty: boolean
  /** 任一端已填全但落在 min / max 之外。只是标注，不改写值。 */
  outOfRange: boolean
  /** 两端都已填全但终点早于起点。只是标注，不改写值。 */
  reversed: boolean
  disabled: boolean
  readOnly: boolean
  /** 与根节点的 data-invalid 同一口径：作者标记的、越界的、终点早于起点的都计入。 */
  invalid: boolean
  /** 实际生效的小时制（prop 未提供时由 locale 推断的值）。 */
  hourCycle: TimeHourCycle
  granularity: TimeGranularity
  /** 实际生效的分列步进。 */
  step: number
  /** 两组段位各自当前参与显示的段，文档序；两组相同。未列入的段由 connect 写上 hidden 收起。 */
  segments: TimeSegmentType[]
  /** 焦点所在的段；焦点在分段输入外时为 null。 */
  focusedSegment: TimeRangePickerSegmentRef | null
  /** 起止两组时列：每组应排列的稳定列及完整选项（已按 step 取样）。界外项由 isItemDisabled 标记，作者据此渲染浮层。 */
  columnGroups: readonly [TimeRangePickerColumnGroup, TimeRangePickerColumnGroup]
  focusedColumn: TimeRangePickerColumnRef | null
  focusedItem: string | null
  /** 快捷选项逐条的状态，数据顺序。未提供 presets 时为空数组。 */
  presets: readonly TimeRangePickerPresetState[]
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  /** 某一端某一段应显示的文字（空段是占位串）。各适配器都用它填充文本，保证同构。 */
  getSegmentText: (props: TimeRangePickerSegmentProps) => string
  /**
   * 某一格应显示的文字。数字列即格子自身的值，上下午列按 locale 给出「上午 / 下午」。
   * 各适配器都用它填充文本，保证同构。
   */
  getItemText: (props: TimeRangePickerItemTextProps) => string
  isItemSelected: (props: TimeRangePickerItemProps) => boolean
  /** 落在 min / max 之外、被另一端限制（或整个控件禁用）：仍在列表中，但不可选、方向键跳过。 */
  isItemDisabled: (props: TimeRangePickerItemProps) => boolean
  setOpen: (next: boolean) => void
  /** 整份写入两端。 */
  setValue: (next: string[]) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 一端的段位容器：起止各一个，data-index 区分，各报「开始时间」「结束时间」。 */
  getSegmentGroupProps: (props: TimeRangePickerEndProps) => T['element']
  /** 分段输入：一段一个节点，与 TimeField 的段同构（role=spinbutton + roving tabindex）。 */
  getSegmentProps: (props: TimeRangePickerSegmentProps) => T['element']
  /** 起止两组段位之间的视觉分隔，退出可访问树。 */
  getRangeSeparatorProps: () => T['element']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 快捷选项列（role=listbox）；未提供 presets 时带 hidden。 */
  getPresetGroupProps: () => T['element']
  /** 一条快捷选项（role=option）：点击把两端整份写入值并收起浮层。 */
  getPresetProps: (props: TimeRangePickerPresetProps) => T['element']
  /** 一端的时列外壳：起止各一个并排，data-index 区分，各报「开始时间」「结束时间」。 */
  getColumnGroupProps: (props: TimeRangePickerEndProps) => T['element']
  /** 时列外壳顶部的小标题（「开始」「结束」），纯视觉，退出可访问树。 */
  getColumnGroupLabelProps: (props: TimeRangePickerEndProps) => T['element']
  getColumnProps: (props: TimeRangePickerColumnProps) => T['element']
  getItemProps: (props: TimeRangePickerItemProps) => T['element']
  /** 表单出口：起止各一份 type=hidden 的原生输入，随表单提交各自的 ISO 串。 */
  getHiddenInputProps: (props: TimeRangePickerEndProps) => T['input']
}

/** 读屏文案。 */
export interface TimeRangePickerTranslations {
  /** 小时段的可及名。 */
  hour: string
  /** 分钟段的可及名。 */
  minute: string
  /** 秒段的可及名。 */
  second: string
  /** 上午下午段的可及名。 */
  dayPeriod: string
  /** 起点组段位与时列的名字。 */
  startTime: string
  /** 终点组段位与时列的名字。 */
  endTime: string
  /** 快捷选项列的名字。 */
  presets: string
  /** 清空按钮的可及名。 */
  clearTrigger: string
}
