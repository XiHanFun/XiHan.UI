import type { Tone } from '@xihan-ui/core'
import type { AlertSchema, AlertTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { AlertProvider, useAlertContext } from './context'
import { useAlert } from './use-alert'

type AlertProps = AlertSchema['props']

export interface XhAlertRootProps extends ComponentPropsWithRef<'div'> {
  tone?: Tone
  /** 缺省交给 connect 决定，写 false 才真的关掉。 */
  closable?: boolean
  open?: boolean
  defaultOpen?: boolean
  translations?: Partial<AlertTranslations>
  onOpenChange?: AlertProps['onOpenChange']
  children?: ReactNode
}

export function XhAlertRoot({
  tone,
  closable,
  open,
  defaultOpen,
  translations,
  onOpenChange,
  children,
  ...rest
}: XhAlertRootProps): ReactNode {
  const ctx = useAlert(withXhConfig('alert', {
    tone,
    closable,
    open,
    defaultOpen,
    translations,
    onOpenChange,
  }) as AlertProps)
  return (
    <AlertProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </AlertProvider>
  )
}

XhAlertRoot.xhEvents = ['open-change'] as const

export interface XhAlertIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhAlertIndicator({ children, ...rest }: XhAlertIndicatorProps): ReactNode {
  const ctx = useAlertContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhAlertContentProps extends ComponentPropsWithRef<'div'> {}
/** 文本列：标题与说明摞成一列。不写它时两段文字直接坐在 root 的那一行上。 */
export function XhAlertContent({ children, ...rest }: XhAlertContentProps): ReactNode {
  const ctx = useAlertContext()
  return <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhAlertTitleProps extends ComponentPropsWithRef<'div'> {}
export function XhAlertTitle({ children, ...rest }: XhAlertTitleProps): ReactNode {
  const ctx = useAlertContext()
  return <div {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhAlertDescriptionProps extends ComponentPropsWithRef<'div'> {}
export function XhAlertDescription({ children, ...rest }: XhAlertDescriptionProps): ReactNode {
  const ctx = useAlertContext()
  return <div {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhAlertActionProps extends ComponentPropsWithRef<'div'> {}
/** 操作槽：圈出按钮区，按钮本身归作者。 */
export function XhAlertAction({ children, ...rest }: XhAlertActionProps): ReactNode {
  const ctx = useAlertContext()
  return <div {...mergeReactProps(ctx.api.getActionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhAlertCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhAlertCloseTrigger({ children, ...rest }: XhAlertCloseTriggerProps): ReactNode {
  const ctx = useAlertContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}
