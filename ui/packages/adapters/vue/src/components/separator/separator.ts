import type { SeparatorProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectSeparator } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhSeparator = defineComponent({
  name: 'XhSeparator',
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    decorative: Boolean,
  },
  setup(props) {
    return () => h('div', connectSeparator(props as SeparatorProps, vueNormalize).getRootProps() as Record<string, unknown>)
  },
})
