/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 empty state 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { EmptyStateLive, EmptyStateProps, EmptyStateStatus } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { emptyStateStructure } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderStructure } from '../../runtime/structure'
import { EmptyStateProvider, useEmptyStateContext } from './context'
import { useEmptyState } from './use-empty-state'

export interface XhEmptyStateRootProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** 尺寸档位，只改留白与字号，不改语义。 */
  size?: Size
  /** 播报方式，默认 polite；off 使根只是一个普通容器。 */
  live?: EmptyStateLive
  /** 结果页的状态码，只写为 data-status；通用结果使用 tone。 */
  status?: EmptyStateStatus
  /** 语气：决定使用哪族颜色。 */
  tone?: Tone
  // —— 不给 children 时的标准结构（emptyStateStructure）——
  /** 插画，铺进 media 部件；与 indicator 二选一。 */
  media?: ReactNode
  /** 装饰图标，铺进 indicator 部件。 */
  indicator?: ReactNode
  /** 标题。是字符串时作文字，是别的节点时由标题部件装着。 */
  title?: ReactNode
  /** 说明。是字符串时作文字，是别的节点时由说明部件装着。 */
  description?: ReactNode
  /** 操作按钮，铺进 action 部件。 */
  action?: ReactNode
}

/** 空状态外壳，默认是 role=status 活区。 */
export function XhEmptyStateRoot({ size, live, status, tone, media, indicator, title, description, action, children, ...rest }: XhEmptyStateRootProps): ReactNode {
  const ctx = useEmptyState(withXhConfig('empty-state', { size, live, status, tone }) as EmptyStateProps)
  return (
    <EmptyStateProvider value={ctx}>
      <div
        {...mergeReactProps(
          { ...ctx.api.getRootProps(), ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
          rest as Record<string, unknown>,
        )}
      >
        {children ?? renderDefaultStructure({ media, indicator, title, description, action })}
      </div>
    </EmptyStateProvider>
  )
}

export interface XhEmptyStateMediaProps extends ComponentPropsWithRef<'div'> {}

/** 插画槽，内容由作者放置（img、内联 svg 均可）；与图标槽二选一。 */
export function XhEmptyStateMedia({ children, ...rest }: XhEmptyStateMediaProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <div {...mergeReactProps(ctx.api.getMediaProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhEmptyStateIndicatorProps extends ComponentPropsWithRef<'span'> {}

/** 装饰性图标容器，内容由作者放置（字形、内联 svg 均可）。 */
export function XhEmptyStateIndicator({ children, ...rest }: XhEmptyStateIndicatorProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <span {...mergeReactProps(ctx.api.getIndicatorProps(), rest)}>
      {children}
    </span>
  )
}

export interface XhEmptyStateTitleProps extends ComponentPropsWithRef<'p'> {}

/** 标题渲染为 p 而不是 hN：它只做视觉主次，不向文档大纲插入一级标题。 */
export function XhEmptyStateTitle({ children, ...rest }: XhEmptyStateTitleProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <p {...mergeReactProps(ctx.api.getTitleProps(), rest)}>
      {children}
    </p>
  )
}

export interface XhEmptyStateDescriptionProps extends ComponentPropsWithRef<'p'> {}

export function XhEmptyStateDescription({ children, ...rest }: XhEmptyStateDescriptionProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <p {...mergeReactProps(ctx.api.getDescriptionProps(), rest)}>
      {children}
    </p>
  )
}

export interface XhEmptyStateActionProps extends ComponentPropsWithRef<'div'> {}

/** 操作槽只排版，按钮由作者放入。 */
export function XhEmptyStateAction({ children, ...rest }: XhEmptyStateActionProps): ReactNode {
  const ctx = useEmptyStateContext()
  return (
    <div {...mergeReactProps(ctx.api.getActionProps(), rest)}>
      {children}
    </div>
  )
}

/** 标准结构里各部件对应的组件。 */
const EMPTY_STATE_PARTS = {
  media: XhEmptyStateMedia,
  indicator: XhEmptyStateIndicator,
  title: XhEmptyStateTitle,
  description: XhEmptyStateDescription,
  action: XhEmptyStateAction,
}

type EmptyStateSections = Readonly<Record<'media' | 'indicator' | 'title' | 'description' | 'action', ReactNode>>

/**
 * 未写 children 时铺开的整套结构：照 headless 的 emptyStateStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 标题与说明是字符串时作文字，是别的节点时由对应部件装着；插画、图标与操作区由同名部件装着。
 */
function renderDefaultStructure({ media, indicator, title, description, action }: EmptyStateSections): ReactNode[] {
  const text = (value: ReactNode): string | undefined => (typeof value === 'string' ? value : undefined)
  const sections: Readonly<Record<string, ReactNode>> = {
    media,
    indicator,
    title: typeof title === 'string' ? undefined : title,
    description: typeof description === 'string' ? undefined : description,
    action,
  }
  return renderStructure(
    emptyStateStructure({ title: text(title), description: text(description), slotted: name => sections[name] != null }),
    EMPTY_STATE_PARTS,
    node => (node.slot ? sections[node.slot.name] : undefined),
  )
}
