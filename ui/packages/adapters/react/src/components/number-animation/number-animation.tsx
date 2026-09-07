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

/** 函数式 children 的载荷：当前帧的数值，以及它按 precision 与 separator 铺好的文本。 */
export type NumberAnimationSlotProps = Pick<NumberAnimationApi, 'value' | 'text'>

export interface XhNumberAnimationProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  from?: number
  to?: number
  duration?: number
  easing?: NumberAnimationEasing
  /** 小数位数；不给按 from / to 推出来。 */
  precision?: number
  /** 千分位分隔符。 */
  separator?: string
  /** 跑不跑；关掉时停在当前值。 */
  active?: boolean
  size?: Size
  tone?: Tone
  /** 读屏播报档位，缺省 off。 */
  live?: NumberAnimationLive
  onComplete?: NumberAnimationProps['onComplete']
  children?: SlotChildren<NumberAnimationSlotProps>
}

/**
 * 一段会自己走的数字：从 from 补间到 to，逐帧算值，格式化后写进根里。
 *
 * 函数式 children 拿得到 `{ value, text }`，给了内容就由作者自己排版；
 * 什么都不给时根里就是格式化好的那串字。
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
