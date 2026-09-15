/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

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
  /** 默认交给 connect 决定，写 false 才真正关闭。 */
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
/** 文本列：标题与说明纵向排列为一列。未写它时两段文字直接位于 root 的一行上。 */
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
/** 操作槽：划定按钮区，按钮本身归作者。 */
export function XhAlertAction({ children, ...rest }: XhAlertActionProps): ReactNode {
  const ctx = useAlertContext()
  return <div {...mergeReactProps(ctx.api.getActionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhAlertCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhAlertCloseTrigger({ children, ...rest }: XhAlertCloseTriggerProps): ReactNode {
  const ctx = useAlertContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}
