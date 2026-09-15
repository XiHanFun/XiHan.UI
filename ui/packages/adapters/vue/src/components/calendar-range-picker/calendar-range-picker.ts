/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar range picker 相关实现。

import type { CalendarCellProps, CalendarGranularity, CalendarRangePickerApi, CalendarRangePickerSchema, CalendarRangePickerTranslations, CalendarView, CalendarWeekdayFormat } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideCalendarRangePicker, provideCalendarRangePickerCell, useCalendarRangePickerCellContext, useCalendarRangePickerContext } from './context'
import { useCalendarRangePicker } from './use-calendar-range-picker'

type CalendarRangePickerProps = CalendarRangePickerSchema['props']

/** 默认插槽的载荷：区间两端与聚焦日、展示月的日期矩阵与表头、选择到一半的起点，以及选中、聚焦、翻月的动作。 */
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

export const XhCalendarRangePickerRoot = defineComponent({
  name: 'XhCalendarRangePickerRoot',
  // 缺省值由 connect 与机器给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    value: { type: [String, Array] as PropType<string | string[]> },
    defaultValue: { type: [String, Array] as PropType<string | string[]> },
    focusedValue: { type: String },
    defaultFocusedValue: { type: String },
    min: { type: String },
    max: { type: String },
    isDateUnavailable: { type: Function as PropType<(value: string, anchor: string | null) => boolean> },
    /** 区间允许跨过不可用的日期；默认关闭，落下起点后只能选到两侧最近的不可用日为止。 */
    allowsNonContiguousRanges: Boolean,
    /** 校验失败：根带 data-invalid，区间内的格子报告 aria-invalid。 */
    invalid: Boolean,
    locale: { type: String },
    timeZone: { type: String },
    disabled: Boolean,
    readOnly: Boolean,
    weekdayFormat: { type: String as PropType<CalendarWeekdayFormat> },
    fixedWeeks: Boolean,
    /** 选择粒度。 */
    granularity: { type: String as PropType<CalendarGranularity> },
    /** 面板当前所处的层级；给定即受控，默认跟随 granularity。 */
    activeView: { type: String as PropType<CalendarView> },
    /** 非受控初值，默认同 granularity。 */
    defaultActiveView: { type: String as PropType<CalendarView> },
    /** 并排展示几页，默认 1。 */
    visibleCount: { type: Number },
    translations: { type: Object as PropType<Partial<CalendarRangePickerTranslations>> },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为两端升序的数组
  emits: {
    'value-change': (_details: PayloadOf<CalendarRangePickerProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<CalendarRangePickerProps, 'onValueChange'>['value']) => true,
    'focused-value-change': (_details: PayloadOf<CalendarRangePickerProps, 'onFocusedValueChange'>) => true,
    'update:focusedValue': (_focusedValue: PayloadOf<CalendarRangePickerProps, 'onFocusedValueChange'>['focusedValue']) => true,
    'active-view-change': (_details: PayloadOf<CalendarRangePickerProps, 'onActiveViewChange'>) => true,
    'update:activeView': (_activeView: PayloadOf<CalendarRangePickerProps, 'onActiveViewChange'>['activeView']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: CalendarRangePickerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: CalendarRangePickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyFocus: CalendarRangePickerProps['onFocusedValueChange'] = (details) => {
      emit('focused-value-change', details)
      emit('update:focusedValue', details.focusedValue)
    }
    const notifyActiveView: CalendarRangePickerProps['onActiveViewChange'] = (details) => {
      emit('active-view-change', details)
      emit('update:activeView', details.activeView)
    }
    const ctx = useCalendarRangePicker(withXhConfig('calendar-range-picker', props) as CalendarRangePickerProps, notifyValue, notifyFocus, notifyActiveView)
    provideCalendarRangePicker(ctx)
    // 网格与表头由作者照插槽里的 weeks / weekDays 自行渲染
    return () => h('div', { ...ctx.api.value.getRootProps() as Record<string, unknown>, ref: ctx.rootRef }, slots.default?.({
      value: ctx.api.value.value,
      focusedValue: ctx.api.value.focusedValue,
      visibleMonth: ctx.api.value.visibleMonth,
      panels: ctx.api.value.panels,
      periods: ctx.api.value.periods,
      weeks: ctx.api.value.weeks,
      weekDays: ctx.api.value.weekDays,
      headingLabel: ctx.api.value.headingLabel,
      canGoPrev: ctx.api.value.canGoPrev,
      canGoNext: ctx.api.value.canGoNext,
      isSelected: ctx.api.value.isSelected,
      isUnavailable: ctx.api.value.isUnavailable,
      rangeAnchor: ctx.api.value.rangeAnchor,
      setValue: ctx.api.value.setValue,
      select: ctx.api.value.select,
      focus: ctx.api.value.focus,
      goToPrevMonth: ctx.api.value.goToPrevMonth,
      goToNextMonth: ctx.api.value.goToNextMonth,
    }))
  },
})

export const XhCalendarRangePickerHeader = defineComponent({
  name: 'XhCalendarRangePickerHeader',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarRangePickerPrevYearTrigger = defineComponent({
  name: 'XhCalendarRangePickerPrevYearTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h('button', ctx.api.value.getPrevYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarRangePickerPrevTrigger = defineComponent({
  name: 'XhCalendarRangePickerPrevTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h('button', ctx.api.value.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarRangePickerNextTrigger = defineComponent({
  name: 'XhCalendarRangePickerNextTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h('button', ctx.api.value.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarRangePickerNextYearTrigger = defineComponent({
  name: 'XhCalendarRangePickerNextYearTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h('button', ctx.api.value.getNextYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarRangePickerHeading = defineComponent({
  name: 'XhCalendarRangePickerHeading',
  props: {
    /** 属于第几个面板，默认 0。单面板时不必写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarRangePickerContext()
    // 有插槽用插槽，否则渲染本面板的标题
    return () => h(
      'div',
      ctx.api.value.getHeadingProps({ index: props.index }) as Record<string, unknown>,
      slots.default?.() ?? (ctx.api.value.panels[props.index]?.headingLabel ?? ctx.api.value.headingLabel),
    )
  },
})

export const XhCalendarRangePickerHeadingYearTrigger = defineComponent({
  name: 'XhCalendarRangePickerHeadingYearTrigger',
  props: {
    /** 属于第几个面板，默认 0。单面板时不必写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarRangePickerContext()
    // 有插槽用插槽，否则渲染标题里年那一截；年视图下它是整个十年跨度
    return () => h(
      'button',
      ctx.api.value.getHeadingYearTriggerProps({ index: props.index }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.panels[props.index]?.headingYear,
    )
  },
})

export const XhCalendarRangePickerHeadingMonthTrigger = defineComponent({
  name: 'XhCalendarRangePickerHeadingMonthTrigger',
  props: {
    /** 属于第几个面板，默认 0。单面板时不必写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h(
      'button',
      ctx.api.value.getHeadingMonthTriggerProps({ index: props.index }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.panels[props.index]?.headingMonth,
    )
  },
})

export const XhCalendarRangePickerGrid = defineComponent({
  name: 'XhCalendarRangePickerGrid',
  props: {
    /** 属于第几个面板，默认 0。单面板时不必写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h(
      'div',
      {
        ...ctx.api.value.getGridProps({ index: props.index }) as Record<string, unknown>,
        // 键盘在首个网格上收口；其余面板只渲染，方向键仍能跨面板走（落点按值现查）
        ref: props.index === 0 ? ctx.gridRef : undefined,
      },
      slots.default?.(),
    )
  },
})

export const XhCalendarRangePickerGridHead = defineComponent({
  name: 'XhCalendarRangePickerGridHead',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h('div', ctx.api.value.getGridHeadProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarRangePickerGridBody = defineComponent({
  name: 'XhCalendarRangePickerGridBody',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h('div', ctx.api.value.getGridBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

// 表头行与日期行共用同一个 role=row
export const XhCalendarRangePickerWeekRow = defineComponent({
  name: 'XhCalendarRangePickerWeekRow',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    return () => h('div', ctx.api.value.getWeekRowProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarRangePickerWeekNumber = defineComponent({
  name: 'XhCalendarRangePickerWeekNumber',
  props: {
    /** 该行行首那一天的 ISO 串。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCalendarRangePickerContext()
    // 有插槽用插槽，否则显示这一行的周序号
    return () => h(
      'span',
      ctx.api.value.getWeekNumberProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getWeekNumberText({ value: props.value }),
    )
  },
})

export const XhCalendarRangePickerWeekDay = defineComponent({
  name: 'XhCalendarRangePickerWeekDay',
  props: {
    // 列序 0-6，兼收字符串
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCalendarRangePickerContext()
    const index = computed(() => Number(props.value))
    return () => h(
      'span',
      ctx.api.value.getWeekDayProps({ value: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.weekDays[index.value]?.label,
    )
  },
})

export const XhCalendarRangePickerCell = defineComponent({
  name: 'XhCalendarRangePickerCell',
  props: {
    /** ISO 日期串。 */
    value: { type: String, required: true },
    /**
     * 属于第几个面板，默认 0。多面板时必须提供：同一天会同时出现在两个面板中
     * （8 月末的几天也铺在 9 月的首行），是否为本月只有连同面板一起看才能判定。
     */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarRangePickerContext()
    const cell = computed<CalendarCellProps>(() => ({ value: props.value, index: props.index }))
    provideCalendarRangePickerCell({ cell })
    // 不上报格子卸载，翻月后由机器按聚焦日重新落点
    return () => h('div', ctx.api.value.getCellProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarRangePickerCellTrigger = defineComponent({
  name: 'XhCalendarRangePickerCellTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarRangePickerContext()
    const { cell } = useCalendarRangePickerCellContext()
    return () => h('div', ctx.api.value.getCellTriggerProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})
