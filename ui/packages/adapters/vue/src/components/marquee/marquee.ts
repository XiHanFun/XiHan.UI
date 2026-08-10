import type { MarqueeDirection, MarqueeProps } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { connectMarquee } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { provideMarquee, useMarqueeContext } from './context'

export const XhMarqueeRoot = defineComponent({
  name: 'XhMarqueeRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    direction: { type: String as PropType<MarqueeDirection>, default: undefined },
    speed: { type: Number, default: undefined },
    pauseOnHover: Boolean,
    autoFill: Boolean,
  },
  setup(props, { slots }) {
    const api = computed(() => connectMarquee(props as MarqueeProps, vueNormalize))
    provideMarquee({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 轨道：走的是这一层。默认插槽里的内容按 api.copies 铺若干份，每份包一层壳。
 *
 * 包壳是为了让每份等长：接缝对不对得上，看的是"走完的距离恰好等于一份的长度"这一条。
 * 第一份之后的都是副本，同时标 aria-hidden 与 inert：读屏不念第二遍，Tab 也不会停在副本上——
 * 只标 aria-hidden 而留着可聚焦的副本，焦点会落进一个读屏看不见的地方。
 * 插槽里只剩注释或空白时一份都不铺——白铺一份只会让轨道多出一段空白在那儿转。
 */
export const XhMarqueeContent = defineComponent({
  name: 'XhMarqueeContent',
  setup(_, { slots }) {
    const ctx = useMarqueeContext()
    return () => {
      const copies: VNode[] = []
      if (slotPaints(slots.default?.())) {
        for (let i = 0; i < ctx.api.value.copies; i++) {
          const copy = i > 0
          copies.push(h(
            'div',
            {
              'data-xh-copy': String(i),
              'aria-hidden': copy ? 'true' : undefined,
              'inert': copy ? true : undefined,
            },
            slots.default?.(),
          ))
        }
      }
      return h('div', ctx.api.value.getContentProps() as Record<string, unknown>, copies)
    }
  },
})
