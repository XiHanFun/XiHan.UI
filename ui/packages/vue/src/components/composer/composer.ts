import type { ComposerRunStatus, ComposerSchema, ComposerTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideComposer, useComposerContext } from './context'
import { useComposer } from './use-composer'

type ComposerProps = ComposerSchema['props']

export const XhComposerRoot = defineComponent({
  name: 'XhComposerRoot',
  props: {
    // 值必须 default: undefined 才表达得了"非受控"。
    // 落成空串会被当作"受控且当前为空"，用户从此一个字也敲不进去
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    disabled: Boolean,
    runStatus: { type: String as PropType<ComposerRunStatus>, default: undefined },
    // 裸 Boolean 会把缺省压成 false，回车从此只换行、再也发不出去 —— 兜底在 connect 里，这里一律 undefined
    submitOnEnter: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<ComposerTranslations>>, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸串，支持 v-model:value。
  // submit 携带 { value }（提交那一刻的原文，清空发生在它之后）；stop 无载荷
  emits: ['value-change', 'update:value', 'submit', 'stop'],
  setup(props, { slots, emit }) {
    const ctx = useComposer(props as ComposerProps, {
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
    // 必须是原生 <textarea>：Shift+Enter 的换行、光标位置与撤销栈全靠它自己，组件一概不接管
    return () => h('textarea', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

export const XhComposerSubmitTrigger = defineComponent({
  name: 'XhComposerSubmitTrigger',
  setup(_, { slots }) {
    const ctx = useComposerContext()
    // 流式期间它原位变"停止"：DOM 位置一动不动，只有 data-mode 与 aria-label 变。
    // 作者据此在插槽里换图标，正在按它的用户不会按空
    return () => h('button', ctx.api.value.getSubmitTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
