import type { Placement } from '@xihan-ui/core'
import type { CalendarCellProps, CalendarSelectionMode, DatePickerSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { provideDatePicker, provideDatePickerCell, useDatePickerCellContext, useDatePickerContext } from './context'
import { useDatePicker } from './use-date-picker'

type DatePickerProps = DatePickerSchema['props']

export const XhDatePickerRoot = defineComponent({
  name: 'XhDatePickerRoot',
  // 缺省值的唯一事实源在 connect / machine —— 凡是那儿有兜底的一律 default: undefined
  // （closeOnSelect 尤其：裸 Boolean 声明会把缺省压成 false，选完就再也不收起了）
  props: {
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    timeZone: { type: String, default: undefined },
    selectionMode: { type: String as PropType<CalendarSelectionMode>, default: undefined },
    isDateUnavailable: { type: Function as PropType<(value: string) => boolean>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    closeOnSelect: { type: Boolean, default: undefined },
  },
  // *-change 携带 details 对象；update:* 携带裸值，支持 v-model:value / v-model:open。
  // 选中值回传的恒是数组（单选也是长度 ≤ 1 的数组），形状不随模式变
  emits: ['value-change', 'open-change', 'focused-value-change', 'update:value', 'update:open'],
  setup(props, { slots, emit }) {
    const notifyValue: DatePickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: DatePickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    // 聚焦日只对外播报、不做 v-model：它是内部同步出来的结果，宿主写回没有意义
    const notifyFocus: DatePickerProps['onFocusedValueChange'] = details => emit('focused-value-change', details)
    const ctx = useDatePicker(props as DatePickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
      onFocusedValueChange: notifyFocus,
    })
    provideDatePicker(ctx)
    // 网格与段位都由作者照 weeks / segments 渲染：组件不替作者生成节点，
    // 否则外层壳、图标、节假日角标这类东西再也塞不进来
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      valueAsString: ctx.api.value.valueAsString,
      focusedValue: ctx.api.value.focusedValue,
      visibleMonth: ctx.api.value.calendar.visibleMonth,
      weeks: ctx.api.value.calendar.weeks,
      weekDays: ctx.api.value.calendar.weekDays,
      headingLabel: ctx.api.value.calendar.headingLabel,
      canGoPrev: ctx.api.value.calendar.canGoPrev,
      canGoNext: ctx.api.value.calendar.canGoNext,
      segments: ctx.api.value.field.segments,
      canClear: ctx.api.value.canClear,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhDatePickerLabel = defineComponent({
  name: 'XhDatePickerLabel',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    // 刻意不是 <label>：段位是 div，不是可被 for 标注的控件，
    // 写成 label 只会给出一个点了没反应的标题。点标题聚焦由连接层自己接管
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerControl = defineComponent({
  name: 'XhDatePickerControl',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhDatePickerInput = defineComponent({
  name: 'XhDatePickerInput',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    // role=group 的分段容器：段位挂在它里面，换段时也以它为查询边界
    return () => h('div', ctx.api.value.getInputProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerSegment = defineComponent({
  name: 'XhDatePickerSegment',
  props: {
    // 下标由作者声明，是哪一段由 locale 算出来。也收字符串：
    // 模板里写 index="0"（不带冒号）拿到的就是字符串，Vue 只对 Boolean 型 prop 做属性转型
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    return () => {
      const index = Math.trunc(Number(props.index))
      const api = ctx.api.value
      const state = api.field.segments[index]
      // 作者可以自己接管文字（比如给数字套一层 span），没接管就渲染连接层算好的那串
      return h(
        'div',
        api.field.getSegmentProps({ index }) as Record<string, unknown>,
        slots.default ? slots.default({ segment: state }) : state?.text,
      )
    }
  },
})

export const XhDatePickerClearTrigger = defineComponent({
  name: 'XhDatePickerClearTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerTrigger = defineComponent({
  name: 'XhDatePickerTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerPositioner = defineComponent({
  name: 'XhDatePickerPositioner',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhDatePickerContent = defineComponent({
  name: 'XhDatePickerContent',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

// ── 以下是内嵌日历的角色节点：DOM 上戴的是 data-scope="calendar"，
// 行为直接取自本组件持有的那台日历机器，日期选择器一条都不重写 ──

export const XhDatePickerCalendar = defineComponent({
  name: 'XhDatePickerCalendar',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    // 内嵌日历的挂载点，同时充当日历的根节点
    return () => h('div', ctx.api.value.getCalendarProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerHeader = defineComponent({
  name: 'XhDatePickerHeader',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerPrevTrigger = defineComponent({
  name: 'XhDatePickerPrevTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerNextTrigger = defineComponent({
  name: 'XhDatePickerNextTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerHeading = defineComponent({
  name: 'XhDatePickerHeading',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    // 文案由作者写（默认插槽为空时退回 headingLabel），组件不劫持内容
    return () => h(
      'div',
      ctx.api.value.calendar.getHeadingProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.headingLabel,
    )
  },
})

export const XhDatePickerGrid = defineComponent({
  name: 'XhDatePickerGrid',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h(
      'div',
      { ...ctx.api.value.calendar.getGridProps() as Record<string, unknown>, ref: ctx.gridRef },
      slots.default?.(),
    )
  },
})

export const XhDatePickerGridHead = defineComponent({
  name: 'XhDatePickerGridHead',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getGridHeadProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerGridBody = defineComponent({
  name: 'XhDatePickerGridBody',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getGridBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

// 表头行与日期行是同一个 role=row：columnheader 必须待在行里，
// 否则 grid 的行列语义从表头这一层就断了
export const XhDatePickerWeekRow = defineComponent({
  name: 'XhDatePickerWeekRow',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getWeekRowProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerWeekDay = defineComponent({
  name: 'XhDatePickerWeekDay',
  props: {
    // 列序 0-6。fixture 与 HTML 属性传进来的是字符串，统一收成数字
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = computed(() => Number(props.value))
    return () => h(
      'span',
      ctx.api.value.calendar.getWeekDayProps({ value: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.weekDays[index.value]?.label,
    )
  },
})

export const XhDatePickerCell = defineComponent({
  name: 'XhDatePickerCell',
  props: {
    /** ISO 日期串。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const cell = computed<CalendarCellProps>(() => ({ value: props.value }))
    provideDatePickerCell({ cell })
    // 这里不补报「承载焦点的格子被卸载」：聚焦日不因格子消失而作废——它正是展示月的来源，
    // 翻月时旧格子必然整批卸载。焦点由日历机器在重渲后按聚焦日现查落点补回来
    return () => h('div', ctx.api.value.calendar.getCellProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerCellTrigger = defineComponent({
  name: 'XhDatePickerCellTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    const { cell } = useDatePickerCellContext()
    return () => h(
      'div',
      ctx.api.value.calendar.getCellTriggerProps(cell.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhDatePickerHiddenInput = defineComponent({
  name: 'XhDatePickerHiddenInput',
  setup() {
    const ctx = useDatePickerContext()
    return () => h('input', ctx.api.value.field.getHiddenInputProps() as Record<string, unknown>)
  },
})
