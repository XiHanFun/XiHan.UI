import type { Cleanup, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema, Service } from '@xihan-ui/machine'
import type { CalendarApi, CalendarSchema, CalendarSelectionMode } from '../calendar'
import type { DateFieldSchema, DateFieldSegmentProps, DateFieldSegmentState } from '../date-field'

/**
 * 值的来源。选中值可以从三处进来，而「选完了该不该收起」只对日历那一路成立：
 * 在段位里敲日期时浮层多半根本没开着，敲到一半就收起更是灾难。
 */
export type DatePickerValueSource = 'calendar' | 'field' | 'api'

export interface DatePickerOpenChangeDetails {
  open: boolean
}

export interface DatePickerValueChangeDetails {
  /**
   * 选中日期集合，ISO 串。单选模式下也是数组（长度 ≤ 1），形状不随模式变；
   * range 挑到一半时长度为 1（只有起点）。
   */
  value: string[]
}

export interface DatePickerFocusChangeDetails {
  /** 新的聚焦日，ISO 串。它同时决定日历展示哪个月。 */
  focusedValue: string
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；纯逻辑测试与 SSR 下保持缺省，
// 此时副作用一律短路（机器状态照常转移，只是不定位、不挂消解层与焦点域）。
export interface DatePickerRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取整个输入行（control），浮层因此与输入框对齐而不是只贴着图标按钮。 */
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
     * 单选写成裸串是简写，内部一律归一成数组。
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
    /** 决定周首日、月份文案与段位先后（zh-CN 年月日、en-US 月日年）。 */
    locale?: string
    /** 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 */
    timeZone?: string
    /** 选择模式，默认 single。它同时决定「选完了没有」——区间要两端都落定。 */
    selectionMode?: CalendarSelectionMode
    /** 作者给的不可用判定，收 ISO 串。界外与它判真的日子同等对待。 */
    isDateUnavailable?: (value: string) => boolean
    /** 整个控件禁用：trigger 转原生 disabled，段位退出 Tab 序，日历格子全转 aria-disabled。 */
    disabled?: boolean
    /** 只读：浮层照常展开、日历照常翻月浏览，但选中值改不动。 */
    readOnly?: boolean
    /** 校验失败：段位报 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 必填标注，落到每一段的 aria-required 上。 */
    required?: boolean
    /** 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。 */
    name?: string
    placement?: Placement
    offset?: number
    /** 选完即收起，默认 true。区间模式下要两端都落定才算选完。 */
    closeOnSelect?: boolean
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: DatePickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: DatePickerOpenChangeDetails) => void
    /**
     * 聚焦日变化（方向键、翻月、展开、在段位里敲出新日期都会发）。
     * 网格由作者渲染，这条是「该重画了」的唯一信号——不听它，日历就永远停在首帧那个月。
     */
    onFocusedValueChange?: (details: DatePickerFocusChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 选中集合，恒为数组。受控（value 给定）时直读 prop。 */
    value: string[]
    /**
     * 聚焦日，ISO 串；它同时决定日历展示哪个月。
     * 内嵌日历的聚焦日恒由这里受控——「输入框敲了个新日期，日历要跟着翻过去」这条同步
     * 只有把唯一事实源收在编排机手里才成立。null 表示还没定过，由连接层退回选中值或今天。
     */
    focusedValue: string | null
    /** 收起时是否把焦点归还给展开前那个控件；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: DatePickerRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 整体改写选中集合。src 决定要不要顺手收起浮层。 */
    | { type: 'VALUE.SET', value: string[], src?: DatePickerValueSource }
    | { type: 'VALUE.CLEAR' }
    /** 聚焦日改写：日历里移动焦点、翻月都会经它回到编排机。 */
    | { type: 'FOCUSED.SET', value: string }
  tag: never
  guard: 'isOpenControlled' | 'closesOnSelect'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setReturnFocus'
    | 'setValue'
    | 'clearValue'
    | 'setFocusedValue'
    | 'syncFocusedValue'
    | 'focusSelectedDay'
  effect: 'trackPosition' | 'trackLayer'
}

/**
 * 三台机器的把手。编排机自己只管开合与两侧的值同步，
 * 选日期/翻月/键盘导航归 calendar，分段输入归 date-field。
 */
export interface DatePickerServices {
  root: Service<DatePickerSchema>
  calendar: Service<CalendarSchema>
  field: Service<DateFieldSchema>
}

/**
 * 内嵌分段输入对外露出的那一面。
 *
 * 刻意不是整份 DateFieldApi：它的 root / label / control 三个部件在这里由日期选择器
 * 自己的角色节点承担（input 就是那个 role=group 的分段容器），把它们一并露出去，
 * 作者就会在同一棵树里挂出第二个 date-field 根节点。
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
  getSegmentProps: (props: DateFieldSegmentProps) => T['element']
  /** 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

export interface DatePickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 选中集合，ISO 串；形状不随模式变。 */
  value: string[]
  /** 首个选中值；无选中时为 null。分段输入承载的就是它。 */
  valueAsString: string | null
  selectionMode: CalendarSelectionMode
  /** 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 */
  focusedValue: string
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 清空按钮此刻可不可按。 */
  canClear: boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  clear: () => void
  /** 内嵌日历：选日期、翻月、键盘导航全在它身上，本组件一条都不重写。 */
  calendar: CalendarApi<T>
  /** 内嵌分段输入。 */
  field: DatePickerFieldApi<T>
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  /** role=group 的分段容器，段位挂在它里面。 */
  getInputProps: () => T['element']
  getTriggerProps: () => T['button']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 内嵌日历的挂载点，同时充当日历的根节点。 */
  getCalendarProps: () => T['element']
}
