import type { Size, Tone } from '@xihan-ui/core'
import type { BadgePlacement, BadgeProps } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import { connectBadge } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideBadge, useBadgeContext } from './context'

const badgeProps = {
  tone: String as PropType<Tone>,
  size: String as PropType<Size>,
  /** 挂在哪个角上，默认 top-end。 */
  placement: String as PropType<BadgePlacement>,
  /** 计数：给了它角标就自己出数字，超过 max 写成「max+」。 */
  count: { type: Number, default: undefined },
  /** 计数上限，默认 99。 */
  max: { type: Number, default: undefined },
  /** 计数为 0 时是否照样显示，默认不显示。 */
  showZero: { type: Boolean, default: undefined },
  /** 只出一个点，不出数字。 */
  dot: { type: Boolean, default: undefined },
  /** 读屏怎么念这枚角标，例如「3 条未读」。 */
  label: { type: String, default: undefined },
} as const

/**
 * 锚点：被标记的那个东西（按钮、头像、标签页）写进默认插槽，角标另起一层贴在它的角上。
 *
 * 角标是挂在别的元素角上的一枚标记，不是可以单独摆的药丸——
 * 行内的状态药丸请用 tag。
 */
export const XhBadgeRoot = defineComponent({
  name: 'XhBadgeRoot',
  props: badgeProps,
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('badge', props)
    const api = computed(() => connectBadge(configured as BadgeProps, vueNormalize))
    provideBadge({ api })
    return () => h('span', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 角标本身，绝对定位在锚点的某个角上。不给内容就用算好的计数文本。 */
export const XhBadgeIndicator = defineComponent({
  name: 'XhBadgeIndicator',
  slots: Object as SlotsType<{ default?: (props: { text: string }) => VNode[] }>,
  setup(_, { slots }) {
    const ctx = useBadgeContext()
    return () => h(
      'span',
      ctx.api.value.getIndicatorProps() as Record<string, unknown>,
      slots.default?.({ text: ctx.api.value.text }) ?? ctx.api.value.text,
    )
  },
})

/**
 * 一步到位的写法：默认插槽放被标记的东西，角标自动跟上。
 *
 * 要往角标里塞自定义内容（比如一枚小图标）时改用 XhBadgeRoot + XhBadgeIndicator。
 */
export const XhBadge = defineComponent({
  name: 'XhBadge',
  props: badgeProps,
  slots: Object as SlotsType<{ default?: () => VNode[] }>,
  setup(props, { slots }) {
    return () => h(XhBadgeRoot, props, () => [slots.default?.(), h(XhBadgeIndicator)])
  },
})
