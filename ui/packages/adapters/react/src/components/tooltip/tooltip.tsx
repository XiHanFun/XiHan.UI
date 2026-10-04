/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tooltip 相关实现。

import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { TooltipApi, TooltipSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { createTooltipGroup } from '@xihan-ui/headless'
import { useRef, useState } from 'react'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { TooltipGroupContext, TooltipProvider, useTooltipContext } from './context'
import { useTooltip } from './use-tooltip'

type TooltipProps = TooltipSchema['props']

/** 函数式 children 的载荷：展开状态与开合方法。 */
export interface TooltipRootSlotProps extends Pick<TooltipApi, 'open' | 'setOpen'> {}

export interface XhTooltipProviderProps {
  /** 组内提示悬停进入到展开的缺省等待毫秒；提示自己写了就以提示为准。 */
  openDelay?: number
  /** 组内提示悬停移出到收起的缺省等待毫秒。 */
  closeDelay?: number
  /** 组内提示的缺省接替窗口毫秒；0 表示组内不接替。 */
  skipDelayDuration?: number
  children?: ReactNode
}

/**
 * 提示组：子树里的提示归同一组，共用接替窗口、同一时刻只开一个，没写延时的取这里给的缺省。
 * 本身不渲染节点，也不改动子节点的排布。
 */
export function XhTooltipProvider({ openDelay, closeDelay, skipDelayDuration, children }: XhTooltipProviderProps): ReactNode {
  // 组在 Provider 的一生里只建一次；缺省值每次现读，改 props 下一次开合即生效
  const latest = useRef({ openDelay, closeDelay, skipDelayDuration })
  latest.current = { openDelay, closeDelay, skipDelayDuration }
  const [group] = useState(() => createTooltipGroup(() => latest.current))
  return <TooltipGroupContext value={group}>{children}</TooltipGroupContext>
}

export interface XhTooltipRootProps {
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  openDelay?: number
  closeDelay?: number
  /** 跳过等待的窗口毫秒，默认 300：另一个提示开着或刚收起时，指向这一个直接接替、不播进场；0 不参与。 */
  skipDelayDuration?: number
  disabled?: boolean
  /** 跟随鼠标：由指针打开的提示锚在指针落点上并随移动更新；触屏与聚焦打开时锚回 trigger。 */
  followCursor?: boolean
  tone?: Tone
  size?: Size
  onOpenChange?: TooltipProps['onOpenChange']
  children?: SlotChildren<TooltipRootSlotProps>
}

export function XhTooltipRoot({ children, ...props }: XhTooltipRootProps): ReactNode {
  const ctx = useTooltip(props as TooltipProps)
  return (
    <TooltipProvider value={ctx}>
      {renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })}
    </TooltipProvider>
  )
}

XhTooltipRoot.xhEvents = ['open-change'] as const

export interface XhTooltipTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhTooltipTrigger({ children, asChild, ...rest }: XhTooltipTriggerProps): ReactNode {
  const ctx = useTooltipContext()
  // 指针进出、按下与聚焦装成原生监听器：这几个事件不冒泡，委派在根容器上的合成事件收不到
  const bind = useNativeEvents(ctx.api.getTriggerProps() as Record<string, unknown>)
  const props = mergePartProps(
    mergeReactProps(
      bind.attrs,
      { ref: bind.ref },
      { ref: (el: HTMLElement | null) => { ctx.triggerRef.current = el } },
    ),
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'tooltip', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhTooltipPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhTooltipPositioner({ children, container, ...rest }: XhTooltipPositionerProps): ReactNode {
  const ctx = useTooltipContext()
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef} present={ctx.rendered}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
      </div>
    </XhPortal>
  )
}

export interface XhTooltipContentProps extends ComponentPropsWithRef<'div'> {}
export function XhTooltipContent({ children, ...rest }: XhTooltipContentProps): ReactNode {
  const ctx = useTooltipContext()
  // 指针进出装成原生监听器，与 trigger 同一条理由：移入浮层要能撤销收起等待
  const bind = useNativeEvents(ctx.api.getContentProps() as Record<string, unknown>)
  return (
    <div
      {...mergeReactProps(
        bind.attrs,
        rest as Record<string, unknown>,
        { ref: bind.ref },
        {
          // 收起跟着退场闸门走：皮肤给 content 声明了 display 来盖掉 UA 的 [hidden]{display:none}
          // （盒子得先在，退场才播得出来），所以真正的收起落成内联 display
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhTooltipArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhTooltipArrow({ children, ...rest }: XhTooltipArrowProps): ReactNode {
  const ctx = useTooltipContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
