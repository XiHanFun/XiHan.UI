import type { NumberAnimationEasing, NumberAnimationFinishDetails, NumberAnimationLive, NumberAnimationSchema } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { connectNumberAnimation, numberAnimationMachine } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'

type NumberAnimationProps = NumberAnimationSchema['props']

/**
 * 一段会自己走的数字：从 from 补间到 to，逐帧算值，格式化后写进根里。
 *
 * 默认插槽拿得到 `{ value, text }`，插了内容就由作者自己排版；
 * 什么都不插时根里就是格式化好的那串字。
 */
export const XhNumberAnimation = defineComponent({
  name: 'XhNumberAnimation',
  // 缺省值由机器与 connect 给出，这里一律 default: undefined
  props: {
    from: { type: Number, default: undefined },
    to: { type: Number, default: undefined },
    duration: { type: Number, default: undefined },
    easing: { type: String as PropType<NumberAnimationEasing>, default: undefined },
    precision: { type: Number, default: undefined },
    separator: { type: String, default: undefined },
    active: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    live: { type: String as PropType<NumberAnimationLive>, default: undefined },
  },
  emits: {
    finish: (_details: PayloadOf<NumberAnimationProps, 'onFinish'>) => true,
  },
  setup(props, { slots, emit }) {
    const notify: NumberAnimationProps['onFinish'] = (details: NumberAnimationFinishDetails) => {
      emit('finish', details)
    }
    const service = useMachine(numberAnimationMachine, () => ({ ...props, onFinish: notify }))
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
