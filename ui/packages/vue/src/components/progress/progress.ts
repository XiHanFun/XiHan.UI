import type { ProgressProps } from '@xihan-ui/headless'
import { connectProgress } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhProgress = defineComponent({
  name: 'XhProgress',
  props: {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
  },
  setup(props) {
    return () => {
      const a = connectProgress(props as ProgressProps, vueNormalize)
      return h('div', a.getRootProps() as Record<string, unknown>, [
        h('div', a.getTrackProps() as Record<string, unknown>, [
          h('div', a.getRangeProps() as Record<string, unknown>),
        ]),
      ])
    }
  },
})
