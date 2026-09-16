/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 time picker 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { TimeDayPeriod, TimeDraft, TimeGranularity, TimeHourCycle, TimeSegmentType } from '../time-field'

/**
 * 浮层中成列排布的单位，与分段输入中的段同名同域：列上选择与段上输入写入的是同一个值。
 * dayPeriod 只在 12 小时制下成列，恒排在末位。
 */
export type TimePickerColumnUnit = 'hour' | 'minute' | 'second' | 'dayPeriod'

/**
 * 展开时焦点落在时列的哪一格：
 * - selected 停在该段已填的值（被 min / max 裁掉时回退为首格；该段仍为空则不落锚点，
 *   焦点停在列容器上：指针打开走这条，不能有格子看似被选中）
 * - first / last 从列的两端进入（键盘的下键走 first、上键走 last；该段已填仍停在它上面）
 */
export type TimePickerFocusIntent = 'selected' | 'first' | 'last'

/**
 * 一列可选值。value 是两位补零的显示串（'09' / '30'），与段上的文字同一写法；
 * 上下午列写 '00'（上午）与 '01'（下午），与该段在 aria-valuenow 上报的数同一个域，
 * 显示的文字由 getItemText 按 locale 给出。
 */
export interface TimePickerColumn<U extends TimePickerColumnUnit = TimePickerColumnUnit> {
  readonly unit: U
  readonly options: readonly string[]
}

/** 生成可选值列表的入参，全部是值，不涉及 DOM 也不读取状态机。 */
export interface TimePickerColumnsOptions {
  /** 精度：hour 只显示时列，minute 显示时分两列，second 再多一列秒。 */
  granularity?: TimeGranularity
  /** 12 小时制下时列是 1-12，24 小时制是 0-23。 */
  hourCycle?: TimeHourCycle
  /** 分列的步进（分钟），默认 1；越界的写法回退为 1。秒列恒为逐秒。 */
  step?: number
  /** 下界（含），ISO 时间串。裁掉落在界外的可选值。 */
  min?: string
  /** 上界（含）。同上。 */
  max?: string
  /** 已选的时（0-23）。分列与秒列据此收窄；尚未选择时两列不收窄。 */
  hour?: number | null
  /** 已选的分。秒列据此收窄。 */
  minute?: number | null
  /** 12 小时制下把时列的显示值换算回 0-23 的依据，默认 am。 */
  dayPeriod?: TimeDayPeriod
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface TimePickerRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control），浮层因此与输入框对齐而不是只贴近某一段。 */
  getAnchorEl: () => HTMLElement | null
  /** 盒内可聚焦的触发按钮。锚点取的是整个输入行（不可聚焦），归还焦点需要落到它身上。 */
  getTriggerEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是列与选项的查询容器。 */
  getContentEl: () => HTMLElement | null
}

export interface TimePickerOpenChangeDetails {
  open: boolean
}

export interface TimePickerValueChangeDetails {
  /** ISO 时间串：'13:45' 或 '13:45:30'（形状随 granularity）。任一必填段为空时为空串。 */
  value: string
}

/**
 * 段的声明：身份由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TimePickerSegmentProps {
  segment: TimeSegmentType
}

/** 列声明自身的单位。 */
export interface TimePickerColumnProps {
  unit: TimePickerColumnUnit
}

/** 选项声明所属的列与自身的值（两位补零的显示串）。 */
export interface TimePickerItemProps {
  unit: TimePickerColumnUnit
  value: string
}

/**
 * 一条快捷选项。value 是整份 ISO 时间串（`'09:00'` / `'13:45:30'`），同时是该项的身份。
 * 时刻由作者计算后传入，`timePickerPresetNow` 提供当前时刻这一条。
 */
export interface TimePickerPreset {
  value: string
  /** 显示文案，同时是该项的可及名。 */
  label: string
  /** 禁用该项：方向键仍可停留，但按下不写值。 */
  disabled?: boolean
}

/** 一条快捷选项的当前状态，连接层计算后透出，各适配器按它渲染。 */
export interface TimePickerPresetState extends TimePickerPreset {
  /** 归一为组件值形状的时刻（'9:00' → '09:00'）；无法解析时为 null。 */
  time: string | null
  /** 不可按下：作者标记了 disabled、无法解析、或落在 min / max 之外。step 只裁剪列表，不限制它。 */
  disabled: boolean
  /** 当前值与它相同（按归一后的串比较）。 */
  selected: boolean
}

/** 选项声明自身是哪一条（值即身份）。 */
export interface TimePickerPresetProps {
  value: string
}

export interface TimePickerSchema extends MachineSchema {
  props: {
    /** 受控值，ISO 时间串。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 下界（含）。裁掉浮层中落在界外的可选值，并把已填的越界值标注出来（不改写它）。 */
    min?: string
    /** 上界（含）。同上。 */
    max?: string
    /** BCP 47 语言标记。决定上午 / 下午的文字，以及未显式提供 hourCycle 时的小时制。 */
    locale?: string
    /** 小时制。未提供时按 locale 推断，locale 也没有时使用 24。 */
    hourCycle?: TimeHourCycle
    /** 值精确到哪一段，默认 minute。它同时决定分段输入显示几段、浮层中排几列。 */
    granularity?: TimeGranularity
    /** 分列的步进（分钟），默认 1。只影响浮层中的可选值，不限制手动输入的分钟数。 */
    step?: number
    /**
     * 快捷选项（「当前时刻」「上午 9 点」等）。提供后浮层中多出一列，点击即整份写入值并收起。
     * 时刻需计算后传入：连接层每帧求值，把当前时刻放进渲染期会每帧得出一个新结果。
     * 无法解析或落在 min / max 之外的选项自动不可按下；带秒的时刻按 granularity 归一后再比较与写入。
     */
    presets?: TimePickerPreset[]
    /** 禁用：分段输入整组退出 Tab 序列、触发器使用原生 disabled，隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：浮层照常展开、列表照常浏览，但值不可修改也不可清空。 */
    readOnly?: boolean
    /** 校验失败标注。 */
    invalid?: boolean
    /** 必填标注（写入每段的 aria-required）。 */
    required?: boolean
    /** 表单字段名；提供后隐藏输入才带 name，值随表单一并提交。 */
    name?: string
    /** 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，输入行与浮层中的格子一并换档。 */
    size?: Size
    placement?: Placement
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    /**
     * 逐值可选性。接收两位补零的值与所属的列：同一个 '30' 在分钟列与秒列含义不同。
     * 与 min / max 裁掉的值同等处理：判定为真的格子仍可聚焦，只是不可选中。
     * 连续区间用 min / max 表达即可，该项留给每隔 15 分钟才可预约这类离散规则。
     */
    isTimeUnavailable?: (value: string, unit: TimePickerColumnUnit) => boolean
    /** 段位读屏名的覆盖；未提供时使用内置英文语义名。 */
    translations?: Partial<TimePickerTranslations>
    onValueChange?: (details: TimePickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TimePickerOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** ISO 时间串；任一必填段为空时为空串。受控（value 提供）时 cell 直读 prop。 */
    value: string
    /**
     * 逐段编辑缓冲，分段输入与浮层选中写入的是同一份。
     * 只在 value 不是可解析的时间时才用它显示。
     */
    draft: TimeDraft
    /** 焦点所在段；焦点在分段输入之外时为 null。同时是段间 roving tabindex 的锚点。 */
    focusedSegment: TimeSegmentType | null
    /** 当前段已输入的数字串。换段、加减、清段、在浮层中选中都会清除它。 */
    typeBuffer: string
    /** 焦点所在的列；浮层收起时为 null。 */
    focusedColumn: TimePickerColumnUnit | null
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
  refs: TimePickerRefs
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
    /** 整份替换（外部 setValue 与快捷选项）；无法解析的串等同于清空。src 为 preset 时一并收起浮层。 */
    | { type: 'VALUE.SET', value: string, src?: 'preset' }
    /** 清空所有段。 */
    | { type: 'VALUE.CLEAR' }
    /** 上下键：把某一段加减一格，越界回绕。 */
    | { type: 'SEGMENT.STEP', segment: TimeSegmentType, delta: 1 | -1 }
    /** 数字直输：把一位数字并入当前段的输入缓冲。 */
    | { type: 'SEGMENT.DIGIT', segment: TimeSegmentType, digit: string }
    /** 清除某一段。 */
    | { type: 'SEGMENT.CLEAR', segment: TimeSegmentType }
    /** 直接指定上午 / 下午（按 a/p 键）。 */
    | { type: 'SEGMENT.PERIOD', period: TimeDayPeriod }
    | { type: 'SEGMENT.FOCUS', segment: TimeSegmentType }
    | { type: 'SEGMENT.BLUR' }
    /** 焦点落到某个选项上（roving tabindex 的锚点随之移动）。 */
    | { type: 'OPTION.FOCUS', unit: TimePickerColumnUnit, value: string }
    /** 选中某列的一个值：只修改该段，浮层不收起（其余列仍需继续选择）。 */
    | { type: 'ITEM.SELECT', unit: TimePickerColumnUnit, value: string }
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
    | 'syncDraft'
    | 'resetToDefault'
  effect: 'trackPosition' | 'trackLayer'
}

export interface TimePickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** ISO 时间串；任一必填段为空时为空串。 */
  value: string
  /** 值为空串（尚未填全）。 */
  empty: boolean
  /** 已填全但落在 min / max 之外。只是标注，不改写值。 */
  outOfRange: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 实际生效的小时制（prop 未提供时由 locale 推断的值）。 */
  hourCycle: TimeHourCycle
  granularity: TimeGranularity
  /** 实际生效的分列步进。 */
  step: number
  /** 当前参与显示的段，文档序。未列入的段由 connect 写上 hidden 收起。 */
  segments: TimeSegmentType[]
  /** 焦点所在段；焦点在分段输入外时为 null。 */
  focusedSegment: TimeSegmentType | null
  /** 当前应排列的列及每列的可选值（已按 step 与 min / max 裁剪）。作者据此渲染浮层。 */
  columns: TimePickerColumn[]
  focusedColumn: TimePickerColumnUnit | null
  focusedItem: string | null
  /** 快捷选项逐条的状态，数据顺序。未提供 presets 时为空数组。 */
  presets: readonly TimePickerPresetState[]
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  /** 某一段应显示的文字（空段是占位串）。各适配器都用它填充文本，保证同构。 */
  getSegmentText: (props: TimePickerSegmentProps) => string
  /**
   * 某一格应显示的文字。数字列即格子自身的值，上下午列按 locale 给出「上午 / 下午」。
   * 各适配器都用它填充文本，保证同构。
   */
  getItemText: (props: TimePickerItemProps) => string
  isItemSelected: (props: TimePickerItemProps) => boolean
  /** 落在 min / max 之外（或整个控件禁用）：仍在列表中，但不可选、方向键跳过。 */
  isItemDisabled: (props: TimePickerItemProps) => boolean
  setOpen: (next: boolean) => void
  setValue: (next: string) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 段位与分隔符的外壳：占满盒内剩余宽度，把尾部按钮推到框内末端。 */
  getSegmentGroupProps: () => T['element']
  /** 分段输入：一段一个节点，与 TimeField 的段同构（role=spinbutton + roving tabindex）。 */
  getSegmentProps: (props: TimePickerSegmentProps) => T['element']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 快捷选项列（role=listbox）；未提供 presets 时带 hidden。 */
  getPresetGroupProps: () => T['element']
  /** 一条快捷选项（role=option）：点击把整份时间写入值并收起浮层。 */
  getPresetProps: (props: TimePickerPresetProps) => T['element']
  getColumnProps: (props: TimePickerColumnProps) => T['element']
  getItemProps: (props: TimePickerItemProps) => T['element']
  /** 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案。 */
export interface TimePickerTranslations {
  /** 小时段的可及名。 */
  hour: string
  /** 分钟段的可及名。 */
  minute: string
  /** 秒段的可及名。 */
  second: string
  /** 上午下午段的可及名。 */
  dayPeriod: string
  /** 快捷选项列的名字。 */
  presets: string
  /** 清空按钮的可及名。 */
  clearTrigger: string
}
