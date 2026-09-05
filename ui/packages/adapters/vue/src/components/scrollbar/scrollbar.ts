import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ScrollbarApi, ScrollbarSchema, ScrollbarType } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { ScrollbarSource, ScrollbarTarget } from './use-scrollbar'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideScrollbar, useScrollbarContext } from './context'
import { useScrollbar } from './use-scrollbar'

type ScrollbarProps = ScrollbarSchema['props']

/** 默认插槽的载荷：这一条此刻的显隐、几何与位置，以及两个命令式动作。 */
export type ScrollbarRootSlotProps = Pick<
  ScrollbarApi,
  'visible' | 'native' | 'overflow' | 'dragging' | 'scrolling' | 'thumbSize' | 'thumbOffset' | 'scroll' | 'max' | 'scrollTo' | 'scrollBy'
>

export const XhScrollbarRoot = defineComponent({
  name: 'XhScrollbarRoot',
  // 缺省值由机器与 connect 给出，这里一律 default: undefined
  props: {
    /**
     * 真正在滚的那个元素，或者取它的函数。它不必是本组件的后代——
     * 表格的滚动盒、虚拟滚动的视口、随手一个 overflow:auto 的 div 都行。
     */
    scrollable: { type: [Object, Function] as PropType<ScrollbarTarget>, default: undefined },
    /**
     * 滚动容器的 id。没给 scrollable 时按它去查节点；focusable 时它同时落到滑块的 aria-controls 上。
     */
    controls: { type: String, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    type: { type: String as PropType<ScrollbarType>, default: undefined },
    hideDelay: { type: Number, default: undefined },
    minThumbSize: { type: Number, default: undefined },
    step: { type: Number, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    disabled: Boolean,
    /** 滑块进 Tab 序并报 role=scrollbar；缺省不进，滚动仍归滚动容器自己。 */
    focusable: Boolean,
    /** 横竖两条同时摆着时在末端让出交叉口那一格，交叉口由 XhScrollbarCorner 补。 */
    gutter: Boolean,
    /** 触屏（粗指针）上也显形；缺省交给原生滚动，整条不画。 */
    forceVisible: Boolean,
    dir: { type: String as PropType<Direction>, default: undefined },
    translations: { type: Object as PropType<ScrollbarProps['translations']>, default: undefined },
  },
  // 四条都是「意图之外的事实」：滚动本身由作者的容器发，这里只报成段与拖拽的起止
  emits: {
    'scroll-start': (_details: PayloadOf<ScrollbarProps, 'onScrollStart'>) => true,
    'scroll-end': (_details: PayloadOf<ScrollbarProps, 'onScrollEnd'>) => true,
    'drag-start': (_details: PayloadOf<ScrollbarProps, 'onDragStart'>) => true,
    'drag-end': (_details: PayloadOf<ScrollbarProps, 'onDragEnd'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ScrollbarRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useScrollbar(withXhConfig('scrollbar', props) as ScrollbarSource, {
      onScrollStart: details => emit('scroll-start', details),
      onScrollEnd: details => emit('scroll-end', details),
      onDragStart: details => emit('drag-start', details),
      onDragEnd: details => emit('drag-end', details),
    })
    provideScrollbar(ctx)

    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default?.({
      visible: ctx.api.value.visible,
      native: ctx.api.value.native,
      overflow: ctx.api.value.overflow,
      dragging: ctx.api.value.dragging,
      scrolling: ctx.api.value.scrolling,
      thumbSize: ctx.api.value.thumbSize,
      thumbOffset: ctx.api.value.thumbOffset,
      scroll: ctx.api.value.scroll,
      max: ctx.api.value.max,
      scrollTo: ctx.api.value.scrollTo,
      scrollBy: ctx.api.value.scrollBy,
    }))
  },
})

export const XhScrollbarTrack = defineComponent({
  name: 'XhScrollbarTrack',
  setup(_, { slots }) {
    const ctx = useScrollbarContext()
    // 轨道节点交给机器，长度在按下滑块时现量
    return () => h('div', {
      ...ctx.api.value.getTrackProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.trackRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhScrollbarThumb = defineComponent({
  name: 'XhScrollbarThumb',
  setup(_, { slots }) {
    const ctx = useScrollbarContext()
    return () => h('div', ctx.api.value.getThumbProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 交叉口补丁：写在其中一条的根里，贴在它末端之外那一格，跟着这一条显隐。 */
export const XhScrollbarCorner = defineComponent({
  name: 'XhScrollbarCorner',
  setup(_, { slots }) {
    const ctx = useScrollbarContext()
    return () => h('div', ctx.api.value.getCornerProps() as Record<string, unknown>, slots.default?.())
  },
})
