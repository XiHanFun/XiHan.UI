import type { OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { DialogApi, DialogSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { DialogProvider, useDialogContext } from './context'
import { useDialog } from './use-dialog'

type DialogProps = DialogSchema['props']

/** 函数式 children 的载荷：展开态与改展开的动作。 */
export interface DialogRootSlotProps extends Pick<DialogApi, 'open' | 'setOpen'> {}

export interface XhDialogRootProps {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
  role?: 'dialog' | 'alertdialog'
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  restoreFocus?: boolean
  initialFocus?: string
  size?: Size
  variant?: OverlayBackdropVariant
  translations?: DialogProps['translations']
  onOpenChange?: DialogProps['onOpenChange']
  onExitComplete?: DialogProps['onExitComplete']
  children?: SlotChildren<DialogRootSlotProps>
}

export function XhDialogRoot({ children, ...props }: XhDialogRootProps): ReactNode {
  const ctx = useDialog(withXhConfig('dialog', props) as DialogProps)
  return (
    <DialogProvider value={ctx}>
      {renderSlot(children, { open: ctx.api.open, setOpen: ctx.api.setOpen })}
    </DialogProvider>
  )
}

XhDialogRoot.xhEvents = ['open-change', 'exit-complete'] as const

export interface XhDialogTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhDialogTrigger({ children, asChild, ...rest }: XhDialogTriggerProps): ReactNode {
  const ctx = useDialogContext()
  const props = mergePartProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'dialog', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhDialogContentProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}

export function XhDialogContent({ children, container, ...rest }: XhDialogContentProps): ReactNode {
  const ctx = useDialogContext()
  if (!ctx.rendered)
    return null
  const api = ctx.api
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
      {api.open || ctx.rendered
        ? (
            <div
              {...api.getBackdropProps() as Record<string, unknown>}
              ref={(el: HTMLDivElement | null) => {
                ctx.backdropRef.current = el
              }}
            />
          )
        : null}
      <div {...api.getPositionerProps() as Record<string, unknown>}>
        <div
          {...mergeReactProps(api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}
          hidden={!ctx.rendered || undefined}
          ref={(el: HTMLDivElement | null) => {
            ctx.contentRef.current = el
          }}
        >
          {children}
        </div>
      </div>
    </XhPortal>
  )
}

export interface XhDialogHeaderProps extends ComponentPropsWithRef<'header'> {}
export function XhDialogHeader({ children, ...rest }: XhDialogHeaderProps): ReactNode {
  const ctx = useDialogContext()
  return <header {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</header>
}

export interface XhDialogIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 语气徽记：不给内容就由皮肤按节点上的 data-tone 画兜底字形，塞了节点即整枚换掉。 */
export function XhDialogIndicator({ children, ...rest }: XhDialogIndicatorProps): ReactNode {
  const ctx = useDialogContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhDialogTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhDialogTitle({ children, ...rest }: XhDialogTitleProps): ReactNode {
  const ctx = useDialogContext()
  return <h2 {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</h2>
}

export interface XhDialogDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhDialogDescription({ children, ...rest }: XhDialogDescriptionProps): ReactNode {
  const ctx = useDialogContext()
  return <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhDialogBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhDialogBody({ children, ...rest }: XhDialogBodyProps): ReactNode {
  const ctx = useDialogContext()
  return <div {...mergeReactProps(ctx.api.getBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDialogFooterProps extends ComponentPropsWithRef<'footer'> {}
export function XhDialogFooter({ children, ...rest }: XhDialogFooterProps): ReactNode {
  const ctx = useDialogContext()
  return <footer {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</footer>
}

export interface XhDialogCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhDialogCloseTrigger({ children, ...rest }: XhDialogCloseTriggerProps): ReactNode {
  const ctx = useDialogContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}
