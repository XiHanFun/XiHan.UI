import type {
  CalendarDay,
  CalendarSchema,
  CalendarSelectionMode,
  CalendarView,
  CalendarViewChangeDetails,
  CalendarWeekDay,
  DateFieldSchema,
  DatePickerFieldApi,
  DatePickerFocusChangeDetails,
  DatePickerOpenChangeDetails,
  DatePickerSchema,
  DatePickerServices,
  DatePickerValueChangeDetails,
  DateSegmentSet,
} from '@xihan-ui/headless'
import type { Cleanup, ControlVariant, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { calendarAnatomy, calendarMachine, connectDatePicker, dateFieldAnatomy, dateFieldMachine, datePickerAnatomy, datePickerCalendarProps, datePickerFieldEndProps, datePickerFieldProps, datePickerMachine, datePickerMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 取作者写在段位上的 index，缺席或写坏了退回组内文档序。 */
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
 * 段位可自带 `index` 属性声明下标，缺省按所在 input 之内的文档序。
 *
 * 区间模式（selection-mode="range"）下 input 写两个：文档序在前的是起点、在后的是终点，
 * 各自内部写一整套段位。段位与 hidden-input 按所在 input 归组，方向键不跨组；
 * hidden-input 写在 input 之外（如与 control 平级）时按文档序对应起止两端。
 * 其余模式只认第一个 input。
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
 * @attr {'day'|'month'|'quarter'|'year'} view - 挑的粒度，默认 day；输入行铺哪几段也跟着它走
 * @attr {'day'|'month'|'quarter'|'year'} active-view - 受控：面板此刻钻到了哪一层；缺省跟着 view，每次展开都拨回去
 * @attr {boolean} week-selection - 周选：点任意一天选中它所在的整周（view=day 且区间模式下生效）
 * @attr {number} visible-count - 并排展示几页
 * @attr {boolean} disabled - 整个控件禁用：trigger 转原生 disabled，段位退出 Tab 序
 * @attr {boolean} read-only - 只读：浮层照常展开、日历照常浏览，但选中值改不动
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} required - 必填标注，落到每段的 aria-required 上
 * @attr {string} name - 表单字段名；给了隐藏输入才带 name。区间模式下是起点那一份
 * @attr {string} end-name - 区间终点那份隐藏输入的表单字段名；不给即终点不参与提交
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} close-on-select - 选完即收起，默认 true；写 close-on-select="false" 关掉
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires focused-value-change - 聚焦日变化（意味着展示月可能换了）；detail 为 `{ focusedValue: string }`，作者据此重画网格
 * @fires active-view-change - 钻到了另一层（点标题钻上、点格子钻下）；detail 为 `{ activeView: 'day'|'month'|'quarter'|'year' }`，作者据此重画网格
 * @csspart root - 组件根容器（承载 data-state/data-disabled/data-readonly/data-invalid）
 * @csspart label - 标题；点它把焦点送进首段。刻意不是原生 label（段位是 div，标不了）
 * @csspart control - 输入行容器，同时是浮层的定位锚点
 * @csspart input - role=group 的分段容器，段位挂在它里面；区间模式下有起止两个，data-index 区分
 * @csspart segment - 一段一个的 spinbutton 节点（data-scope="date-field"），可自带 index 属性；下标在所属 input 组内数
 * @csspart trigger - 展开日历的按钮，须是原生 button
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位且对读屏隐藏
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=dialog 浮层（消解层的根节点），收起时带 hidden
 * @csspart calendar - 内嵌日历的挂载点，同时充当日历的根节点
 * @csspart time-column - showTime 的时间列，须自带 unit 属性（hour/minute/second）；没开时带 hidden
 * @csspart time-item - 时间选项，须自带 value 属性（两位补零串）；点按把该单位写进值
 * @csspart confirm-trigger - showTime 的收口按钮；没开时带 hidden
 * @csspart header - 日历标题栏外壳（data-scope="calendar"）
 * @csspart prev-year-trigger - 快速往前翻一大步（日视图一年、粗粒度十页）；可选
 * @csspart prev-trigger - 上一月；越过 min 时转原生 disabled
 * @csspart next-trigger - 下一月；越过 max 时转原生 disabled
 * @csspart next-year-trigger - 快速往后翻一大步；可选
 * @csspart heading - 展示月标题（grid 的 aria-labelledby 目标）
 * @csspart heading-year-trigger - 标题里年那一截，点它钻到十年格；可选
 * @csspart heading-month-trigger - 标题里月那一截，点它钻到月格；只有日视图有这一截；可选
 * @csspart grid - role=grid 容器，网格键盘在此收口
 * @csspart grid-head - role=rowgroup 表头组，里面套一个 week-row
 * @csspart week-day - role=columnheader 列头，须自带 value 属性标明列序 0-6
 * @csspart grid-body - role=rowgroup 日期组
 * @csspart week-row - role=row 周行，表头与日期行共用
 * @csspart week-number - 行首的周序号格（role=rowheader），须自带 value 属性（行首那天）；可选
 * @csspart cell - role=gridcell 日期格，承载 aria-selected；须自带 value 属性（ISO 串）
 * @csspart cell-trigger - 真正可点可聚焦的那一层，承载 aria-disabled 与 roving tabindex
 * @csspart hidden-input - type=hidden 的表单出口，值是 ISO 串；区间模式下起止各一份
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
    view: { converter: STRING_CONVERTER },
    activeView: { converter: STRING_CONVERTER, attribute: 'active-view' },
    segments: { attribute: false },
    weekSelection: { converter: BOOLEAN_CONVERTER, attribute: 'week-selection' },
    visibleCount: { converter: NUMBER_CONVERTER, attribute: 'visible-count' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    endName: { converter: STRING_CONVERTER, attribute: 'end-name' },
    // 文案是对象，只能走 property
    translations: { attribute: false },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    closeOnSelect: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-select' },
    showTime: { converter: BOOLEAN_CONVERTER, attribute: 'show-time' },
    timeGranularity: { converter: STRING_CONVERTER, attribute: 'time-granularity' },
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
  declare view?: CalendarView
  declare activeView?: CalendarView
  declare segments?: DateSegmentSet
  declare weekSelection?: boolean
  declare visibleCount?: number
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare endName?: string
  declare translations?: DatePickerSchema['props']['translations']
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare placement?: Placement
  declare offset?: number
  declare closeOnSelect?: boolean
  declare showTime?: boolean
  declare timeGranularity?: DatePickerSchema['props']['timeGranularity']
  declare isDateUnavailable?: (value: string) => boolean

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // 四台机器共用一份 scope，part id 里带组件名故不相撞
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
  private readonly notifyActiveView = (details: CalendarViewChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('active-view-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyFocus = (details: DatePickerFocusChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('focused-value-change', { detail: details, bubbles: true, composed: true }))
  }

  // 声明顺序即 controller 挂载顺序：三台内嵌机器的 props 从编排机现读，编排机须先建
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

  // 终点那组段位；一律建起来不按模式条件建，机器实例数得是定数。
  // 非区间模式下它的值恒为空、写值入口自锁，connect 也不把它露出来
  private readonly fieldEndCtrl = new MachineController<DateFieldSchema>(
    this,
    dateFieldMachine,
    () => datePickerFieldEndProps(this.rootCtrl.service),
    { scope: this.pickerScope },
  )

  private services(): DatePickerServices {
    return {
      root: this.rootCtrl.service,
      calendar: this.calendarCtrl.service,
      field: this.fieldCtrl.service,
      fieldEnd: this.fieldEndCtrl.service,
    }
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
      view: this.view,
      activeView: this.activeView,
      segments: this.segments,
      weekSelection: this.weekSelection,
      visibleCount: this.visibleCount,
      isDateUnavailable: this.isDateUnavailable,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      required: this.required ?? false,
      name: this.name,
      endName: this.endName,
      translations: this.translations,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      placement: this.placement,
      offset: this.offset,
      closeOnSelect: this.closeOnSelect,
      showTime: this.showTime,
      timeGranularity: this.timeGranularity,
      onValueChange: this.notifyValue,
      onOpenChange: this.notifyOpen,
      onFocusedValueChange: this.notifyFocus,
      onActiveViewChange: this.notifyActiveView,
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

  /**
   * 把隐藏输入分到起止两端：写在某个 input 之内的归那一组，
   * 写在全部 input 之外的按自己的文档序对号入座。多出来的一律不接线。
   */
  private hiddenInputGroups(inputs: readonly HTMLElement[]): HTMLElement[][] {
    const groups: HTMLElement[][] = [[], []]
    this.getParts('hidden-input').forEach((el, position) => {
      const owned = inputs.findIndex(input => input.contains(el))
      groups[owned >= 0 ? owned : position]?.push(el)
    })
    return groups
  }

  /** 打一组段位：下标在组内从 0 数起，段位文字与收起态一并落。 */
  private wireSegments(owner: HTMLElement, field: DatePickerFieldApi): void {
    // wire 跑在事件之前，换段时 data-scope/data-part 已在 DOM 上供现查
    this.partsIn(owner, 'segment').forEach((el, position) => {
      const index = declaredIndex(el, position)
      this.spreader.spread(el, field.getSegmentProps({ index }) as Record<string, unknown>)
      const state = field.segments[index]
      // 段位文字归元素写，比对后再赋值
      const text = state?.text ?? ''
      if (el.textContent !== text)
        el.textContent = text
      // 用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
      this.setPartHidden(el, state == null)
    })
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
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('calendar', api.getCalendarProps() as Record<string, unknown>)
    put('confirm-trigger', api.getConfirmTriggerProps() as Record<string, unknown>)

    // 时间列是多实例 part：列自报 unit、选项自报 unit+value
    for (const el of this.getParts('time-column'))
      this.spreader.spread(el, api.getTimeColumnProps({ unit: (el.getAttribute('unit') ?? 'hour') as 'hour' | 'minute' | 'second' }) as Record<string, unknown>)
    for (const el of this.getParts('time-item')) {
      this.spreader.spread(el, api.getTimeItemProps({
        unit: (el.closest('[data-xh-part="time-column"]')?.getAttribute('unit') ?? 'hour') as 'hour' | 'minute' | 'second',
        value: el.getAttribute('value') ?? '',
      }) as Record<string, unknown>)
    }

    // 起止两组各自成组：段位与隐藏输入按所属 input 归组，跨组不共用下标。
    // input 可缺省，作者没写就拿宿主自身当归组容器，段位全归起点那一组
    const inputs = this.getParts('input')
    const owners = [inputs[0] ?? (this as unknown as HTMLElement), inputs[1]]
    const hiddenInputs = this.hiddenInputGroups(inputs)
    for (const index of [0, 1] as const) {
      // 非区间模式没有终点那一组，作者多写的 input、段位与隐藏输入一概不接线
      const field = index === 0 ? api.field : api.fieldEnd
      if (!field)
        continue
      const input = inputs[index]
      if (input)
        this.spreader.spread(input, api.getInputProps({ index }) as Record<string, unknown>)
      const owner = owners[index]
      if (owner)
        this.wireSegments(owner, field)
      for (const el of hiddenInputs[index] ?? [])
        this.spreader.spread(el, field.getHiddenInputProps() as Record<string, unknown>)
    }

    // 内嵌日历的角色节点：行为取自本元素持有的那台日历机器
    put('header', api.calendar.getHeaderProps() as Record<string, unknown>)
    put('prev-year-trigger', api.calendar.getPrevYearTriggerProps() as Record<string, unknown>)
    put('prev-trigger', api.calendar.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.calendar.getNextTriggerProps() as Record<string, unknown>)
    put('next-year-trigger', api.calendar.getNextYearTriggerProps() as Record<string, unknown>)
    // 面板逐个打：下标取作者写的 index，没写就按文档序（第 N 张就是第 N 个面板）
    this.getParts('heading').forEach((el, position) => {
      this.spreader.spread(el, api.calendar.getHeadingProps({ index: declaredIndex(el, position) }) as Record<string, unknown>)
    })
    // 标题里的年与月两个钮：属性由 connect 打，文字归元素填
    this.getParts('heading-year-trigger').forEach((el, position) => {
      const index = declaredIndex(el, position)
      this.spreader.spread(el, api.calendar.getHeadingYearTriggerProps({ index }) as Record<string, unknown>)
      const text = api.calendar.panels[index]?.headingYear ?? ''
      if (el.textContent !== text)
        el.textContent = text
    })
    this.getParts('heading-month-trigger').forEach((el, position) => {
      const index = declaredIndex(el, position)
      this.spreader.spread(el, api.calendar.getHeadingMonthTriggerProps({ index }) as Record<string, unknown>)
      const text = api.calendar.panels[index]?.headingMonth ?? ''
      if (el.textContent !== text)
        el.textContent = text
      // connect 已置 hidden，但作者若设了 display 就会盖过 UA 的 [hidden]{display:none}
      this.setPartHidden(el, !api.calendar.canZoomOutMonth)
    })
    this.getParts('grid').forEach((el, position) => {
      this.spreader.spread(el, api.calendar.getGridProps({ index: declaredIndex(el, position) }) as Record<string, unknown>)
    })
    put('grid-head', api.calendar.getGridHeadProps() as Record<string, unknown>)
    put('grid-body', api.calendar.getGridBodyProps() as Record<string, unknown>)

    // 表头行与日期行共用 role=row，一并打
    // 周序号格：身份取行首那天，文字由元素填
    for (const el of this.getParts('week-number')) {
      const value = el.getAttribute('value') ?? ''
      this.spreader.spread(el, api.calendar.getWeekNumberProps({ value }) as Record<string, unknown>)
      // 文字归元素写，比对后再赋值（这份元素没有 fillText，与段位那处同一套写法）
      const text = api.calendar.getWeekNumberText({ value })
      if (el.textContent !== text)
        el.textContent = text
    }

    for (const el of this.getParts('week-row'))
      this.spreader.spread(el, api.calendar.getWeekRowProps() as Record<string, unknown>)

    // 列头身份取作者写的 value（列序 0-6）；漏写给 NaN，不写 aria-label
    for (const el of this.getParts('week-day')) {
      const raw = el.getAttribute('value')
      const index = raw == null || raw === '' ? Number.NaN : Number(raw)
      this.spreader.spread(el, api.calendar.getWeekDayProps({ value: index }) as Record<string, unknown>)
    }

    // 日期格逐个打，身份取 cell 上的 value，格内 trigger 跟着同一份声明走
    const gridEls = this.getParts('grid')
    for (const el of this.getParts('cell')) {
      // 格子归哪个面板：找它所在的那张 grid，取 grid 的下标（作者不必逐格再写一遍）
      const owner = gridEls.findIndex(grid => grid.contains(el))
      const ownerGrid = owner < 0 ? null : gridEls[owner]!
      const cell = {
        value: el.getAttribute('value') ?? '',
        index: ownerGrid ? declaredIndex(ownerGrid, owner) : 0,
      }
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
