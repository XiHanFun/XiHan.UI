import type { ComposerApi, ComposerRunStatus, ComposerSchema, ComposerTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideComposer, useComposerContext } from './context'
import { useComposer } from './use-composer'

type ComposerProps = ComposerSchema['props']

/** 默认插槽的载荷：草稿文本与输入法、可提交、流式、禁用四个状态，以及改写、提交、停止三个动作。 */
export type ComposerRootSlotProps = Pick<
  ComposerApi,
  'value' | 'isComposing' | 'canSubmit' | 'streaming' | 'disabled' | 'setValue' | 'submit' | 'stop'
>

export const XhComposerRoot = defineComponent({
  name: 'XhComposerRoot',
  props: {
    // default: undefined 表示非受控，落成空串会被当成受控的空值
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    disabled: Boolean,
    runStatus: { type: String as PropType<ComposerRunStatus>, default: undefined },
    // 用 undefined 而非裸 Boolean，缺省值由 connect 给出
    submitOnEnter: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<ComposerTranslations>>, default: undefined },
  },
  // value-change 与 submit 携带 { value }，update:value 携带裸串以支持 v-model:value，stop 无载荷
  emits: {
    'value-change': (_details: PayloadOf<ComposerProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ComposerProps, 'onValueChange'>['value']) => true,
    'submit': (_details: PayloadOf<ComposerProps, 'onSubmit'>) => true,
    'stop': () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ComposerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useComposer(withXhConfig('composer', props) as ComposerProps, {
      onValueChange: (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      onSubmit: details => emit('submit', details),
      onStop: () => emit('stop'),
    })
    provideComposer(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      isComposing: ctx.api.value.isComposing,
      canSubmit: ctx.api.value.canSubmit,
      streaming: ctx.api.value.streaming,
      disabled: ctx.api.value.disabled,
      setValue: ctx.api.value.setValue,
      submit: ctx.api.value.submit,
      stop: ctx.api.value.stop,
    }))
  },
})

export const XhComposerInput = defineComponent({
  name: 'XhComposerInput',
  setup() {
    const ctx = useComposerContext()
    // 渲染原生 textarea，换行与撤销栈交给浏览器
    return () => h('textarea', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

export const XhComposerSubmitTrigger = defineComponent({
  name: 'XhComposerSubmitTrigger',
  setup(_, { slots }) {
    const ctx = useComposerContext()
    // 流式期间原位切换为停止，只改 data-mode 与 aria-label
    return () => h('button', ctx.api.value.getSubmitTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
