/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 typography 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { TypographyAlign, TypographyLevel, TypographyProps, TypographyVariant, TypographyWeight } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import { connectTypography } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { TypographyProvider, useTypographyContext } from './context'

export interface XhTypographyRootProps extends ComponentPropsWithRef<'div'> {
  /** 尺寸：sm / md / lg，整块正文的字号与段间距随之换档。 */
  size?: Size
  /** 对齐：start / center / end / justify。 */
  align?: TypographyAlign
  /** 字重：regular / medium / semibold / bold。 */
  weight?: TypographyWeight
}

/** 正文块容器，管理段间距与最大行宽。 */
export function XhTypographyRoot({ size, align, weight, children, ...rest }: XhTypographyRootProps): ReactNode {
  const api = connectTypography(
    withXhConfig('typography', { size, align, weight }) as TypographyProps,
    reactNormalize,
  )
  return (
    <TypographyProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </TypographyProvider>
  )
}

export interface XhTypographyHeadingProps extends ComponentPropsWithRef<'p'> {
  /** 字号档位 1-6，超出范围收敛到边界。 */
  level?: TypographyLevel | string
  /** 渲染为哪个标签，默认 p；需要进入文档大纲时写 h2（或 hN）。 */
  as?: ElementType
}

/** 标题：level 只切换字号档位，不决定标签。 */
export function XhTypographyHeading({ level, as = 'p', children, ...rest }: XhTypographyHeadingProps): ReactNode {
  const ctx = useTypographyContext()
  const Tag = as as 'p'
  return (
    <Tag {...mergeReactProps(ctx.api.getHeadingProps({ level }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}

export interface XhTypographyParagraphProps extends ComponentPropsWithRef<'p'> {}

export function XhTypographyParagraph({ children, ...rest }: XhTypographyParagraphProps): ReactNode {
  const ctx = useTypographyContext()
  return (
    <p {...mergeReactProps(ctx.api.getParagraphProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </p>
  )
}

export interface XhTypographyTextProps extends ComponentPropsWithRef<'span'> {
  /** 语气：决定使用哪族颜色。 */
  tone?: Tone
  /** 形态：muted 弱化 / strong 加重 / code 等宽。 */
  variant?: TypographyVariant
  /** 字重：regular / medium / semibold / bold，只作用于该段行内文字。 */
  weight?: TypographyWeight
  /** 渲染为哪个标签，默认 span；需要 code / strong 的原生语义时自行写明。 */
  as?: ElementType
}

/** 行内文字：variant 切换形态，tone 切换语气色，weight 切换字重。 */
export function XhTypographyText({ tone, variant, weight, as = 'span', children, ...rest }: XhTypographyTextProps): ReactNode {
  const ctx = useTypographyContext()
  const Tag = as as 'span'
  return (
    <Tag {...mergeReactProps(ctx.api.getTextProps({ tone, variant, weight }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}

export interface XhTypographyProseProps extends ComponentPropsWithRef<'div'> {
  /** 渲染为哪个标签，默认 div。 */
  as?: ElementType
}

/** 富文本容器：外来的 HTML 铺入其中，样式按标签给出。 */
export function XhTypographyProse({ as = 'div', children, ...rest }: XhTypographyProseProps): ReactNode {
  const ctx = useTypographyContext()
  const Tag = as as 'div'
  return (
    <Tag {...mergeReactProps(ctx.api.getProseProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}

export interface XhTypographyLinkProps extends ComponentPropsWithRef<'a'> {}

/** href、target、rel 由作者写，这里只提供身份。 */
export function XhTypographyLink({ children, ...rest }: XhTypographyLinkProps): ReactNode {
  const ctx = useTypographyContext()
  return (
    <a {...mergeReactProps(ctx.api.getLinkProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </a>
  )
}
