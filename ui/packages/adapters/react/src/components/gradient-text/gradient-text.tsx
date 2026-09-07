import type { Tone } from '@xihan-ui/core'
import type { GradientTextDirection, GradientTextProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectGradientText } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhGradientTextProps extends ComponentPropsWithRef<'span'> {
  /** 渐变起点色；不给退回皮肤缺省。 */
  from?: string
  /** 渐变终点色；不给退回皮肤缺省。 */
  to?: string
  /** 走向档位，缺省 to-right。 */
  direction?: GradientTextDirection
  tone?: Tone
}

/** 一段用渐变上色的文字：走向落成 data-direction，两端颜色走根上的内联变量。 */
export function XhGradientText({ from, to, direction, tone, children, ...rest }: XhGradientTextProps): ReactNode {
  const api = connectGradientText({ from, to, direction, tone } satisfies GradientTextProps, reactNormalize)
  return (
    <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}
