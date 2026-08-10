import type { IconWrapperProps } from '@xihan-ui/headless'
import { connectIconWrapper } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhIconWrapper = defineComponent({
  name: 'XhIconWrapper',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    variant: { type: String, default: undefined },
    tone: { type: String, default: undefined },
    size: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => h(
      'span',
      connectIconWrapper(props as IconWrapperProps, vueNormalize).getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
