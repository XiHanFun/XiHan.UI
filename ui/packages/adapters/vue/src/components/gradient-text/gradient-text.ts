import type { GradientTextDirection, GradientTextProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectGradientText } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhGradientText = defineComponent({
  name: 'XhGradientText',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    from: { type: String, default: undefined },
    to: { type: String, default: undefined },
    direction: { type: String as PropType<GradientTextDirection>, default: undefined },
  },
  setup(props, { slots }) {
    return () => h(
      'span',
      connectGradientText(props as GradientTextProps, vueNormalize).getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
