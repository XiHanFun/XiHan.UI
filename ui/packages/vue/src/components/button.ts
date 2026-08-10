import type { ButtonProps } from '@xihan-ui/headless'
import type { PropTypes } from '@xihan-ui/kernel'
import type { InjectionKey, PropType, Ref } from 'vue'
import { connectButton } from '@xihan-ui/headless'
import { computed, defineComponent, h, inject, provide } from 'vue'
import { vueNormalize } from '../runtime/normalize-props'

/** 从实际调用推出 api 形状，免得再写一遍 normalize 的类型参数。 */
type VueButtonApi = ReturnType<typeof connectButton<PropTypes>>

const ButtonKey: InjectionKey<Ref<VueButtonApi>> = Symbol('XhButton')

function useButtonApi(): Ref<VueButtonApi> {
  const api = inject(ButtonKey, null)
  if (!api)
    throw new Error('[xh] XhButton 的子部件必须放在 XhButton 里')
  return api
}

export const XhButton = defineComponent({
  name: 'XhButton',
  props: {
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
    disabled: Boolean,
    loading: Boolean,
    variant: String,
    tone: String,
    size: String,
  },
  setup(props, { slots }) {
    const api = computed(() => connectButton(props as ButtonProps, vueNormalize))
    provide(ButtonKey, api)
    return () => h('button', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhButtonLabel = defineComponent({
  name: 'XhButtonLabel',
  setup(_, { slots }) {
    const api = useButtonApi()
    return () => h('span', api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhButtonPrefix = defineComponent({
  name: 'XhButtonPrefix',
  setup(_, { slots }) {
    const api = useButtonApi()
    return () => h('span', api.value.getPrefixProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhButtonSuffix = defineComponent({
  name: 'XhButtonSuffix',
  setup(_, { slots }) {
    const api = useButtonApi()
    return () => h('span', api.value.getSuffixProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 载入态的转圈标记；皮肤给它挂了旋转动画，作者只需摆位置。 */
export const XhButtonIndicator = defineComponent({
  name: 'XhButtonIndicator',
  setup(_, { slots }) {
    const api = useButtonApi()
    return () => h('span', api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})
