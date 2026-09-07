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
  /** 计数：给了它角标就自己出数字，超过 max 写成「max+」。 */
  count?: number
  /** 计数上限，默认 99。 */
  max?: number
  /** 计数为 0 时是否照样显示，默认不显示。 */
  showZero?: boolean
  /** 只出一个点，不出数字。 */
  dot?: boolean
  /** 读屏怎么念这枚角标，例如「3 条未读」。 */
  label?: string
}

export interface XhBadgeRootProps extends ComponentPropsWithRef<'span'>, BadgeOwnProps {}

/**
 * 锚点：被标记的那个东西（按钮、头像、标签页）写进 children，角标另起一层贴在它的角上。
 *
 * 角标是挂在别的元素角上的一枚标记，不是可以单独摆的药丸——
 * 行内的状态药丸请用 tag。
 */
export function XhBadgeRoot({
  tone,
  size,
  placement,
  count,
  max,
  showZero,
  dot,
  label,
  children,
  ...rest
}: XhBadgeRootProps): ReactNode {
  const configured = withXhConfig('badge', { tone, size, placement, count, max, showZero, dot, label } as BadgeProps)
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
 * 一步到位的写法：children 放被标记的东西，角标自动跟上。
 *
 * 要往角标里塞自定义内容（比如一枚小图标）时改用 XhBadgeRoot + XhBadgeIndicator。
 */
export function XhBadge({ children, ...props }: XhBadgeProps): ReactNode {
  return (
    <XhBadgeRoot {...props}>
      {children}
      <XhBadgeIndicator />
    </XhBadgeRoot>
  )
}

/** 函数式 children 的载荷：算好的计数文本。 */
export interface BadgeIndicatorSlotProps {
  text: string
}

export interface XhBadgeIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  children?: SlotChildren<BadgeIndicatorSlotProps>
}

/** 角标本身，绝对定位在锚点的某个角上。不给内容就用算好的计数文本。 */
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
