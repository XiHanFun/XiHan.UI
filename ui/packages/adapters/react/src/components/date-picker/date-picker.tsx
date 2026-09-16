/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date picker 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  CalendarGranularity,
  CalendarPickerApi,
  CalendarPickerSelectionMode,
  CalendarView,
  DateFieldSegmentState,
  DatePickerApi,
  DatePickerPreset,
  DatePickerPresetState,
  DatePickerSchema,
  DateSegmentSet,
  DateSegmentType,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { resolveDatePickerPanelIndex } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  DatePickerCellProvider,
  DatePickerPanelProvider,
  DatePickerProvider,
  useDatePickerCellContext,
  useDatePickerContext,
  useDatePickerPanelContext,
} from './context'
import { useDatePicker } from './use-date-picker'

type DatePickerProps = DatePickerSchema['props']

function noop(): void {}

/**
 * 部件属于并排的第几张面板：自己写了即按自己写的，未写时跟随所在的日历。
 * 兼收字符串以支持写 index="1"。
 */
function usePanelIndex(index: number | string | undefined): number {
  const panel = useDatePickerPanelContext()
  return resolveDatePickerPanelIndex(index, panel)
}

/** 函数式 children 的载荷：选择器的开合与选中值、内嵌日历的展示数据、两组段位，以及改写值的句柄。 */
export type DatePickerRootSlotProps
  = & Pick<
    DatePickerApi,
    | 'open'
    | 'value'
    | 'valueAsString'
    | 'periodValue'
    | 'focusedValue'
    | 'canClear'
    | 'setOpen'
    | 'setValue'
    | 'clear'
  >
  & Pick<
    CalendarPickerApi,
    | 'visibleMonth'
    | 'panels'
    | 'periods'
    | 'weeks'
    | 'weekDays'
    | 'headingLabel'
    | 'canGoPrev'
    | 'canGoNext'
  >
  & {
    segments: DateFieldSegmentState[]
    /** 区间终点组段位；非区间模式为空数组。 */
  }

/** 段位函数式 children 的载荷：本段的投影；下标越界时缺席。 */
export interface DatePickerSegmentSlotProps {
  segment: DateFieldSegmentState | undefined
}

/** 快捷选项列函数式 children 的载荷：逐条的投影，作者据此自行铺设条目。 */
export interface DatePickerPresetsSlotProps {
  presets: readonly DatePickerPresetState[]
}

export interface XhDatePickerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'> {
  value?: string | string[]
  defaultValue?: string | string[]
  open?: boolean
  defaultOpen?: boolean
  min?: string
  max?: string
  locale?: string
  timeZone?: string
  selectionMode?: CalendarPickerSelectionMode
  /** 选择粒度；与 selectionMode 正交，输入行铺设哪几段也跟随它。 */
  granularity?: CalendarGranularity
  /** 面板当前所处的层级；给定即受控，默认跟随 granularity。 */
  activeView?: CalendarView
  /** 输入行铺设哪几段；未提供时按 granularity 推导。 */
  segments?: DateSegmentSet
  /** 并排展示几页；默认 1。 */
  visibleCount?: number
  /** 日历恒渲染六行，默认开启。关闭后翻页时浮层高度会随月份变化。 */
  fixedWeeks?: boolean
  /** 初始聚焦日，同时决定展开时先落在哪一页；未提供时退回首个选中值，再退回今天。 */
  defaultFocusedValue?: string
  /** 快捷选项；提供后浮层中多出一列，日期要在调用方计算后再传入。 */
  presets?: DatePickerPreset[]
  isDateUnavailable?: (value: string) => boolean
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  name?: string
  translations?: DatePickerProps['translations']
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  placement?: Placement
  offset?: number
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  closeOnSelect?: boolean
  showTime?: boolean
  timeGranularity?: DatePickerProps['timeGranularity']
  onValueChange?: DatePickerProps['onValueChange']
  onOpenChange?: DatePickerProps['onOpenChange']
  onFocusedValueChange?: DatePickerProps['onFocusedValueChange']
  onActiveViewChange?: DatePickerProps['onActiveViewChange']
  children?: SlotChildren<DatePickerRootSlotProps>
}

/** 网格与段位由作者按 children 载荷中的 weeks / segments 自行渲染。 */
export function XhDatePickerRoot({
  value,
  defaultValue,
  open,
  defaultOpen,
  min,
  max,
  locale,
  timeZone,
  selectionMode,
  granularity,
  activeView,
  segments,
  visibleCount,
  fixedWeeks,
  defaultFocusedValue,
  presets,
  isDateUnavailable,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  translations,
  variant,
  tone,
  size,
  placement,
  offset,
  dir,
  closeOnSelect,
  showTime,
  timeGranularity,
  onValueChange,
  onOpenChange,
  onFocusedValueChange,
  onActiveViewChange,
  children,
  ...rest
}: XhDatePickerRootProps): ReactNode {
  const ctx = useDatePicker(withXhConfig('date-picker', useFormControlProps({
    value,
    defaultValue,
    open,
    defaultOpen,
    min,
    max,
    locale,
    timeZone,
    selectionMode,
    granularity,
    activeView,
    segments,
    visibleCount,
    fixedWeeks,
    defaultFocusedValue,
    presets,
    isDateUnavailable,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    translations,
    variant,
    tone,
    size,
    placement,
    offset,
    dir,
    closeOnSelect,
    showTime,
    timeGranularity,
    onValueChange,
    onOpenChange,
    onFocusedValueChange,
    onActiveViewChange,
  })) as DatePickerProps)
  const api = ctx.api
  return (
    <DatePickerProvider value={ctx}>
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
              open: api.open,
              value: api.value,
              valueAsString: api.valueAsString,
              periodValue: api.periodValue,
              focusedValue: api.focusedValue,
              visibleMonth: api.calendar.visibleMonth,
              panels: api.calendar.panels,
              periods: api.calendar.periods,
              weeks: api.calendar.weeks,
              weekDays: api.calendar.weekDays,
              headingLabel: api.calendar.headingLabel,
              canGoPrev: api.calendar.canGoPrev,
              canGoNext: api.calendar.canGoNext,
              segments: api.field.segments,
              // 区间终点那组段位；非区间模式为空数组，作者据此决定渲不渲第二组
              canClear: api.canClear,
              setOpen: api.setOpen,
              setValue: api.setValue,
              clear: api.clear,
            })}
      </div>
    </DatePickerProvider>
  )
}

XhDatePickerRoot.xhEvents = ['value-change', 'open-change'] as const

export interface XhDatePickerLabelProps extends ComponentPropsWithRef<'span'> {}
/** 渲染为 span 而非 label，点击聚焦由连接层接管。 */
export function XhDatePickerLabel({ children, ...rest }: XhDatePickerLabelProps): ReactNode {
  const ctx = useDatePickerContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhDatePickerControlProps extends ComponentPropsWithRef<'div'> {}
export function XhDatePickerControl({ children, ...rest }: XhDatePickerControlProps): ReactNode {
  const ctx = useDatePickerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getControlProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.controlRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhDatePickerSegmentGroupProps extends ComponentPropsWithRef<'div'> {}
/** role=group 的分段容器，也是换段时的查询边界。 */
export function XhDatePickerSegmentGroup({ children, ...rest }: XhDatePickerSegmentGroupProps): ReactNode {
  const ctx = useDatePickerContext()
  return (
    <div {...mergeReactProps(ctx.api.getSegmentGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhDatePickerSegmentProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 段位下标，兼收字符串。 */
  index?: number | string
  /** 按段名声明该格。段集中没有该段时它收起；与 index 二选一，两个都写时按段名计算。 */
  segment?: DateSegmentType
  children?: SlotChildren<DatePickerSegmentSlotProps>
}
/** 有内容时使用内容，否则渲染连接层计算的段位文本。 */
export function XhDatePickerSegment({ index, segment, children, ...rest }: XhDatePickerSegmentProps): ReactNode {
  const ctx = useDatePickerContext()
  const { field } = ctx.api
  // 落点由连接层算：按下标还是按段名是同一条路，适配器这边不重写一份
  const declared = segment != null ? { segment } : { index: Math.trunc(Number(index)) }
  const state = field.segmentOf(declared)
  // 段位的聚焦上报不冒泡（连接层直接转交分段输入那一份），改装成原生监听器
  const bind = useNativeEvents(field.getSegmentProps(declared) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children == null ? state?.text : renderSlot(children, { segment: state })}
    </div>
  )
}

export interface XhDatePickerClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDatePickerClearTrigger({ children, ...rest }: XhDatePickerClearTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDatePickerTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDatePickerTrigger({ children, ...rest }: XhDatePickerTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  return (
    <button
      {...mergeReactProps(
        fieldLabel({ ...fieldWiring, ...ctx.api.getTriggerProps() as Record<string, unknown> }),
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </button>
  )
}

export interface XhDatePickerPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhDatePickerPositioner({ children, container, ...rest }: XhDatePickerPositionerProps): ReactNode {
  const ctx = useDatePickerContext()
  // 浮层面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；
  // 面板两轴都滚（日历保持天然宽度），条子走浮层 4px 档
  const bars = useScrollbars({
    scrollable: () => ctx.contentRef.current,
    axes: ['vertical', 'horizontal'],
    props: () => ({ dir: (ctx.api.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
  })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.controlRef}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhDatePickerContentProps extends ComponentPropsWithRef<'div'> {}
export function XhDatePickerContent({ children, ...rest }: XhDatePickerContentProps): ReactNode {
  const ctx = useDatePickerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

// 以下是内嵌日历的角色节点，DOM 上带 data-scope="calendar"，行为取自本组件持有的日历机器

export interface XhDatePickerCalendarProps extends ComponentPropsWithRef<'div'> {
  /** 并排的第几张面板，默认 0。写在这里，面板内的标题、网格与格子就不必各写一遍。 */
  index?: number | string
}
/** 内嵌日历的挂载点，同时是日历的根节点。 */
export function XhDatePickerCalendar({ index = 0, children, ...rest }: XhDatePickerCalendarProps): ReactNode {
  const ctx = useDatePickerContext()
  const panel = usePanelIndex(index)
  return (
    <DatePickerPanelProvider value={panel}>
      <div {...mergeReactProps(ctx.api.getCalendarProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </DatePickerPanelProvider>
  )
}

export interface XhDatePickerPresetGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 */
  children?: SlotChildren<DatePickerPresetsSlotProps>
}
export function XhDatePickerPresetGroup({ children, ...rest }: XhDatePickerPresetGroupProps): ReactNode {
  const ctx = useDatePickerContext()
  const api = ctx.api
  const authored = children == null ? null : renderSlot(children, { presets: api.presets })
  return (
    <div {...mergeReactProps(api.getPresetGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(authored)
        ? authored
        : api.presets.map(preset => (
            <div key={preset.value} {...api.getPresetProps({ value: preset.value }) as Record<string, unknown>}>
              {preset.label}
            </div>
          ))}
    </div>
  )
}

export interface XhDatePickerPresetProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 该条目的身份，与 presets 数据中的 value 逐字对应。 */
  value: string
}
/** 有内容时使用内容，否则使用数据中的 label。 */
export function XhDatePickerPreset({ value, children, ...rest }: XhDatePickerPresetProps): ReactNode {
  const ctx = useDatePickerContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getPresetProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : api.presets.find(p => p.value === value)?.label}
    </div>
  )
}

/** 时间列整组自动铺设：时/分[/秒]各一列，选项点按写值；未开启 showTime 时整组带 hidden。 */
export function XhDatePickerTimePanel(): ReactNode {
  const ctx = useDatePickerContext()
  const api = ctx.api
  return (
    <>
      {api.timeColumns.map(column => (
        <div key={column.unit} {...api.getTimeColumnProps({ unit: column.unit }) as Record<string, unknown>}>
          {column.options.map(option => (
            <div key={option} {...api.getTimeItemProps({ unit: column.unit, value: option }) as Record<string, unknown>}>
              {option}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

export interface XhDatePickerConfirmTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDatePickerConfirmTrigger({ children, ...rest }: XhDatePickerConfirmTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  return <button {...mergeReactProps(ctx.api.getConfirmTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDatePickerHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhDatePickerHeader({ children, ...rest }: XhDatePickerHeaderProps): ReactNode {
  const ctx = useDatePickerContext()
  return <div {...mergeReactProps(ctx.api.calendar.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDatePickerPrevYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDatePickerPrevYearTrigger({ children, ...rest }: XhDatePickerPrevYearTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  return <button {...mergeReactProps(ctx.api.calendar.getPrevYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDatePickerPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDatePickerPrevTrigger({ children, ...rest }: XhDatePickerPrevTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  return <button {...mergeReactProps(ctx.api.calendar.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDatePickerNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDatePickerNextTrigger({ children, ...rest }: XhDatePickerNextTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  return <button {...mergeReactProps(ctx.api.calendar.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDatePickerNextYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDatePickerNextYearTrigger({ children, ...rest }: XhDatePickerNextYearTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  return <button {...mergeReactProps(ctx.api.calendar.getNextYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDatePickerHeadingProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板；未写时跟随所在的日历。 */
  index?: number | string
}
/** 有内容时使用内容，否则渲染本面板的标题。 */
export function XhDatePickerHeading({ index, children, ...rest }: XhDatePickerHeadingProps): ReactNode {
  const ctx = useDatePickerContext()
  const panel = usePanelIndex(index)
  const cal = ctx.api.calendar
  return (
    <div {...mergeReactProps(cal.getHeadingProps({ index: panel }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? (cal.panels[panel]?.headingLabel ?? cal.headingLabel)}
    </div>
  )
}

export interface XhDatePickerHeadingYearTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板；未写时跟随所在的日历。 */
  index?: number | string
}
/** 有内容时使用内容，否则渲染标题中年份的部分；年视图下它是整个十年跨度。 */
export function XhDatePickerHeadingYearTrigger({ index, children, ...rest }: XhDatePickerHeadingYearTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  const panel = usePanelIndex(index)
  const cal = ctx.api.calendar
  return (
    <button {...mergeReactProps(cal.getHeadingYearTriggerProps({ index: panel }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? cal.panels[panel]?.headingYear}
    </button>
  )
}

export interface XhDatePickerHeadingMonthTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板；未写时跟随所在的日历。 */
  index?: number | string
}
export function XhDatePickerHeadingMonthTrigger({ index, children, ...rest }: XhDatePickerHeadingMonthTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  const panel = usePanelIndex(index)
  const cal = ctx.api.calendar
  return (
    <button {...mergeReactProps(cal.getHeadingMonthTriggerProps({ index: panel }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? cal.panels[panel]?.headingMonth}
    </button>
  )
}

export interface XhDatePickerGridProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板；未写时跟随所在的日历。 */
  index?: number | string
}
export function XhDatePickerGrid({ index, children, ...rest }: XhDatePickerGridProps): ReactNode {
  const ctx = useDatePickerContext()
  const panel = usePanelIndex(index)
  return (
    <div
      {...mergeReactProps(
        ctx.api.calendar.getGridProps({ index: panel }) as Record<string, unknown>,
        rest as Record<string, unknown>,
        // 键盘在首个网格上收口；其余面板只渲染，方向键仍能跨面板走（落点按值现查）
        panel === 0 ? { ref: (el: HTMLDivElement | null) => { ctx.gridRef.current = el } } : {},
      )}
    >
      {children}
    </div>
  )
}

export interface XhDatePickerGridHeadProps extends ComponentPropsWithRef<'div'> {}
export function XhDatePickerGridHead({ children, ...rest }: XhDatePickerGridHeadProps): ReactNode {
  const ctx = useDatePickerContext()
  return <div {...mergeReactProps(ctx.api.calendar.getGridHeadProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDatePickerGridBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhDatePickerGridBody({ children, ...rest }: XhDatePickerGridBodyProps): ReactNode {
  const ctx = useDatePickerContext()
  return <div {...mergeReactProps(ctx.api.calendar.getGridBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDatePickerWeekRowProps extends ComponentPropsWithRef<'div'> {}
/** 表头行与日期行共用同一个 role=row。 */
export function XhDatePickerWeekRow({ children, ...rest }: XhDatePickerWeekRowProps): ReactNode {
  const ctx = useDatePickerContext()
  return <div {...mergeReactProps(ctx.api.calendar.getWeekRowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDatePickerWeekNumberProps extends ComponentPropsWithRef<'span'> {
  /** 该行行首那一天的 ISO 串。 */
  value: string
}
/** 有内容时使用内容，否则显示该行的周序号。 */
export function XhDatePickerWeekNumber({ value, children, ...rest }: XhDatePickerWeekNumberProps): ReactNode {
  const ctx = useDatePickerContext()
  const cal = ctx.api.calendar
  return (
    <span {...mergeReactProps(cal.getWeekNumberProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? cal.getWeekNumberText({ value })}
    </span>
  )
}

export interface XhDatePickerWeekDayProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 列序 0-6，兼收字符串。 */
  value: number | string
}
export function XhDatePickerWeekDay({ value, children, ...rest }: XhDatePickerWeekDayProps): ReactNode {
  const ctx = useDatePickerContext()
  const cal = ctx.api.calendar
  const index = Number(value)
  return (
    <span {...mergeReactProps(cal.getWeekDayProps({ value: index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? cal.weekDays[index]?.label}
    </span>
  )
}

export interface XhDatePickerCellProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** ISO 日期串。 */
  value: string
  /**
   * 属于第几个面板；未写时跟随所在的日历。同一天会同时出现在两个面板中
   * （8 月末的几天也铺在 9 月的首行），是否为本月只有连同面板一起看才能判定。
   */
  index?: number | string
}
/** 不上报格子卸载，翻月后由日历状态机按聚焦日重新落点。 */
export function XhDatePickerCell({ value, index, children, ...rest }: XhDatePickerCellProps): ReactNode {
  const ctx = useDatePickerContext()
  const panel = usePanelIndex(index)
  const cell = useMemo(() => ({ value, index: panel }), [value, panel])
  return (
    <DatePickerCellProvider value={cell}>
      <div {...mergeReactProps(ctx.api.calendar.getCellProps(cell) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </DatePickerCellProvider>
  )
}

export interface XhDatePickerCellTriggerProps extends ComponentPropsWithRef<'div'> {}
export function XhDatePickerCellTrigger({ children, ...rest }: XhDatePickerCellTriggerProps): ReactNode {
  const ctx = useDatePickerContext()
  const cell = useDatePickerCellContext()
  // 格子的聚焦上报不冒泡（连接层直接转交日历那一份），改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.calendar.getCellTriggerProps(cell) as Record<string, unknown>,
    ['onFocus'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhDatePickerHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
export function XhDatePickerHiddenInput(rest: XhDatePickerHiddenInputProps): ReactNode {
  const ctx = useDatePickerContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.field.getHiddenInputProps() as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
