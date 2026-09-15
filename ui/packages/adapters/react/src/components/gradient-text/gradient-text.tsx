/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 gradient text 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { GradientTextDirection, GradientTextProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectGradientText } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhGradientTextProps extends ComponentPropsWithRef<'span'> {
  /** 渐变起点色；未提供时退回皮肤默认。 */
  from?: string
  /** 渐变终点色；未提供时退回皮肤默认。 */
  to?: string
  /** 走向档位，默认 to-right。 */
  direction?: GradientTextDirection
  tone?: Tone
}

/** 一段使用渐变上色的文字：走向写为 data-direction，两端颜色经根上的内联变量。 */
export function XhGradientText({ from, to, direction, tone, children, ...rest }: XhGradientTextProps): ReactNode {
  const api = connectGradientText({ from, to, direction, tone } satisfies GradientTextProps, reactNormalize)
  return (
    <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}
