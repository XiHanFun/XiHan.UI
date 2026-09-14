/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar picker 相关实现。

import type { CalendarCellProps, CalendarGranularity, CalendarPickerApi, CalendarPickerSchema, CalendarPickerSelectionMode, CalendarPickerTranslations, CalendarView, CalendarWeekdayFormat } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideCalendarPicker, provideCalendarPickerCell, useCalendarPickerCellContext, useCalendarPickerContext } from './context'
import { useCalendarPicker } from './use-calendar-picker'

type CalendarPickerProps = CalendarPickerSchema['props']

/** 默认插槽的载荷：选中值与聚焦日、展示月的日期矩阵与表头，以及选中、聚焦、翻月的动作。 */
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

export const XhCalendarPickerRoot = defineComponent({
  name: 'XhCalendarPickerRoot',
  // 缺省值由 connect 与机器给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    value: { type: [String, Array] as PropType<string | string[]> },
    defaultValue: { type: [String, Array] as PropType<string | string[]> },
    selectionMode: { type: String as PropType<CalendarPickerSelectionMode> },
    focusedValue: { type: String },
    defaultFocusedValue: { type: String },
    min: { type: String },
    max: { type: String },
    isDateUnavailable: { type: Function as PropType<(value: string) => boolean> },
    /** 校验失败：根带 data-invalid。 */
    invalid: Boolean,
    locale: { type: String },
    timeZone: { type: String },
    disabled: Boolean,
    readOnly: Boolean,
    weekdayFormat: { type: String as PropType<CalendarWeekdayFormat> },
    fixedWeeks: Boolean,
    /** 选择粒度；与 selectionMode 正交。区间选择是另一个组件（XhCalendarRangePicker）。 */
    granularity: { type: String as PropType<CalendarGranularity> },
    /** 面板此刻钻到了哪一层；给定即受控，缺省跟着 granularity。 */
    activeView: { type: String as PropType<CalendarView> },
    /** 非受控初值，缺省同 granularity。 */
    defaultActiveView: { type: String as PropType<CalendarView> },
    /** 并排展示几页，默认 1。 */
    visibleCount: { type: Number },
    translations: { type: Object as PropType<Partial<CalendarPickerTranslations>> },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为数组，单选时长度 ≤ 1
  emits: {
    'value-change': (_details: PayloadOf<CalendarPickerProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<CalendarPickerProps, 'onValueChange'>['value']) => true,
    'focused-value-change': (_details: PayloadOf<CalendarPickerProps, 'onFocusedValueChange'>) => true,
    'update:focusedValue': (_focusedValue: PayloadOf<CalendarPickerProps, 'onFocusedValueChange'>['focusedValue']) => true,
    'active-view-change': (_details: PayloadOf<CalendarPickerProps, 'onActiveViewChange'>) => true,
    'update:activeView': (_activeView: PayloadOf<CalendarPickerProps, 'onActiveViewChange'>['activeView']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: CalendarPickerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: CalendarPickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyFocus: CalendarPickerProps['onFocusedValueChange'] = (details) => {
      emit('focused-value-change', details)
      emit('update:focusedValue', details.focusedValue)
    }
    const notifyActiveView: CalendarPickerProps['onActiveViewChange'] = (details) => {
      emit('active-view-change', details)
      emit('update:activeView', details.activeView)
    }
    const ctx = useCalendarPicker(withXhConfig('calendar-picker', props) as CalendarPickerProps, notifyValue, notifyFocus, notifyActiveView)
    provideCalendarPicker(ctx)
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
      setValue: ctx.api.value.setValue,
      select: ctx.api.value.select,
      focus: ctx.api.value.focus,
      goToPrevMonth: ctx.api.value.goToPrevMonth,
      goToNextMonth: ctx.api.value.goToNextMonth,
    }))
  },
})

export const XhCalendarPickerHeader = defineComponent({
  name: 'XhCalendarPickerHeader',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPickerPrevYearTrigger = defineComponent({
  name: 'XhCalendarPickerPrevYearTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h('button', ctx.api.value.getPrevYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPickerPrevTrigger = defineComponent({
  name: 'XhCalendarPickerPrevTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h('button', ctx.api.value.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPickerNextTrigger = defineComponent({
  name: 'XhCalendarPickerNextTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h('button', ctx.api.value.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPickerNextYearTrigger = defineComponent({
  name: 'XhCalendarPickerNextYearTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h('button', ctx.api.value.getNextYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPickerHeading = defineComponent({
  name: 'XhCalendarPickerHeading',
  props: {
    /** 属于第几个面板，默认 0。单面板时不用写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarPickerContext()
    // 有插槽用插槽，否则渲染本面板的标题
    return () => h(
      'div',
      ctx.api.value.getHeadingProps({ index: props.index }) as Record<string, unknown>,
      slots.default?.() ?? (ctx.api.value.panels[props.index]?.headingLabel ?? ctx.api.value.headingLabel),
    )
  },
})

export const XhCalendarPickerHeadingYearTrigger = defineComponent({
  name: 'XhCalendarPickerHeadingYearTrigger',
  props: {
    /** 属于第几个面板，默认 0。单面板时不用写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarPickerContext()
    // 有插槽用插槽，否则渲染标题里年那一截；年视图下它是整个十年跨度
    return () => h(
      'button',
      ctx.api.value.getHeadingYearTriggerProps({ index: props.index }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.panels[props.index]?.headingYear,
    )
  },
})

export const XhCalendarPickerHeadingMonthTrigger = defineComponent({
  name: 'XhCalendarPickerHeadingMonthTrigger',
  props: {
    /** 属于第几个面板，默认 0。单面板时不用写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h(
      'button',
      ctx.api.value.getHeadingMonthTriggerProps({ index: props.index }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.panels[props.index]?.headingMonth,
    )
  },
})

export const XhCalendarPickerGrid = defineComponent({
  name: 'XhCalendarPickerGrid',
  props: {
    /** 属于第几个面板，默认 0。单面板时不用写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarPickerContext()
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

export const XhCalendarPickerGridHead = defineComponent({
  name: 'XhCalendarPickerGridHead',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h('div', ctx.api.value.getGridHeadProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPickerGridBody = defineComponent({
  name: 'XhCalendarPickerGridBody',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h('div', ctx.api.value.getGridBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

// 表头行与日期行共用同一个 role=row
export const XhCalendarPickerWeekRow = defineComponent({
  name: 'XhCalendarPickerWeekRow',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    return () => h('div', ctx.api.value.getWeekRowProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPickerWeekNumber = defineComponent({
  name: 'XhCalendarPickerWeekNumber',
  props: {
    /** 这一行行首那天的 ISO 串。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCalendarPickerContext()
    // 有插槽用插槽，否则显示这一行的周序号
    return () => h(
      'span',
      ctx.api.value.getWeekNumberProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getWeekNumberText({ value: props.value }),
    )
  },
})

export const XhCalendarPickerWeekDay = defineComponent({
  name: 'XhCalendarPickerWeekDay',
  props: {
    // 列序 0-6，兼收字符串
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCalendarPickerContext()
    const index = computed(() => Number(props.value))
    return () => h(
      'span',
      ctx.api.value.getWeekDayProps({ value: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.weekDays[index.value]?.label,
    )
  },
})

export const XhCalendarPickerCell = defineComponent({
  name: 'XhCalendarPickerCell',
  props: {
    /** ISO 日期串。 */
    value: { type: String, required: true },
    /**
     * 属于第几个面板，默认 0。多面板时必须给：同一天会同时出现在两个面板里
     * （8 月末那几天也铺在 9 月的首行），「是不是本月」只有连着面板一起看才判得出来。
     */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarPickerContext()
    const cell = computed<CalendarCellProps>(() => ({ value: props.value, index: props.index }))
    provideCalendarPickerCell({ cell })
    // 不上报格子卸载，翻月后由机器按聚焦日重新落点
    return () => h('div', ctx.api.value.getCellProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPickerCellTrigger = defineComponent({
  name: 'XhCalendarPickerCellTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarPickerContext()
    const { cell } = useCalendarPickerCellContext()
    return () => h('div', ctx.api.value.getCellTriggerProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})
