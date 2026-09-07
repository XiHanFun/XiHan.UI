import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ScrollAreaApi, ScrollAreaOrientation, ScrollAreaProps, ScrollAreaVariant, ScrollbarType } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ScrollAreaProvider, ScrollAreaScrollbarProvider, useScrollAreaContext, useScrollAreaScrollbarContext } from './context'
import { useScrollArea } from './use-scroll-area'

/** 函数式 children 的载荷：两条轴的滚动条状态、正被拖动的那条轴，以及右下角补丁该不该显形。 */
export type ScrollAreaRootSlotProps = Pick<ScrollAreaApi, 'vertical' | 'horizontal' | 'draggingAxis' | 'cornerVisible'>

export interface XhScrollAreaRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'> {
  type?: ScrollbarType
  hideDelay?: number
  orientation?: ScrollAreaOrientation
  variant?: ScrollAreaVariant
  size?: Size
  /** 文字方向，缺省 ltr。 */
  dir?: Direction
  /** 触屏（粗指针）上也画自绘滚动条；缺省交给原生滚动。 */
  forceVisible?: boolean
  children?: SlotChildren<ScrollAreaRootSlotProps>
}

// 组件不对外报事件，滚动是原生的，宿主直接在视口上监听
export function XhScrollAreaRoot({
  type,
  hideDelay,
  orientation,
  variant,
  size,
  dir,
  forceVisible,
  children,
  ...rest
}: XhScrollAreaRootProps): ReactNode {
  const ctx = useScrollArea(withXhConfig('scroll-area', {
    type,
    hideDelay,
    orientation,
    variant,
    size,
    dir,
    forceVisible,
  }) as ScrollAreaProps)
  const api = ctx.api

  return (
    <ScrollAreaProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          vertical: api.vertical,
          horizontal: api.horizontal,
          draggingAxis: api.draggingAxis,
          cornerVisible: api.cornerVisible,
        })}
      </div>
    </ScrollAreaProvider>
  )
}

export interface XhScrollAreaViewportProps extends ComponentPropsWithRef<'div'> {}

/** 视口节点交给两台机器，尺寸与滚动量在效应与事件里现量。 */
export function XhScrollAreaViewport({ children, ...rest }: XhScrollAreaViewportProps): ReactNode {
  const ctx = useScrollAreaContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getViewportProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: ctx.viewportRef },
      )}
    >
      {children}
    </div>
  )
}

export interface XhScrollAreaContentProps extends ComponentPropsWithRef<'div'> {}

export function XhScrollAreaContent({ children, ...rest }: XhScrollAreaContentProps): ReactNode {
  const ctx = useScrollAreaContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: ctx.contentRef },
      )}
    >
      {children}
    </div>
  )
}

export interface XhScrollAreaScrollbarProps extends ComponentPropsWithRef<'div'> {
  /** 这条滚动条管哪条轴。 */
  orientation?: Orientation
}

/** 某条轴的滚动条挂载点，同时是那条 scrollbar 的根；里面照 scrollbar 的写法摆轨道、滑块与交叉口。 */
export function XhScrollAreaScrollbar({ orientation = 'vertical', children, ...rest }: XhScrollAreaScrollbarProps): ReactNode {
  const ctx = useScrollAreaContext()
  return (
    <ScrollAreaScrollbarProvider value={orientation}>
      <div
        {...mergeReactProps(
          ctx.api.getScrollbarProps({ orientation }) as Record<string, unknown>,
          rest as Record<string, unknown>,
          // 根节点交给机器：指针进出它也算「手还在这儿」
          { ref: (el: HTMLDivElement | null) => { ctx.setScrollbarEl(orientation, el) } },
        )}
      >
        {children}
      </div>
    </ScrollAreaScrollbarProvider>
  )
}

export interface XhScrollAreaTrackProps extends ComponentPropsWithRef<'div'> {}

/** 轨道节点交给机器，长度在按下滑块时现量。 */
export function XhScrollAreaTrack({ children, ...rest }: XhScrollAreaTrackProps): ReactNode {
  const ctx = useScrollAreaContext()
  const orientation = useScrollAreaScrollbarContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getTrackProps({ orientation }) as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.setTrackEl(orientation, el) } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhScrollAreaThumbProps extends ComponentPropsWithRef<'div'> {}

export function XhScrollAreaThumb({ children, ...rest }: XhScrollAreaThumbProps): ReactNode {
  const ctx = useScrollAreaContext()
  const orientation = useScrollAreaScrollbarContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getThumbProps({ orientation }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}

export interface XhScrollAreaCornerProps extends ComponentPropsWithRef<'div'> {}

/** 交叉口补丁，写在竖条的挂载点里；两条都在场时才显形。 */
export function XhScrollAreaCorner({ children, ...rest }: XhScrollAreaCornerProps): ReactNode {
  const ctx = useScrollAreaContext()
  return (
    <div {...mergeReactProps(ctx.api.getCornerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
