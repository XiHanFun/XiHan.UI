/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { AlertSchema, AlertTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { alertStructure } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderStructure } from '../../runtime/structure'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { AlertProvider, useAlertContext } from './context'
import { useAlert } from './use-alert'

type AlertProps = AlertSchema['props']

export interface XhAlertRootProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  tone?: Tone
  /** 默认交给 connect 决定，写 false 才真正关闭。不给 children 时写了真才铺关闭钮。 */
  closable?: boolean
  /** 横幅：贴边铺满的页面通栏，不取圆角，只留块尾描边。 */
  banner?: boolean
  open?: boolean
  defaultOpen?: boolean
  translations?: Partial<AlertTranslations>
  onOpenChange?: AlertProps['onOpenChange']
  // —— 不给 children 时的标准结构（alertStructure）——
  /** 语气图标，铺进 indicator 部件。 */
  indicator?: ReactNode
  /** 标题。是字符串时作文字，是别的节点时由标题部件装着。 */
  title?: ReactNode
  /** 说明。是字符串时作文字，是别的节点时由说明部件装着。 */
  description?: ReactNode
  /** 操作按钮，铺进 action 部件。 */
  action?: ReactNode
  children?: ReactNode
}

export function XhAlertRoot({
  tone,
  closable,
  banner,
  open,
  defaultOpen,
  translations,
  onOpenChange,
  indicator,
  title,
  description,
  action,
  children,
  ...rest
}: XhAlertRootProps): ReactNode {
  const props = withXhConfig('alert', {
    tone,
    closable,
    banner,
    open,
    defaultOpen,
    translations,
    onOpenChange,
  }) as AlertProps
  const ctx = useAlert(props)
  return (
    <AlertProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps(), rest)}>
        {children ?? renderDefaultStructure(props.closable, { indicator, title, description, action })}
      </div>
    </AlertProvider>
  )
}

XhAlertRoot.xhEvents = ['open-change'] as const

export interface XhAlertIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhAlertIndicator({ children, ...rest }: XhAlertIndicatorProps): ReactNode {
  const ctx = useAlertContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps(), rest)}>{children}</span>
}

export interface XhAlertContentProps extends ComponentPropsWithRef<'div'> {}
/** 文本列：标题与说明纵向排列为一列。未写它时两段文字直接位于 root 的一行上。 */
export function XhAlertContent({ children, ...rest }: XhAlertContentProps): ReactNode {
  const ctx = useAlertContext()
  return <div {...mergeReactProps(ctx.api.getContentProps(), rest)}>{children}</div>
}

export interface XhAlertTitleProps extends ComponentPropsWithRef<'div'> {}
export function XhAlertTitle({ children, ...rest }: XhAlertTitleProps): ReactNode {
  const ctx = useAlertContext()
  useTitleDescriptionPart(ctx.presence, 'title')
  return <div {...mergeReactProps(ctx.api.getTitleProps(), rest)}>{children}</div>
}

export interface XhAlertDescriptionProps extends ComponentPropsWithRef<'div'> {}
export function XhAlertDescription({ children, ...rest }: XhAlertDescriptionProps): ReactNode {
  const ctx = useAlertContext()
  // 读不出一句话的说明不进描述链
  const el = useDescriptionPart(ctx.presence)
  return <div {...mergeReactProps({ ...ctx.api.getDescriptionProps() as Record<string, unknown>, ref: el }, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhAlertActionProps extends ComponentPropsWithRef<'div'> {}
/** 操作槽：划定按钮区，按钮本身归作者。 */
export function XhAlertAction({ children, ...rest }: XhAlertActionProps): ReactNode {
  const ctx = useAlertContext()
  return <div {...mergeReactProps(ctx.api.getActionProps(), rest)}>{children}</div>
}

export interface XhAlertCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhAlertCloseTrigger({ children, ...rest }: XhAlertCloseTriggerProps): ReactNode {
  const ctx = useAlertContext()
  return <button {...mergeReactProps(ctx.api.getCloseTriggerProps(), rest)}>{children}</button>
}

/** 标准结构里各部件对应的组件。 */
const ALERT_PARTS = {
  'indicator': XhAlertIndicator,
  'content': XhAlertContent,
  'title': XhAlertTitle,
  'description': XhAlertDescription,
  'action': XhAlertAction,
  'close-trigger': XhAlertCloseTrigger,
}

type AlertSections = Readonly<Record<'indicator' | 'title' | 'description' | 'action', ReactNode>>

/**
 * 未写 children 时铺开的整套结构：照 headless 的 alertStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 文本列恒铺；标题与说明是字符串时作文字，是别的节点时由对应部件装着；图标与操作区由同名部件装着；写了 closable 才铺关闭钮。
 */
function renderDefaultStructure(closable: boolean | undefined, { indicator, title, description, action }: AlertSections): ReactNode[] {
  const text = (value: ReactNode): string | undefined => (typeof value === 'string' ? value : undefined)
  const sections: Readonly<Record<string, ReactNode>> = {
    indicator,
    title: typeof title === 'string' ? undefined : title,
    description: typeof description === 'string' ? undefined : description,
    action,
  }
  return renderStructure(
    alertStructure({ title: text(title), description: text(description), closable, slotted: name => sections[name] != null }),
    ALERT_PARTS,
    node => (node.slot ? sections[node.slot.name] : undefined),
  )
}
