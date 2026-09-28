/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { ControlVariant } from '@xihan-ui/core'
import type { CardProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import { connectCard } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { CardProvider, useCardContext } from './context'

export interface XhCardRootProps extends ComponentPropsWithRef<'div'> {
  /** 形态：outline 为带影的抬起面，subtle 为淡底，ghost 无底无影。默认 outline。 */
  variant?: ControlVariant
  /** 整卡可交互：标题里的 trigger 把点击区铺满整张卡片。 */
  interactive?: boolean
}

/** 卡片外壳。形态只落在这一层。 */
export function XhCardRoot({ variant, interactive, children, ...rest }: XhCardRootProps): ReactNode {
  const api = connectCard(withXhConfig('card', { variant, interactive }) as CardProps, reactNormalize)
  return (
    <CardProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </CardProvider>
  )
}

export interface XhCardHeaderProps extends ComponentPropsWithRef<'div'> {}

export function XhCardHeader({ children, ...rest }: XhCardHeaderProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCardTitleProps extends ComponentPropsWithRef<'h3'> {}

export function XhCardTitle({ children, ...rest }: XhCardTitleProps): ReactNode {
  const ctx = useCardContext()
  return (
    <h3 {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </h3>
  )
}

export interface XhCardTriggerProps extends ComponentPropsWithRef<'a'>, AsChildProps {}

/**
 * 整卡的触发器，放在 title 里：给了 href 渲染链接，不给渲染 `<button type="button">`；
 * 路由链接等作者自己的节点用 asChild。卡片 interactive 时它的点击区铺满整张卡片。
 */
export function XhCardTrigger({ children, asChild, ...rest }: XhCardTriggerProps): ReactNode {
  const ctx = useCardContext()
  const props = mergePartProps(ctx.api.getTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)
  return renderAsChild(asChild, children, props, 'card', (p, kids) => p.href == null
    ? <button type="button" {...p}>{kids}</button>
    : <a {...p}>{kids}</a>)
}

export interface XhCardDescriptionProps extends ComponentPropsWithRef<'p'> {}

export function XhCardDescription({ children, ...rest }: XhCardDescriptionProps): ReactNode {
  const ctx = useCardContext()
  return (
    <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </p>
  )
}

export interface XhCardContentProps extends ComponentPropsWithRef<'div'> {}

export function XhCardContent({ children, ...rest }: XhCardContentProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCardFooterProps extends ComponentPropsWithRef<'div'> {}

export function XhCardFooter({ children, ...rest }: XhCardFooterProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
