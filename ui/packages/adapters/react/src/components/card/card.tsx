/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { ControlVariant } from '@xihan-ui/core'
import type { CardProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import { cardStructure, connectCard } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { renderStructure } from '../../runtime/structure'
import { CardProvider, useCardContext } from './context'

export interface XhCardRootProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'content'> {
  /** 形态：outline 为带影的抬起面，subtle 为淡底，ghost 无底无影。默认 outline。 */
  variant?: ControlVariant
  /** 整卡可交互：标题里的 trigger 把点击区铺满整张卡片。 */
  interactive?: boolean
  /** 标题。不给 children 时铺进页头的 title 部件。 */
  title?: ReactNode
  /** 标题下的说明。不给 children 时铺进页头的 description 部件。 */
  description?: ReactNode
  /** 正文。不给 children 时铺进 content 部件。 */
  content?: ReactNode
  /** 页脚，通常放操作。不给 children 时铺进 footer 部件。 */
  footer?: ReactNode
}

/** 卡片外壳。形态只落在这一层。 */
export function XhCardRoot({ variant, interactive, title, description, content, footer, children, ...rest }: XhCardRootProps): ReactNode {
  const api = connectCard(withXhConfig('card', { variant, interactive }) as CardProps, reactNormalize)
  return (
    <CardProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps(), rest)}>
        {children ?? renderDefaultStructure({ title, description, content, footer })}
      </div>
    </CardProvider>
  )
}

export interface XhCardHeaderProps extends ComponentPropsWithRef<'div'> {}

export function XhCardHeader({ children, ...rest }: XhCardHeaderProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getHeaderProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhCardTitleProps extends ComponentPropsWithRef<'h3'> {}

export function XhCardTitle({ children, ...rest }: XhCardTitleProps): ReactNode {
  const ctx = useCardContext()
  return (
    <h3 {...mergeReactProps(ctx.api.getTitleProps(), rest)}>
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
  const props = mergePartProps(ctx.api.getTriggerProps(), rest)
  return renderAsChild(asChild, children, props, 'card', (p, kids) => p.href == null
    ? <button type="button" {...p}>{kids}</button>
    : <a {...p}>{kids}</a>)
}

export interface XhCardDescriptionProps extends ComponentPropsWithRef<'p'> {}

export function XhCardDescription({ children, ...rest }: XhCardDescriptionProps): ReactNode {
  const ctx = useCardContext()
  return (
    <p {...mergeReactProps(ctx.api.getDescriptionProps(), rest)}>
      {children}
    </p>
  )
}

export interface XhCardContentProps extends ComponentPropsWithRef<'div'> {}

export function XhCardContent({ children, ...rest }: XhCardContentProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhCardFooterProps extends ComponentPropsWithRef<'div'> {}

export function XhCardFooter({ children, ...rest }: XhCardFooterProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getFooterProps(), rest)}>
      {children}
    </div>
  )
}

/** 标准结构里各部件对应的组件。 */
const CARD_PARTS = {
  header: XhCardHeader,
  title: XhCardTitle,
  description: XhCardDescription,
  content: XhCardContent,
  footer: XhCardFooter,
}

type CardSections = Readonly<Partial<Record<'title' | 'description' | 'content' | 'footer', ReactNode>>>

/**
 * 未写 children 时铺开的整套结构：照 headless 的 cardStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。给了哪段内容才铺哪一段。
 */
function renderDefaultStructure(sections: CardSections): ReactNode[] {
  const nodes = cardStructure({ slotted: name => sections[name as keyof CardSections] != null })
  return renderStructure(nodes, CARD_PARTS, node => (node.slot ? sections[node.slot.name as keyof CardSections] : undefined))
}
