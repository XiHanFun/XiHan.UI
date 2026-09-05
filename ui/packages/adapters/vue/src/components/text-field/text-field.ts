import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TextFieldApi, TextFieldInputHost, TextFieldSchema, TextFieldType } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { autoSizeTextarea } from '@xihan-ui/headless'
import { defineComponent, h, onMounted, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { provideTextField, useTextFieldContext } from './context'
import { useTextField } from './use-text-field'

type TextFieldProps = TextFieldSchema['props']

/** 默认插槽的载荷：当前值、值状态标志与写值方法。 */
export type TextFieldRootSlotProps = Pick<
  TextFieldApi,
  'value' | 'empty' | 'atLimit' | 'canClear' | 'setValue' | 'clear'
>

export const XhTextFieldRoot = defineComponent({
  name: 'XhTextFieldRoot',
  props: {
    // default: undefined 表示非受控
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    type: { type: String as PropType<TextFieldType>, default: undefined },
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
    translations: { type: Object as PropType<TextFieldProps['translations']>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸串
  emits: {
    'value-change': (_details: PayloadOf<TextFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<TextFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TextFieldRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: TextFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useTextField(withXhConfig('text-field', props) as TextFieldProps, notify)
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

export const XhTextFieldControl = defineComponent({
  name: 'XhTextFieldControl',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    // 视觉盒：输入框与清空按钮都放进来，皮肤把描边、底色、聚焦环画在它身上
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTextFieldInput = defineComponent({
  name: 'XhTextFieldInput',
  props: {
    /** 输入框渲染成哪个标签，默认 input；写 textarea 即多行宿主，接上 autoSize 自动高度。 */
    as: { type: String as PropType<TextFieldInputHost>, default: 'input' },
  },
  setup(props) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
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
    return () => h(props.as, fieldLabel.value({
      ...ctx.api.value.getInputProps({ as: props.as }) as Record<string, unknown>,
      ref: (node: unknown) => {
        el.value = props.as === 'textarea' ? node as HTMLTextAreaElement : null
      },
      ...fieldWiring.value,
    }))
  },
})

export const XhTextFieldClearTrigger = defineComponent({
  name: 'XhTextFieldClearTrigger',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
