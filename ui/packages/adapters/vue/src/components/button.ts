import type { PropTypes } from '@xihan-ui/core'
import type { ButtonProps } from '@xihan-ui/headless'
import type { InjectionKey, PropType, Ref } from 'vue'
import { connectButton } from '@xihan-ui/headless'
import { computed, defineComponent, h, inject, provide, useAttrs } from 'vue'
import { withXhConfig } from '../config/config'
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
    iconOnly: Boolean,
    fullWidth: Boolean,
    variant: String as PropType<ButtonProps['variant']>,
    tone: String as PropType<ButtonProps['tone']>,
    size: String as PropType<ButtonProps['size']>,
  },
  setup(props, { slots }) {
    const attrs = useAttrs()
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('button', props as ButtonProps)
    // 作者写在根节点上的可及名转告连接层，图标按钮缺名时由它提醒
    const api = computed(() => connectButton({
      ...configured,
      ariaLabel: attrs['aria-label'] as string | undefined,
      ariaLabelledby: attrs['aria-labelledby'] as string | undefined,
    }, vueNormalize))
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
