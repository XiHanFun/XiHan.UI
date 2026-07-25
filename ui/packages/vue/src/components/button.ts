import type { ButtonProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectButton } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../runtime/normalize-props'

export const XhButton = defineComponent({
  name: 'XhButton',
  props: {
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
    disabled: Boolean,
    loading: Boolean,
    variant: String,
    size: String,
  },
  setup(props, { slots }) {
    const api = computed(() => connectButton(props as ButtonProps, vueNormalize))
    return () => h('button', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})
