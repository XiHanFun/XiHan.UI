import type { ProgressGapPosition, ProgressProps, ProgressVariant } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { connectProgress } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'

export const XhProgress = defineComponent({
  name: 'XhProgress',
  props: {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    // 缺省值都在 connect 里收口，这边一律不预设
    variant: { type: String as PropType<ProgressVariant>, default: undefined },
    strokeWidth: { type: Number, default: undefined },
    gapDegree: { type: Number, default: undefined },
    gapPosition: { type: String as PropType<ProgressGapPosition>, default: undefined },
    valueText: { type: String, default: undefined },
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
  },
  setup(props, { slots }) {
    return () => {
      const a = connectProgress(props as ProgressProps, vueNormalize)
      const rootProps = a.getRootProps() as Record<string, unknown>
      if (a.variant === 'line') {
        return h('div', rootProps, [
          h('div', a.getTrackProps() as Record<string, unknown>, [
            h('div', a.getRangeProps() as Record<string, unknown>),
          ]),
        ])
      }
      // 环心的内容归作者：没写就不渲染那一层，免得一个空盒子压在环上挡住指针
      const label = slots.default?.()
      const children: unknown[] = [
        h('svg', a.getCanvasProps() as Record<string, unknown>, [
          h('circle', a.getTrackProps() as Record<string, unknown>),
          h('circle', a.getRangeProps() as Record<string, unknown>),
        ]),
      ]
      if (slotPaints(label))
        children.push(h('div', a.getLabelProps() as Record<string, unknown>, label))
      return h('div', rootProps, children as never)
    }
  },
})
