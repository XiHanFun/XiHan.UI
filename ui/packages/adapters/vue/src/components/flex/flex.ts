import type { FlexProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectFlex } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhFlex = defineComponent({
  name: 'XhFlex',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    orientation: { type: String as PropType<FlexProps['orientation']>, default: undefined },
    direction: { type: String as PropType<FlexProps['direction']>, default: undefined },
    align: { type: String as PropType<FlexProps['align']>, default: undefined },
    justify: { type: String as PropType<FlexProps['justify']>, default: undefined },
    gap: { type: String as PropType<FlexProps['gap']>, default: undefined },
    wrap: Boolean,
    inline: Boolean,
  },
  setup(props, { slots }) {
    return () => h(
      'div',
      connectFlex(props as FlexProps, vueNormalize).getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
