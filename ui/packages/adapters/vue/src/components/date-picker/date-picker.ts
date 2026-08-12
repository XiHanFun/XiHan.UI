import type { CalendarCellProps, CalendarSelectionMode, DatePickerApi, DatePickerFieldApi, DatePickerSchema } from '@xihan-ui/headless'
import type { Placement } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import {
  provideDatePicker,
  provideDatePickerCell,
  provideDatePickerInput,
  useDatePickerCellContext,
  useDatePickerContext,
  useDatePickerInputContext,
} from './context'
import { useDatePicker } from './use-date-picker'

type DatePickerProps = DatePickerSchema['props']

/** 按组号取那一组分段输入；非区间模式下终点那组缺席。 */
function fieldOf(api: DatePickerApi, index: 0 | 1): DatePickerFieldApi | null {
  return index === 1 ? api.fieldEnd : api.field
}

export const XhDatePickerRoot = defineComponent({
  name: 'XhDatePickerRoot',
  // 有 connect / machine 兜底的 prop 一律 default: undefined
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
    // 区间终点那份隐藏输入的表单名；不给即终点不参与提交
    endName: { type: String, default: undefined },
    // 区间模式下两组段位各自的读屏名字
    translations: { type: Object as PropType<DatePickerProps['translations']>, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    closeOnSelect: { type: Boolean, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为数组，单选时长度 ≤ 1
  emits: {
    'value-change': (_details: PayloadOf<DatePickerProps, 'onValueChange'>) => true,
    'open-change': (_details: PayloadOf<DatePickerProps, 'onOpenChange'>) => true,
    'focused-value-change': (_details: PayloadOf<DatePickerProps, 'onFocusedValueChange'>) => true,
    'update:value': (_value: PayloadOf<DatePickerProps, 'onValueChange'>['value']) => true,
    'update:open': (_open: PayloadOf<DatePickerProps, 'onOpenChange'>['open']) => true,
  },
  setup(props, { slots, emit }) {
    const notifyValue: DatePickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: DatePickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    // 聚焦日只对外播报，不提供 v-model
    const notifyFocus: DatePickerProps['onFocusedValueChange'] = details => emit('focused-value-change', details)
    const ctx = useDatePicker(withXhConfig('date-picker', props) as DatePickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
      onFocusedValueChange: notifyFocus,
    })
    provideDatePicker(ctx)
    // 网格与段位由作者照插槽里的 weeks / segments 自行渲染
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
      // 区间终点那组段位；非区间模式为空数组，作者据此决定渲不渲第二组
      endSegments: ctx.api.value.fieldEnd?.segments ?? [],
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
    // 渲染为 span 而非 label，点击聚焦由连接层接管
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
  props: {
    // 组号：0 起点、1 区间终点，兼收字符串以支持模板里写 index="1"
    index: { type: [Number, String] as PropType<number | string>, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = computed<0 | 1>(() => (Number(props.index) === 1 ? 1 : 0))
    // 组内的段位与隐藏输入据此认领起止
    provideDatePickerInput({ index })
    // role=group 的分段容器，也是换段时的查询边界
    return () => h(
      'div',
      ctx.api.value.getInputProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhDatePickerSegment = defineComponent({
  name: 'XhDatePickerSegment',
  props: {
    // 段位下标，兼收字符串以支持模板里写 index="0"
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const group = useDatePickerInputContext()
    return () => {
      const index = Math.trunc(Number(props.index))
      const field = fieldOf(ctx.api.value, group.index.value)
      // 非区间模式下写在终点组里的段位无处落脚，不渲染
      if (!field)
        return null
      const state = field.segments[index]
      // 有插槽用插槽，否则渲染连接层算好的段位文本
      return h(
        'div',
        field.getSegmentProps({ index }) as Record<string, unknown>,
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

// 以下是内嵌日历的角色节点，DOM 上带 data-scope="calendar"，行为取自本组件持有的日历机器

export const XhDatePickerCalendar = defineComponent({
  name: 'XhDatePickerCalendar',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    // 内嵌日历的挂载点，同时是日历的根节点
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
    // 有插槽用插槽，否则渲染 headingLabel
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

// 表头行与日期行共用同一个 role=row
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
    // 列序 0-6，兼收字符串
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
    // 不上报格子卸载，翻月后由日历机器按聚焦日重新落点
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
  props: {
    // 写在分段容器外面时用它指明属于哪一端；写在容器里面不必给，跟着容器走
    index: { type: [Number, String] as PropType<number | string>, default: undefined },
  },
  setup(props) {
    const ctx = useDatePickerContext()
    const group = useDatePickerInputContext()
    return () => {
      const index = props.index === undefined ? group.index.value : (Number(props.index) === 1 ? 1 : 0)
      const field = fieldOf(ctx.api.value, index)
      // 非区间模式下终点那份没有可提交的值，不渲染
      if (!field)
        return null
      return h('input', field.getHiddenInputProps() as Record<string, unknown>)
    }
  },
})
