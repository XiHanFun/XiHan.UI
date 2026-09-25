/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 badge 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { BadgePlacement, BadgeProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { connectBadge } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { renderSlot } from '../../runtime/slot-content'
import { BadgeProvider, useBadgeContext } from './context'

/** 三轴与计数这几项在锚点与一步到位两种写法上是同一份。 */
interface BadgeOwnProps {
  tone?: Tone
  size?: Size
  /** 挂在哪个角上，默认 top-end。 */
  placement?: BadgePlacement
  /** 计数：提供后角标自行显示数字，超过 max 时显示为「max+」。 */
  count?: number
  /** 计数上限，默认 99。 */
  max?: number
  /** 计数为 0 时是否仍然显示，默认不显示。 */
  showZero?: boolean
  /** 只显示一个点，不显示数字。 */
  dot?: boolean
  /** 圆点呼吸：表达正在进行、给不出进度的状态。只在 dot 模式下生效。 */
  pulse?: boolean
  /** 读屏朗读该角标的方式，例如「3 条未读」。 */
  label?: string
}

export interface XhBadgeRootProps extends ComponentPropsWithRef<'span'>, BadgeOwnProps {}

/**
 * 锚点：被标记的元素（按钮、头像、标签页）写进 children，角标另起一层贴在它的角上。
 *
 * 角标是挂在其他元素角上的标记，不是可以单独放置的药丸：
 * 行内的状态药丸请使用 tag。
 */
export function XhBadgeRoot({
  tone,
  size,
  placement,
  count,
  max,
  showZero,
  dot,
  pulse,
  label,
  children,
  ...rest
}: XhBadgeRootProps): ReactNode {
  const configured = withXhConfig('badge', { tone, size, placement, count, max, showZero, dot, pulse, label } as BadgeProps)
  const api = connectBadge(configured, reactNormalize)
  return (
    <BadgeProvider value={{ api }}>
      <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </span>
    </BadgeProvider>
  )
}

export interface XhBadgeProps extends XhBadgeRootProps {}

/**
 * 一步到位的写法：children 放被标记的元素，角标自动跟随。
 *
 * 需要在角标中放置自定义内容（例如一个小图标）时改用 XhBadgeRoot + XhBadgeIndicator。
 */
export function XhBadge({ children, ...props }: XhBadgeProps): ReactNode {
  return (
    <XhBadgeRoot {...props}>
      {children}
      <XhBadgeIndicator />
    </XhBadgeRoot>
  )
}

/** 函数式 children 的载荷：计算得出的计数文本。 */
export interface BadgeIndicatorSlotProps {
  text: string
}

export interface XhBadgeIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  children?: SlotChildren<BadgeIndicatorSlotProps>
}

/** 角标本身，绝对定位在锚点的某个角上。未提供内容时使用计算得出的计数文本。 */
export function XhBadgeIndicator({ children, ...rest }: XhBadgeIndicatorProps): ReactNode {
  const ctx = useBadgeContext()
  const text = ctx.api.text
  const body = children == null ? text : renderSlot(children, { text })
  return (
    <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {body}
    </span>
  )
}
