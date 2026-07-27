import type { TextFieldSchema } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { provideTextField, useTextFieldContext } from './context'
import { useTextField } from './use-text-field'

type TextFieldProps = TextFieldSchema['props']

export const XhTextFieldRoot = defineComponent({
  name: 'XhTextFieldRoot',
  props: {
    // 值必须 default: undefined 才表达得了"非受控"。
    // 落成空串会被当作"受控且当前为空"，用户从此一个字也敲不进去
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
  },
  // value-change 携带 { value }；update:value 携带裸串，支持 v-model:value
  emits: ['value-change', 'update:value'],
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
    // 必须是原生 <label>：connect 把 for 写向 input，换成别的标签这条关联当场作废
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTextFieldInput = defineComponent({
  name: 'XhTextFieldInput',
  setup() {
    const ctx = useTextFieldContext()
    // 自己渲染 <input>：label 的 for 指的就是这个节点，不是任何外层包裹
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
