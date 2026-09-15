/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 separator 相关实现。

import type { SeparatorAlign, SeparatorProps, SeparatorVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectSeparator } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { SeparatorProvider, useSeparatorContext } from './context'

/** 分隔本身的取值，两种写法共用这一份。 */
interface SeparatorOwnProps {
  orientation?: 'horizontal' | 'vertical'
  /** 装饰性分隔：仅视觉分组，不进无障碍树。 */
  decorative?: boolean
  /** 线的绘制方式，默认 default。 */
  variant?: SeparatorVariant
  /** 绘制为虚线。 */
  dashed?: boolean
  /** 分节文字所在的一侧，默认居中。 */
  align?: SeparatorAlign
}

export interface XhSeparatorRootProps extends ComponentPropsWithRef<'div'>, SeparatorOwnProps {}

/**
 * 分隔本身。children 为空时它就是那条线；放入 XhSeparatorLine 与 XhSeparatorContent
 * 之后它改作容器，线由 line 绘制。
 */
export function XhSeparatorRoot({
  orientation = 'horizontal',
  decorative,
  variant,
  dashed,
  align,
  children,
  ...rest
}: XhSeparatorRootProps): ReactNode {
  const api = connectSeparator({ orientation, decorative, variant, dashed, align } as SeparatorProps, reactNormalize)
  return (
    <SeparatorProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </SeparatorProvider>
  )
}

/** 线是纯装饰，不承载内容。 */
export interface XhSeparatorLineProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/** 分节文字两侧的线，纯装饰。 */
export function XhSeparatorLine(props: XhSeparatorLineProps): ReactNode {
  const ctx = useSeparatorContext()
  return (
    <div {...mergeReactProps(ctx.api.getLineProps() as Record<string, unknown>, props as Record<string, unknown>)} />
  )
}

export interface XhSeparatorContentProps extends ComponentPropsWithRef<'span'> {}

/** 夹在两条线中间的分节文字。 */
export function XhSeparatorContent({ children, ...rest }: XhSeparatorContentProps): ReactNode {
  const ctx = useSeparatorContext()
  return (
    <span {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhSeparatorProps extends XhSeparatorRootProps {}

/**
 * 一步到位的写法：未提供 children 即为一条线；提供后自动排为线、文字、线三段。
 *
 * 需要在分节文字中放置自定义结构（例如一个图标加一段文字）时改用
 * XhSeparatorRoot + XhSeparatorLine + XhSeparatorContent。
 */
export function XhSeparator({ children, ...rest }: XhSeparatorProps): ReactNode {
  // 空白与假分支不算给了文案：包进三段就是一条断开的线
  if (!slotPaints(children))
    return <XhSeparatorRoot {...rest} />
  return (
    <XhSeparatorRoot {...rest}>
      <XhSeparatorLine />
      <XhSeparatorContent>{children}</XhSeparatorContent>
      <XhSeparatorLine />
    </XhSeparatorRoot>
  )
}
