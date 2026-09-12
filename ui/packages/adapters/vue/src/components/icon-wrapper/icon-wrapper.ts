import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { IconWrapperProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectIconWrapper } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhIconWrapper = defineComponent({
  name: 'XhIconWrapper',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    variant: { type: String as PropType<ActionVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
  },
  setup(props, { slots }) {
    return () => h(
      'span',
      connectIconWrapper(withXhConfig('icon-wrapper', props) as IconWrapperProps, vueNormalize).getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
