import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { TooltipApi, TooltipSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { TooltipProvider, useTooltipContext } from './context'
import { useTooltip } from './use-tooltip'

type TooltipProps = TooltipSchema['props']

/** 函数式 children 的载荷：展开状态与开合方法。 */
export interface TooltipRootSlotProps extends Pick<TooltipApi, 'open' | 'setOpen'> {}

export interface XhTooltipRootProps {
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
  dir?: Direction
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
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
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhTooltipPositioner({ children, container, ...rest }: XhTooltipPositionerProps): ReactNode {
  const ctx = useTooltipContext()
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
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
