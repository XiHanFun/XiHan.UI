import type { NumberFieldApi, NumberFieldSchema } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideNumberField, useNumberFieldContext } from './context'
import { useNumberField } from './use-number-field'

type NumberFieldProps = NumberFieldSchema['props']

/** 默认插槽的载荷：原始输入串与其数值、增减是否还走得动，以及写值、增减的命令。 */
export type NumberFieldRootSlotProps = Pick<
  NumberFieldApi,
  'value' | 'valueAsNumber' | 'empty' | 'canIncrement' | 'canDecrement' | 'setValue' | 'increment' | 'decrement'
>

export const XhNumberFieldRoot = defineComponent({
  name: 'XhNumberFieldRoot',
  props: {
    // 值是原始输入串；default: undefined 表示非受控
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: undefined },
    largeStep: { type: Number, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    required: Boolean,
    invalid: Boolean,
    name: { type: String, default: undefined },
    changeDelay: { type: Number, default: undefined },
    changeInterval: { type: Number, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    parse: { type: Function as PropType<NumberFieldProps['parse']>, default: undefined },
    format: { type: Function as PropType<NumberFieldProps['format']>, default: undefined },
  },
  // value-change 携带 { value, valueAsNumber }，update:value 携带裸串
  emits: {
    'value-change': (_details: PayloadOf<NumberFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<NumberFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: NumberFieldRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: NumberFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useNumberField(props as NumberFieldProps, notify)
    provideNumberField(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      valueAsNumber: ctx.api.value.valueAsNumber,
      empty: ctx.api.value.empty,
      canIncrement: ctx.api.value.canIncrement,
      canDecrement: ctx.api.value.canDecrement,
      setValue: ctx.api.value.setValue,
      increment: ctx.api.value.increment,
      decrement: ctx.api.value.decrement,
    }))
  },
})

export const XhNumberFieldLabel = defineComponent({
  name: 'XhNumberFieldLabel',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhNumberFieldControl = defineComponent({
  name: 'XhNumberFieldControl',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    // 视觉盒：输入框与加减钮都放进来，皮肤把描边、底色、聚焦环画在它身上
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhNumberFieldInput = defineComponent({
  name: 'XhNumberFieldInput',
  setup() {
    const ctx = useNumberFieldContext()
    return () => h('input', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

export const XhNumberFieldIncrementTrigger = defineComponent({
  name: 'XhNumberFieldIncrementTrigger',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    return () => h('button', ctx.api.value.getIncrementTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhNumberFieldDecrementTrigger = defineComponent({
  name: 'XhNumberFieldDecrementTrigger',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    return () => h('button', ctx.api.value.getDecrementTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
