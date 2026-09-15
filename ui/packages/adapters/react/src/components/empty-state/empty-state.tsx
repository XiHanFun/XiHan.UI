/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 empty state 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { EmptyStateLive, EmptyStateProps, EmptyStateStatus } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { EmptyStateProvider, useEmptyStateContext } from './context'
import { useEmptyState } from './use-empty-state'

export interface XhEmptyStateRootProps extends ComponentPropsWithRef<'div'> {
  /** 尺寸档位，只改留白与字号，不改语义。 */
  size?: Size
  /** 播报方式，默认 polite；off 使根只是一个普通容器。 */
  live?: EmptyStateLive
  /** 结果页的状态码，只写为 data-status；通用结果使用 tone。 */
  status?: EmptyStateStatus
  /** 语气：决定使用哪族颜色。 */
  tone?: Tone
}

/** 空状态外壳，默认是 role=status 活区。 */
export function XhEmptyStateRoot({ size, live, status, tone, children, ...rest }: XhEmptyStateRootProps): ReactNode {
  const ctx = useEmptyState(withXhConfig('empty-state', { size, live, status, tone }) as EmptyStateProps)
  return (
    <EmptyStateProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </EmptyStateProvider>
  )
}

export interface XhEmptyStateMediaProps extends ComponentPropsWithRef<'div'> {}

/** 插画槽，内容由作者放置（img、内联 svg 均可）；与图标槽二选一。 */
export function XhEmptyStateMedia({ children, ...rest }: XhEmptyStateMediaProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <div {...mergeReactProps(ctx.api.getMediaProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhEmptyStateIndicatorProps extends ComponentPropsWithRef<'span'> {}

/** 装饰性图标容器，内容由作者放置（字形、内联 svg 均可）。 */
export function XhEmptyStateIndicator({ children, ...rest }: XhEmptyStateIndicatorProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhEmptyStateTitleProps extends ComponentPropsWithRef<'p'> {}

/** 标题渲染为 p 而不是 hN：它只做视觉主次，不向文档大纲插入一级标题。 */
export function XhEmptyStateTitle({ children, ...rest }: XhEmptyStateTitleProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <p {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </p>
  )
}

export interface XhEmptyStateDescriptionProps extends ComponentPropsWithRef<'p'> {}

export function XhEmptyStateDescription({ children, ...rest }: XhEmptyStateDescriptionProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </p>
  )
}

export interface XhEmptyStateActionProps extends ComponentPropsWithRef<'div'> {}

/** 操作槽只排版，按钮由作者放入。 */
export function XhEmptyStateAction({ children, ...rest }: XhEmptyStateActionProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <div {...mergeReactProps(ctx.api.getActionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
