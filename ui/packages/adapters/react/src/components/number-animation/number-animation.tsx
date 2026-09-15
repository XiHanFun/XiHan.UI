/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number animation 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { NumberAnimationApi, NumberAnimationEasing, NumberAnimationLive, NumberAnimationSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { connectNumberAnimation, numberAnimationMachine } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'

type NumberAnimationProps = NumberAnimationSchema['props']

/** 函数式 children 的载荷：当前帧的数值，以及它按 precision 与 separator 格式化后的文本。 */
export type NumberAnimationSlotProps = Pick<NumberAnimationApi, 'value' | 'text'>

export interface XhNumberAnimationProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  from?: number
  to?: number
  duration?: number
  easing?: NumberAnimationEasing
  /** 小数位数；未提供时按 from / to 推导。 */
  precision?: number
  /** 千分位分隔符。 */
  separator?: string
  /** 是否运行；关闭时停在当前值。 */
  active?: boolean
  size?: Size
  tone?: Tone
  /** 读屏播报档位，默认 off。 */
  live?: NumberAnimationLive
  onComplete?: NumberAnimationProps['onComplete']
  children?: SlotChildren<NumberAnimationSlotProps>
}

/**
 * 一段自动变化的数字：从 from 补间到 to，逐帧计算值，格式化后写入根中。
 *
 * 函数式 children 可得到 `{ value, text }`，提供内容后由作者自行排版；
 * 未提供任何内容时根中即为格式化后的文本。
 */
export function XhNumberAnimation({
  from,
  to,
  duration,
  easing,
  precision,
  separator,
  active,
  size,
  tone,
  live,
  onComplete,
  children,
  ...rest
}: XhNumberAnimationProps): ReactNode {
  const service = useMachine(numberAnimationMachine, () => ({
    from,
    to,
    duration,
    easing,
    precision,
    separator,
    active,
    size,
    tone,
    live,
    onComplete,
  }))
  const api = connectNumberAnimation(service, reactNormalize)
  const content = children == null ? null : renderSlot(children, { value: api.value, text: api.text })
  return (
    <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {/* children 落空（条件渲染没画出东西）时退回组件自己铺好的那串字 */}
      {slotPaints(content) ? content : api.text}
    </span>
  )
}

XhNumberAnimation.xhEvents = ['complete'] as const
