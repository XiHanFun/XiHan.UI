import type { DateFieldApi, DateFieldSchema, DateFieldSegmentState, DateFieldTranslations, DateGranularity, DateSegmentSet, DateSegmentType } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideDateField, useDateFieldContext } from './context'
import { useDateField } from './use-date-field'

type DateFieldProps = DateFieldSchema['props']
type SegmentTexts = { readonly [K in DateSegmentType]?: string }

/** 默认插槽的载荷：整份值、逐段投影、填写状态，以及改写与清空的句柄。 */
export type DateFieldRootSlotProps = Pick<
  DateFieldApi,
  | 'value'
  | 'valueAsDate'
  | 'segments'
  | 'complete'
  | 'empty'
  | 'outOfRange'
  | 'focusedSegment'
  | 'setValue'
  | 'clear'
  | 'canClear'
>

/** 段位默认插槽的载荷：本段的投影；下标越界时缺席。 */
export interface DateFieldSegmentSlotProps {
  segment: DateFieldSegmentState | undefined
}

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
    // 段集：给了就以它为准，granularity 让路。段位节点仍按下标认段，段集是有序的
    segments: { type: Array as PropType<DateSegmentSet>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    placeholder: { type: Object as PropType<SegmentTexts>, default: undefined },
    translations: { type: Object as PropType<DateFieldTranslations>, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸串
  emits: {
    'value-change': (_details: PayloadOf<DateFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<DateFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DateFieldRootSlotProps) => VNode[]
  }>,
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
      canClear: ctx.api.value.canClear,
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

export const XhDateFieldSegmentGroup = defineComponent({
  name: 'XhDateFieldSegmentGroup',
  setup(_, { slots }) {
    const ctx = useDateFieldContext()
    return () => h('div', ctx.api.value.getSegmentGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateFieldSegment = defineComponent({
  name: 'XhDateFieldSegment',
  props: {
    // 下标由作者声明，是哪一段由 locale 与段集算出；兼收字符串
    index: { type: [Number, String] as PropType<number | string>, default: undefined },
    /** 按段名声明这一格。段集里没有这一块时它收起；与 index 二选一，两个都写按段名算。 */
    segment: { type: String as PropType<DateSegmentType>, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: DateFieldSegmentSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDateFieldContext()
    return () => {
      const api = ctx.api.value
      // 落点由连接层算：按下标还是按段名是同一条路，适配器这边不重写一份
      const declared = props.segment != null
        ? { segment: props.segment }
        : { index: Math.trunc(Number(props.index)) }
      const state = api.segmentOf(declared)
      // 有插槽用插槽，否则渲染连接层算好的段位文本
      return h(
        'div',
        api.getSegmentProps(declared) as Record<string, unknown>,
        slots.default ? slots.default({ segment: state }) : state?.text,
      )
    }
  },
})

export const XhDateFieldClearTrigger = defineComponent({
  name: 'XhDateFieldClearTrigger',
  setup(_, { slots }) {
    const ctx = useDateFieldContext()
    // 没有默认插槽时由皮肤画兜底字形
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateFieldHiddenInput = defineComponent({
  name: 'XhDateFieldHiddenInput',
  setup() {
    const ctx = useDateFieldContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
