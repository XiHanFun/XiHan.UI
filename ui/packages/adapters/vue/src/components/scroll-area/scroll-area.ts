import type { ScrollAreaApi, ScrollAreaOrientation, ScrollAreaProps, ScrollAreaScrollbarProps, ScrollbarType } from '@xihan-ui/headless'
import type { Direction, Orientation, Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import {
  provideScrollArea,
  provideScrollAreaScrollbar,
  useScrollAreaContext,
  useScrollAreaScrollbarContext,
} from './context'
import { useScrollArea } from './use-scroll-area'

/** 默认插槽的载荷：两条轴的滚动条状态、正被拖动的那条轴，以及右下角补丁该不该显形。 */
export type ScrollAreaRootSlotProps = Pick<ScrollAreaApi, 'vertical' | 'horizontal' | 'draggingAxis' | 'cornerVisible'>

export const XhScrollAreaRoot = defineComponent({
  name: 'XhScrollAreaRoot',
  // 缺省值由 scrollbar 的机器与 connect 给出，这里一律 default: undefined
  props: {
    type: { type: String as PropType<ScrollbarType>, default: undefined },
    hideDelay: { type: Number, default: undefined },
    orientation: { type: String as PropType<ScrollAreaOrientation>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    /** 触屏（粗指针）上也画自绘滚动条；缺省交给原生滚动。 */
    forceVisible: Boolean,
  },
  slots: Object as SlotsType<{
    default?: (props: ScrollAreaRootSlotProps) => VNode[]
  }>,
  // 组件不对外报事件，滚动是原生的，宿主直接在视口上监听
  setup(props, { slots }) {
    const ctx = useScrollArea(withXhConfig('scroll-area', props) as ScrollAreaProps)
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
    // 视口节点交给两台机器，尺寸与滚动量在效应与事件里现量
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

/** 某条轴的滚动条挂载点，同时是那条 scrollbar 的根；里面照 scrollbar 的写法摆轨道、滑块与交叉口。 */
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
      // 根节点交给机器：指针进出它也算「手还在这儿」
      ref: ctx.scrollbarRefs[props.orientation],
    }, slots.default?.())
  },
})

export const XhScrollAreaTrack = defineComponent({
  name: 'XhScrollAreaTrack',
  setup(_, { slots }) {
    const ctx = useScrollAreaContext()
    const { scrollbar } = useScrollAreaScrollbarContext()
    // 轨道节点交给机器，长度在按下滑块时现量
    return () => h('div', {
      ...ctx.api.value.getTrackProps(scrollbar.value) as Record<string, unknown>,
      ref: ctx.trackRefs[scrollbar.value.orientation],
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

/** 交叉口补丁，写在竖条的挂载点里；两条都在场时才显形。 */
export const XhScrollAreaCorner = defineComponent({
  name: 'XhScrollAreaCorner',
  setup(_, { slots }) {
    const ctx = useScrollAreaContext()
    return () => h('div', ctx.api.value.getCornerProps() as Record<string, unknown>, slots.default?.())
  },
})
