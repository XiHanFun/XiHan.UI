import type { WatermarkProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectWatermark } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideWatermark, useWatermarkContext } from './context'

/**
 * 盖水印的那块地。图样由 connect 算成一张 SVG，写成根上的内联 CSS 变量，
 * 由皮肤铺成一层盖在内容之上的伪元素——印子因此不进无障碍树、不吃点击、也选不中。
 */
export const XhWatermarkRoot = defineComponent({
  name: 'XhWatermarkRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    text: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    rotate: { type: Number, default: undefined },
    gap: { type: Number, default: undefined },
    fontSize: { type: Number, default: undefined },
    opacity: { type: Number, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectWatermark(props as WatermarkProps, vueNormalize))
    provideWatermark({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 被盖住的那段内容。 */
export const XhWatermarkContent = defineComponent({
  name: 'XhWatermarkContent',
  setup(_, { slots }) {
    const ctx = useWatermarkContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})
