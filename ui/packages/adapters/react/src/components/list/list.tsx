/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 list 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { ListProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import { connectList } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { ListProvider, useListContext } from './context'

export interface XhListRootProps extends ComponentPropsWithRef<'ul'> {
  /** 形态：ghost 不画壳（默认），outline 为整份列表绘制描边与圆角，subtle 淡底。默认 ghost。 */
  variant?: ControlVariant
  /** 指针悬停时条目更换底色。 */
  hoverable?: boolean
  /** 条目之间绘制分隔线。 */
  split?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  /** 根渲染为哪个标签，默认 ul；换为 div 即不进入读屏的列表语义。 */
  as?: ElementType
}

/** 一份条目列表：两个轴与两个开关只落在根上，条目各段从这里继承。 */
export function XhListRoot({
  variant,
  hoverable,
  split,
  size,
  as = 'ul',
  children,
  ...rest
}: XhListRootProps): ReactNode {
  const configured = withXhConfig('list', { variant, hoverable, split, size }) as ListProps
  const api = connectList(configured, reactNormalize)
  const Tag = as as 'ul'
  return (
    <ListProvider value={{ api }}>
      <Tag {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </Tag>
    </ListProvider>
  )
}

export interface XhListItemProps extends ComponentPropsWithRef<'li'> {
  /** 条目渲染为哪个标签，默认 li；根换为 div 时这里一并更换。 */
  as?: ElementType
}

export function XhListItem({ as = 'li', children, ...rest }: XhListItemProps): ReactNode {
  const ctx = useListContext()
  const Tag = as as 'li'
  return (
    <Tag {...mergeReactProps(ctx.api.getItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}

export interface XhListItemMediaProps extends ComponentPropsWithRef<'div'> {}
/** 媒体位排在条目最前，内容由作者放置（头像、图标、缩略图均可）。 */
export function XhListItemMedia({ children, ...rest }: XhListItemMediaProps): ReactNode {
  const ctx = useListContext()
  return <div {...mergeReactProps(ctx.api.getItemMediaProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhListItemContentProps extends ComponentPropsWithRef<'div'> {}
export function XhListItemContent({ children, ...rest }: XhListItemContentProps): ReactNode {
  const ctx = useListContext()
  return <div {...mergeReactProps(ctx.api.getItemContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhListItemTitleProps extends ComponentPropsWithRef<'div'> {}
/** 标题渲染为 div 而不是 hN：它只做视觉主次，不向文档大纲插入一级标题。 */
export function XhListItemTitle({ children, ...rest }: XhListItemTitleProps): ReactNode {
  const ctx = useListContext()
  return <div {...mergeReactProps(ctx.api.getItemTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhListItemDescriptionProps extends ComponentPropsWithRef<'div'> {}
export function XhListItemDescription({ children, ...rest }: XhListItemDescriptionProps): ReactNode {
  const ctx = useListContext()
  return <div {...mergeReactProps(ctx.api.getItemDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhListItemActionProps extends ComponentPropsWithRef<'div'> {}
/** 操作位排在条目末尾，按钮由作者放进 children。 */
export function XhListItemAction({ children, ...rest }: XhListItemActionProps): ReactNode {
  const ctx = useListContext()
  return <div {...mergeReactProps(ctx.api.getItemActionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
