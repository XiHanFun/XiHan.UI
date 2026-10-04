/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 time picker 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { ResolvedTimeStep, TimeColumn, TimeColumnUnit, TimeStep, TimeUnavailablePredicate } from '../shared/time-constraint'
import type { TimeDayPeriod, TimeDraft, TimeGranularity, TimeHourCycle, TimeSegmentType } from '../time-field'

/**
 * 浮层中成列排布的单位，与分段输入中的段同名同域：列上选择与段上输入写入的是同一个值。
 * dayPeriod 只在 12 小时制下成列，恒排在末位。
 */
export type TimePickerColumnUnit = TimeColumnUnit

/**
 * 选择模式：single 选一个时刻；multiple 选一组时刻——浮层里各列拼出的是草稿，按「添加」才收进值，
 * 输入行里的段位让位给一排标签。
 */
export type TimePickerSelectionMode = 'single' | 'multiple'

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
export type TimePickerColumn<U extends TimePickerColumnUnit = TimePickerColumnUnit> = TimeColumn<U>

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
  /**
   * 选中的时刻，ISO 时间串（'13:45' 或 '13:45:30'，形状随 granularity），恒为数组。
   * 单选时至多一项，任一必填段为空时为空数组；多选时去重并按时刻升序。
   */
  value: string[]
}

/** 多选时一枚标签：value 是它代表的选中值（ISO 时间串），label 是按 locale 与小时制排出来的显示文本。 */
export interface TimePickerTagMeta {
  value: string
  label: string
}

export interface TimePickerTagProps {
  /** 它代表哪个选中值。 */
  value: string
}

export interface TimePickerHiddenInputProps {
  /** 多选时一个选中值一份原生输入：传这个值，产出的就是它那一份。 */
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
  /** 不可按下：作者标记了 disabled、无法解析、或落在 min / max 之外。timeStep 只裁剪列表，不限制它。 */
  disabled: boolean
  /** 当前值与它相同（按归一后的串比较）。 */
  selected: boolean
}

/** 选项声明自身是哪一条（值即身份）。 */
export interface TimePickerPresetProps {
  value: string
}

/**
 * 接了按压通道的部件，按 key 记住正被按住的那一个：
 * 清空钮、触发钮各一，快捷选项按其值、时间格按「列:值」。
 */
export type TimePickerPressedKey = 'clear' | 'trigger' | 'confirm' | `preset:${string}` | `item:${TimePickerColumnUnit}:${string}`

export interface TimePickerSchema extends MachineSchema {
  props: {
    /**
     * 受控值，ISO 时间串数组。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。
     * 单选可写裸串，内部一律归一为数组（空串即空数组）。
     */
    value?: string | string[]
    defaultValue?: string | string[]
    /** 选择模式，默认 single。 */
    selectionMode?: TimePickerSelectionMode
    /** multiple 下最多选几个时刻：选满后「添加」不可按、快捷选项只能点掉已选的。非整数向下取整，小于 1 或不是有限数时不设上限。 */
    maxSelected?: number
    /** 多选时输入行最多摆几枚标签，其余折进 +N 那一枚；默认 3。 */
    maxTagCount?: number
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
    /**
     * 按单位的步进：`{ hour?, minute?, second? }`，各单位缺省 1。时的步进按 24 小时制的真实小时取。
     * 只影响浮层中的可选值，不限制段位上手动输入的数。
     */
    timeStep?: TimeStep
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
    /**
     * 逐值可选性。value 是两位补零的格值，时列恒按 24 小时制给出（12 小时制下也换算成真实的时）；
     * unit 区分同一个 '30' 属于哪一列；context 带这份值里已选的时（24 小时制）与分，
     * 写得出「9 点只能选 30 分以后」。date 与 index 在本组件恒为 null。
     * 与 min / max 裁掉的值同等处理：判定为真的格子仍可聚焦，只是不可选中。
     * 连续区间用 min / max 表达即可，该项留给每隔 15 分钟才可预约这类离散规则。
     */
    isTimeUnavailable?: TimeUnavailablePredicate
    /** 段位读屏名的覆盖；未提供时取英文语言包里的语义名。 */
    translations?: Partial<TimePickerTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: TimePickerValueChangeDetails) => void
    /** 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。 */
    onClear?: () => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TimePickerOpenChangeDetails) => void
  }
  context: {
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，content 投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 选中的时刻，ISO 时间串数组；单选至多一项。受控（value 提供）时 cell 直读 prop。 */
    value: string[]
    /**
     * 逐段编辑缓冲，分段输入与浮层选中写入的是同一份。
     * 单选时它跟着值走，只在值不是可解析的时间时才用它显示；多选时它就是浮层里拼着的那个草稿，按「添加」才收进值。
     */
    draft: TimeDraft
    /** 标签行的列表动效接上了：此前首帧就在的标签直接呈现，之后到达的才播进场。 */
    tagListTracked: boolean
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
    /**
     * 按压通道：Space / Enter 或触屏手指按下到松开之间正被按住的那一个，该部件投影 data-pressed；
     * 没有按住时为 null。抬起、失焦、指针取消或浮层收起时即撤下。
     */
    pressed: TimePickerPressedKey | null
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
    /** 整份替换（外部 setValue 与快捷选项）；无法解析的串丢掉。src 为 preset 时一并收起浮层。 */
    | { type: 'VALUE.SET', value: string[], src?: 'preset' }
    /** 多选：把浮层里拼好的草稿收进值。 */
    | { type: 'VALUE.ADD' }
    /** 多选：摘掉一个选中值（标签的删除钮、触发钮上的退格）。 */
    | { type: 'VALUE.REMOVE', value: string }
    /** 多选：快捷选项点一下切换选中。 */
    | { type: 'VALUE.TOGGLE', value: string }
    | { type: 'TAG_LIST.TRACKED' }
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
    /**
     * 按压通道（shared/press）：某个部件被 Space / Enter 或触屏按住，key 说的是哪一个；
     * disabled 是 connect 按该部件自己的可按性（快捷选项 / 时间格的逐条禁用、清空钮的可清）带来的事实。
     */
    | { type: 'PRESS.START', key: TimePickerPressedKey, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只收自己那一下。 */
    | { type: 'PRESS.END', key: TimePickerPressedKey }
  tag: never
  guard: 'isOpenControlled' | 'canEdit' | 'closesOnPreset' | 'canPress'
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
    | 'clearOpenedAtMount'
    | 'addValue'
    | 'removeValue'
    | 'toggleValue'
    | 'markTagListTracked'
  effect: 'trackPosition' | 'trackLayer' | 'trackColumnScroll' | 'trackTagListMotion'
}

export interface TimePickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 选中的时刻，ISO 时间串数组；单选至多一项，任一必填段为空时为空数组。 */
  value: string[]
  selectionMode: TimePickerSelectionMode
  /** 多选时浮层里拼着的草稿（填全了才有，否则空串）；单选时就是当前值。 */
  draftValue: string
  /** 没有选中值（单选时还没填全也算）。 */
  empty: boolean
  /** 已填全但落在 min / max 之外。只是标注，不改写值。 */
  outOfRange: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 实际生效的小时制（prop 未提供时由 locale 推断的值）。 */
  hourCycle: TimeHourCycle
  granularity: TimeGranularity
  /** 实际生效的按单位步进。 */
  timeStep: ResolvedTimeStep
  /** 当前参与显示的段，文档序。未列入的段由 connect 写上 hidden 收起。 */
  segments: TimeSegmentType[]
  /** 焦点所在段；焦点在分段输入外时为 null。 */
  focusedSegment: TimeSegmentType | null
  /** 当前应排列的列及每列的可选值（已按 timeStep 取样、按 min / max 裁剪）。作者据此渲染浮层。 */
  columns: TimePickerColumn[]
  focusedColumn: TimePickerColumnUnit | null
  focusedItem: string | null
  /** 快捷选项逐条的状态，数据顺序。未提供 presets 时为空数组。 */
  presets: readonly TimePickerPresetState[]
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  /** 多选时「添加」此刻可按：草稿填全、在 min / max 之内、还没选过、也没到 maxSelected。 */
  canAdd: boolean
  /** 多选时可见的标签（受 maxTagCount 截断），与 value 同序；单选恒为空数组。 */
  tags: TimePickerTagMeta[]
  /** 被 maxTagCount 折叠的标签数。 */
  overflowCount: number
  /** +N 标签显示的文字（由 translations.overflowTag 计算）；没有折叠的标签时为空串。 */
  overflowText: string
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
  setValue: (next: string[]) => void
  clear: () => void
  /** 多选：把草稿收进值（与按「添加」同一条路）。 */
  add: () => void
  /** 多选：摘掉一个选中值。 */
  deselect: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 标签行：多选时放在盒里，收纳可见标签与 +N 标签；没有选中时整体留空。单选时整体 hidden。 */
  getTagListProps: () => T['element']
  /** 标签：一个选中值一个，即库内 tag 的 root（data-scope="tag"），另带 data-value。 */
  getTagProps: (props: TimePickerTagProps) => T['element']
  /** 标签文字所在的块（tag 的 label）；标签与 +N 共用。 */
  getTagLabelProps: () => T['element']
  /** 被折叠的标签合成的一个：同样是 tag 的 root，显示 overflowText、带 data-count；没有折叠的标签时 hidden。 */
  getOverflowTagProps: () => T['element']
  /** 标签删除按钮：即所在标签那份 tag 的 close-trigger，可及名使用 translations.deleteItem；不占 Tab 位、按下不夺焦。 */
  getItemDeleteTriggerProps: (props: TimePickerTagProps) => T['button']
  /** 段位与分隔符的外壳：占满盒内剩余宽度，把尾部按钮推到框内末端；多选时整体 hidden。 */
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
  /** 「添加」：多选时把浮层里拼好的草稿收进值，浮层不收起；单选时 hidden。文字由作者写。 */
  getConfirmTriggerProps: () => T['button']
  /**
   * 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。
   * 多选时一个选中值一份同名输入：传 `{ value }` 产出那一份，不传是首个选中值那一份。
   */
  getHiddenInputProps: (props?: TimePickerHiddenInputProps) => T['input']
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
  /** 多选标签删除按钮的可及名，接收标签文本；默认 `Delete <label>`。 */
  deleteItem: (label: string) => string
  /** 被折叠的标签（+N）显示的文字，接收折叠的个数；默认 +N。 */
  overflowTag: (count: number) => string
}
