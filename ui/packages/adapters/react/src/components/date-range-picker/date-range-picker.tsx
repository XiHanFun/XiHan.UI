/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date range picker 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  CalendarGranularity,
  CalendarRangePickerApi,
  CalendarView,
  DateFieldSegmentState,
  DateRangePickerApi,
  DateRangePickerPreset,
  DateRangePickerPresetState,
  DateRangePickerSchema,
  DateSegmentSet,
  DateSegmentType,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import type { DateRangePickerGroupIndex } from './context'
import { dateRangePickerFieldAt, resolveDateRangePickerFieldIndex, resolveDateRangePickerPanelIndex } from '@xihan-ui/headless'
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
  DateRangePickerCellProvider,
  DateRangePickerPanelProvider,
  DateRangePickerProvider,
  DateRangePickerSegmentGroupProvider,
  useDateRangePickerCellContext,
  useDateRangePickerContext,
  useDateRangePickerPanelContext,
  useDateRangePickerSegmentGroupContext,
} from './context'
import { useDateRangePicker } from './use-date-range-picker'

type DateRangePickerProps = DateRangePickerSchema['props']

function noop(): void {}

/**
 * 部件属于并排的第几张面板：自己写了就按自己写的，没写就跟着所在的日历走。
 * 兼收字符串以支持写 index="1"。
 */
function usePanelIndex(index: number | string | undefined): number {
  const panel = useDateRangePickerPanelContext()
  return resolveDateRangePickerPanelIndex(index, panel)
}

/** 函数式 children 的载荷：选择器的开合与两端、内嵌范围日历的展示数据、两组段位，以及改写值的句柄。 */
export type DateRangePickerRootSlotProps
  = & Pick<
    DateRangePickerApi,
    | 'open'
    | 'value'
    | 'start'
    | 'end'
    | 'periodValue'
    | 'focusedValue'
    | 'canClear'
    | 'setOpen'
    | 'setValue'
    | 'clear'
  >
  & Pick<
    CalendarRangePickerApi,
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
    /** 起点那组段位。 */
    segments: DateFieldSegmentState[]
    /** 终点那组段位。 */
    endSegments: DateFieldSegmentState[]
  }

/** 段位函数式 children 的载荷：本段的投影；下标越界时缺席。 */
export interface DateRangePickerSegmentSlotProps {
  segment: DateFieldSegmentState | undefined
}

/** 快捷选项列函数式 children 的载荷：逐条的投影，作者据此自己铺条目。 */
export interface DateRangePickerPresetsSlotProps {
  presets: readonly DateRangePickerPresetState[]
}

export interface XhDateRangePickerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'> {
  /** 区间两端 [start, end]；空缺的一端用空串占位。 */
  value?: string[]
  defaultValue?: string[]
  open?: boolean
  defaultOpen?: boolean
  min?: string
  max?: string
  locale?: string
  timeZone?: string
  /** 选择粒度；两组输入行铺哪几段也跟着它走。 */
  granularity?: CalendarGranularity
  /** 面板此刻钻到了哪一层；给定即受控，缺省跟着 granularity。 */
  activeView?: CalendarView
  /** 输入行铺哪几段；不给就按 granularity 推。 */
  segments?: DateSegmentSet
  /** 并排展示几页；缺省 1，起止常跨月时给 2。 */
  visibleCount?: number
  /** 日历恒渲染六行，默认开。关掉后翻页时浮层高度会跟着月份变。 */
  fixedWeeks?: boolean
  /** 初始聚焦日，同时决定展开时先落在哪一页；不给就退回起点，再退回今天。 */
  defaultFocusedValue?: string
  /** 快捷选项；给了就在浮层里多出一列，日子要在自己那儿算好再传。 */
  presets?: DateRangePickerPreset[]
  isDateUnavailable?: (value: string, anchor: string | null) => boolean
  /** 允许跨过不可用的日子；默认关，落了起点后只能挑到两侧最近的不可用日为止。 */
  allowsNonContiguousRanges?: boolean
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  name?: string
  /** 终点那份隐藏输入的表单名；不给即终点不参与提交。 */
  endName?: string
  /** 两组段位各自的读屏名字与快捷选项列的名字。 */
  translations?: DateRangePickerProps['translations']
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  placement?: Placement
  offset?: number
  /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
  dir?: Direction
  closeOnSelect?: boolean
  onValueChange?: DateRangePickerProps['onValueChange']
  onOpenChange?: DateRangePickerProps['onOpenChange']
  onFocusedValueChange?: DateRangePickerProps['onFocusedValueChange']
  onActiveViewChange?: DateRangePickerProps['onActiveViewChange']
  children?: SlotChildren<DateRangePickerRootSlotProps>
}

/** 网格与段位由作者照 children 载荷里的 weeks / segments 自行渲染。 */
export function XhDateRangePickerRoot({
  value,
  defaultValue,
  open,
  defaultOpen,
  min,
  max,
  locale,
  timeZone,
  granularity,
  activeView,
  segments,
  visibleCount,
  fixedWeeks,
  defaultFocusedValue,
  presets,
  isDateUnavailable,
  allowsNonContiguousRanges,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  endName,
  translations,
  variant,
  tone,
  size,
  placement,
  offset,
  dir,
  closeOnSelect,
  onValueChange,
  onOpenChange,
  onFocusedValueChange,
  onActiveViewChange,
  children,
  ...rest
}: XhDateRangePickerRootProps): ReactNode {
  const ctx = useDateRangePicker(withXhConfig('date-range-picker', useFormControlProps({
    value,
    defaultValue,
    open,
    defaultOpen,
    min,
    max,
    locale,
    timeZone,
    granularity,
    activeView,
    segments,
    visibleCount,
    fixedWeeks,
    defaultFocusedValue,
    presets,
    isDateUnavailable,
    allowsNonContiguousRanges,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    endName,
    translations,
    variant,
    tone,
    size,
    placement,
    offset,
    dir,
    closeOnSelect,
    onValueChange,
    onOpenChange,
    onFocusedValueChange,
    onActiveViewChange,
  })) as DateRangePickerProps)
  const api = ctx.api
  return (
    <DateRangePickerProvider value={ctx}>
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
              start: api.start,
              end: api.end,
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
              endSegments: api.fieldEnd.segments,
              canClear: api.canClear,
              setOpen: api.setOpen,
              setValue: api.setValue,
              clear: api.clear,
            })}
      </div>
    </DateRangePickerProvider>
  )
}

XhDateRangePickerRoot.xhEvents = ['value-change', 'open-change'] as const

export interface XhDateRangePickerLabelProps extends ComponentPropsWithRef<'span'> {}
/** 渲染为 span 而非 label，点击聚焦由连接层接管。 */
export function XhDateRangePickerLabel({ children, ...rest }: XhDateRangePickerLabelProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhDateRangePickerControlProps extends ComponentPropsWithRef<'div'> {}
export function XhDateRangePickerControl({ children, ...rest }: XhDateRangePickerControlProps): ReactNode {
  const ctx = useDateRangePickerContext()
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

export interface XhDateRangePickerSegmentGroupProps extends ComponentPropsWithRef<'div'> {
  /** 组号：0 起点、1 终点，兼收字符串。 */
  index?: number | string
}
/** role=group 的分段容器，也是换段时的查询边界。 */
export function XhDateRangePickerSegmentGroup({ index = 0, children, ...rest }: XhDateRangePickerSegmentGroupProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const group: DateRangePickerGroupIndex = resolveDateRangePickerFieldIndex(index)
  return (
    // 组内的段位与隐藏输入据此认领起止
    <DateRangePickerSegmentGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getSegmentGroupProps({ index: group }) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </DateRangePickerSegmentGroupProvider>
  )
}

export interface XhDateRangePickerSegmentProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 段位下标，兼收字符串。 */
  index?: number | string
  /** 按段名声明这一格。段集里没有这一块时它收起；与 index 二选一，两个都写按段名算。 */
  segment?: DateSegmentType
  children?: SlotChildren<DateRangePickerSegmentSlotProps>
}
/** 有内容用内容，否则渲染连接层算好的段位文本。 */
export function XhDateRangePickerSegment({ index, segment, children, ...rest }: XhDateRangePickerSegmentProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const group = useDateRangePickerSegmentGroupContext()
  const field = dateRangePickerFieldAt(ctx.api, group)
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

export interface XhDateRangePickerRangeSeparatorProps extends ComponentPropsWithRef<'span'> {}
export function XhDateRangePickerRangeSeparator({ children, ...rest }: XhDateRangePickerRangeSeparatorProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return (
    <span {...mergeReactProps(ctx.api.getRangeSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? '-'}
    </span>
  )
}

export interface XhDateRangePickerClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDateRangePickerClearTrigger({ children, ...rest }: XhDateRangePickerClearTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDateRangePickerTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDateRangePickerTrigger({ children, ...rest }: XhDateRangePickerTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
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

export interface XhDateRangePickerPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhDateRangePickerPositioner({ children, container, ...rest }: XhDateRangePickerPositionerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  // 浮层面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
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

export interface XhDateRangePickerContentProps extends ComponentPropsWithRef<'div'> {}
export function XhDateRangePickerContent({ children, ...rest }: XhDateRangePickerContentProps): ReactNode {
  const ctx = useDateRangePickerContext()
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

// 以下是内嵌范围日历的角色节点，DOM 上带 data-scope="calendar-range-picker"，行为取自本组件持有的日历机器

export interface XhDateRangePickerCalendarProps extends ComponentPropsWithRef<'div'> {
  /** 并排的第几张面板，默认 0。写在这里，面板内的标题、网格与格子就不必各写一遍。 */
  index?: number | string
}
/** 内嵌日历的挂载点，同时是日历的根节点。 */
export function XhDateRangePickerCalendar({ index = 0, children, ...rest }: XhDateRangePickerCalendarProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const panel = usePanelIndex(index)
  return (
    <DateRangePickerPanelProvider value={panel}>
      <div {...mergeReactProps(ctx.api.getCalendarProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </DateRangePickerPanelProvider>
  )
}

export interface XhDateRangePickerPresetGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 自己铺条目；不写就按 presets 数据自动铺，两者产出的 DOM 一致。 */
  children?: SlotChildren<DateRangePickerPresetsSlotProps>
}
export function XhDateRangePickerPresetGroup({ children, ...rest }: XhDateRangePickerPresetGroupProps): ReactNode {
  const ctx = useDateRangePickerContext()
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

export interface XhDateRangePickerPresetProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 这一条的身份，与 presets 数据里的 value 逐字对上。 */
  value: string
}
/** 有内容用内容，否则用数据里的 label。 */
export function XhDateRangePickerPreset({ value, children, ...rest }: XhDateRangePickerPresetProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getPresetProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : api.presets.find(p => p.value === value)?.label}
    </div>
  )
}

export interface XhDateRangePickerHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhDateRangePickerHeader({ children, ...rest }: XhDateRangePickerHeaderProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <div {...mergeReactProps(ctx.api.calendar.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDateRangePickerPrevYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDateRangePickerPrevYearTrigger({ children, ...rest }: XhDateRangePickerPrevYearTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <button {...mergeReactProps(ctx.api.calendar.getPrevYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDateRangePickerPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDateRangePickerPrevTrigger({ children, ...rest }: XhDateRangePickerPrevTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <button {...mergeReactProps(ctx.api.calendar.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDateRangePickerNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDateRangePickerNextTrigger({ children, ...rest }: XhDateRangePickerNextTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <button {...mergeReactProps(ctx.api.calendar.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDateRangePickerNextYearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDateRangePickerNextYearTrigger({ children, ...rest }: XhDateRangePickerNextYearTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <button {...mergeReactProps(ctx.api.calendar.getNextYearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDateRangePickerHeadingProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板；不写就跟着所在的日历走。 */
  index?: number | string
}
/** 有内容用内容，否则渲染本面板的标题。 */
export function XhDateRangePickerHeading({ index, children, ...rest }: XhDateRangePickerHeadingProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const panel = usePanelIndex(index)
  const cal = ctx.api.calendar
  return (
    <div {...mergeReactProps(cal.getHeadingProps({ index: panel }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? (cal.panels[panel]?.headingLabel ?? cal.headingLabel)}
    </div>
  )
}

export interface XhDateRangePickerHeadingYearTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板；不写就跟着所在的日历走。 */
  index?: number | string
}
/** 有内容用内容，否则渲染标题里年那一截；年视图下它是整个十年跨度。 */
export function XhDateRangePickerHeadingYearTrigger({ index, children, ...rest }: XhDateRangePickerHeadingYearTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const panel = usePanelIndex(index)
  const cal = ctx.api.calendar
  return (
    <button {...mergeReactProps(cal.getHeadingYearTriggerProps({ index: panel }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? cal.panels[panel]?.headingYear}
    </button>
  )
}

export interface XhDateRangePickerHeadingMonthTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 属于第几个面板；不写就跟着所在的日历走。 */
  index?: number | string
}
export function XhDateRangePickerHeadingMonthTrigger({ index, children, ...rest }: XhDateRangePickerHeadingMonthTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const panel = usePanelIndex(index)
  const cal = ctx.api.calendar
  return (
    <button {...mergeReactProps(cal.getHeadingMonthTriggerProps({ index: panel }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? cal.panels[panel]?.headingMonth}
    </button>
  )
}

export interface XhDateRangePickerGridProps extends ComponentPropsWithRef<'div'> {
  /** 属于第几个面板；不写就跟着所在的日历走。 */
  index?: number | string
}
export function XhDateRangePickerGrid({ index, children, ...rest }: XhDateRangePickerGridProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const panel = usePanelIndex(index)
  // 区间预览的清除挂在网格上，pointerleave 不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.calendar.getGridProps({ index: panel }) as Record<string, unknown>,
    ['onPointerLeave'],
  )
  return (
    <div
      {...mergeReactProps(
        bind.attrs,
        rest as Record<string, unknown>,
        { ref: bind.ref },
        // 键盘在首个网格上收口；其余面板只渲染，方向键仍能跨面板走（落点按值现查）
        panel === 0 ? { ref: (el: HTMLDivElement | null) => { ctx.gridRef.current = el } } : {},
      )}
    >
      {children}
    </div>
  )
}

export interface XhDateRangePickerGridHeadProps extends ComponentPropsWithRef<'div'> {}
export function XhDateRangePickerGridHead({ children, ...rest }: XhDateRangePickerGridHeadProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <div {...mergeReactProps(ctx.api.calendar.getGridHeadProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDateRangePickerGridBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhDateRangePickerGridBody({ children, ...rest }: XhDateRangePickerGridBodyProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <div {...mergeReactProps(ctx.api.calendar.getGridBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDateRangePickerWeekRowProps extends ComponentPropsWithRef<'div'> {}
/** 表头行与日期行共用同一个 role=row。 */
export function XhDateRangePickerWeekRow({ children, ...rest }: XhDateRangePickerWeekRowProps): ReactNode {
  const ctx = useDateRangePickerContext()
  return <div {...mergeReactProps(ctx.api.calendar.getWeekRowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDateRangePickerWeekNumberProps extends ComponentPropsWithRef<'span'> {
  /** 这一行行首那天的 ISO 串。 */
  value: string
}
/** 有内容用内容，否则显示这一行的周序号。 */
export function XhDateRangePickerWeekNumber({ value, children, ...rest }: XhDateRangePickerWeekNumberProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const cal = ctx.api.calendar
  return (
    <span {...mergeReactProps(cal.getWeekNumberProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? cal.getWeekNumberText({ value })}
    </span>
  )
}

export interface XhDateRangePickerWeekDayProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 列序 0-6，兼收字符串。 */
  value: number | string
}
export function XhDateRangePickerWeekDay({ value, children, ...rest }: XhDateRangePickerWeekDayProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const cal = ctx.api.calendar
  const index = Number(value)
  return (
    <span {...mergeReactProps(cal.getWeekDayProps({ value: index }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? cal.weekDays[index]?.label}
    </span>
  )
}

export interface XhDateRangePickerCellProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** ISO 日期串。 */
  value: string
  /**
   * 属于第几个面板；不写就跟着所在的日历走。同一天会同时出现在两个面板里
   * （8 月末那几天也铺在 9 月的首行），「是不是本月」只有连着面板一起看才判得出来。
   */
  index?: number | string
}
/** 不上报格子卸载，翻月后由日历机器按聚焦日重新落点。 */
export function XhDateRangePickerCell({ value, index, children, ...rest }: XhDateRangePickerCellProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const panel = usePanelIndex(index)
  const cell = useMemo(() => ({ value, index: panel }), [value, panel])
  return (
    <DateRangePickerCellProvider value={cell}>
      <div {...mergeReactProps(ctx.api.calendar.getCellProps(cell) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </DateRangePickerCellProvider>
  )
}

export interface XhDateRangePickerCellTriggerProps extends ComponentPropsWithRef<'div'> {}
export function XhDateRangePickerCellTrigger({ children, ...rest }: XhDateRangePickerCellTriggerProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const cell = useDateRangePickerCellContext()
  // 格子的聚焦上报与指针进入都不冒泡（连接层直接转交日历那一份），改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.calendar.getCellTriggerProps(cell) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhDateRangePickerHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {
  /** 写在分段容器外面时用它指明属于哪一端；写在容器里面不必给，跟着容器走。 */
  index?: number | string
}
export function XhDateRangePickerHiddenInput({ index, ...rest }: XhDateRangePickerHiddenInputProps): ReactNode {
  const ctx = useDateRangePickerContext()
  const group = useDateRangePickerSegmentGroupContext()
  const at: DateRangePickerGroupIndex = index === undefined ? group : resolveDateRangePickerFieldIndex(index)
  return (
    <input
      {...mergeReactProps(
        dateRangePickerFieldAt(ctx.api, at).getHiddenInputProps() as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
