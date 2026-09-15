/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar range picker 相关实现。

import type { CalendarGranularity, CalendarRangePickerApi, CalendarRangePickerSchema, CalendarRangePickerTranslations, CalendarView, CalendarWeekdayFormat } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { CalendarRangePickerCellProvider, CalendarRangePickerProvider, useCalendarRangePickerCellContext, useCalendarRangePickerContext } from './context'
import { useCalendarRangePicker } from './use-calendar-range-picker'

type CalendarRangePickerProps = CalendarRangePickerSchema['props']

/** 函数式 children 的载荷：区间两端与聚焦日、展示月的日期矩阵与表头、选择到一半的起点，以及选中、聚焦、翻月的动作。 */
export type CalendarRangePickerRootSlotProps = Pick<
  CalendarRangePickerApi,
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
  | 'rangeAnchor'
  | 'setValue'
  | 'select'
  | 'focus'
  | 'goToPrevMonth'
  | 'goToNextMonth'
>

export interface XhCalendarRangePickerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  value?: string | string[]
  defaultValue?: string | string[]
  focusedValue?: string
  defaultFocusedValue?: string
  min?: string
  max?: string
  isDateUnavailable?: (value: string, anchor: string | null) => boolean
  /** 区间允许跨过不可用的日期；默认关闭，落下起点后只能选到两侧最近的不可用日为止。 */
  allowsNonContiguousRanges?: boolean
  /** 校验失败：根带 data-invalid，区间内的格子报告 aria-invalid。 */
  invalid?: boolean
  locale?: string
  timeZone?: string
  disabled?: boolean
  readOnly?: boolean
  weekdayFormat?: CalendarWeekdayFormat
  fixedWeeks?: boolean
  /** 选择粒度。 */
  granularity?: CalendarGranularity
  /** 面板当前所处的层级；给定即受控，默认跟随 granularity。 */
  activeView?: CalendarView
  /** 非受控初值，默认同 granularity。 */
  defaultActiveView?: CalendarView
  /** 并排展示几页，默认 1。 */
  visibleCount?: number
  translations?: Partial<CalendarRangePickerTranslations>
  onValueChange?: CalendarRangePickerProps['onValueChange']
  onFocusedValueChange?: CalendarRangePickerProps['onFocusedValueChange']
  onActiveViewChange?: CalendarRangePickerProps['onActiveViewChange']
  children?: SlotChildren<CalendarRangePickerRootSlotProps>
}

/** 网格与表头由作者按 children 载荷中的 weeks / weekDays 自行渲染。 */
export function XhCalendarRangePickerRoot({
  value,
  defaultValue,
  focusedValue,
  defaultFocusedValue,
  min,
  max,
  isDateUnavailable,
  allowsNonContiguousRanges,
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
}: XhCalendarRangePickerRootProps): ReactNode {
  const ctx = useCalendarRangePicker(withXhConfig('calendar-range-picker', {
    value,
    defaultValue,
    focusedValue,
    defaultFocusedValue,
    min,
    max,
    isDateUnavailable,
    allowsNonContiguousRanges,
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
  }) as CalendarRangePickerProps)
  const api = ctx.api
  return (
    <CalendarRangePickerProvider value={ctx}>
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
              rangeAnchor: api.rangeAnchor,
              setValue: api.setValue,
              select: api.select,
              focus: api.focus,
              goToPrevMonth: api.goToPrevMonth,
              goToNextMonth: api.goToNextMonth,
            })}
      </div>
    </CalendarRangePickerProvider>
  )
}

XhCalendarRangePickerRoot.xhEvents = ['value-change'] as const

export interface XhCalendarRangePickerHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarRangePickerHeader({ children, ...rest }: XhCalendarRangePickerHeaderProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  return <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarRangePickerPrevYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarRangePickerPrevYearTrigger({ children, ...rest }: XhCalendarRangePickerPrevYearTriggerProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  return <button {...mergeReactProps(ctx.api.getPrevYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarRangePickerPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarRangePickerPrevTrigger({ children, ...rest }: XhCalendarRangePickerPrevTriggerProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  return <button {...mergeReactProps(ctx.api.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarRangePickerNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarRangePickerNextTrigger({ children, ...rest }: XhCalendarRangePickerNextTriggerProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  return <button {...mergeReactProps(ctx.api.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarRangePickerNextYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarRangePickerNextYearTrigger({ children, ...rest }: XhCalendarRangePickerNextYearTriggerProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  return <button {...mergeReactProps(ctx.api.getNextYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarRangePickerHeadingProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板，默认 0。单面板时不必写。 */
  index?: number
}
/** 有内容时使用内容，否则渲染本面板的标题。 */
export function XhCalendarRangePickerHeading({ index = 0, children, ...rest }: XhCalendarRangePickerHeadingProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getHeadingProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? (api.panels[index]?.headingLabel ?? api.headingLabel)}
    </div>
  )
}

export interface XhCalendarRangePickerHeadingYearTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板，默认 0。单面板时不必写。 */
  index?: number
}
/** 有内容时使用内容，否则渲染标题中年份的部分；年视图下它是整个十年跨度。 */
export function XhCalendarRangePickerHeadingYearTrigger({ index = 0, children, ...rest }: XhCalendarRangePickerHeadingYearTriggerProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  const api = ctx.api
  return (
    <button {...mergeReactProps(api.getHeadingYearTriggerProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.panels[index]?.headingYear}
    </button>
  )
}

export interface XhCalendarRangePickerHeadingMonthTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板，默认 0。单面板时不必写。 */
  index?: number
}
export function XhCalendarRangePickerHeadingMonthTrigger({ index = 0, children, ...rest }: XhCalendarRangePickerHeadingMonthTriggerProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  const api = ctx.api
  return (
    <button {...mergeReactProps(api.getHeadingMonthTriggerProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.panels[index]?.headingMonth}
    </button>
  )
}

export interface XhCalendarRangePickerGridProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板，默认 0。单面板时不必写。 */
  index?: number
}
export function XhCalendarRangePickerGrid({ index = 0, children, ...rest }: XhCalendarRangePickerGridProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  // 区间预览的清除挂在网格上，pointerleave 不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getGridProps({ index }) as Record<string, unknown>,
    ['onPointerLeave'],
  )
  return (
    <div
      {...mergeReactProps(
        bind.attrs,
        rest as Record<string, unknown>,
        { ref: bind.ref },
        // 键盘在首个网格上收口；其余面板只渲染，方向键仍能跨面板走（落点按值现查）
        index === 0 ? { ref: (el: HTMLDivElement | null) => { ctx.gridRef.current = el } } : {},
      )}
    >
      {children}
    </div>
  )
}

export interface XhCalendarRangePickerGridHeadProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarRangePickerGridHead({ children, ...rest }: XhCalendarRangePickerGridHeadProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  return <div {...mergeReactProps(ctx.api.getGridHeadProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarRangePickerGridBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarRangePickerGridBody({ children, ...rest }: XhCalendarRangePickerGridBodyProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  return <div {...mergeReactProps(ctx.api.getGridBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarRangePickerWeekRowProps extends ComponentPropsWithRef<'div'> {}
/** 表头行与日期行共用同一个 role=row。 */
export function XhCalendarRangePickerWeekRow({ children, ...rest }: XhCalendarRangePickerWeekRowProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  return <div {...mergeReactProps(ctx.api.getWeekRowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarRangePickerWeekNumberProps extends ComponentPropsWithRef<'span'> {
  /** 该行行首那一天的 ISO 串。 */
  value: string
}
/** 有内容时使用内容，否则显示该行的周序号。 */
export function XhCalendarRangePickerWeekNumber({ value, children, ...rest }: XhCalendarRangePickerWeekNumberProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  const api = ctx.api
  return (
    <span {...mergeReactProps(api.getWeekNumberProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.getWeekNumberText({ value })}
    </span>
  )
}

export interface XhCalendarRangePickerWeekDayProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 列序 0-6，兼收字符串。 */
  value: number | string
}
export function XhCalendarRangePickerWeekDay({ value, children, ...rest }: XhCalendarRangePickerWeekDayProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  const api = ctx.api
  const index = Number(value)
  return (
    <span {...mergeReactProps(api.getWeekDayProps({ value: index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.weekDays[index]?.label}
    </span>
  )
}

export interface XhCalendarRangePickerCellProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** ISO 日期串。 */
  value: string
  /**
   * 属于第几个面板，默认 0。多面板时必须提供：同一天会同时出现在两个面板中
   * （8 月末的几天也铺在 9 月的首行），是否为本月只有连同面板一起看才能判定。
   */
  index?: number
}
/** 不上报格子卸载，翻月后由状态机按聚焦日重新落点。 */
export function XhCalendarRangePickerCell({ value, index = 0, children, ...rest }: XhCalendarRangePickerCellProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  const cell = useMemo(() => ({ value, index }), [value, index])
  return (
    <CalendarRangePickerCellProvider value={cell}>
      <div {...mergeReactProps(ctx.api.getCellProps(cell) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </CalendarRangePickerCellProvider>
  )
}

export interface XhCalendarRangePickerCellTriggerProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarRangePickerCellTrigger({ children, ...rest }: XhCalendarRangePickerCellTriggerProps): ReactNode {
  const ctx = useCalendarRangePickerContext()
  const cell = useCalendarRangePickerCellContext()
  // 格子的聚焦上报与指针进入都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getCellTriggerProps(cell) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}
