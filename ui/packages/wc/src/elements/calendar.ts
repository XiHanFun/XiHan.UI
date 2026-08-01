import type {
  CalendarDay,
  CalendarFocusChangeDetails,
  CalendarSchema,
  CalendarSelectionMode,
  CalendarValueChangeDetails,
  CalendarWeekDay,
  CalendarWeekdayFormat,
} from '@xihan-ui/headless'
import { calendarAnatomy, calendarMachine, calendarMeta, connectCalendar } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-calendar>` —— 日历行为宿主。
 *
 * 网格由作者渲染，元素不生成节点：读 `weeks` / `weekDays` / `headingLabel` 三个只读属性，
 * 听 `focused-value-change` 重画（须在收到事件的同一拍内完成）。日期身份取 cell 上的
 * `value`（ISO 串），cell-trigger 跟随所在 cell；表头列取 week-day 上的 `value`（列序 0-6）。
 * 翻月按钮的可及名字由作者给。
 *
 * @customElement xh-calendar
 * @attr {string} value - 受控选中值（单选简写，ISO 串）；缺省即非受控，多选/区间用 property
 * @attr {string} default-value - 非受控初始选中值
 * @attr {'single'|'multiple'|'range'} selection-mode - 选择模式，默认 single
 * @attr {string} focused-value - 受控聚焦日（ISO 串），同时决定展示哪个月
 * @attr {string} default-focused-value - 非受控初始聚焦日；缺省时退回首个选中值，再退回今天
 * @attr {string} min - 可选范围下界（含当天），界外的日子转 aria-disabled 但仍可聚焦
 * @attr {string} max - 可选范围上界（含当天）
 * @attr {string} locale - 决定周首日与文案，默认 zh-CN
 * @attr {string} time-zone - 判定今天与格式化用的时区，默认宿主本地时区
 * @attr {boolean} disabled - 整张禁用：翻月按钮转原生 disabled，格子全转 aria-disabled
 * @attr {boolean} read-only - 只读：翻月与移动焦点照常，只是选不动值
 * @attr {'narrow'|'short'} weekday-format - 表头缩写粒度，默认 short
 * @attr {boolean} fixed-weeks - 恒渲染六行
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires focused-value-change - 聚焦日变化；detail 为 `{ focusedValue: string }`
 * @csspart root - 组件根容器
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
 * @csspart cell-trigger - 可点可聚焦层，承载 aria-selected/aria-disabled 与 roving tabindex
 */
export class XhCalendarElement extends XhElement {
  static override partContract = { anatomy: calendarAnatomy, meta: calendarMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
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
    // 三个开关缺省为假，属性在场即真
    disabled: { type: Boolean },
    readOnly: { type: Boolean, attribute: 'read-only' },
    fixedWeeks: { type: Boolean, attribute: 'fixed-weeks' },
    // 判定函数只走 property
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
      // 机器跨月后靠它把焦点送进重画出来的格子
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

  /** 取指定角色节点在 owner 子树内的实例。 */
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

    // 列头身份取作者写的 value（列序 0-6）；漏写给 NaN，不写 aria-label
    for (const el of this.getParts('week-day')) {
      const raw = el.getAttribute('value')
      const index = raw == null || raw === '' ? Number.NaN : Number(raw)
      this.spreader.spread(el, api.getWeekDayProps({ value: index }) as Record<string, unknown>)
    }

    // 日期格逐个打，身份取 cell 上的 value，格内 trigger 跟着同一份声明走
    for (const el of this.getParts('cell')) {
      const cell = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getCellProps(cell) as Record<string, unknown>)
      for (const trigger of this.partsIn(el, 'cell-trigger'))
        this.spreader.spread(trigger, api.getCellTriggerProps(cell) as Record<string, unknown>)
    }
  }
}
