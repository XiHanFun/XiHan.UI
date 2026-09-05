import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { ButtonGroupProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectButtonGroup } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhButtonGroup = defineComponent({
  name: 'XhButtonGroup',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: undefined },
    variant: { type: String as PropType<ActionVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  setup(props, { slots }) {
    // 组内每一段是作者放进插槽的按钮，直接当直接子节点摆
    return () => h(
      'div',
      connectButtonGroup(withXhConfig('button-group', props) as ButtonGroupProps, vueNormalize).getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
