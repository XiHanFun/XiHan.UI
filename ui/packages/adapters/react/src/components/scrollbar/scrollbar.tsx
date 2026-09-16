/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 scrollbar 相关实现。

import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ScrollbarAnchor, ScrollbarApi, ScrollbarSchema, ScrollbarType } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import type { ScrollbarSource, ScrollbarTarget } from './use-scrollbar'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ScrollbarProvider, useScrollbarContext } from './context'
import { useScrollbar } from './use-scrollbar'

type ScrollbarProps = ScrollbarSchema['props']

/** 函数式 children 的载荷：该滚动条当前的显隐、几何与位置，以及两个命令式动作。 */
export type ScrollbarRootSlotProps = Pick<
  ScrollbarApi,
  'visible' | 'native' | 'overflow' | 'dragging' | 'scrolling' | 'thumbSize' | 'thumbOffset' | 'scroll' | 'max' | 'scrollTo' | 'scrollBy'
>

export interface XhScrollbarRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir' | 'onDragStart' | 'onDragEnd' | 'onScrollEnd'> {
  /**
   * 真正在滚动的元素，或者取它的函数。它不必是本组件的后代：
   * 表格的滚动盒、虚拟滚动的视口、任意 overflow:auto 的 div 均可。
   */
  scrollable?: ScrollbarTarget
  /** 滚动容器的 id。未提供 scrollable 时按它查询节点；focusable 时它同时写到滑块的 aria-controls 上。 */
  controls?: string
  orientation?: Orientation
  type?: ScrollbarType
  hideDelay?: number
  minThumbSize?: number
  step?: number
  size?: Size
  /** 根节点贴在壳边（shell，默认）还是贴在滚动层自己的盒子上（layer）；layer 要求壳是滚动层的定位祖先。 */
  anchor?: ScrollbarAnchor
  disabled?: boolean
  /** 滑块进入 Tab 序列并报告 role=scrollbar；默认不进入，滚动仍归滚动容器自身。 */
  focusable?: boolean
  /** 横竖两条同时存在时在末端让出交叉口一格。 */
  gutter?: boolean
  /** 触屏（粗指针）上也显示；默认交给原生滚动，整条不绘制。 */
  forceVisible?: boolean
  /** 文字方向，默认 ltr。 */
  dir?: Direction
  translations?: ScrollbarProps['translations']
  onScrollStart?: ScrollbarProps['onScrollStart']
  onScrollEnd?: ScrollbarProps['onScrollEnd']
  onDragStart?: ScrollbarProps['onDragStart']
  onDragEnd?: ScrollbarProps['onDragEnd']
  children?: SlotChildren<ScrollbarRootSlotProps>
}

export function XhScrollbarRoot({
  scrollable,
  controls,
  orientation,
  type,
  hideDelay,
  minThumbSize,
  step,
  size,
  anchor,
  disabled,
  focusable,
  gutter,
  forceVisible,
  dir,
  translations,
  onScrollStart,
  onScrollEnd,
  onDragStart,
  onDragEnd,
  children,
  ...rest
}: XhScrollbarRootProps): ReactNode {
  const ctx = useScrollbar(withXhConfig('scrollbar', {
    scrollable,
    controls,
    orientation,
    type,
    hideDelay,
    minThumbSize,
    step,
    size,
    anchor,
    disabled,
    focusable,
    gutter,
    forceVisible,
    dir,
    translations,
    onScrollStart,
    onScrollEnd,
    onDragStart,
    onDragEnd,
  }) as ScrollbarSource)
  const api = ctx.api

  return (
    <ScrollbarProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          visible: api.visible,
          native: api.native,
          overflow: api.overflow,
          dragging: api.dragging,
          scrolling: api.scrolling,
          thumbSize: api.thumbSize,
          thumbOffset: api.thumbOffset,
          scroll: api.scroll,
          max: api.max,
          scrollTo: api.scrollTo,
          scrollBy: api.scrollBy,
        })}
      </div>
    </ScrollbarProvider>
  )
}

XhScrollbarRoot.xhEvents = ['scroll-start', 'scroll-end', 'drag-start', 'drag-end'] as const

export interface XhScrollbarTrackProps extends ComponentPropsWithRef<'div'> {}

/** 轨道节点交给状态机，长度在按下滑块时现测。 */
export function XhScrollbarTrack({ children, ...rest }: XhScrollbarTrackProps): ReactNode {
  const ctx = useScrollbarContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getTrackProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: ctx.trackRef },
      )}
    >
      {children}
    </div>
  )
}

export interface XhScrollbarThumbProps extends ComponentPropsWithRef<'div'> {}

export function XhScrollbarThumb({ children, ...rest }: XhScrollbarThumbProps): ReactNode {
  const ctx = useScrollbarContext()
  return (
    <div {...mergeReactProps(ctx.api.getThumbProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhScrollbarCornerProps extends ComponentPropsWithRef<'div'> {}

/** 交叉口补丁：写在其中一条的根中，贴在它末端之外的一格，跟随该条显隐。 */
export function XhScrollbarCorner({ children, ...rest }: XhScrollbarCornerProps): ReactNode {
  const ctx = useScrollbarContext()
  return (
    <div {...mergeReactProps(ctx.api.getCornerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
