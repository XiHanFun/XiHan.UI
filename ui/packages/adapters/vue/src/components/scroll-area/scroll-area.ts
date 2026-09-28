/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 scroll area 相关实现。

import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ScrollAreaApi, ScrollAreaOrientation, ScrollAreaProps, ScrollAreaScrollbarProps, ScrollAreaScrollDetails, ScrollAreaScrollToOptions, ScrollAreaVariant, ScrollbarType } from '@xihan-ui/headless'
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

/** 默认插槽的载荷：两条轴的滚动条状态、正被拖动的轴、右下角补丁是否应当显示，以及滚动视口的命令。 */
export type ScrollAreaRootSlotProps = Pick<ScrollAreaApi, 'vertical' | 'horizontal' | 'draggingAxis' | 'cornerVisible' | 'scrollTo'>

export const XhScrollAreaRoot = defineComponent({
  name: 'XhScrollAreaRoot',
  // 缺省值由 scrollbar 的机器与 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    type: { type: String as PropType<ScrollbarType> },
    hideDelay: { type: Number },
    orientation: { type: String as PropType<ScrollAreaOrientation> },
    variant: { type: String as PropType<ScrollAreaVariant> },
    size: { type: String as PropType<Size> },
    dir: { type: String as PropType<Direction> },
    /** 触屏（粗指针）上也绘制自绘滚动条；默认交给原生滚动。 */
    forceVisible: Boolean,
  },
  emits: {
    /** 某条轴的滚动量变了，按轴分别通知。 */
    'scroll-change': (_details: ScrollAreaScrollDetails) => true,
    /** 某条轴滚到了末端，只在跨过末端那一下通知。 */
    'reach-end': (_details: ScrollAreaScrollDetails) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ScrollAreaRootSlotProps) => VNode[]
  }>,
  // 滚动本身是原生的；滚动量变化与到头由两台 scrollbar 机器按轴报出来
  setup(props, { slots, emit, expose }) {
    const source = withXhConfig('scroll-area', props) as ScrollAreaProps
    const ctx = useScrollArea(() => ({
      ...source,
      onScrollChange: details => emit('scroll-change', details),
      onReachEnd: details => emit('reach-end', details),
    }))
    provideScrollArea(ctx)
    const scrollTo = (options: ScrollAreaScrollToOptions): void => ctx.api.value.scrollTo(options)
    expose({ scrollTo })
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      vertical: ctx.api.value.vertical,
      horizontal: ctx.api.value.horizontal,
      draggingAxis: ctx.api.value.draggingAxis,
      cornerVisible: ctx.api.value.cornerVisible,
      scrollTo,
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

/** 某条轴的滚动条挂载点，同时是该 scrollbar 的根；其中按 scrollbar 的写法放置轨道、滑块与交叉口。 */
export const XhScrollAreaScrollbar = defineComponent({
  name: 'XhScrollAreaScrollbar',
  props: {
    /** 该滚动条管理哪条轴。 */
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

/** 交叉口补丁，写在竖条的挂载点中；两条都在场时才显示。 */
export const XhScrollAreaCorner = defineComponent({
  name: 'XhScrollAreaCorner',
  setup(_, { slots }) {
    const ctx = useScrollAreaContext()
    return () => h('div', ctx.api.value.getCornerProps() as Record<string, unknown>, slots.default?.())
  },
})
