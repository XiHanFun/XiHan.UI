import type { TextFieldSchema } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideTextField, useTextFieldContext } from './context'
import { useTextField } from './use-text-field'

type TextFieldProps = TextFieldSchema['props']

export const XhTextFieldRoot = defineComponent({
  name: 'XhTextFieldRoot',
  props: {
    // default: undefined 表示非受控
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    required: Boolean,
    invalid: Boolean,
    name: { type: String, default: undefined },
    maxLength: { type: Number, default: undefined },
    clearable: Boolean,
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸串
  emits: {
    'value-change': (_details: PayloadOf<TextFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<TextFieldProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: TextFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useTextField(props as TextFieldProps, notify)
    provideTextField(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      empty: ctx.api.value.empty,
      atLimit: ctx.api.value.atLimit,
      canClear: ctx.api.value.canClear,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhTextFieldLabel = defineComponent({
  name: 'XhTextFieldLabel',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    // 必须是原生 <label>，connect 把 for 写向 input
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTextFieldInput = defineComponent({
  name: 'XhTextFieldInput',
  setup() {
    const ctx = useTextFieldContext()
    // 自己渲染 <input>，label 的 for 指向这个节点
    return () => h('input', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

export const XhTextFieldClearTrigger = defineComponent({
  name: 'XhTextFieldClearTrigger',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
