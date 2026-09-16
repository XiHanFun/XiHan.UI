/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 scrollbar 相关实现。

import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ScrollbarAnchor, ScrollbarApi, ScrollbarSchema, ScrollbarType } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { ScrollbarSource, ScrollbarTarget } from './use-scrollbar'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideScrollbar, useScrollbarContext } from './context'
import { useScrollbar } from './use-scrollbar'

type ScrollbarProps = ScrollbarSchema['props']

/** 默认插槽的载荷：该滚动条当前的显隐、几何与位置，以及两个命令式动作。 */
export type ScrollbarRootSlotProps = Pick<
  ScrollbarApi,
  'visible' | 'native' | 'overflow' | 'dragging' | 'scrolling' | 'thumbSize' | 'thumbOffset' | 'scroll' | 'max' | 'scrollTo' | 'scrollBy'
>

export const XhScrollbarRoot = defineComponent({
  name: 'XhScrollbarRoot',
  // 缺省值由机器与 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /**
     * 真正在滚动的元素，或者取它的函数。它不必是本组件的后代：
     * 表格的滚动盒、虚拟滚动的视口、任意 overflow:auto 的 div 均可。
     */
    scrollable: { type: [Object, Function] as PropType<ScrollbarTarget> },
    /**
     * 滚动容器的 id。未提供 scrollable 时按它查询节点；focusable 时它同时写到滑块的 aria-controls 上。
     */
    controls: { type: String },
    orientation: { type: String as PropType<Orientation> },
    type: { type: String as PropType<ScrollbarType> },
    hideDelay: { type: Number },
    minThumbSize: { type: Number },
    step: { type: Number },
    size: { type: String as PropType<Size> },
    /** 根节点贴在壳边（shell，默认）还是贴在滚动层自己的盒子上（layer）；layer 要求壳是滚动层的定位祖先。 */
    anchor: { type: String as PropType<ScrollbarAnchor> },
    disabled: Boolean,
    /** 滑块进入 Tab 序列并报告 role=scrollbar；默认不进入，滚动仍归滚动容器自身。 */
    focusable: Boolean,
    /** 横竖两条同时存在时在末端让出交叉口一格，交叉口由 XhScrollbarCorner 补齐。 */
    gutter: Boolean,
    /** 触屏（粗指针）上也显示；默认交给原生滚动，整条不绘制。 */
    forceVisible: Boolean,
    dir: { type: String as PropType<Direction> },
    translations: { type: Object as PropType<ScrollbarProps['translations']> },
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

/** 交叉口补丁：写在其中一条的根中，贴在它末端之外的一格，跟随该条显隐。 */
export const XhScrollbarCorner = defineComponent({
  name: 'XhScrollbarCorner',
  setup(_, { slots }) {
    const ctx = useScrollbarContext()
    return () => h('div', ctx.api.value.getCornerProps() as Record<string, unknown>, slots.default?.())
  },
})
