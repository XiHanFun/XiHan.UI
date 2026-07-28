import type {
  CalendarDay,
  CalendarFocusChangeDetails,
  CalendarSchema,
  CalendarSelectionMode,
  CalendarValueChangeDetails,
  CalendarWeekDay,
  CalendarWeekdayFormat,
} from '@xihan-ui/headless'
import { calendarMachine, connectCalendar } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席一律翻成 undefined：缺省值的唯一事实源留在机器与 connect 里。
// Lit 自带的转换器会把缺席落成 null，那样属性就再也表达不了"未指定"
// （value 尤其：落成 null 就分不出"非受控"与"受控且当前无选中"）。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-calendar>` —— Light-DOM 行为宿主：作者写 root/header/prev-trigger/next-trigger/heading
 * 与 grid/grid-head/week-row/week-day/grid-body/cell/cell-trigger 角色节点，
 * 元素跑 calendar 机器并把 connect 产出打上去。
 *
 * **网格由作者渲染，元素不生成节点**：读 `weeks` / `weekDays` / `headingLabel` 三个只读属性，
 * 听 `focused-value-change` 重画。生成节点就等于收走模板控制权，外层壳、农历副标题、
 * 节假日角标都再塞不进来。日期身份取 cell 节点上的 `value` 属性（ISO 串），
 * cell-trigger 跟着它所在的 cell 走，作者只写一次；表头列取 week-day 上的 `value`（列序 0-6）。
 *
 * 键盘跨月时元素会在重画之后把焦点送回落点那一格：重画得发生在收到
 * `focused-value-change` 的那一拍里，晚了焦点就掉回 body。
 *
 * 翻月按钮的可及名字由作者给（按钮里的文案或 aria-label）：本地化文案元素编不出来。
 *
 * @customElement xh-calendar
 * @attr {string} value - 受控选中值（单选简写，ISO 串）；缺省该属性即非受控，多选/区间请用 property
 * @attr {string} default-value - 非受控初始选中值
 * @attr {'single'|'multiple'|'range'} selection-mode - 选择模式，默认 single
 * @attr {string} focused-value - 受控聚焦日（ISO 串），同时决定展示哪个月
 * @attr {string} default-focused-value - 非受控初始聚焦日；缺省时退回首个选中值，再退回今天
 * @attr {string} min - 可选范围下界（含当天），界外的日子转 aria-disabled 但仍可聚焦
 * @attr {string} max - 可选范围上界（含当天）
 * @attr {string} locale - 决定周首日与文案，默认 zh-CN
 * @attr {string} time-zone - 判定"今天"与格式化用的时区，默认宿主本地时区
 * @attr {boolean} disabled - 整张禁用：翻月按钮转原生 disabled，格子全转 aria-disabled
 * @attr {boolean} read-only - 只读：翻月与移动焦点照常，只是选不动值
 * @attr {'narrow'|'short'} weekday-format - 表头缩写粒度，默认 short
 * @attr {boolean} fixed-weeks - 恒渲染六行，翻月时网格高度不跳
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires focused-value-change - 聚焦日变化（同时意味着展示月可能换了）；detail 为 `{ focusedValue: string }`
 * @csspart root - 组件根容器（承载 data-disabled/data-readonly）
 * @csspart header - 标题栏外壳
 * @csspart prev-trigger - 上一月；越过 min 时转原生 disabled
 * @csspart next-trigger - 下一月；越过 max 时转原生 disabled
 * @csspart heading - 展示月标题（grid 的 aria-labelledby 目标）
 * @csspart grid - role=grid 容器，键盘在此收口
 * @csspart grid-head - role=rowgroup 表头组，里面套一个 week-row
 * @csspart week-day - role=columnheader 列头，须自带 value 属性标明列序 0-6
 * @csspart grid-body - role=rowgroup 日期组
 * @csspart week-row - role=row 周行，表头与日期行共用
 * @csspart cell - role=gridcell 日期格，须自带 value 属性（ISO 串）标明是哪一天
 * @csspart cell-trigger - 真正可点可聚焦的那一层，承载 aria-selected/aria-disabled 与 roving tabindex
 */
export class XhCalendarElement extends XhElement {
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    selectionMode: { converter: STRING_CONVERTER, attribute: 'selection-mode' },
    focusedValue: { converter: STRING_CONVERTER, attribute: 'focused-value' },
    defaultFocusedValue: { converter: STRING_CONVERTER, attribute: 'default-focused-value' },
    min: { converter: STRING_CONVERTER },
    max: { converter: STRING_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    timeZone: { converter: STRING_CONVERTER, attribute: 'time-zone' },
    weekdayFormat: { converter: STRING_CONVERTER, attribute: 'weekday-format' },
    // 三个开关的缺省都是假，属性在场即真就够用；缺省为真的开关才需要三态转换器
    disabled: { type: Boolean },
    readOnly: { type: Boolean, attribute: 'read-only' },
    fixedWeeks: { type: Boolean, attribute: 'fixed-weeks' },
    // 判定函数是函数，走不了属性；只作为 property 暴露，与 Vue 侧同名 prop 对齐
    isDateUnavailable: { attribute: false },
  }

  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare selectionMode?: CalendarSelectionMode
  declare focusedValue?: string
  declare defaultFocusedValue?: string
  declare min?: string
  declare max?: string
  declare locale?: string
  declare timeZone?: string
  declare weekdayFormat?: CalendarWeekdayFormat
  declare disabled?: boolean
  declare readOnly?: boolean
  declare fixedWeeks?: boolean
  declare isDateUnavailable?: (value: string) => boolean

  private readonly notifyValue = (details: CalendarValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyFocus = (details: CalendarFocusChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('focused-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CalendarSchema>(
    this,
    calendarMachine,
    () => this.machineProps(),
    {
      // 跨月要把焦点送进重画之后才存在的那一格，机器得有个查活 DOM 的入口。
      // 重连时 controller 会重建机器，这个注入必须跟着重建走，否则第二次连上来焦点就搬不动了
      onBuilt: (service) => {
        service.refs.set('getGridEl', () => this.getPart('grid'))
      },
    },
  )

  private machineProps(): Partial<CalendarSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      selectionMode: this.selectionMode,
      focusedValue: this.focusedValue,
      defaultFocusedValue: this.defaultFocusedValue,
      min: this.min,
      max: this.max,
      isDateUnavailable: this.isDateUnavailable,
      locale: this.locale,
      timeZone: this.timeZone,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      weekdayFormat: this.weekdayFormat,
      fixedWeeks: this.fixedWeeks ?? false,
      onValueChange: this.notifyValue,
      onFocusedValueChange: this.notifyFocus,
    }
  }

  /** 当前展示月的日期矩阵，作者照它重画网格。机器尚未建起时给空数组。 */
  get weeks(): CalendarDay[][] {
    return this.ctrl.service ? connectCalendar(this.ctrl.service, wcNormalize).weeks : []
  }

  /** 七列表头（缩写 + 全称），列序与 weeks 的列序一致。 */
  get weekDays(): CalendarWeekDay[] {
    return this.ctrl.service ? connectCalendar(this.ctrl.service, wcNormalize).weekDays : []
  }

  /** 展示月标题文案，作者写进 heading 节点。 */
  get headingLabel(): string {
    return this.ctrl.service ? connectCalendar(this.ctrl.service, wcNormalize).headingLabel : ''
  }

  /** 格子内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectCalendar(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('prev-trigger', api.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.getNextTriggerProps() as Record<string, unknown>)
    put('heading', api.getHeadingProps() as Record<string, unknown>)
    put('grid', api.getGridProps() as Record<string, unknown>)
    put('grid-head', api.getGridHeadProps() as Record<string, unknown>)
    put('grid-body', api.getGridBodyProps() as Record<string, unknown>)

    // 表头行与日期行共用 role=row，一并打
    for (const el of this.getParts('week-row'))
      this.spreader.spread(el, api.getWeekRowProps() as Record<string, unknown>)

    // 列头身份取作者写的 value（列序 0-6）；漏写给 NaN，取不到全称就不写 aria-label，
    // 绝不冒充成第 0 列——那会让所有漏写的列头都自称"星期一"
    for (const el of this.getParts('week-day')) {
      const raw = el.getAttribute('value')
      const index = raw == null || raw === '' ? Number.NaN : Number(raw)
      this.spreader.spread(el, api.getWeekDayProps({ value: index }) as Record<string, unknown>)
    }

    // 日期格是多实例 part，逐个打：身份取 cell 上的 value，格子内的 trigger 跟着同一份声明走，
    // 作者因此只需在 cell 上写一次日期
    for (const el of this.getParts('cell')) {
      const cell = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getCellProps(cell) as Record<string, unknown>)
      for (const trigger of this.partsIn(el, 'cell-trigger'))
        this.spreader.spread(trigger, api.getCellTriggerProps(cell) as Record<string, unknown>)
    }
  }
}
