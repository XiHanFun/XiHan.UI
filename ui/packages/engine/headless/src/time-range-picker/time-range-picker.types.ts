/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 time range picker 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { TimeDayPeriod, TimeDraft, TimeGranularity, TimeHourCycle, TimeSegmentType } from '../time-field'
import type { TimePickerColumn, TimePickerColumnUnit, TimePickerFocusIntent } from '../time-picker'

/** 区间的哪一端：0 起点、1 终点。两组段位、两组时列、两份表单出口都按它认领。 */
export type TimeRangePickerEndIndex = 0 | 1

/** 段自报家门：属于哪一端、是哪一段。 */
export interface TimeRangePickerSegmentProps {
  index: TimeRangePickerEndIndex
  segment: TimeSegmentType
}

/** 起止各一组段位容器与各一份表单出口，靠它认领哪一端。 */
export interface TimeRangePickerEndProps {
  index: TimeRangePickerEndIndex
}

/** 列自报自己属于哪一端、是哪一个单位。 */
export interface TimeRangePickerColumnProps {
  index: TimeRangePickerEndIndex
  unit: TimePickerColumnUnit
}

/** 选项自报所属的端、列与自己的值（两位补零的显示串）。 */
export interface TimeRangePickerItemProps {
  index: TimeRangePickerEndIndex
  unit: TimePickerColumnUnit
  value: string
}

/** 格子上该显示什么与端无关，只看单位与值。 */
export interface TimeRangePickerItemTextProps {
  unit: TimePickerColumnUnit
  value: string
}

/** 一端的时列：起点那组与终点那组各自成组并排在浮层里。 */
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
  /** 视觉退场与行为资源共享的 Presence；缺省时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control），浮层因此与输入框对齐而不是只贴着某一组段位。 */
  getAnchorEl: () => HTMLElement | null
  /** 盒内那颗可聚焦的触发钮。锚点取的是整个输入行（不可聚焦），归还焦点得落到它身上。 */
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
   * 按位存放：只填了终点时是 `['', '18:00']`；尾部的空缺裁掉，只填起点是 `['09:00']`；两端都空是 `[]`。
   */
  value: string[]
}

/**
 * 一条快捷选项。value 用 ISO 8601 的区间写法把两端拼在一起（`'09:00/18:00'`），同时是这一项的身份。
 * 时刻由作者算好传进来，`timeRangePickerPresetValue` 帮着拼。
 */
export interface TimeRangePickerPreset {
  value: string
  /** 显示文案，同时是这一项的可及名字。 */
  label: string
  /** 禁用这一项：方向键仍能停上去，但按下不写值。 */
  disabled?: boolean
}

/** 一条快捷选项此刻的样子，连接层算好后透出，两个适配器照它渲染。 */
export interface TimeRangePickerPresetState extends TimeRangePickerPreset {
  /** 归一成组件值形状的两端（'9:00/18:00' → ['09:00', '18:00']）；不是恰好两端或解析不了为 null。 */
  times: readonly [string, string] | null
  /** 按不下去：作者标了 disabled、解析不了、任一端落在 min/max 之外、或终点早于起点。step 只裁列表，不限制它。 */
  disabled: boolean
  /** 当前两端与它相同（按归一后的串比）。 */
  selected: boolean
}

/** 选项自报自己是哪一条（值即身份）。 */
export interface TimeRangePickerPresetProps {
  value: string
}

export interface TimeRangePickerSchema extends MachineSchema {
  props: {
    /** 受控的区间两端 `[start, end]`；空缺的一端用空串占位。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 */
    value?: string[]
    defaultValue?: string[]
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 下界（含）。裁掉浮层里落在界外的可选值，并把已填的越界值标注出来（不改写它）。终点那组还以起点为下界。 */
    min?: string
    /** 上界（含）。同上。起点那组还以终点为上界。 */
    max?: string
    /** BCP 47 语言标记。决定上午/下午的文字，以及未显式给 hourCycle 时的小时制。 */
    locale?: string
    /** 小时制。不给则按 locale 推断，locale 也没有时用 24。 */
    hourCycle?: TimeHourCycle
    /** 值精确到哪一段，默认 minute。它同时决定两组分段输入各显示几段、浮层里各排几列。 */
    granularity?: TimeGranularity
    /** 分列的步进（分钟），默认 1。只影响浮层里的可选值，不限制手打进去的分数。 */
    step?: number
    /**
     * 快捷选项（「上午」「全天」这类）。给了就在浮层里多出一列，点一下两端整份写进值并收起。
     * 时刻要算好再传：连接层每帧求值，把「此刻」放进渲染期会每帧算出一个新答案。
     * 解析不了、不是恰好两端、任一端落在 min/max 之外或终点早于起点的那条自动按不下去。
     */
    presets?: TimeRangePickerPreset[]
    /** 禁用：两组分段输入整组退出 Tab 序列、触发器用原生 disabled，隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：浮层照常展开、列表照常浏览，但值改不动也清不掉。 */
    readOnly?: boolean
    /** 校验失败标注。不给也会自己判：任一端越界、或终点早于起点。 */
    invalid?: boolean
    /** 必填标注（落到每段的 aria-required 上）。 */
    required?: boolean
    /** 起点那份隐藏输入的表单字段名；给了才带 name。 */
    name?: string
    /** 终点那份隐藏输入的表单字段名；不给即终点不参与提交。 */
    endName?: string
    /** 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，输入行与浮层里的格子一并换档。 */
    size?: Size
    placement?: Placement
    /** 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    /**
     * 逐值可选性。收两位补零的值、它所属的列与端——同一个 '30' 在分钟列与秒列不是一回事，
     * 起点与终点也可以各有各的规则。与 min/max 裁掉的值同等对待：判真的格子仍可聚焦，只是选不中。
     */
    isTimeUnavailable?: (value: string, unit: TimePickerColumnUnit, index: TimeRangePickerEndIndex) => boolean
    /** 段位与两端读屏名的覆盖；不给就用内置英文语义名。 */
    translations?: Partial<TimeRangePickerTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: TimeRangePickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TimeRangePickerOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 区间两端，按位存放，空缺的一端是空串。受控（value 给定）时 cell 直读 prop。 */
    value: string[]
    /**
     * 两端各自的逐段编辑缓冲，分段输入与浮层选中写的是同一份。
     * 只在那一端的值不是可解析的时间时才拿它显示。
     */
    drafts: readonly [TimeDraft, TimeDraft]
    /** 焦点所在的段（哪一端的哪一段）；焦点在分段输入之外时为 null。同时是段间 roving tabindex 的锚点。 */
    focusedSegment: TimeRangePickerSegmentRef | null
    /** 当前段已敲进去的数字串。换段、加减、清段、在浮层里选中都会把它清掉。 */
    typeBuffer: string
    /** 焦点所在的列（哪一端的哪一列）；浮层收起时为 null。 */
    focusedColumn: TimeRangePickerColumnRef | null
    /** 焦点所在列里的那个选项值；浮层收起时为 null。 */
    focusedItem: string | null
    /** 本轮展开是从哪个入口来的，决定要不要预落锚点。指针与命令式入口都是 selected。 */
    focusIntent: TimePickerFocusIntent
    /** 关闭时是否把焦点归还触发器；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /**
     * 这一轮展开要不要把焦点搬进浮层。
     * 点输入行展开时为假：那一下的用意是编辑段位，抢走焦点就打不了字了。
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
    /** 整份替换两端（外部 setValue 与快捷选项）；解析不了的那一端等同于清空。src 为 preset 时顺手收起浮层。 */
    | { type: 'VALUE.SET', value: string[], src?: 'preset' }
    /** 清空两端所有段。 */
    | { type: 'VALUE.CLEAR' }
    /** 上下键：把某一端的某一段加减一格，越界回绕。 */
    | { type: 'SEGMENT.STEP', index: TimeRangePickerEndIndex, segment: TimeSegmentType, delta: 1 | -1 }
    /** 数字直输：把一位数字并进当前段的输入缓冲。 */
    | { type: 'SEGMENT.DIGIT', index: TimeRangePickerEndIndex, segment: TimeSegmentType, digit: string }
    /** 清掉某一端的某一段。 */
    | { type: 'SEGMENT.CLEAR', index: TimeRangePickerEndIndex, segment: TimeSegmentType }
    /** 直接指定某一端的上午/下午（按 a/p 键）。 */
    | { type: 'SEGMENT.PERIOD', index: TimeRangePickerEndIndex, period: TimeDayPeriod }
    | { type: 'SEGMENT.FOCUS', index: TimeRangePickerEndIndex, segment: TimeSegmentType }
    | { type: 'SEGMENT.BLUR' }
    /** 焦点落到某个选项上（roving tabindex 的锚点跟着它走）。 */
    | { type: 'OPTION.FOCUS', index: TimeRangePickerEndIndex, unit: TimePickerColumnUnit, value: string }
    /** 选中某一端某列的一个值：只改那一段，浮层不收起（其余列还要接着挑）。 */
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
  /** 区间两端，按位存放；空缺的一端是空串，尾部的空缺裁掉。 */
  value: string[]
  /** 起点的 ISO 时间串；还没填全时为 null。 */
  start: string | null
  /** 终点的 ISO 时间串；还没填全时为 null。 */
  end: string | null
  /** 两端都还没填全。 */
  empty: boolean
  /** 任一端已填全但落在 min/max 之外。只是标注，不改写值。 */
  outOfRange: boolean
  /** 两端都填全了但终点早于起点。只是标注，不改写值。 */
  reversed: boolean
  disabled: boolean
  readOnly: boolean
  /** 与根节点的 data-invalid 同一口径：作者标的、越界的、终点早于起点的都算。 */
  invalid: boolean
  /** 实际生效的小时制（prop 没给时由 locale 推出来的那个）。 */
  hourCycle: TimeHourCycle
  granularity: TimeGranularity
  /** 实际生效的分列步进。 */
  step: number
  /** 两组段位各自此刻参与显示的段，文档序；两组相同。未列入的段由 connect 打上 hidden 收起。 */
  segments: TimeSegmentType[]
  /** 焦点所在的段；焦点在分段输入外时为 null。 */
  focusedSegment: TimeRangePickerSegmentRef | null
  /** 起止两组时列：每组该排哪几列、每列有哪些可选值（已按 step、min/max 与另一端裁过）。作者据此渲染浮层。 */
  columnGroups: readonly [TimeRangePickerColumnGroup, TimeRangePickerColumnGroup]
  focusedColumn: TimeRangePickerColumnRef | null
  focusedItem: string | null
  /** 快捷选项逐条的样子，数据顺序。没给 presets 时为空数组。 */
  presets: readonly TimeRangePickerPresetState[]
  /** 清空按钮此刻可不可按。 */
  canClear: boolean
  /** 某一端某一段该显示的文字（空段是占位串）。两个适配器都拿它填文本，保证同构。 */
  getSegmentText: (props: TimeRangePickerSegmentProps) => string
  /**
   * 某一格该显示的文字。数字列就是格子自己的值，上下午列按 locale 给出「上午 / 下午」。
   * 两个适配器都拿它填文本，保证同构。
   */
  getItemText: (props: TimeRangePickerItemTextProps) => string
  isItemSelected: (props: TimeRangePickerItemProps) => boolean
  /** 落在 min/max 之外、被另一端顶住（或整个控件禁用）：仍在列表里，但不可选、方向键跳过。 */
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
  /** 快捷选项列（role=listbox）；没给 presets 时带 hidden。 */
  getPresetGroupProps: () => T['element']
  /** 一条快捷选项（role=option）：点按把两端整份写进值并收起浮层。 */
  getPresetProps: (props: TimeRangePickerPresetProps) => T['element']
  /** 一端的时列外壳：起止各一个并排，data-index 区分，各报「开始时间」「结束时间」。 */
  getColumnGroupProps: (props: TimeRangePickerEndProps) => T['element']
  /** 时列外壳顶上的小标题（「开始」「结束」），纯视觉，退出可访问树。 */
  getColumnGroupLabelProps: (props: TimeRangePickerEndProps) => T['element']
  getColumnProps: (props: TimeRangePickerColumnProps) => T['element']
  getItemProps: (props: TimeRangePickerItemProps) => T['element']
  /** 表单出口：起止各一份 type=hidden 的原生输入，随表单提交各自的 ISO 串。 */
  getHiddenInputProps: (props: TimeRangePickerEndProps) => T['input']
}

/** 读屏用的文案。 */
export interface TimeRangePickerTranslations {
  /** 小时段的可及名。 */
  hour: string
  /** 分钟段的可及名。 */
  minute: string
  /** 秒段的可及名。 */
  second: string
  /** 上午下午段的可及名。 */
  dayPeriod: string
  /** 起点那组段位与时列的名字。 */
  startTime: string
  /** 终点那组段位与时列的名字。 */
  endTime: string
  /** 快捷选项那一列的名字。 */
  presets: string
  /** 清空按钮的可及名。 */
  clearTrigger: string
}
