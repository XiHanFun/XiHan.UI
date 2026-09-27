/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number animation 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { NumberAnimationApi, NumberAnimationEasing, NumberAnimationFormatOptions, NumberAnimationLive, NumberAnimationSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { connectNumberAnimation, numberAnimationMachine } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'

type NumberAnimationProps = NumberAnimationSchema['props']

/** 函数式 children 的载荷：当前帧的数值，以及它按 locale、precision、separator 与 formatOptions 格式化后的文本。 */
export type NumberAnimationSlotProps = Pick<NumberAnimationApi, 'value' | 'text'>

export interface XhNumberAnimationProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  from?: number
  to?: number
  duration?: number
  easing?: NumberAnimationEasing
  /** 小数位数；未提供时按 from / to 推导。 */
  precision?: number
  /** 分组符。给了就分组并把该语言的分组符换成它；默认不分组。 */
  separator?: string
  /** BCP 47 语言标记，决定小数点、分组习惯、数字系统与货币写法；未提供时按宿主语言。 */
  locale?: string
  /** 交给 Intl.NumberFormat 的选项：货币、百分比、单位、紧凑记数、符号、数字系统与 useGrouping。小数位归 precision。 */
  formatOptions?: NumberAnimationFormatOptions
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
  locale,
  formatOptions,
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
    locale,
    formatOptions,
    active,
    size,
    tone,
    live,
    onComplete,
  }), { scope: useReactScope() })
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
