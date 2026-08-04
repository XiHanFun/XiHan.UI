import type { Cleanup, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/core'
import type {
  CalendarDay,
  CalendarSchema,
  CalendarSelectionMode,
  CalendarWeekDay,
  DateFieldSchema,
  DatePickerFocusChangeDetails,
  DatePickerOpenChangeDetails,
  DatePickerSchema,
  DatePickerServices,
  DatePickerValueChangeDetails,
} from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { calendarAnatomy, calendarMachine, connectDatePicker, dateFieldAnatomy, dateFieldMachine, datePickerAnatomy, datePickerCalendarProps, datePickerFieldProps, datePickerMachine, datePickerMeta } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 取作者写在段位上的 index，缺席或写坏了退回文档序。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * `<xh-date-picker>` —— Light-DOM 行为宿主：作者写 root/label/control/input/segment/trigger/
 * clear-trigger/positioner/content/calendar 角色节点，calendar 之内再照日历那套写
 * header/prev-trigger/next-trigger/heading/grid/grid-head/week-day/grid-body/week-row/cell/cell-trigger。
 *
 * 本元素是编排机，只持有开合与「分段输入 ↔ 日历」之间的值同步；选日期、翻月、网格键盘导航
 * 委派给内嵌日历，分段输入委派给内嵌分段输入，两部件之内的 DOM 各戴各自的 data-scope。
 *
 * 网格由作者渲染，元素不生成节点：读 `weeks` / `weekDays` / `headingLabel` 三个只读属性，
 * 听 `focused-value-change` 重画。日期身份取 cell 节点上的 `value`（ISO 串），
 * cell-trigger 跟随所在 cell；表头列取 week-day 上的 `value`（列序 0-6）；
 * 段位可自带 `index` 属性声明下标，缺省按文档序。
 *
 * @customElement xh-date-picker
 * @attr {string} value - 受控选中值（单选简写，ISO 串）；缺省该属性即非受控，区间/多选请用 property 传数组
 * @attr {string} default-value - 非受控初始选中值
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} min - 可选范围下界（含当天），日历与分段输入共用
 * @attr {string} max - 可选范围上界（含当天）
 * @attr {string} locale - 决定周首日、月份文案与段位先后，默认 zh-CN（段序默认 en-US 由分段输入自定）
 * @attr {string} time-zone - 判定"今天"与格式化用的时区，默认宿主本地时区
 * @attr {'single'|'multiple'|'range'} selection-mode - 选择模式，默认 single
 * @attr {boolean} disabled - 整个控件禁用：trigger 转原生 disabled，段位退出 Tab 序
 * @attr {boolean} read-only - 只读：浮层照常展开、日历照常浏览，但选中值改不动
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} required - 必填标注，落到每段的 aria-required 上
 * @attr {string} name - 表单字段名；给了隐藏输入才带 name
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} close-on-select - 选完即收起，默认 true；写 close-on-select="false" 关掉
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires focused-value-change - 聚焦日变化（意味着展示月可能换了）；detail 为 `{ focusedValue: string }`，作者据此重画网格
 * @csspart root - 组件根容器（承载 data-state/data-disabled/data-readonly/data-invalid）
 * @csspart label - 标题；点它把焦点送进首段。刻意不是原生 label（段位是 div，标不了）
 * @csspart control - 输入行容器，同时是浮层的定位锚点
 * @csspart input - role=group 的分段容器，段位挂在它里面
 * @csspart segment - 一段一个的 spinbutton 节点（data-scope="date-field"），可自带 index 属性
 * @csspart trigger - 展开日历的按钮，须是原生 button
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位且对读屏隐藏
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=dialog 浮层（消解层的根节点），收起时带 hidden
 * @csspart calendar - 内嵌日历的挂载点，同时充当日历的根节点
 * @csspart header - 日历标题栏外壳（data-scope="calendar"）
 * @csspart prev-trigger - 上一月；越过 min 时转原生 disabled
 * @csspart next-trigger - 下一月；越过 max 时转原生 disabled
 * @csspart heading - 展示月标题（grid 的 aria-labelledby 目标）
 * @csspart grid - role=grid 容器，网格键盘在此收口
 * @csspart grid-head - role=rowgroup 表头组，里面套一个 week-row
 * @csspart week-day - role=columnheader 列头，须自带 value 属性标明列序 0-6
 * @csspart grid-body - role=rowgroup 日期组
 * @csspart week-row - role=row 周行，表头与日期行共用
 * @csspart cell - role=gridcell 日期格，须自带 value 属性（ISO 串）
 * @csspart cell-trigger - 真正可点可聚焦的那一层，承载 aria-selected 与 roving tabindex
 * @csspart hidden-input - type=hidden 的表单出口，值是 ISO 串
 */
export class XhDatePickerElement extends XhElement {
  // 分段输入与日历的 DOM 摊在本元素的 Light DOM 里由本元素接线，它们的角色节点归各自 scope 管
  static override partContract = {
    anatomy: datePickerAnatomy,
    meta: datePickerMeta,
    delegates: [dateFieldAnatomy, calendarAnatomy],
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    min: { converter: STRING_CONVERTER },
    max: { converter: STRING_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    timeZone: { converter: STRING_CONVERTER, attribute: 'time-zone' },
    selectionMode: { converter: STRING_CONVERTER, attribute: 'selection-mode' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    closeOnSelect: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-select' },
    // 判定函数只走 property
    isDateUnavailable: { attribute: false },
  }

  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare open?: boolean
  declare defaultOpen?: boolean
  declare min?: string
  declare max?: string
  declare locale?: string
  declare timeZone?: string
  declare selectionMode?: CalendarSelectionMode
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare placement?: Placement
  declare offset?: number
  declare closeOnSelect?: boolean
  declare isDateUnavailable?: (value: string) => boolean

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // 三台机器共用一份 scope，part id 里带组件名故不相撞
  private readonly pickerScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  private readonly notifyValue = (details: DatePickerValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: DatePickerOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  // 网格由作者渲染，这条是「该重画了」的信号
  private readonly notifyFocus = (details: DatePickerFocusChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('focused-value-change', { detail: details, bubbles: true, composed: true }))
  }

  // 声明顺序即 controller 挂载顺序：两台内嵌机器的 props 从编排机现读，编排机须先建
  private readonly rootCtrl = new MachineController<DatePickerSchema>(
    this,
    datePickerMachine,
    () => this.machineProps(),
    { scope: this.pickerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private readonly calendarCtrl = new MachineController<CalendarSchema>(
    this,
    calendarMachine,
    () => datePickerCalendarProps(this.rootCtrl.service),
    {
      scope: this.pickerScope,
      // 机器跨月后靠它把焦点送进重画出来的格子
      onBuilt: (service) => {
        service.refs.set('getGridEl', () => this.getPart('grid'))
      },
    },
  )

  private readonly fieldCtrl = new MachineController<DateFieldSchema>(
    this,
    dateFieldMachine,
    () => datePickerFieldProps(this.rootCtrl.service),
    { scope: this.pickerScope },
  )

  private services(): DatePickerServices {
    return { root: this.rootCtrl.service, calendar: this.calendarCtrl.service, field: this.fieldCtrl.service }
  }

  private machineProps(): Partial<DatePickerSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      min: this.min,
      max: this.max,
      locale: this.locale,
      timeZone: this.timeZone,
      selectionMode: this.selectionMode,
      isDateUnavailable: this.isDateUnavailable,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      required: this.required ?? false,
      name: this.name,
      placement: this.placement,
      offset: this.offset,
      closeOnSelect: this.closeOnSelect,
      onValueChange: this.notifyValue,
      onOpenChange: this.notifyOpen,
      onFocusedValueChange: this.notifyFocus,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.pickerScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 整个输入行记为本层分支：点 trigger 或段位算层内交互，开合交给它们自己切换。
      branches: () => [this.getPart('control')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<DatePickerSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('control'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /** 提前发现一次角色节点：default-open 时焦点域在 hostConnected 当场要去 content 里找聚焦日那一格。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /** 当前展示月的日期矩阵，作者照它重画网格。机器尚未建起时给空数组。 */
  get weeks(): CalendarDay[][] {
    return this.rootCtrl.service ? connectDatePicker(this.services(), wcNormalize).calendar.weeks : []
  }

  /** 七列表头（缩写 + 全称），列序与 weeks 的列序一致。 */
  get weekDays(): CalendarWeekDay[] {
    return this.rootCtrl.service ? connectDatePicker(this.services(), wcNormalize).calendar.weekDays : []
  }

  /** 展示月标题文案，作者写进 heading 节点。 */
  get headingLabel(): string {
    return this.rootCtrl.service ? connectDatePicker(this.services(), wcNormalize).calendar.headingLabel : ''
  }

  /** 取 owner 子树内指定名字的角色节点。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectDatePicker(this.services(), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('calendar', api.getCalendarProps() as Record<string, unknown>)
    put('hidden-input', api.field.getHiddenInputProps() as Record<string, unknown>)

    // 段位逐个打；wire 跑在事件之前，换段时 data-scope/data-part 已在 DOM 上供现查
    this.getParts('segment').forEach((el, position) => {
      const index = declaredIndex(el, position)
      this.spreader.spread(el, api.field.getSegmentProps({ index }) as Record<string, unknown>)
      const state = api.field.segments[index]
      // 段位文字归元素写，比对后再赋值
      const text = state?.text ?? ''
      if (el.textContent !== text)
        el.textContent = text
      // 用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
      this.setPartHidden(el, state == null)
    })

    // 内嵌日历的角色节点：行为取自本元素持有的那台日历机器
    put('header', api.calendar.getHeaderProps() as Record<string, unknown>)
    put('prev-trigger', api.calendar.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.calendar.getNextTriggerProps() as Record<string, unknown>)
    put('heading', api.calendar.getHeadingProps() as Record<string, unknown>)
    put('grid', api.calendar.getGridProps() as Record<string, unknown>)
    put('grid-head', api.calendar.getGridHeadProps() as Record<string, unknown>)
    put('grid-body', api.calendar.getGridBodyProps() as Record<string, unknown>)

    // 表头行与日期行共用 role=row，一并打
    for (const el of this.getParts('week-row'))
      this.spreader.spread(el, api.calendar.getWeekRowProps() as Record<string, unknown>)

    // 列头身份取作者写的 value（列序 0-6）；漏写给 NaN，不写 aria-label
    for (const el of this.getParts('week-day')) {
      const raw = el.getAttribute('value')
      const index = raw == null || raw === '' ? Number.NaN : Number(raw)
      this.spreader.spread(el, api.calendar.getWeekDayProps({ value: index }) as Record<string, unknown>)
    }

    // 日期格逐个打，身份取 cell 上的 value，格内 trigger 跟着同一份声明走
    for (const el of this.getParts('cell')) {
      const cell = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.calendar.getCellProps(cell) as Record<string, unknown>)
      for (const trigger of this.partsIn(el, 'cell-trigger'))
        this.spreader.spread(trigger, api.calendar.getCellTriggerProps(cell) as Record<string, unknown>)
    }

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    this.setPartHidden(this.getPart('content'), !api.open)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层随机器停机一并撤掉，此处不再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
