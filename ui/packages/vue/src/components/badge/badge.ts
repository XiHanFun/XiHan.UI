import type { BadgeProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectBadge } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhBadge = defineComponent({
  name: 'XhBadge',
  props: {
    variant: String as PropType<'solid' | 'subtle' | 'outline'>,
  },
  setup(props, { slots }) {
    return () => h('span', connectBadge(props as BadgeProps, vueNormalize).getRootProps() as Record<string, unknown>, slots.default?.())
  },
})
