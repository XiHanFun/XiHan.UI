import type { TimeFieldSchema, TimeGranularity, TimeHourCycle, TimeSegmentType } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideTimeField, useTimeFieldContext } from './context'
import { useTimeField } from './use-time-field'

type TimeFieldProps = TimeFieldSchema['props']

export const XhTimeFieldRoot = defineComponent({
  name: 'XhTimeFieldRoot',
  props: {
    // 给 default: undefined 才表达得了"非受控"；落成空串会被当作"受控且当前为空"，
    // 用户从此再也改不动
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    // 缺省值的唯一事实源在 connect：这里一律 undefined，别在两侧各写一份默认
    hourCycle: { type: Number as PropType<TimeHourCycle>, default: undefined },
    granularity: { type: String as PropType<TimeGranularity>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸串，支持 v-model:value
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const onValueChange: TimeFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useTimeField(props as TimeFieldProps, { onValueChange })
    provideTimeField(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      empty: ctx.api.value.empty,
      outOfRange: ctx.api.value.outOfRange,
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
    // 段不是能被 <label for> 指向的原生控件，"点标题聚焦到第一段"由连接层的 click 接管；
    // 仍写成原生 label 是为了让它在表单里保持惯常的语义与样式
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
    // 段的身份由作者声明。刻意不叫 type：那个名字会被快照当成表单控件的 type 采集，
    // 而 Vue 这侧声明成 prop 之后并不会落成属性，两个适配器的快照会就此分叉
    segment: { type: String as PropType<TimeSegmentType>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimeFieldContext()
    // 作者写了插槽就听作者的，否则显示这一段该显示的文字（空段是占位串）
    return () => h(
      'span',
      ctx.api.value.getSegmentProps({ segment: props.segment }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getSegmentText({ segment: props.segment }),
    )
  },
})

export const XhTimeFieldHiddenInput = defineComponent({
  name: 'XhTimeFieldHiddenInput',
  setup() {
    const ctx = useTimeFieldContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
