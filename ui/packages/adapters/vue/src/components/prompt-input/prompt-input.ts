import type { PromptInputApi, PromptInputSchema, PromptInputSubmitKey, PromptInputTranslations } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { providePromptInput, usePromptInputContext } from './context'
import { usePromptInput } from './use-prompt-input'

type Props = PromptInputSchema['props']

/** 默认插槽的载荷：草稿文本与四个状态，以及改写、提交、停止三个动作。 */
export type PromptInputRootSlotProps = Pick<
  PromptInputApi,
  'value' | 'isComposing' | 'canSubmit' | 'busy' | 'disabled' | 'setValue' | 'submit' | 'stop'
>

export const XhPromptInputRoot = defineComponent({
  name: 'XhPromptInputRoot',
  props: {
    // default: undefined 表示非受控，落成空串会被当成受控的空值
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    disabled: Boolean,
    busy: Boolean,
    submitKey: { type: String as PropType<PromptInputSubmitKey>, default: undefined },
    // 用 undefined 而非裸 Boolean，缺省值由机器与 connect 给出
    allowEmptySubmit: { type: Boolean, default: undefined },
    clearOnSubmit: { type: Boolean, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<PromptInputTranslations>>, default: undefined },
  },
  // value-change 与 submit 携带 { value }，update:value 携带裸串以支持 v-model:value，stop 无载荷
  emits: {
    'value-change': (_details: PayloadOf<Props, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<Props, 'onValueChange'>['value']) => true,
    'submit': (_details: PayloadOf<Props, 'onSubmit'>) => true,
    'stop': () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: PromptInputRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = usePromptInput(withXhConfig('prompt-input', props) as Props, {
      onValueChange: (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      onSubmit: details => emit('submit', details),
      onStop: () => emit('stop'),
    })
    providePromptInput(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      isComposing: ctx.api.value.isComposing,
      canSubmit: ctx.api.value.canSubmit,
      busy: ctx.api.value.busy,
      disabled: ctx.api.value.disabled,
      setValue: ctx.api.value.setValue,
      submit: ctx.api.value.submit,
      stop: ctx.api.value.stop,
    }))
  },
})

export const XhPromptInputControl = defineComponent({
  name: 'XhPromptInputControl',
  setup(_, { slots }) {
    const ctx = usePromptInputContext()
    // 渲了这一层，输入框与按钮并排收在它里面，root 翻成竖排
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPromptInputInput = defineComponent({
  name: 'XhPromptInputInput',
  setup() {
    const ctx = usePromptInputContext()
    // 渲染原生 textarea，换行与撤销栈交给浏览器；自动长高是皮肤的两行 CSS
    return () => h('textarea', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

export const XhPromptInputSubmitTrigger = defineComponent({
  name: 'XhPromptInputSubmitTrigger',
  setup(_, { slots }) {
    const ctx = usePromptInputContext()
    // 生成期间原位切换为停止，只改 data-mode 与 aria-label
    return () => h('button', ctx.api.value.getSubmitTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
