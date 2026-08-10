import type { NumberFieldSchema } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideNumberField, useNumberFieldContext } from './context'
import { useNumberField } from './use-number-field'

type NumberFieldProps = NumberFieldSchema['props']

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
  },
  // value-change 携带 { value, valueAsNumber }，update:value 携带裸串
  emits: {
    'value-change': (_details: PayloadOf<NumberFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<NumberFieldProps, 'onValueChange'>['value']) => true,
  },
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
