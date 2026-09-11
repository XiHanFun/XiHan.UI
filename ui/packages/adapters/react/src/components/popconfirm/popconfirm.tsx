import type { Placement, Size } from '@xihan-ui/core'
import type { PopconfirmApi, PopconfirmNotifiers, PopconfirmOverlayProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { PopconfirmProvider, usePopconfirmContext } from './context'
import { usePopconfirm } from './use-popconfirm'

/** 函数式 children 的载荷：开合、确认事务状态与三个动作。 */
export type PopconfirmRootSlotProps = Pick<
  PopconfirmApi,
  'open' | 'pending' | 'actionError' | 'setOpen' | 'confirm' | 'cancel'
>

/** 根上自有的那些取值；onCancel 与原生的同名事件含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onCancel'>

export interface XhPopconfirmRootProps extends RootElementProps {
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  size?: Size
  onOpenChange?: PopconfirmNotifiers['onOpenChange']
  /**
   * 点了确认。返回 thenable 即挂起确认门：浮层等它兑现才收起、确认按钮转圈且再点无效，
   * 拒绝则留在原地并经 onConfirmError 报告。同步返回照旧立即收起。
   */
  onConfirm?: PopconfirmNotifiers['onConfirm']
  /** 确认动作失败；details.cause 保留同步抛出或 thenable 拒绝时的原始原因。 */
  onConfirmError?: PopconfirmNotifiers['onConfirmError']
  /** 点了取消，随后浮层收起；Escape 与层外交互只发 onOpenChange，不发这条。 */
  onCancel?: PopconfirmNotifiers['onCancel']
  children?: SlotChildren<PopconfirmRootSlotProps>
}

export function XhPopconfirmRoot({
  open,
  defaultOpen,
  placement,
  offset,
  closeOnEscape,
  closeOnInteractOutside,
  size,
  onOpenChange,
  onConfirm,
  onConfirmError,
  onCancel,
  children,
  ...rest
}: XhPopconfirmRootProps): ReactNode {
  const notify: PopconfirmNotifiers = { onOpenChange, onConfirm, onConfirmError, onCancel }
  const ctx = usePopconfirm({
    open,
    defaultOpen,
    placement,
    offset,
    closeOnEscape,
    closeOnInteractOutside,
    size,
  } as PopconfirmOverlayProps, notify)
  return (
    <PopconfirmProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          open: ctx.api.open,
          pending: ctx.api.pending,
          actionError: ctx.api.actionError,
          setOpen: ctx.api.setOpen,
          confirm: ctx.api.confirm,
          cancel: ctx.api.cancel,
        })}
      </div>
    </PopconfirmProvider>
  )
}

XhPopconfirmRoot.xhEvents = ['open-change', 'confirm-error'] as const

export interface XhPopconfirmTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}
export function XhPopconfirmTrigger({ children, asChild, ...rest }: XhPopconfirmTriggerProps): ReactNode {
  const ctx = usePopconfirmContext()
  const props = mergePartProps(
    mergeReactProps(
      ctx.api.getTriggerProps() as Record<string, unknown>,
      { ref: (el: HTMLElement | null) => { ctx.triggerRef.current = el } },
    ),
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'popconfirm', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhPopconfirmPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhPopconfirmPositioner({ children, container, ...rest }: XhPopconfirmPositionerProps): ReactNode {
  const ctx = usePopconfirmContext()
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef}>
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

export interface XhPopconfirmContentProps extends ComponentPropsWithRef<'div'> {}
export function XhPopconfirmContent({ children, ...rest }: XhPopconfirmContentProps): ReactNode {
  const ctx = usePopconfirmContext()
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

export interface XhPopconfirmTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhPopconfirmTitle({ children, ...rest }: XhPopconfirmTitleProps): ReactNode {
  const ctx = usePopconfirmContext()
  return <h2 {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</h2>
}

export interface XhPopconfirmDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhPopconfirmDescription({ children, ...rest }: XhPopconfirmDescriptionProps): ReactNode {
  const ctx = usePopconfirmContext()
  return <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhPopconfirmConfirmTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhPopconfirmConfirmTrigger({ children, ...rest }: XhPopconfirmConfirmTriggerProps): ReactNode {
  const ctx = usePopconfirmContext()
  return <button {...mergeReactProps(ctx.api.getConfirmTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhPopconfirmCancelTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhPopconfirmCancelTrigger({ children, ...rest }: XhPopconfirmCancelTriggerProps): ReactNode {
  const ctx = usePopconfirmContext()
  return <button {...mergeReactProps(ctx.api.getCancelTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhPopconfirmArrowProps extends ComponentPropsWithRef<'div'> {}
export function XhPopconfirmArrow({ children, ...rest }: XhPopconfirmArrowProps): ReactNode {
  const ctx = usePopconfirmContext()
  return <div {...mergeReactProps(ctx.api.getArrowProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
