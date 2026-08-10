import type { SpinnerProps, SpinnerTranslations } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideSpinner, useSpinnerContext } from './context'
import { useSpinner } from './use-spinner'

/** 转圈图形由皮肤画在 root 的伪元素上，这里不生成任何子节点。 */
export const XhSpinner = defineComponent({
  name: 'XhSpinner',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    label: { type: String, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    translations: { type: Object as PropType<Partial<SpinnerTranslations>>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useSpinner(props as SpinnerProps)
    provideSpinner(ctx)
    return () => h('span', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 可见文案节点。作者不写内容时显示解析后的 label，屏幕上看到的与读屏念的因此是同一段字。 */
export const XhSpinnerLabel = defineComponent({
  name: 'XhSpinnerLabel',
  setup(_, { slots }) {
    const ctx = useSpinnerContext()
    return () => h(
      'span',
      ctx.api.value.getLabelProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.label,
    )
  },
})
