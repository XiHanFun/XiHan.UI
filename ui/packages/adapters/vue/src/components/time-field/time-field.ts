import type { TimeFieldApi, TimeFieldSchema, TimeGranularity, TimeHourCycle, TimeSegmentType } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideTimeField, useTimeFieldContext } from './context'
import { useTimeField } from './use-time-field'

type TimeFieldProps = TimeFieldSchema['props']

/** 默认插槽的载荷：当前值、值状态标志、参与显示的段与写值方法。 */
export type TimeFieldRootSlotProps = Pick<
  TimeFieldApi,
  'value' | 'empty' | 'outOfRange' | 'canClear' | 'segments' | 'focusedSegment' | 'hourCycle' | 'granularity' | 'setValue' | 'clear'
>

export const XhTimeFieldRoot = defineComponent({
  name: 'XhTimeFieldRoot',
  props: {
    // default: undefined 表示非受控
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    // 缺省值由 connect 给出，这里一律 default: undefined
    hourCycle: { type: Number as PropType<TimeHourCycle>, default: undefined },
    granularity: { type: String as PropType<TimeGranularity>, default: undefined },
    disabled: Boolean,
    translations: { type: Object as PropType<TimeFieldProps['translations']>, default: undefined },
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸串
  emits: {
    'value-change': (_details: PayloadOf<TimeFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<TimeFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TimeFieldRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onValueChange: TimeFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useTimeField(withXhConfig('time-field', props) as TimeFieldProps, { onValueChange })
    provideTimeField(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      empty: ctx.api.value.empty,
      outOfRange: ctx.api.value.outOfRange,
      canClear: ctx.api.value.canClear,
      segments: ctx.api.value.segments,
      focusedSegment: ctx.api.value.focusedSegment,
      hourCycle: ctx.api.value.hourCycle,
      granularity: ctx.api.value.granularity,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhTimeFieldLabel = defineComponent({
  name: 'XhTimeFieldLabel',
  setup(_, { slots }) {
    const ctx = useTimeFieldContext()
    // 仍用原生 label 保持表单语义，点标题聚焦第一段由连接层的 click 接管
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimeFieldControl = defineComponent({
  name: 'XhTimeFieldControl',
  setup(_, { slots }) {
    const ctx = useTimeFieldContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimeFieldSegment = defineComponent({
  name: 'XhTimeFieldSegment',
  props: {
    // 段的身份由作者声明
    segment: { type: String as PropType<TimeSegmentType>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimeFieldContext()
    // 有插槽用插槽，否则显示该段的文字，空段为占位串
    return () => h(
      'span',
      ctx.api.value.getSegmentProps({ segment: props.segment }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getSegmentText({ segment: props.segment }),
    )
  },
})

export const XhTimeFieldClearTrigger = defineComponent({
  name: 'XhTimeFieldClearTrigger',
  setup(_, { slots }) {
    const ctx = useTimeFieldContext()
    // 没写内容时由皮肤画兜底字形
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimeFieldHiddenInput = defineComponent({
  name: 'XhTimeFieldHiddenInput',
  setup() {
    const ctx = useTimeFieldContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
