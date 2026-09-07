import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ScrollbarApi, ScrollbarSchema, ScrollbarType } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import type { ScrollbarSource, ScrollbarTarget } from './use-scrollbar'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ScrollbarProvider, useScrollbarContext } from './context'
import { useScrollbar } from './use-scrollbar'

type ScrollbarProps = ScrollbarSchema['props']

/** 函数式 children 的载荷：这一条此刻的显隐、几何与位置，以及两个命令式动作。 */
export type ScrollbarRootSlotProps = Pick<
  ScrollbarApi,
  'visible' | 'native' | 'overflow' | 'dragging' | 'scrolling' | 'thumbSize' | 'thumbOffset' | 'scroll' | 'max' | 'scrollTo' | 'scrollBy'
>

export interface XhScrollbarRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir' | 'onDragStart' | 'onDragEnd' | 'onScrollEnd'> {
  /**
   * 真正在滚的那个元素，或者取它的函数。它不必是本组件的后代——
   * 表格的滚动盒、虚拟滚动的视口、随手一个 overflow:auto 的 div 都行。
   */
  scrollable?: ScrollbarTarget
  /** 滚动容器的 id。没给 scrollable 时按它去查节点；focusable 时它同时落到滑块的 aria-controls 上。 */
  controls?: string
  orientation?: Orientation
  type?: ScrollbarType
  hideDelay?: number
  minThumbSize?: number
  step?: number
  size?: Size
  disabled?: boolean
  /** 滑块进 Tab 序并报 role=scrollbar；缺省不进，滚动仍归滚动容器自己。 */
  focusable?: boolean
  /** 横竖两条同时摆着时在末端让出交叉口那一格。 */
  gutter?: boolean
  /** 触屏（粗指针）上也显形；缺省交给原生滚动，整条不画。 */
  forceVisible?: boolean
  /** 文字方向，缺省 ltr。 */
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

/** 轨道节点交给机器，长度在按下滑块时现量。 */
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

/** 交叉口补丁：写在其中一条的根里，贴在它末端之外那一格，跟着这一条显隐。 */
export function XhScrollbarCorner({ children, ...rest }: XhScrollbarCornerProps): ReactNode {
  const ctx = useScrollbarContext()
  return (
    <div {...mergeReactProps(ctx.api.getCornerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
