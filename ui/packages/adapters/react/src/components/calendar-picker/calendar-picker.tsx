/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar picker 相关实现。

import type { CalendarGranularity, CalendarPickerApi, CalendarPickerSchema, CalendarPickerSelectionMode, CalendarPickerTranslations, CalendarView, CalendarWeekdayFormat } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { CalendarPickerCellProvider, CalendarPickerProvider, useCalendarPickerCellContext, useCalendarPickerContext } from './context'
import { useCalendarPicker } from './use-calendar-picker'

type CalendarPickerProps = CalendarPickerSchema['props']

/** 函数式 children 的载荷：选中值与聚焦日、展示月的日期矩阵与表头，以及选中、聚焦、翻月的动作。 */
export type CalendarPickerRootSlotProps = Pick<
  CalendarPickerApi,
  | 'value'
  | 'focusedValue'
  | 'visibleMonth'
  | 'panels'
  | 'periods'
  | 'weeks'
  | 'weekDays'
  | 'headingLabel'
  | 'canGoPrev'
  | 'canGoNext'
  | 'isSelected'
  | 'isUnavailable'
  | 'setValue'
  | 'select'
  | 'focus'
  | 'goToPrevMonth'
  | 'goToNextMonth'
>

export interface XhCalendarPickerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  value?: string | string[]
  defaultValue?: string | string[]
  selectionMode?: CalendarPickerSelectionMode
  focusedValue?: string
  defaultFocusedValue?: string
  min?: string
  max?: string
  isDateUnavailable?: (value: string) => boolean
  /** 校验失败：根带 data-invalid。 */
  invalid?: boolean
  locale?: string
  timeZone?: string
  disabled?: boolean
  readOnly?: boolean
  weekdayFormat?: CalendarWeekdayFormat
  fixedWeeks?: boolean
  /** 选择粒度；与 selectionMode 正交。区间选择是另一个组件（XhCalendarRangePicker）。 */
  granularity?: CalendarGranularity
  /** 面板当前所处的层级；给定即受控，默认跟随 granularity。 */
  activeView?: CalendarView
  /** 非受控初值，默认同 granularity。 */
  defaultActiveView?: CalendarView
  /** 并排展示几页，默认 1。 */
  visibleCount?: number
  translations?: Partial<CalendarPickerTranslations>
  onValueChange?: CalendarPickerProps['onValueChange']
  onFocusedValueChange?: CalendarPickerProps['onFocusedValueChange']
  onActiveViewChange?: CalendarPickerProps['onActiveViewChange']
  children?: SlotChildren<CalendarPickerRootSlotProps>
}

/** 网格与表头由作者按 children 载荷中的 weeks / weekDays 自行渲染。 */
export function XhCalendarPickerRoot({
  value,
  defaultValue,
  selectionMode,
  focusedValue,
  defaultFocusedValue,
  min,
  max,
  isDateUnavailable,
  invalid,
  locale,
  timeZone,
  disabled,
  readOnly,
  weekdayFormat,
  fixedWeeks,
  granularity,
  activeView,
  defaultActiveView,
  visibleCount,
  translations,
  onValueChange,
  onFocusedValueChange,
  onActiveViewChange,
  children,
  ...rest
}: XhCalendarPickerRootProps): ReactNode {
  const ctx = useCalendarPicker(withXhConfig('calendar-picker', {
    value,
    defaultValue,
    selectionMode,
    focusedValue,
    defaultFocusedValue,
    min,
    max,
    isDateUnavailable,
    invalid,
    locale,
    timeZone,
    disabled,
    readOnly,
    weekdayFormat,
    fixedWeeks,
    granularity,
    activeView,
    defaultActiveView,
    visibleCount,
    translations,
    onValueChange,
    onFocusedValueChange,
    onActiveViewChange,
  }) as CalendarPickerProps)
  const api = ctx.api
  return (
    <CalendarPickerProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {children == null
          ? null
          : renderSlot(children, {
              value: api.value,
              focusedValue: api.focusedValue,
              visibleMonth: api.visibleMonth,
              panels: api.panels,
              periods: api.periods,
              weeks: api.weeks,
              weekDays: api.weekDays,
              headingLabel: api.headingLabel,
              canGoPrev: api.canGoPrev,
              canGoNext: api.canGoNext,
              isSelected: api.isSelected,
              isUnavailable: api.isUnavailable,
              setValue: api.setValue,
              select: api.select,
              focus: api.focus,
              goToPrevMonth: api.goToPrevMonth,
              goToNextMonth: api.goToNextMonth,
            })}
      </div>
    </CalendarPickerProvider>
  )
}

XhCalendarPickerRoot.xhEvents = ['value-change'] as const

export interface XhCalendarPickerHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarPickerHeader({ children, ...rest }: XhCalendarPickerHeaderProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarPickerPrevYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarPickerPrevYearTrigger({ children, ...rest }: XhCalendarPickerPrevYearTriggerProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return <button {...mergeReactProps(ctx.api.getPrevYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarPickerPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarPickerPrevTrigger({ children, ...rest }: XhCalendarPickerPrevTriggerProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return <button {...mergeReactProps(ctx.api.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarPickerNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarPickerNextTrigger({ children, ...rest }: XhCalendarPickerNextTriggerProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return <button {...mergeReactProps(ctx.api.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarPickerNextYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarPickerNextYearTrigger({ children, ...rest }: XhCalendarPickerNextYearTriggerProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return <button {...mergeReactProps(ctx.api.getNextYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarPickerHeadingProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板，默认 0。单面板时不必写。 */
  index?: number
}
/** 有内容时使用内容，否则渲染本面板的标题。 */
export function XhCalendarPickerHeading({ index = 0, children, ...rest }: XhCalendarPickerHeadingProps): ReactNode {
  const ctx = useCalendarPickerContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getHeadingProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? (api.panels[index]?.headingLabel ?? api.headingLabel)}
    </div>
  )
}

export interface XhCalendarPickerHeadingYearTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板，默认 0。单面板时不必写。 */
  index?: number
}
/** 有内容时使用内容，否则渲染标题中年份的部分；年视图下它是整个十年跨度。 */
export function XhCalendarPickerHeadingYearTrigger({ index = 0, children, ...rest }: XhCalendarPickerHeadingYearTriggerProps): ReactNode {
  const ctx = useCalendarPickerContext()
  const api = ctx.api
  return (
    <button {...mergeReactProps(api.getHeadingYearTriggerProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.panels[index]?.headingYear}
    </button>
  )
}

export interface XhCalendarPickerHeadingMonthTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板，默认 0。单面板时不必写。 */
  index?: number
}
export function XhCalendarPickerHeadingMonthTrigger({ index = 0, children, ...rest }: XhCalendarPickerHeadingMonthTriggerProps): ReactNode {
  const ctx = useCalendarPickerContext()
  const api = ctx.api
  return (
    <button {...mergeReactProps(api.getHeadingMonthTriggerProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.panels[index]?.headingMonth}
    </button>
  )
}

export interface XhCalendarPickerGridProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板，默认 0。单面板时不必写。 */
  index?: number
}
export function XhCalendarPickerGrid({ index = 0, children, ...rest }: XhCalendarPickerGridProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getGridProps({ index }) as Record<string, unknown>,
        rest as Record<string, unknown>,
        // 键盘在首个网格上收口；其余面板只渲染，方向键仍能跨面板走（落点按值现查）
        index === 0 ? { ref: (el: HTMLDivElement | null) => { ctx.gridRef.current = el } } : {},
      )}
    >
      {children}
    </div>
  )
}

export interface XhCalendarPickerGridHeadProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarPickerGridHead({ children, ...rest }: XhCalendarPickerGridHeadProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return <div {...mergeReactProps(ctx.api.getGridHeadProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarPickerGridBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarPickerGridBody({ children, ...rest }: XhCalendarPickerGridBodyProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return <div {...mergeReactProps(ctx.api.getGridBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarPickerWeekRowProps extends ComponentPropsWithRef<'div'> {}
/** 表头行与日期行共用同一个 role=row。 */
export function XhCalendarPickerWeekRow({ children, ...rest }: XhCalendarPickerWeekRowProps): ReactNode {
  const ctx = useCalendarPickerContext()
  return <div {...mergeReactProps(ctx.api.getWeekRowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarPickerWeekNumberProps extends ComponentPropsWithRef<'span'> {
  /** 该行行首那一天的 ISO 串。 */
  value: string
}
/** 有内容时使用内容，否则显示该行的周序号。 */
export function XhCalendarPickerWeekNumber({ value, children, ...rest }: XhCalendarPickerWeekNumberProps): ReactNode {
  const ctx = useCalendarPickerContext()
  const api = ctx.api
  return (
    <span {...mergeReactProps(api.getWeekNumberProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.getWeekNumberText({ value })}
    </span>
  )
}

export interface XhCalendarPickerWeekDayProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 列序 0-6，兼收字符串。 */
  value: number | string
}
export function XhCalendarPickerWeekDay({ value, children, ...rest }: XhCalendarPickerWeekDayProps): ReactNode {
  const ctx = useCalendarPickerContext()
  const api = ctx.api
  const index = Number(value)
  return (
    <span {...mergeReactProps(api.getWeekDayProps({ value: index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.weekDays[index]?.label}
    </span>
  )
}

export interface XhCalendarPickerCellProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** ISO 日期串。 */
  value: string
  /**
   * 属于第几个面板，默认 0。多面板时必须提供：同一天会同时出现在两个面板中
   * （8 月末的几天也铺在 9 月的首行），是否为本月只有连同面板一起看才能判定。
   */
  index?: number
}
/** 不上报格子卸载，翻月后由状态机按聚焦日重新落点。 */
export function XhCalendarPickerCell({ value, index = 0, children, ...rest }: XhCalendarPickerCellProps): ReactNode {
  const ctx = useCalendarPickerContext()
  const cell = useMemo(() => ({ value, index }), [value, index])
  return (
    <CalendarPickerCellProvider value={cell}>
      <div {...mergeReactProps(ctx.api.getCellProps(cell) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </CalendarPickerCellProvider>
  )
}

export interface XhCalendarPickerCellTriggerProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarPickerCellTrigger({ children, ...rest }: XhCalendarPickerCellTriggerProps): ReactNode {
  const ctx = useCalendarPickerContext()
  const cell = useCalendarPickerCellContext()
  // 格子的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getCellTriggerProps(cell) as Record<string, unknown>,
    ['onFocus'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}
