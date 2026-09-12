import type { Tone } from '@xihan-ui/core'
import type { GradientTextDirection, GradientTextProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectGradientText } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhGradientText = defineComponent({
  name: 'XhGradientText',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    from: { type: String },
    to: { type: String },
    direction: { type: String as PropType<GradientTextDirection> },
    tone: { type: String as PropType<Tone> },
  },
  setup(props, { slots }) {
    return () => h(
      'span',
      connectGradientText(props as GradientTextProps, vueNormalize).getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
