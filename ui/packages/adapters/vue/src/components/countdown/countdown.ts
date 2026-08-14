import type {
  CountdownApi,
  CountdownFinishDetails,
  CountdownLive,
  CountdownParts,
  CountdownSchema,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { connectCountdown, countdownMachine } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'

type CountdownProps = CountdownSchema['props']

/** 默认插槽的载荷：量化后的剩余毫秒、按模板铺好的文本，以及拆开的时分秒毫秒。 */
export type CountdownSlotProps = Pick<CountdownApi, 'value' | 'text'> & CountdownParts

/**
 * 一段自己往下走的时间：剩余毫秒逐帧递减，按模板铺成时分秒写进根里。
 *
 * 默认插槽拿得到 `{ value, text, hours, minutes, seconds, milliseconds }`，
 * 插了内容就由作者自己排版每一段；什么都不插时根里就是按模板铺好的那串字。
 */
export const XhCountdown = defineComponent({
  name: 'XhCountdown',
  // 缺省值由机器与 connect 给出，这里一律 default: undefined
  props: {
    value: { type: Number, default: undefined },
    format: { type: String, default: undefined },
    active: { type: Boolean, default: undefined },
    precision: { type: Number, default: undefined },
    live: { type: String as PropType<CountdownLive>, default: undefined },
  },
  emits: {
    finish: (_details: PayloadOf<CountdownProps, 'onFinish'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: CountdownSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: CountdownProps['onFinish'] = (details: CountdownFinishDetails) => {
      emit('finish', details)
    }
    const service = useMachine(countdownMachine, () => ({ ...props, onFinish: notify }))
    const api = computed(() => connectCountdown(service, vueNormalize))

    return () => {
      const current = api.value
      const content = slots.default?.({
        value: current.value,
        text: current.text,
        ...current.parts,
      })
      return h(
        'span',
        current.getRootProps() as Record<string, unknown>,
        // 插槽为空（含 v-if 落空只剩注释节点）时退回组件自己铺好的那串字
        slotPaints(content) ? content : current.text,
      )
    }
  },
})
