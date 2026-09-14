/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar picker 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CalendarCellBaseState, CalendarCellProps, CalendarPeriod } from '../shared/calendar'
import type { CalendarPickerApi, CalendarPickerSchema, CalendarPickerTranslations } from './calendar-picker.types'
import { dataAttr, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { createCalendarFrame } from '../shared/calendar'
import { calendarPickerAnatomy } from './calendar-picker.anatomy'

const parts = calendarPickerAnatomy.build()

function resolveTranslations(input: Partial<CalendarPickerTranslations> | undefined): CalendarPickerTranslations {
  return {
    todayDate: input?.todayDate ?? (date => `Today, ${date}`),
  }
}

export function connectCalendarPicker<T extends PropTypes>(
  service: Service<CalendarPickerSchema>,
  normalize: NormalizeProps<T>,
): CalendarPickerApi<T> {
  const { context, prop, send } = service
  const translations = resolveTranslations(prop('translations'))
  const frame = createCalendarFrame(service, calendarPickerAnatomy.name)
  const { periodAt, focusedValue, view, disabled: calendarDisabled, readOnly } = frame

  const mode = prop('selectionMode') ?? 'single'
  const value = context.get('value')
  const isDateUnavailable = prop('isDateUnavailable')
  const invalid = !!prop('invalid')

  /** 一个周期挡不挡得住落值：越过 min/max 任一边界即不可选，再交给作者的判定。 */
  const blockedBy = (period: CalendarPeriod): boolean =>
    frame.boundsBlocked(period) || !!isDateUnavailable?.(period.start)

  /** 一格可不可选。禁用的日历下恒不可选。 */
  const isUnavailable = (v: string): boolean => {
    if (calendarDisabled)
      return true
    const period = periodAt(v)
    return !period || blockedBy(period)
  }

  const selectedStarts = value
    .map(v => periodAt(v)?.start)
    .filter((v): v is string => v != null)
  const isSelected = (v: string): boolean => {
    const period = periodAt(v)
    return !!period && selectedStarts.includes(period.start)
  }

  /** 一格的派生状态：骨架那份之上加选中。 */
  const cellState = (item: CalendarCellProps): CalendarCellBaseState & { selected: boolean } => {
    const base = frame.cellBaseState(item, isUnavailable(item.value))
    return {
      ...base,
      selected: !base.ownedElsewhere && !!base.period && selectedStarts.includes(base.period.start),
    }
  }

  // cell 与 cell-trigger 共用同一份状态标记，样式层两处一致
  const stateAttrs = (state: ReturnType<typeof cellState>): Record<string, string | undefined> => ({
    'data-selected': dataAttr(state.selected),
    'data-disabled': dataAttr(state.disabled),
    'data-outside-month': dataAttr(state.outsideMonth),
    'data-today': dataAttr(state.isToday),
    'data-focus': dataAttr(state.focused),
  })

  /** 确认键：选中聚焦日。只读与不可用的日子不认，禁用的日历整条不进来。 */
  const commit = (): void => {
    if (readOnly || isUnavailable(focusedValue))
      return
    frame.selectAt(focusedValue)
  }

  return {
    value,
    selectionMode: mode,
    focusedValue,
    panels: frame.panels,
    visibleMonth: { year: frame.grid.year, month: frame.grid.month, startValue: frame.grid.startValue },
    weeks: frame.grid.weeks,
    periods: frame.grid.periods,
    weekDays: frame.weekDays,
    headingLabel: frame.grid.headingLabel,
    granularity: frame.granularity,
    activeView: view,
    headingOrder: frame.headingOrder,
    canZoomOutYear: frame.canZoomOutYear,
    canZoomOutMonth: frame.canZoomOutMonth,
    disabled: calendarDisabled,
    readOnly,
    invalid,
    isSelected,
    isUnavailable,
    canGoPrev: frame.canGoPrev,
    canGoNext: frame.canGoNext,
    canGoPrevYear: frame.canGoPrevYear,
    canGoNextYear: frame.canGoNextYear,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    select: v => frame.selectAt(v),
    focus: frame.focusAt,
    setActiveView: next => send({ type: 'VIEW.SET', activeView: next }),
    goToPrevMonth: () => frame.stepMonth(-1),
    goToNextMonth: () => frame.stepMonth(1),
    goToPrevYear: () => frame.stepYear(-1),
    goToNextYear: () => frame.stepYear(1),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(calendarDisabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
    }),

    // 翻月是单体控件，用原生 disabled（不可聚焦、不进 Tab 序列）；日期格子才用 aria-disabled。
    // 可及名字由作者写在按钮里（文案或 aria-label）
    // 快速翻年：与上下一页同一副长相，只是步子大。两个都是可选部件，不写即不渲染
    getPrevYearTriggerProps: () => normalize.button({
      ...parts['prev-year-trigger'].attrs,
      'type': 'button',
      'disabled': !frame.canGoPrevYear || undefined,
      'data-disabled': dataAttr(!frame.canGoPrevYear),
      'onClick': () => frame.stepYear(-1),
    }),

    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'disabled': !frame.canGoPrev || undefined,
      'data-disabled': dataAttr(!frame.canGoPrev),
      'onClick': () => frame.stepMonth(-1),
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      'disabled': !frame.canGoNext || undefined,
      'data-disabled': dataAttr(!frame.canGoNext),
      'onClick': () => frame.stepMonth(1),
    }),

    getNextYearTriggerProps: () => normalize.button({
      ...parts['next-year-trigger'].attrs,
      'type': 'button',
      'disabled': !frame.canGoNextYear || undefined,
      'data-disabled': dataAttr(!frame.canGoNextYear),
      'onClick': () => frame.stepYear(1),
    }),

    // 标题是网格的可及名字来源
    getHeadingProps: (panel = {}) => normalize.element({
      ...parts.heading.attrs,
      // 每个面板一份 id：两张网格各由自己那行标题命名，读屏才报得出这是哪个月那张
      'id': frame.headingId(panel.index),
      'data-index': frame.panelOf(panel).index,
      'data-view': view,
    }),

    // 标题里的年与月各是一个钮，点它钻上一层。两个都是可选部件：只写 heading 就是从前那条不可点的路。
    // 用原生 disabled 而不是 aria-disabled：它们是单体控件，到顶了就该退出 Tab 序列
    getHeadingYearTriggerProps: (panel = {}) => normalize.button({
      ...parts['heading-year-trigger'].attrs,
      'type': 'button',
      'data-index': frame.panelOf(panel).index,
      'data-view': view,
      'disabled': !frame.canZoomOutYear || undefined,
      'data-disabled': dataAttr(!frame.canZoomOutYear),
      'onClick': () => {
        if (frame.canZoomOutYear)
          frame.zoomTo('year')
      },
    }),

    getHeadingMonthTriggerProps: (panel = {}) => normalize.button({
      ...parts['heading-month-trigger'].attrs,
      'type': 'button',
      'data-index': frame.panelOf(panel).index,
      'data-view': view,
      // 日与周视图以月为容器；其余层收起而不是卸载，钻回来时要原地复现
      'hidden': !frame.canZoomOutMonth || undefined,
      'disabled': !frame.canZoomOutMonth || undefined,
      'data-disabled': dataAttr(!frame.canZoomOutMonth),
      'onClick': () => {
        if (frame.canZoomOutMonth)
          frame.zoomTo('month')
      },
    }),

    // 键盘全在 grid 上收口，格子只管声明自己
    getGridProps: (panel = {}) => normalize.element({
      ...parts.grid.attrs,
      'role': 'grid',
      'aria-labelledby': frame.headingId(panel.index),
      'data-index': frame.panelOf(panel).index,
      // 皮肤按它换排布：日视图铺周行，其余周期直接铺进网格
      'data-view': view,
      // 三条状态都显式给，不省略
      'aria-multiselectable': mode === 'multiple' ? 'true' : 'false',
      'aria-disabled': calendarDisabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-disabled': dataAttr(calendarDisabled),
      'data-readonly': dataAttr(readOnly),
      'onKeyDown': (event: KeyboardEvent) => frame.gridKeyDown(event, { onCommit: commit }),
    }),

    getGridHeadProps: () => normalize.element({
      ...parts['grid-head'].attrs,
      role: 'rowgroup',
    }),

    getGridBodyProps: () => normalize.element({
      ...parts['grid-body'].attrs,
      role: 'rowgroup',
    }),

    getWeekRowProps: () => normalize.element({
      ...parts['week-row'].attrs,
      role: 'row',
    }),

    // 周序号格：在 role=grid 里，一行的标号语义上就是这一行的表头
    getWeekNumberProps: ({ value: v }) => normalize.element({
      ...parts['week-number'].attrs,
      'role': 'rowheader',
      [ITEM_VALUE_ATTR]: v,
      // 它只是标号，不是可选的格子；读屏念行时带上它即可，不必单独停留
      'aria-hidden': true,
    }),

    getWeekNumberText: ({ value: v }) => frame.weekNumberText(v),

    getWeekDayProps: (day) => {
      const meta = frame.weekDays[day.value]
      return normalize.element({
        ...parts['week-day'].attrs,
        'role': 'columnheader',
        // 可见文本是缩写，读屏念全称
        'aria-label': meta?.long,
        [ITEM_VALUE_ATTR]: day.value,
      })
    },

    getCellProps: (item) => {
      const state = cellState(item)
      return normalize.element({
        ...parts.cell.attrs,
        ...stateAttrs(state),
        [ITEM_VALUE_ATTR]: item.value,
        // 表格语义留在 cell 上；能点能聚焦的是它里面的 cell-trigger
        'role': 'gridcell',
        // aria-selected 是 gridcell 的属性，选中态标在这一层
        'aria-selected': state.selected ? 'true' : 'false',
      })
    },

    getCellTriggerProps: (item) => {
      const state = cellState(item)
      // 补一句完整日期给读屏；解析不出日期时不写
      let label = frame.dateLabel(state.date, state.period)
      if (label != null && state.isToday)
        label = translations.todayDate(label)
      return normalize.element({
        ...parts['cell-trigger'].attrs,
        ...stateAttrs(state),
        // 导航与选中都以此为格子身份；翻月后靠它在活 DOM 里找回落点
        [ITEM_VALUE_ATTR]: item.value,
        'role': 'button',
        // 禁用标在 trigger 上，焦点落的是它；选中态由外层 gridcell 报
        // 一律 aria-disabled 不用原生 disabled：不可用的日子仍要能当方向键起点
        'aria-disabled': state.disabled ? 'true' : 'false',
        'aria-label': label,
        // roving tabindex：整张网格只有聚焦日那一格留在 Tab 序列内
        'tabindex': state.focused ? 0 : -1,
        'onClick': () => frame.cellClick(item, state, { onSelect: () => frame.selectAt(item.value) }),
        // 不可用的格子获得焦点也记锚点，方向键据此起步
        'onFocus': () => frame.focusAt(item.value),
      })
    },
  }
}
