import type { Placement } from '@xihan-ui/core'
import type {
  TimeGranularity,
  TimeHourCycle,
  TimePickerColumnUnit,
  TimePickerSchema,
  TimeSegmentType,
} from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import {
  provideTimePicker,
  provideTimePickerColumn,
  useTimePickerColumnContext,
  useTimePickerContext,
} from './context'
import { useTimePicker } from './use-time-picker'

type TimePickerProps = TimePickerSchema['props']

export const XhTimePickerRoot = defineComponent({
  name: 'XhTimePickerRoot',
  // 缺省值的唯一事实源在 connect —— 凡是 connect 有兜底的一律 default: undefined。
  // value 尤其：落成空串会被当作"受控且当前为空"，用户从此再也改不动
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    hourCycle: { type: Number as PropType<TimeHourCycle>, default: undefined },
    granularity: { type: String as PropType<TimeGranularity>, default: undefined },
    step: { type: Number, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
  },
  // *-change 携带 details 对象；update:* 携带裸值，支持 v-model:value / v-model:open
  emits: ['value-change', 'open-change', 'update:value', 'update:open'],
  setup(props, { slots, emit }) {
    const notifyValue: TimePickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: TimePickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useTimePicker(props as TimePickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
    })
    provideTimePicker(ctx)

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      empty: ctx.api.value.empty,
      outOfRange: ctx.api.value.outOfRange,
      segments: ctx.api.value.segments,
      columns: ctx.api.value.columns,
      canClear: ctx.api.value.canClear,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhTimePickerLabel = defineComponent({
  name: 'XhTimePickerLabel',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    // 段不是能被 <label for> 指向的原生控件，"点标题聚焦到第一段"由连接层的 click 接管；
    // 仍写成原生 label 是为了让它在表单里保持惯常的语义与样式
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimePickerControl = defineComponent({
  name: 'XhTimePickerControl',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTimePickerInput = defineComponent({
  name: 'XhTimePickerInput',
  props: {
    // 段的身份由作者声明。刻意不叫 type：那个名字会被快照当成表单控件的 type 采集，
    // 而 Vue 这侧声明成 prop 之后并不会落成属性，两个适配器的快照会就此分叉
    segment: { type: String as PropType<TimeSegmentType>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
    // 作者写了插槽就听作者的，否则显示这一段该显示的文字（空段是占位串）
    return () => h(
      'span',
      ctx.api.value.getInputProps({ segment: props.segment }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getSegmentText({ segment: props.segment }),
    )
  },
})

export const XhTimePickerTrigger = defineComponent({
  name: 'XhTimePickerTrigger',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimePickerClearTrigger = defineComponent({
  name: 'XhTimePickerClearTrigger',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimePickerPositioner = defineComponent({
  name: 'XhTimePickerPositioner',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTimePickerContent = defineComponent({
  name: 'XhTimePickerContent',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTimePickerColumn = defineComponent({
  name: 'XhTimePickerColumn',
  props: {
    unit: { type: String as PropType<TimePickerColumnUnit>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
    const unit = computed(() => props.unit)
    // 选项从这里取自己归哪一列，作者不必在每个格子上再抄一遍单位
    provideTimePickerColumn({ unit })
    return () => h(
      'div',
      ctx.api.value.getColumnProps({ unit: props.unit }) as Record<string, unknown>,
      slots.default?.({ options: ctx.api.value.columns.find(c => c.unit === props.unit)?.options ?? [] }),
    )
  },
})

export const XhTimePickerOption = defineComponent({
  name: 'XhTimePickerOption',
  props: {
    /** 两位补零的显示串（'09' / '30'），与段上的文字同一套写法。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
    const { unit } = useTimePickerColumnContext()
    // 作者写了插槽就听作者的，否则格子上就显示它自己的值
    return () => h(
      'div',
      ctx.api.value.getOptionProps({ unit: unit.value, value: props.value }) as Record<string, unknown>,
      slots.default?.() ?? props.value,
    )
  },
})

export const XhTimePickerHiddenInput = defineComponent({
  name: 'XhTimePickerHiddenInput',
  setup() {
    const ctx = useTimePickerContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
