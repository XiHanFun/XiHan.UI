import type { DateFieldSchema, DateGranularity, DateSegmentType } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideDateField, useDateFieldContext } from './context'
import { useDateField } from './use-date-field'

type DateFieldProps = DateFieldSchema['props']
type SegmentTexts = { readonly [K in DateSegmentType]?: string }

export const XhDateFieldRoot = defineComponent({
  name: 'XhDateFieldRoot',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    timeZone: { type: String, default: undefined },
    granularity: { type: String as PropType<DateGranularity>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    placeholder: { type: Object as PropType<SegmentTexts>, default: undefined },
    translations: { type: Object as PropType<SegmentTexts>, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸串
  emits: {
    'value-change': (_details: PayloadOf<DateFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<DateFieldProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const onValueChange: DateFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useDateField(withXhConfig('date-field', props) as DateFieldProps, { onValueChange })
    provideDateField(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      valueAsDate: ctx.api.value.valueAsDate,
      segments: ctx.api.value.segments,
      complete: ctx.api.value.complete,
      empty: ctx.api.value.empty,
      outOfRange: ctx.api.value.outOfRange,
      focusedSegment: ctx.api.value.focusedSegment,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhDateFieldLabel = defineComponent({
  name: 'XhDateFieldLabel',
  setup(_, { slots }) {
    const ctx = useDateFieldContext()
    // 渲染为 span 而非 label，段位不是可被 for 标注的控件；点标题聚焦由连接层接管
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateFieldControl = defineComponent({
  name: 'XhDateFieldControl',
  setup(_, { slots }) {
    const ctx = useDateFieldContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateFieldSegment = defineComponent({
  name: 'XhDateFieldSegment',
  props: {
    // 下标由作者声明，是哪一段由 locale 与 granularity 算出；兼收字符串
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDateFieldContext()
    return () => {
      const index = Math.trunc(Number(props.index))
      const api = ctx.api.value
      const state = api.segments[index]
      // 有插槽用插槽，否则渲染连接层算好的段位文本
      return h(
        'div',
        api.getSegmentProps({ index }) as Record<string, unknown>,
        slots.default ? slots.default({ segment: state }) : state?.text,
      )
    }
  },
})

export const XhDateFieldHiddenInput = defineComponent({
  name: 'XhDateFieldHiddenInput',
  setup() {
    const ctx = useDateFieldContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
