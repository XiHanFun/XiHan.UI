import type { CalendarCellProps, CalendarSchema, CalendarSelectionMode, CalendarWeekdayFormat } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { provideCalendar, provideCalendarCell, useCalendarCellContext, useCalendarContext } from './context'
import { useCalendar } from './use-calendar'

type CalendarProps = CalendarSchema['props']

export const XhCalendarRoot = defineComponent({
  name: 'XhCalendarRoot',
  // 缺省值的唯一事实源在 connect / machine —— 凡是那儿有兜底的一律 default: undefined
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
  },
  // value-change / focused-value-change 携带 details；update:* 携带裸值，支持 v-model。
  // 选中值回传的恒是数组（单选也是长度 ≤ 1 的数组），形状不随模式变
  emits: ['value-change', 'update:value', 'focused-value-change', 'update:focusedValue'],
  setup(props, { slots, emit }) {
    const notifyValue: CalendarProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyFocus: CalendarProps['onFocusedValueChange'] = (details) => {
      emit('focused-value-change', details)
      emit('update:focusedValue', details.focusedValue)
    }
    const ctx = useCalendar(props as CalendarProps, notifyValue, notifyFocus)
    provideCalendar(ctx)
    // 网格与表头都由作者照 weeks / weekDays 渲染：组件不替作者生成节点，
    // 否则外层壳、图标、农历副标题这类东西再也塞不进来
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      focusedValue: ctx.api.value.focusedValue,
      visibleMonth: ctx.api.value.visibleMonth,
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

export const XhCalendarHeading = defineComponent({
  name: 'XhCalendarHeading',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    // 文案由作者写（默认插槽为空时退回 headingLabel），组件不劫持内容
    return () => h(
      'div',
      ctx.api.value.getHeadingProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.headingLabel,
    )
  },
})

export const XhCalendarGrid = defineComponent({
  name: 'XhCalendarGrid',
  setup(_, { slots }) {
    const ctx = useCalendarContext()
    return () => h(
      'div',
      { ...ctx.api.value.getGridProps() as Record<string, unknown>, ref: ctx.gridRef },
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

// 表头行与日期行是同一个 role=row：columnheader 必须待在行里，
// 否则 grid 的行列语义从表头这一层就断了
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
    // 列序 0-6。fixture 与 HTML 属性传进来的是字符串，统一收成数字
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
  },
  setup(props, { slots }) {
    const ctx = useCalendarContext()
    const cell = computed<CalendarCellProps>(() => ({ value: props.value }))
    provideCalendarCell({ cell })
    // 这里不补报「承载焦点的格子被卸载」：与 Listbox 不同，聚焦日不因格子消失而作废
    // ——它正是展示月的来源，翻月时旧格子必然整批卸载。焦点由机器在重渲后按聚焦日
    // 现查落点补回来，清掉锚点反而会把展示月一起打空
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
