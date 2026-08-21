import type { ScrollAreaApi, ScrollAreaOrientation, ScrollAreaSchema, ScrollAreaScrollbarProps, ScrollAreaType } from '@xihan-ui/headless'
import type { Direction, Orientation } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import { computed, defineComponent, h } from 'vue'
import {
  provideScrollArea,
  provideScrollAreaScrollbar,
  useScrollAreaContext,
  useScrollAreaScrollbarContext,
} from './context'
import { useScrollArea } from './use-scroll-area'

type ScrollAreaProps = ScrollAreaSchema['props']

/** 默认插槽的载荷：两条轴的滚动条状态、正被拖动的那条轴，以及右下角补丁该不该显形。 */
export type ScrollAreaRootSlotProps = Pick<ScrollAreaApi, 'vertical' | 'horizontal' | 'draggingAxis' | 'cornerVisible'>

export const XhScrollAreaRoot = defineComponent({
  name: 'XhScrollAreaRoot',
  // 缺省值由机器与 connect 给出，这里一律 default: undefined
  props: {
    type: { type: String as PropType<ScrollAreaType>, default: undefined },
    hideDelay: { type: Number, default: undefined },
    orientation: { type: String as PropType<ScrollAreaOrientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: ScrollAreaRootSlotProps) => VNode[]
  }>,
  // 组件不对外报事件，滚动是原生的，宿主直接在视口上监听
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
    // 视口节点交给机器，尺寸与滚动量在效应与事件里现量
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
    /** 这条滚动条管哪条轴。 */
    orientation: { type: String as PropType<Orientation>, default: 'vertical' },
  },
  setup(props, { slots }) {
    const ctx = useScrollAreaContext()
    const scrollbar = computed<ScrollAreaScrollbarProps>(() => ({ orientation: props.orientation }))
    provideScrollAreaScrollbar({ scrollbar })
    return () => h('div', {
      ...ctx.api.value.getScrollbarProps(scrollbar.value) as Record<string, unknown>,
      // 轨道节点交给机器，长度在按下滑块时现量
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
