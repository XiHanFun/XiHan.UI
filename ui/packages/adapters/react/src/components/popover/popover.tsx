import type { Direction, Placement, Size } from '@xihan-ui/core'
import type { PopoverApi, PopoverSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { PopoverProvider, usePopoverContext } from './context'
import { usePopover } from './use-popover'

type PopoverProps = PopoverSchema['props']

/** 函数式 children 的载荷：浮层的展开态与开合命令。 */
export interface PopoverRootSlotProps extends Pick<PopoverApi, 'open' | 'setOpen'> {}

export interface XhPopoverRootProps {
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
  dir?: Direction
  modal?: boolean
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  translations?: PopoverProps['translations']
  size?: Size
  onOpenChange?: PopoverProps['onOpenChange']
  children?: SlotChildren<PopoverRootSlotProps>
}

export function XhPopoverRoot({ children, ...props }: XhPopoverRootProps): ReactNode {
  const ctx = usePopover(withXhConfig('popover', props) as PopoverProps)
  return (
    <PopoverProvider value={ctx}>
      {renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })}
    </PopoverProvider>
  )
}

XhPopoverRoot.xhEvents = ['open-change'] as const

export interface XhPopoverTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhPopoverTrigger({ children, asChild, ...rest }: XhPopoverTriggerProps): ReactNode {
  const ctx = usePopoverContext()
  const props = mergeReactProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
    { ref: (el: HTMLElement | null) => { ctx.triggerRef.current = el } },
  )
  return renderAsChild(asChild, children, props, 'popover', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhPopoverPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhPopoverPositioner({ children, container, ...rest }: XhPopoverPositionerProps): ReactNode {
  const ctx = usePopoverContext()
  // 面板内容的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
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
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhPopoverContentProps extends ComponentPropsWithRef<'div'> {}
export function XhPopoverContent({ children, ...rest }: XhPopoverContentProps): ReactNode {
  const ctx = usePopoverContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhPopoverTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhPopoverTitle({ children, ...rest }: XhPopoverTitleProps): ReactNode {
  const ctx = usePopoverContext()
  return <h2 {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</h2>
}

export interface XhPopoverDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhPopoverDescription({ children, ...rest }: XhPopoverDescriptionProps): ReactNode {
  const ctx = usePopoverContext()
  return <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhPopoverCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhPopoverCloseTrigger({ children, ...rest }: XhPopoverCloseTriggerProps): ReactNode {
  const ctx = usePopoverContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhPopoverArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhPopoverArrow({ children, ...rest }: XhPopoverArrowProps): ReactNode {
  const ctx = usePopoverContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
