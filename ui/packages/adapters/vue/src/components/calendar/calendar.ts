import type { CalendarApi, CalendarCellProps, CalendarSchema, CalendarSelectionMode, CalendarView, CalendarWeekdayFormat } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideCalendar, provideCalendarCell, useCalendarCellContext, useCalendarContext } from './context'
import { useCalendar } from './use-calendar'

type CalendarProps = CalendarSchema['props']

/** 默认插槽的载荷：选中值与聚焦日、展示月的日期矩阵与表头，以及选中、聚焦、翻月的动作。 */
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

export const XhCalendarRoot = defineComponent({
  name: 'XhCalendarRoot',
  // 缺省值由 connect 与机器给出，这里一律 default: undefined
  props: {
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    selectionMode: { type: String as PropType<CalendarSelectionMode>, default: undefined },
    focusedValue: { type: String, default: undefined },
    defaultFocusedValue: { type: String, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    isDateUnavailable: { type: Function as PropType<(value: string) => boolean>, default: undefined },
    locale: { type: String, default: undefined },
    timeZone: { type: String, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    weekdayFormat: { type: String as PropType<CalendarWeekdayFormat>, default: undefined },
    fixedWeeks: Boolean,
    /** 面板粒度：天（默认）/ 月 / 季度 / 年。 */
    view: { type: String as PropType<CalendarView>, default: undefined },
    /** 周选：点任意一天选中它所在的整周。只在 view=day 且区间模式下生效。 */
    weekSelection: { type: Boolean, default: undefined },
    /** 并排展示几页，默认 1。 */
    visibleCount: { type: Number, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为数组，单选时长度 ≤ 1
  emits: {
    'value-change': (_details: PayloadOf<CalendarProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<CalendarProps, 'onValueChange'>['value']) => true,
    'focused-value-change': (_details: PayloadOf<CalendarProps, 'onFocusedValueChange'>) => true,
    'update:focusedValue': (_focusedValue: PayloadOf<CalendarProps, 'onFocusedValueChange'>['focusedValue']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: CalendarRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: CalendarProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyFocus: CalendarProps['onFocusedValueChange'] = (details) => {
      emit('focused-value-change', details)
      emit('update:focusedValue', details.focusedValue)
    }
    const ctx = useCalendar(withXhConfig('calendar', props) as CalendarProps, notifyValue, notifyFocus)
    provideCalendar(ctx)
    // 网格与表头由作者照插槽里的 weeks / weekDays 自行渲染
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      focusedValue: ctx.api.value.focusedValue,
      visibleMonth: ctx.api.value.visibleMonth,
      panels: ctx.api.value.panels,
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

export const XhCalendarHeader = defineComponent({
  name: 'XhCalendarHeader',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPrevYearTrigger = defineComponent({
  name: 'XhCalendarPrevYearTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h('button', ctx.api.value.getPrevYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarPrevTrigger = defineComponent({
  name: 'XhCalendarPrevTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h('button', ctx.api.value.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarNextTrigger = defineComponent({
  name: 'XhCalendarNextTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h('button', ctx.api.value.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarNextYearTrigger = defineComponent({
  name: 'XhCalendarNextYearTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h('button', ctx.api.value.getNextYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarHeading = defineComponent({
  name: 'XhCalendarHeading',
  props: {
    /** 属于第几个面板，默认 0。单面板时不用写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarContext()
    // 有插槽用插槽，否则渲染本面板的标题
    return () => h(
      'div',
      ctx.api.value.getHeadingProps({ index: props.index }) as Record<string, unknown>,
      slots.default?.() ?? (ctx.api.value.panels[props.index]?.headingLabel ?? ctx.api.value.headingLabel),
    )
  },
})

export const XhCalendarGrid = defineComponent({
  name: 'XhCalendarGrid',
  props: {
    /** 属于第几个面板，默认 0。单面板时不用写。 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useCalendarContext()
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

export const XhCalendarGridHead = defineComponent({
  name: 'XhCalendarGridHead',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h('div', ctx.api.value.getGridHeadProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarGridBody = defineComponent({
  name: 'XhCalendarGridBody',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h('div', ctx.api.value.getGridBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

// 表头行与日期行共用同一个 role=row
export const XhCalendarWeekRow = defineComponent({
  name: 'XhCalendarWeekRow',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h('div', ctx.api.value.getWeekRowProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarWeekDay = defineComponent({
  name: 'XhCalendarWeekDay',
  props: {
    // 列序 0-6，兼收字符串
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCalendarContext()
    const index = computed(() => Number(props.value))
    return () => h(
      'span',
      ctx.api.value.getWeekDayProps({ value: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.weekDays[index.value]?.label,
    )
  },
})

export const XhCalendarCell = defineComponent({
  name: 'XhCalendarCell',
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
    const ctx = useCalendarContext()
    const cell = computed<CalendarCellProps>(() => ({ value: props.value, index: props.index }))
    provideCalendarCell({ cell })
    // 不上报格子卸载，翻月后由机器按聚焦日重新落点
    return () => h('div', ctx.api.value.getCellProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCalendarCellTrigger = defineComponent({
  name: 'XhCalendarCellTrigger',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    const { cell } = useCalendarCellContext()
    return () => h('div', ctx.api.value.getCellTriggerProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})
