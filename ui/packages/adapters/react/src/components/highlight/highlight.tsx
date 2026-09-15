/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 highlight 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { HighlightProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectHighlight } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhHighlightProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** 要显示的整段文本。命中位置按该串逐字符计算。 */
  text?: string
  /** 关键词，一个或一组。 */
  keyword?: string | readonly string[]
  /** 区分大小写，默认不区分。 */
  caseSensitive?: boolean
  tone?: Tone
}

/**
 * 把 text 按 keyword 切段铺进一个 span：命中的片段渲染为 mark，其余是纯文本节点。
 *
 * 整段内容由 text 与 keyword 计算得出，组件不接收 children：命中位置是按 text 这个串
 * 逐字符计算的，内容另有来源时无法对应。
 */
export function XhHighlight({ text, keyword, caseSensitive, tone, ...rest }: XhHighlightProps): ReactNode {
  const api = connectHighlight({ text, keyword, caseSensitive, tone } satisfies HighlightProps, reactNormalize)
  const markProps = api.getMarkProps() as Record<string, unknown>
  return (
    <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {/* 片段每次整份重算，位置即身份：命中的那几段按下标认领自己那一格 */}
      {api.segments.map((segment, index) => (segment.matched
        ? <mark key={index} {...markProps}>{segment.text}</mark>
        : segment.text))}
    </span>
  )
}
