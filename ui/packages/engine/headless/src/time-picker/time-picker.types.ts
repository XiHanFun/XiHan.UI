import type { Cleanup, ControlVariant, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { TimeDayPeriod, TimeDraft, TimeGranularity, TimeHourCycle, TimeSegmentType } from '../time-field'

/**
 * 浮层里成列排布的单位，与分段输入里的段同名同域：列上挑与段上敲写的是同一个东西。
 * dayPeriod 只在 12 小时制下成列，恒排在末位。
 */
export type TimePickerColumnUnit = 'hour' | 'minute' | 'second' | 'dayPeriod'

/**
 * 展开那一刻焦点落在时列的哪一格：
 * - selected 停在这一段已填的那个值（它被 min/max 裁掉时退回首格；这一段还空着则不落锚点，
 *   焦点歇在列容器上——指针打开走这条，不能有格子看着像被选中）
 * - first / last 从列的两端进（键盘的下键走 first、上键走 last；这一段已填仍停在它上面）
 */
export type TimePickerFocusIntent = 'selected' | 'first' | 'last'

/**
 * 一列可选值。value 是两位补零的显示串（'09' / '30'），与段上的文字同一套写法；
 * 上下午列写的是 '00'（上午）与 '01'（下午），跟这一段在 aria-valuenow 上报的数同一个域，
 * 显示成什么字由 getItemText 按 locale 给。
 */
export interface TimePickerColumn<U extends TimePickerColumnUnit = TimePickerColumnUnit> {
  readonly unit: U
  readonly options: readonly string[]
}

/** 生成可选值列表的入参，全是值，不碰 DOM 也不读机器。 */
export interface TimePickerColumnsOptions {
  /** 精度：hour 只出时列，minute 出时分两列，second 再多一列秒。 */
  granularity?: TimeGranularity
  /** 12 小时制下时列是 1-12，24 小时制是 0-23。 */
  hourCycle?: TimeHourCycle
  /** 分列的步进（分钟），默认 1；越界的写法回落到 1。秒列恒为逐秒。 */
  step?: number
  /** 下界（含），ISO 时间串。裁掉落在界外的可选值。 */
  min?: string
  /** 上界（含）。同上。 */
  max?: string
  /** 已选的时（0-23）。分列与秒列据此收窄；还没选时两列不收窄。 */
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
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control），浮层因此与输入框对齐而不是只贴着某一段。 */
  getAnchorEl: () => HTMLElement | null
  /** 盒内那颗可聚焦的触发钮。锚点取的是整个输入行（不可聚焦），归还焦点得落到它身上。 */
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
  /** ISO 时间串：'13:45' 或 '13:45:30'（形状随 granularity）。任一必填段为空时是空串。 */
  value: string
}

/**
 * 段自报家门：身份由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TimePickerSegmentProps {
  segment: TimeSegmentType
}

/** 列自报自己是哪一个单位。 */
export interface TimePickerColumnProps {
  unit: TimePickerColumnUnit
}

/** 选项自报所属的列与自己的值（两位补零的显示串）。 */
export interface TimePickerItemProps {
  unit: TimePickerColumnUnit
  value: string
}

/**
 * 一条快捷选项。value 是整份 ISO 时间串（`'09:00'` / `'13:45:30'`），同时是这一项的身份。
 * 时刻由作者算好传进来，`timePickerPresetNow` 备着「此刻」那一条。
 */
export interface TimePickerPreset {
  value: string
  /** 显示文案，同时是这一项的可及名字。 */
  label: string
  /** 禁用这一项：方向键仍能停上去，但按下不写值。 */
  disabled?: boolean
}

/** 一条快捷选项此刻的样子，连接层算好后透出，两个适配器照它渲染。 */
export interface TimePickerPresetState extends TimePickerPreset {
  /** 归一成组件值形状的时刻（'9:00' → '09:00'）；解析不了为 null。 */
  time: string | null
  /** 按不下去：作者标了 disabled、解析不了、或落在 min/max 之外。step 只裁列表，不限制它。 */
  disabled: boolean
  /** 当前值与它相同（按归一后的串比）。 */
  selected: boolean
}

/** 选项自报自己是哪一条（值即身份）。 */
export interface TimePickerPresetProps {
  value: string
}

export interface TimePickerSchema extends MachineSchema {
  props: {
    /** 受控值，ISO 时间串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 下界（含）。裁掉浮层里落在界外的可选值，并把已填的越界值标注出来（不改写它）。 */
    min?: string
    /** 上界（含）。同上。 */
    max?: string
    /** BCP 47 语言标记。决定上午/下午的文字，以及未显式给 hourCycle 时的小时制。 */
    locale?: string
    /** 小时制。不给则按 locale 推断，locale 也没有时用 24。 */
    hourCycle?: TimeHourCycle
    /** 值精确到哪一段，默认 minute。它同时决定分段输入显示几段、浮层里排几列。 */
    granularity?: TimeGranularity
    /** 分列的步进（分钟），默认 1。只影响浮层里的可选值，不限制手打进去的分数。 */
    step?: number
    /**
     * 快捷选项（「此刻」「上午 9 点」这类）。给了就在浮层里多出一列，点一下整份写进值并收起。
     * 时刻要算好再传：连接层每帧求值，把`此刻`放进渲染期会每帧算出一个新答案。
     * 解析不了或落在 min/max 之外的那条自动按不下去；带秒的时刻按 granularity 归一后再比对与写入。
     */
    presets?: TimePickerPreset[]
    /** 禁用：分段输入整组退出 Tab 序列、触发器用原生 disabled，隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：浮层照常展开、列表照常浏览，但值改不动也清不掉。 */
    readOnly?: boolean
    /** 校验失败标注。 */
    invalid?: boolean
    /** 必填标注（落到每段的 aria-required 上）。 */
    required?: boolean
    /** 表单字段名；给了隐藏输入才带 name，值随表单一并提交。 */
    name?: string
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
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    /**
     * 逐值可选性。收两位补零的值与它所属的列——同一个 '30' 在分钟列与秒列不是一回事。
     * 与 min/max 裁掉的值同等对待：判真的格子仍可聚焦，只是选不中。
     * 连续区间用 min/max 表达即可，这条留给「每隔 15 分钟才可约」这类离散规则。
     */
    isTimeUnavailable?: (value: string, unit: TimePickerColumnUnit) => boolean
    /** 段位读屏名的覆盖；不给就用内置英文语义名。 */
    translations?: Partial<TimePickerTranslations>
    onValueChange?: (details: TimePickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TimePickerOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** ISO 时间串；任一必填段为空时是空串。受控（value 给定）时 cell 直读 prop。 */
    value: string
    /**
     * 逐段编辑缓冲，分段输入与浮层选中写的是同一份。
     * 只在 value 不是可解析的时间时才拿它显示。
     */
    draft: TimeDraft
    /** 焦点所在段；焦点在分段输入之外时为 null。同时是段间 roving tabindex 的锚点。 */
    focusedSegment: TimeSegmentType | null
    /** 当前段已敲进去的数字串。换段、加减、清段、在浮层里选中都会把它清掉。 */
    typeBuffer: string
    /** 焦点所在的列；浮层收起时为 null。 */
    focusedColumn: TimePickerColumnUnit | null
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
    /** 整份替换（外部 setValue 与快捷选项）；解析不了的串等同于清空。src 为 preset 时顺手收起浮层。 */
    | { type: 'VALUE.SET', value: string, src?: 'preset' }
    /** 清空所有段。 */
    | { type: 'VALUE.CLEAR' }
    /** 上下键：把某一段加减一格，越界回绕。 */
    | { type: 'SEGMENT.STEP', segment: TimeSegmentType, delta: 1 | -1 }
    /** 数字直输：把一位数字并进当前段的输入缓冲。 */
    | { type: 'SEGMENT.DIGIT', segment: TimeSegmentType, digit: string }
    /** 清掉某一段。 */
    | { type: 'SEGMENT.CLEAR', segment: TimeSegmentType }
    /** 直接指定上午/下午（按 a/p 键）。 */
    | { type: 'SEGMENT.PERIOD', period: TimeDayPeriod }
    | { type: 'SEGMENT.FOCUS', segment: TimeSegmentType }
    | { type: 'SEGMENT.BLUR' }
    /** 焦点落到某个选项上（roving tabindex 的锚点跟着它走）。 */
    | { type: 'OPTION.FOCUS', unit: TimePickerColumnUnit, value: string }
    /** 选中某列的一个值：只改那一段，浮层不收起（其余列还要接着挑）。 */
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
  /** ISO 时间串；任一必填段为空时是空串。 */
  value: string
  /** 值为空串（还没填全）。 */
  empty: boolean
  /** 已填全但落在 min/max 之外。只是标注，不改写值。 */
  outOfRange: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 实际生效的小时制（prop 没给时由 locale 推出来的那个）。 */
  hourCycle: TimeHourCycle
  granularity: TimeGranularity
  /** 实际生效的分列步进。 */
  step: number
  /** 此刻参与显示的段，文档序。未列入的段由 connect 打上 hidden 收起。 */
  segments: TimeSegmentType[]
  /** 焦点所在段；焦点在分段输入外时为 null。 */
  focusedSegment: TimeSegmentType | null
  /** 此刻该排哪几列、每列有哪些可选值（已按 step 与 min/max 裁过）。作者据此渲染浮层。 */
  columns: TimePickerColumn[]
  focusedColumn: TimePickerColumnUnit | null
  focusedItem: string | null
  /** 快捷选项逐条的样子，数据顺序。没给 presets 时为空数组。 */
  presets: readonly TimePickerPresetState[]
  /** 清空按钮此刻可不可按。 */
  canClear: boolean
  /** 某一段该显示的文字（空段是占位串）。两个适配器都拿它填文本，保证同构。 */
  getSegmentText: (props: TimePickerSegmentProps) => string
  /**
   * 某一格该显示的文字。数字列就是格子自己的值，上下午列按 locale 给出「上午 / 下午」。
   * 两个适配器都拿它填文本，保证同构。
   */
  getItemText: (props: TimePickerItemProps) => string
  isItemSelected: (props: TimePickerItemProps) => boolean
  /** 落在 min/max 之外（或整个控件禁用）：仍在列表里，但不可选、方向键跳过。 */
  isItemDisabled: (props: TimePickerItemProps) => boolean
  setOpen: (next: boolean) => void
  setValue: (next: string) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 段位与分隔符的外壳：占满盒里剩下的宽度，把尾部按钮顶到框内末端。 */
  getSegmentGroupProps: () => T['element']
  /** 分段输入：一段一个节点，与 TimeField 的段同构（role=spinbutton + roving tabindex）。 */
  getSegmentProps: (props: TimePickerSegmentProps) => T['element']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 快捷选项列（role=listbox）；没给 presets 时带 hidden。 */
  getPresetGroupProps: () => T['element']
  /** 一条快捷选项（role=option）：点按把整份时间写进值并收起浮层。 */
  getPresetProps: (props: TimePickerPresetProps) => T['element']
  getColumnProps: (props: TimePickerColumnProps) => T['element']
  getItemProps: (props: TimePickerItemProps) => T['element']
  /** 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案。 */
export interface TimePickerTranslations {
  /** 小时段的可及名。 */
  hour: string
  /** 分钟段的可及名。 */
  minute: string
  /** 秒段的可及名。 */
  second: string
  /** 上午下午段的可及名。 */
  dayPeriod: string
  /** 快捷选项那一列的名字。 */
  presets: string
  /** 清空按钮的可及名。 */
  clearTrigger: string
}
