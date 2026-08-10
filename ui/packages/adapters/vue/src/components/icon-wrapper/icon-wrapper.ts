import type { IconWrapperProps } from '@xihan-ui/headless'
import type { ActionVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { connectIconWrapper } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhIconWrapper = defineComponent({
  name: 'XhIconWrapper',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    variant: { type: String as PropType<ActionVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  setup(props, { slots }) {
    return () => h(
      'span',
      connectIconWrapper(props as IconWrapperProps, vueNormalize).getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
