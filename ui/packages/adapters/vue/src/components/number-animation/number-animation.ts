import type { Size, Tone } from '@xihan-ui/core'
import type { NumberAnimationApi, NumberAnimationCompleteDetails, NumberAnimationEasing, NumberAnimationLive, NumberAnimationSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { connectNumberAnimation, numberAnimationMachine } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'

type NumberAnimationProps = NumberAnimationSchema['props']

/** 默认插槽的载荷：当前帧的数值，以及它按 precision 与 separator 铺好的文本。 */
export type NumberAnimationSlotProps = Pick<NumberAnimationApi, 'value' | 'text'>

/**
 * 一段会自己走的数字：从 from 补间到 to，逐帧算值，格式化后写进根里。
 *
 * 默认插槽拿得到 `{ value, text }`，插了内容就由作者自己排版；
 * 什么都不插时根里就是格式化好的那串字。
 */
export const XhNumberAnimation = defineComponent({
  name: 'XhNumberAnimation',
  // 缺省值由机器与 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    from: { type: Number },
    to: { type: Number },
    duration: { type: Number },
    easing: { type: String as PropType<NumberAnimationEasing> },
    precision: { type: Number },
    separator: { type: String },
    active: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size> },
    tone: { type: String as PropType<Tone> },
    live: { type: String as PropType<NumberAnimationLive> },
  },
  emits: {
    complete: (_details: PayloadOf<NumberAnimationProps, 'onComplete'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: NumberAnimationSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: NumberAnimationProps['onComplete'] = (details: NumberAnimationCompleteDetails) => {
      emit('complete', details)
    }
    const service = useMachine(numberAnimationMachine, () => ({ ...props, onComplete: notify }))
    const api = computed(() => connectNumberAnimation(service, vueNormalize))

    return () => {
      const current = api.value
      const content = slots.default?.({ value: current.value, text: current.text })
      return h(
        'span',
        current.getRootProps() as Record<string, unknown>,
        // 插槽为空（含 v-if 落空只剩注释节点）时退回组件自己铺好的那串字
        slotPaints(content) ? content : current.text,
      )
    }
  },
})
