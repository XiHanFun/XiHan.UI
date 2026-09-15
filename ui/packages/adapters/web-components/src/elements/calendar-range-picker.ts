/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar range picker 相关实现。

import type {
  CalendarDay,
  CalendarFocusChangeDetails,
  CalendarGranularity,
  CalendarPanel,
  CalendarPeriod,
  CalendarRangePickerSchema,
  CalendarRangePickerTranslations,
  CalendarRangePickerValueChangeDetails,
  CalendarView,
  CalendarViewChangeDetails,
  CalendarWeekDay,
  CalendarWeekdayFormat,
} from '@xihan-ui/headless'
import { calendarRangePickerAnatomy, calendarRangePickerMachine, calendarRangePickerMeta, connectCalendarRangePicker } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/** 作者写的面板下标；写坏了或没写按 0 算。 */
function declaredIndex(el: Element | null | undefined, fallback = 0): number {
  const raw = el?.getAttribute('index')?.trim()
  const n = raw == null || raw === '' ? Number.NaN : Number(raw)
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : fallback
}

/**
 * `<xh-calendar-range-picker>`：日历范围选择器行为宿主：先落下起点再落下终点。
 *
 * 网格由作者渲染，元素不生成节点：读取 `weeks` / `weekDays` / `headingLabel` 三个只读属性，
 * 监听 `focused-value-change` 重绘（须在收到事件的同一拍内完成）。日期身份取 cell 上的
 * `value`（ISO 串），cell-trigger 跟随所在 cell；表头列取 week-day 上的 `value`（列序 0-6）。
 * 翻月按钮的可及名由作者提供。
 *
 * @customElement xh-calendar-range-picker
 * @prop {string[]} value - 受控区间两端（升序 ISO 串）；未提供即非受控，只能通过 property 设置
 * @prop {string[]} default-value - 非受控初始区间
 * @attr {string} focused-value - 受控聚焦日（ISO 串），同时决定展示哪个月
 * @attr {string} default-focused-value - 非受控初始聚焦日；未提供时回退为首个选中值，再回退为今天
 * @attr {string} min - 可选范围下界（含当天），界外的日期为 aria-disabled 但仍可聚焦
 * @attr {string} max - 可选范围上界（含当天）
 * @attr {string} locale - 决定周首日与文案；未提供时按宿主语言，宿主也没有时按 en-US
 * @attr {string} time-zone - 判定今天与格式化使用的时区，默认宿主本地时区
 * @attr {boolean} disabled - 整张禁用：翻月按钮为原生 disabled，格子全部为 aria-disabled
 * @attr {boolean} read-only - 只读：翻月与移动焦点照常，只是不可选择值
 * @attr {boolean} invalid - 校验失败：根带 data-invalid，区间中的格子报告 aria-invalid；已选区间某一端越界或不可用时也会自行判定
 * @attr {boolean} allows-non-contiguous-ranges - 区间允许跨过不可用的日期；默认关闭，落下起点后只能选到两侧最近的不可用日为止
 * @prop {Partial<CalendarRangePickerTranslations>} translations - 读屏文案（选择区间的提示、区间两端的名字、今天），只能通过 property 设置
 * @attr {'narrow'|'short'} weekday-format - 表头缩写粒度，默认 short
 * @attr {boolean} fixed-weeks - 恒渲染六行
 * @attr {'day'|'week'|'month'|'quarter'|'year'} granularity - 选择粒度，默认 day
 * @attr {'day'|'week'|'month'|'quarter'|'year'} active-view - 受控：面板当前所在的层级；未提供时跟随 granularity
 * @attr {'day'|'week'|'month'|'quarter'|'year'} default-active-view - 非受控初值，默认同 granularity
 * @attr {number} visible-count - 并排展示的页数
 * @fires value-change - 区间两端都落定；detail 为 `{ value: string[] }`，长度恒为 2
 * @fires focused-value-change - 聚焦日变化；detail 为 `{ focusedValue: string }`
 * @fires active-view-change - 切换到另一层级；detail 为 `{ activeView: 'day'|'week'|'month'|'quarter'|'year' }`
 * @csspart root - 组件根容器
 * @csspart header - 标题栏外壳
 * @csspart prev-year-trigger - 快速向前翻一大步（日视图一年、粗粒度十页）；可选
 * @csspart prev-trigger - 上一月；越过 min 时为原生 disabled
 * @csspart next-trigger - 下一月；越过 max 时为原生 disabled
 * @csspart next-year-trigger - 快速向后翻一大步；可选
 * @csspart heading - 展示月标题（grid 的 aria-labelledby 目标）
 * @csspart heading-year-trigger - 标题中的年，点击切换到十年格；文字由元素填入。年视图下已到顶层，为原生 disabled；可选
 * @csspart heading-month-trigger - 标题中的月，点击切换到月格；只有日视图有该部分，其余层级带 hidden；可选
 * @csspart grid - role=grid 容器，键盘在此收口
 * @csspart grid-head - role=rowgroup 表头组，其中包含一个 week-row
 * @csspart week-day - role=columnheader 列头，须自带 value 属性标明列序 0-6
 * @csspart grid-body - role=rowgroup 日期组
 * @csspart week-row - role=row 周行，表头与日期行共用
 * @csspart week-number - 行首的周序号格（role=rowheader），须自带 value 属性（行首日期）；可选
 * @csspart cell - role=gridcell 日期格，承载 aria-selected；须自带 value 属性（ISO 串）标明日期
 * @csspart cell-trigger - 可点击可聚焦层，承载 aria-disabled 与 roving tabindex
 */
export class XhCalendarRangePickerElement extends XhElement {
  static override partContract = { anatomy: calendarRangePickerAnatomy, meta: calendarRangePickerMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
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
    invalid: { type: Boolean },
    allowsNonContiguousRanges: { type: Boolean, attribute: 'allows-non-contiguous-ranges' },
    granularity: { converter: STRING_CONVERTER },
    activeView: { converter: STRING_CONVERTER, attribute: 'active-view' },
    defaultActiveView: { converter: STRING_CONVERTER, attribute: 'default-active-view' },
    visibleCount: { converter: NUMBER_CONVERTER, attribute: 'visible-count' },
    // 判定函数与文案对象只走 property
    isDateUnavailable: { attribute: false },
    translations: { attribute: false },
  }

  declare value?: string | string[]
  declare defaultValue?: string | string[]
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
  declare invalid?: boolean
  declare allowsNonContiguousRanges?: boolean
  declare granularity?: CalendarGranularity
  declare activeView?: CalendarView
  declare defaultActiveView?: CalendarView
  declare visibleCount?: number
  declare isDateUnavailable?: (value: string, anchor: string | null) => boolean
  declare translations?: Partial<CalendarRangePickerTranslations>

  private readonly notifyValue = (details: CalendarRangePickerValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyFocus = (details: CalendarFocusChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('focused-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyActiveView = (details: CalendarViewChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('active-view-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CalendarRangePickerSchema>(
    this,
    calendarRangePickerMachine,
    () => this.machineProps(),
    {
      // 机器跨月后靠它把焦点送进重画出来的格子
      onBuilt: (service) => {
        service.refs.set('getGridEl', () => this.getPart('grid'))
        // 区间挑到一半时，指针在根节点之外松开就地收口
        service.refs.set('getBoundaryEls', () => [this.getPart('root')])
      },
    },
  )

  private machineProps(): Partial<CalendarRangePickerSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      focusedValue: this.focusedValue,
      defaultFocusedValue: this.defaultFocusedValue,
      min: this.min,
      max: this.max,
      isDateUnavailable: this.isDateUnavailable,
      allowsNonContiguousRanges: this.allowsNonContiguousRanges ?? false,
      invalid: this.invalid ?? false,
      locale: this.locale,
      timeZone: this.timeZone,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      weekdayFormat: this.weekdayFormat,
      fixedWeeks: this.fixedWeeks ?? false,
      translations: this.translations,
      granularity: this.granularity,
      activeView: this.activeView,
      defaultActiveView: this.defaultActiveView,
      visibleCount: this.visibleCount,
      onValueChange: this.notifyValue,
      onFocusedValueChange: this.notifyFocus,
      onActiveViewChange: this.notifyActiveView,
    }
  }

  /** 视窗内的各张面板（visibleCount 张连续月），标题与格子都包含在内；多面板时按 index 各自渲染。状态机尚未建立时返回空数组。 */
  get panels(): CalendarPanel[] {
    return this.ctrl.service ? connectCalendarRangePicker(this.ctrl.service, wcNormalize).panels : []
  }

  /** 当前展示月的日期矩阵，作者据此渲染网格。状态机尚未建立时返回空数组。 */
  get weeks(): CalendarDay[][] {
    return this.ctrl.service ? connectCalendarRangePicker(this.ctrl.service, wcNormalize).weeks : []
  }

  /** 当前面板内的统一周期数据。 */
  get periods(): CalendarPeriod[] {
    return this.ctrl.service ? connectCalendarRangePicker(this.ctrl.service, wcNormalize).periods : []
  }

  /** 七列表头（缩写 + 全称），列序与 weeks 的列序一致。 */
  get weekDays(): CalendarWeekDay[] {
    return this.ctrl.service ? connectCalendarRangePicker(this.ctrl.service, wcNormalize).weekDays : []
  }

  /** 展示月标题文案，作者写入 heading 节点。 */
  get headingLabel(): string {
    return this.ctrl.service ? connectCalendarRangePicker(this.ctrl.service, wcNormalize).headingLabel : ''
  }

  /** 区间选择进行到一半时的起点（周期首日的 ISO 串）；其余情况为 null。 */
  get rangeAnchor(): string | null {
    return this.ctrl.service ? connectCalendarRangePicker(this.ctrl.service, wcNormalize).rangeAnchor : null
  }

  /** 取指定角色节点在 owner 子树内的实例。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectCalendarRangePicker(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('prev-year-trigger', api.getPrevYearTriggerProps() as Record<string, unknown>)
    put('prev-trigger', api.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.getNextTriggerProps() as Record<string, unknown>)
    put('next-year-trigger', api.getNextYearTriggerProps() as Record<string, unknown>)
    // 面板逐个打：下标取作者写的 index，没写就按文档序（第 N 张就是第 N 个面板）
    this.getParts('heading').forEach((el, position) => {
      this.spreader.spread(el, api.getHeadingProps({ index: declaredIndex(el, position) }) as Record<string, unknown>)
    })
    // 标题里的年与月两个钮：属性由 connect 打，文字归元素填（spreader 只管属性与事件）
    this.getParts('heading-year-trigger').forEach((el, position) => {
      const index = declaredIndex(el, position)
      this.spreader.spread(el, api.getHeadingYearTriggerProps({ index }) as Record<string, unknown>)
      const text = api.panels[index]?.headingYear ?? ''
      if (el.textContent !== text)
        el.textContent = text
    })
    this.getParts('heading-month-trigger').forEach((el, position) => {
      const index = declaredIndex(el, position)
      this.spreader.spread(el, api.getHeadingMonthTriggerProps({ index }) as Record<string, unknown>)
      const text = api.panels[index]?.headingMonth ?? ''
      if (el.textContent !== text)
        el.textContent = text
      // connect 已置 hidden，但作者若给它设了 display 就会盖过 UA 的 [hidden]{display:none}
      this.setPartHidden(el, !api.canZoomOutMonth)
    })
    this.getParts('grid').forEach((el, position) => {
      this.spreader.spread(el, api.getGridProps({ index: declaredIndex(el, position) }) as Record<string, unknown>)
    })
    // 多面板时每张 grid 各有一对表头组与日期组，逐个打；两组的属性不带面板下标
    for (const el of this.getParts('grid-head'))
      this.spreader.spread(el, api.getGridHeadProps() as Record<string, unknown>)
    for (const el of this.getParts('grid-body'))
      this.spreader.spread(el, api.getGridBodyProps() as Record<string, unknown>)

    // 表头行与日期行共用 role=row，一并打
    // 周序号格：身份取行首那天，文字由元素填
    for (const el of this.getParts('week-number')) {
      const value = el.getAttribute('value') ?? ''
      this.spreader.spread(el, api.getWeekNumberProps({ value }) as Record<string, unknown>)
      // 文字归元素写，比对后再赋值
      const text = api.getWeekNumberText({ value })
      if (el.textContent !== text)
        el.textContent = text
    }

    for (const el of this.getParts('week-row'))
      this.spreader.spread(el, api.getWeekRowProps() as Record<string, unknown>)

    // 列头身份取作者写的 value（列序 0-6）；漏写给 NaN，不写 aria-label
    for (const el of this.getParts('week-day')) {
      const raw = el.getAttribute('value')
      const index = raw == null || raw === '' ? Number.NaN : Number(raw)
      this.spreader.spread(el, api.getWeekDayProps({ value: index }) as Record<string, unknown>)
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
      this.spreader.spread(el, api.getCellProps(cell) as Record<string, unknown>)
      for (const trigger of this.partsIn(el, 'cell-trigger'))
        this.spreader.spread(trigger, api.getCellTriggerProps(cell) as Record<string, unknown>)
    }
  }
}
