import type { Direction, Orientation } from '@xihan-ui/core'
import type { ScrollAreaOrientation, ScrollAreaSchema, ScrollAreaScrollbarProps, ScrollAreaType } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import {
  provideScrollArea,
  provideScrollAreaScrollbar,
  useScrollAreaContext,
  useScrollAreaScrollbarContext,
} from './context'
import { useScrollArea } from './use-scroll-area'

type ScrollAreaProps = ScrollAreaSchema['props']

export const XhScrollAreaRoot = defineComponent({
  name: 'XhScrollAreaRoot',
  // 缺省值的唯一事实源在机器与 connect —— 凡是那边有兜底的一律 default: undefined
  props: {
    type: { type: String as PropType<ScrollAreaType>, default: undefined },
    scrollHideDelay: { type: Number, default: undefined },
    orientation: { type: String as PropType<ScrollAreaOrientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // 组件不对外报事件：滚动是原生的，宿主要听滚动直接在视口上监听即可
  setup(props, { slots }) {
    const ctx = useScrollArea(props as ScrollAreaProps)
    provideScrollArea(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      vertical: ctx.api.value.vertical,
      horizontal: ctx.api.value.horizontal,
      draggingAxis: ctx.api.value.draggingAxis,
      cornerVisible: ctx.api.value.cornerVisible,
    }))
  },
})

export const XhScrollAreaViewport = defineComponent({
  name: 'XhScrollAreaViewport',
  setup(_, { slots }) {
    const ctx = useScrollAreaContext()
    // 视口节点交给机器：尺寸与滚动量只在效应/事件那一刻现量，连接期一律不碰 DOM
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: ctx.viewportRef,
    }, slots.default?.())
  },
})

export const XhScrollAreaContent = defineComponent({
  name: 'XhScrollAreaContent',
  setup(_, { slots }) {
    const ctx = useScrollAreaContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: ctx.contentRef,
    }, slots.default?.())
  },
})

export const XhScrollAreaScrollbar = defineComponent({
  name: 'XhScrollAreaScrollbar',
  props: {
    /** 这条滚动条管哪条轴。与 WC 侧作者写的 orientation 属性是同一份声明。 */
    orientation: { type: String as PropType<Orientation>, default: 'vertical' },
  },
  setup(props, { slots }) {
    const ctx = useScrollAreaContext()
    const scrollbar = computed<ScrollAreaScrollbarProps>(() => ({ orientation: props.orientation }))
    provideScrollAreaScrollbar({ scrollbar })
    return () => h('div', {
      ...ctx.api.value.getScrollbarProps(scrollbar.value) as Record<string, unknown>,
      // 轨道长度按下滑块那一刻才量，所以节点要留给机器
      ref: ctx.scrollbarRefs[props.orientation],
    }, slots.default?.())
  },
})

export const XhScrollAreaThumb = defineComponent({
  name: 'XhScrollAreaThumb',
  setup(_, { slots }) {
    const ctx = useScrollAreaContext()
    const { scrollbar } = useScrollAreaScrollbarContext()
    return () => h('div', ctx.api.value.getThumbProps(scrollbar.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhScrollAreaCorner = defineComponent({
  name: 'XhScrollAreaCorner',
  setup(_, { slots }) {
    const ctx = useScrollAreaContext()
    return () => h('div', ctx.api.value.getCornerProps() as Record<string, unknown>, slots.default?.())
  },
})
