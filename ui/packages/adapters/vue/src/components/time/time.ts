import type { TimeLocale, TimeProps, TimeType, TimeValue } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectTime } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'

/**
 * 渲染成 `<time datetime>`：文本给人看，datetime 给机器读，两者取自同一个墙钟。
 *
 * 默认插槽里写了东西就用作者的文本，datetime 仍由组件算——这正是拿它包一段
 * 自己排版好的时间说法的用法。插槽为空时铺组件格式化出来的文本。
 */
export const XhTime = defineComponent({
  name: 'XhTime',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    value: { type: [String, Number, Date] as PropType<TimeValue>, default: undefined },
    type: { type: String as PropType<TimeType>, default: undefined },
    format: { type: String, default: undefined },
    locale: { type: String as PropType<TimeLocale>, default: undefined },
    now: { type: [String, Number, Date] as PropType<TimeValue>, default: undefined },
  },
  setup(props, { slots }) {
    const merged = withXhConfig('time', props)
    const api = computed(() => connectTime({
      value: merged.value,
      type: merged.type,
      format: merged.format,
      locale: merged.locale,
      now: merged.now,
    } satisfies TimeProps, vueNormalize))

    return () => {
      const content = slots.default?.()
      return h(
        'time',
        api.value.getRootProps() as Record<string, unknown>,
        // 插槽里只剩注释或空白时不算写过东西，那种情况仍铺组件的文本
        slotPaints(content) ? content : api.value.text,
      )
    }
  },
})
