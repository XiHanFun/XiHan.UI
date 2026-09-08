import type { CalendarApi, CalendarSchema, CalendarSelectionMode, CalendarView, CalendarWeekdayFormat } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { CalendarCellProvider, CalendarProvider, useCalendarCellContext, useCalendarContext } from './context'
import { useCalendar } from './use-calendar'

type CalendarProps = CalendarSchema['props']

/** 函数式 children 的载荷：选中值与聚焦日、展示月的日期矩阵与表头，以及选中、聚焦、翻月的动作。 */
export type CalendarRootSlotProps = Pick<
  CalendarApi,
  | 'value'
  | 'focusedValue'
  | 'visibleMonth'
  | 'panels'
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

export interface XhCalendarRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  value?: string | string[]
  defaultValue?: string | string[]
  selectionMode?: CalendarSelectionMode
  focusedValue?: string
  defaultFocusedValue?: string
  min?: string
  max?: string
  isDateUnavailable?: (value: string) => boolean
  locale?: string
  timeZone?: string
  disabled?: boolean
  readOnly?: boolean
  weekdayFormat?: CalendarWeekdayFormat
  fixedWeeks?: boolean
  /** 挑的粒度：天（默认）/ 月 / 季度 / 年。这一档也是「点一格即选中」的那一档。 */
  view?: CalendarView
  /** 面板此刻钻到了哪一层；给定即受控，缺省跟着 view。 */
  activeView?: CalendarView
  /** 非受控初值，缺省同 view。 */
  defaultActiveView?: CalendarView
  /** 周选：点任意一天选中它所在的整周。只在 view=day 且区间模式下生效。 */
  weekSelection?: boolean
  /** 并排展示几页，默认 1。 */
  visibleCount?: number
  onValueChange?: CalendarProps['onValueChange']
  onFocusedValueChange?: CalendarProps['onFocusedValueChange']
  onActiveViewChange?: CalendarProps['onActiveViewChange']
  children?: SlotChildren<CalendarRootSlotProps>
}

/** 网格与表头由作者照 children 载荷里的 weeks / weekDays 自行渲染。 */
export function XhCalendarRoot({
  value,
  defaultValue,
  selectionMode,
  focusedValue,
  defaultFocusedValue,
  min,
  max,
  isDateUnavailable,
  locale,
  timeZone,
  disabled,
  readOnly,
  weekdayFormat,
  fixedWeeks,
  view,
  activeView,
  defaultActiveView,
  weekSelection,
  visibleCount,
  onValueChange,
  onFocusedValueChange,
  onActiveViewChange,
  children,
  ...rest
}: XhCalendarRootProps): ReactNode {
  const ctx = useCalendar(withXhConfig('calendar', {
    value,
    defaultValue,
    selectionMode,
    focusedValue,
    defaultFocusedValue,
    min,
    max,
    isDateUnavailable,
    locale,
    timeZone,
    disabled,
    readOnly,
    weekdayFormat,
    fixedWeeks,
    view,
    activeView,
    defaultActiveView,
    weekSelection,
    visibleCount,
    onValueChange,
    onFocusedValueChange,
    onActiveViewChange,
  }) as CalendarProps)
  const api = ctx.api
  return (
    <CalendarProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children == null
          ? null
          : renderSlot(children, {
              value: api.value,
              focusedValue: api.focusedValue,
              visibleMonth: api.visibleMonth,
              panels: api.panels,
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
    </CalendarProvider>
  )
}

XhCalendarRoot.xhEvents = ['value-change'] as const

export interface XhCalendarHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarHeader({ children, ...rest }: XhCalendarHeaderProps): ReactNode {
  const ctx = useCalendarContext()
  return <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarPrevYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarPrevYearTrigger({ children, ...rest }: XhCalendarPrevYearTriggerProps): ReactNode {
  const ctx = useCalendarContext()
  return <button {...mergeReactProps(ctx.api.getPrevYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarPrevTrigger({ children, ...rest }: XhCalendarPrevTriggerProps): ReactNode {
  const ctx = useCalendarContext()
  return <button {...mergeReactProps(ctx.api.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarNextTrigger({ children, ...rest }: XhCalendarNextTriggerProps): ReactNode {
  const ctx = useCalendarContext()
  return <button {...mergeReactProps(ctx.api.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarNextYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCalendarNextYearTrigger({ children, ...rest }: XhCalendarNextYearTriggerProps): ReactNode {
  const ctx = useCalendarContext()
  return <button {...mergeReactProps(ctx.api.getNextYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCalendarHeadingProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板，默认 0。单面板时不用写。 */
  index?: number
}
/** 有内容用内容，否则渲染本面板的标题。 */
export function XhCalendarHeading({ index = 0, children, ...rest }: XhCalendarHeadingProps): ReactNode {
  const ctx = useCalendarContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getHeadingProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? (api.panels[index]?.headingLabel ?? api.headingLabel)}
    </div>
  )
}

export interface XhCalendarHeadingYearTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板，默认 0。单面板时不用写。 */
  index?: number
}
/** 有内容用内容，否则渲染标题里年那一截；年视图下它是整个十年跨度。 */
export function XhCalendarHeadingYearTrigger({ index = 0, children, ...rest }: XhCalendarHeadingYearTriggerProps): ReactNode {
  const ctx = useCalendarContext()
  const api = ctx.api
  return (
    <button {...mergeReactProps(api.getHeadingYearTriggerProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.panels[index]?.headingYear}
    </button>
  )
}

export interface XhCalendarHeadingMonthTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板，默认 0。单面板时不用写。 */
  index?: number
}
export function XhCalendarHeadingMonthTrigger({ index = 0, children, ...rest }: XhCalendarHeadingMonthTriggerProps): ReactNode {
  const ctx = useCalendarContext()
  const api = ctx.api
  return (
    <button {...mergeReactProps(api.getHeadingMonthTriggerProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.panels[index]?.headingMonth}
    </button>
  )
}

export interface XhCalendarGridProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板，默认 0。单面板时不用写。 */
  index?: number
}
export function XhCalendarGrid({ index = 0, children, ...rest }: XhCalendarGridProps): ReactNode {
  const ctx = useCalendarContext()
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

export interface XhCalendarGridHeadProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarGridHead({ children, ...rest }: XhCalendarGridHeadProps): ReactNode {
  const ctx = useCalendarContext()
  return <div {...mergeReactProps(ctx.api.getGridHeadProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarGridBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarGridBody({ children, ...rest }: XhCalendarGridBodyProps): ReactNode {
  const ctx = useCalendarContext()
  return <div {...mergeReactProps(ctx.api.getGridBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarWeekRowProps extends ComponentPropsWithRef<'div'> {}
/** 表头行与日期行共用同一个 role=row。 */
export function XhCalendarWeekRow({ children, ...rest }: XhCalendarWeekRowProps): ReactNode {
  const ctx = useCalendarContext()
  return <div {...mergeReactProps(ctx.api.getWeekRowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCalendarWeekNumberProps extends ComponentPropsWithRef<'span'> {
  /** 这一行行首那天的 ISO 串。 */
  value: string
}
/** 有内容用内容，否则显示这一行的周序号。 */
export function XhCalendarWeekNumber({ value, children, ...rest }: XhCalendarWeekNumberProps): ReactNode {
  const ctx = useCalendarContext()
  const api = ctx.api
  return (
    <span {...mergeReactProps(api.getWeekNumberProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.getWeekNumberText({ value })}
    </span>
  )
}

export interface XhCalendarWeekDayProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 列序 0-6，兼收字符串。 */
  value: number | string
}
export function XhCalendarWeekDay({ value, children, ...rest }: XhCalendarWeekDayProps): ReactNode {
  const ctx = useCalendarContext()
  const api = ctx.api
  const index = Number(value)
  return (
    <span {...mergeReactProps(api.getWeekDayProps({ value: index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.weekDays[index]?.label}
    </span>
  )
}

export interface XhCalendarCellProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** ISO 日期串。 */
  value: string
  /**
   * 属于第几个面板，默认 0。多面板时必须给：同一天会同时出现在两个面板里
   * （8 月末那几天也铺在 9 月的首行），「是不是本月」只有连着面板一起看才判得出来。
   */
  index?: number
}
/** 不上报格子卸载，翻月后由机器按聚焦日重新落点。 */
export function XhCalendarCell({ value, index = 0, children, ...rest }: XhCalendarCellProps): ReactNode {
  const ctx = useCalendarContext()
  const cell = useMemo(() => ({ value, index }), [value, index])
  return (
    <CalendarCellProvider value={cell}>
      <div {...mergeReactProps(ctx.api.getCellProps(cell) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </CalendarCellProvider>
  )
}

export interface XhCalendarCellTriggerProps extends ComponentPropsWithRef<'div'> {}
export function XhCalendarCellTrigger({ children, ...rest }: XhCalendarCellTriggerProps): ReactNode {
  const ctx = useCalendarContext()
  const cell = useCalendarCellContext()
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
