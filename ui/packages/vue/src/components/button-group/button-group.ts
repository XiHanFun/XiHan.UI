import type { ButtonGroupProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectButtonGroup } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhButtonGroup = defineComponent({
  name: 'XhButtonGroup',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: undefined },
    variant: { type: String, default: undefined },
    tone: { type: String, default: undefined },
    size: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    // 组内每一段是作者放进插槽的按钮，直接当直接子节点摆
    return () => h(
      'div',
      connectButtonGroup(props as ButtonGroupProps, vueNormalize).getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
