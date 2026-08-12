import type { TextFieldInputHost, TextFieldSchema } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { autoSizeTextarea } from '@xihan-ui/headless'
import { defineComponent, h, onMounted, ref, watch } from 'vue'
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
    autoSize: { type: [Boolean, Object] as PropType<TextFieldProps['autoSize']>, default: undefined },
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
  props: {
    /** 输入框渲染成哪个标签，默认 input；写 textarea 即多行宿主，接上 autoSize 自动高度。 */
    as: { type: String as PropType<TextFieldInputHost>, default: 'input' },
  },
  setup(props) {
    const ctx = useTextFieldContext()
    const el = ref<HTMLTextAreaElement | null>(null)
    // 程序化写值（setValue / 表单重置 / 受控回写）不触发 input 事件，量高在渲染后补一次
    watch(() => [ctx.api.value.value, props.as], () => {
      if (props.as === 'textarea' && el.value)
        autoSizeTextarea(el.value, ctx.api.value.autoSize)
    }, { flush: 'post' })
    onMounted(() => {
      if (props.as === 'textarea' && el.value)
        autoSizeTextarea(el.value, ctx.api.value.autoSize)
    })
    // 自己渲染宿主节点，label 的 for 指向它
    return () => h(props.as, {
      ...ctx.api.value.getInputProps({ as: props.as }) as Record<string, unknown>,
      ref: (node: unknown) => {
        el.value = props.as === 'textarea' ? node as HTMLTextAreaElement : null
      },
    })
  },
})

export const XhTextFieldClearTrigger = defineComponent({
  name: 'XhTextFieldClearTrigger',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
