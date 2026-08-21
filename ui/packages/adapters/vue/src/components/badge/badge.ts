import type { BadgeProps, BadgeVariant } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { connectBadge } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhBadge = defineComponent({
  name: 'XhBadge',
  props: {
    variant: String as PropType<BadgeVariant>,
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
    /** 计数：给了它徽标就自己出数字，超过 max 写成「max+」。 */
    count: { type: Number, default: undefined },
    /** 计数上限，默认 99。 */
    max: { type: Number, default: undefined },
    /** 计数为 0 时是否照样显示，默认不显示。 */
    showZero: { type: Boolean, default: undefined },
    /** 只出一个点，不出数字。 */
    dot: { type: Boolean, default: undefined },
    /** 读屏怎么念这枚徽标，例如「3 条未读」。 */
    label: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('badge', props)
    return () => {
      const api = connectBadge(configured as BadgeProps, vueNormalize)
      // 插槽有内容就以它为准，没有才用算好的计数文本
      return h('span', api.getRootProps() as Record<string, unknown>, slots.default?.() ?? api.text)
    }
  },
})
