import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { IconWrapperProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectIconWrapper } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhIconWrapperProps extends ComponentPropsWithRef<'span'> {
  variant?: ActionVariant
  tone?: Tone
  size?: Size
}

/**
 * 图标底座：给里面那枚图元定直径与底色，三个视觉轴落在根上。
 *
 * 根上不写 role、也不写 aria-hidden——里面那个图元是装饰还是信息，由作者按用途自己声明。
 */
export function XhIconWrapper({ variant, tone, size, children, ...rest }: XhIconWrapperProps): ReactNode {
  const configured = withXhConfig('icon-wrapper', { variant, tone, size } as IconWrapperProps)
  const api = connectIconWrapper(configured, reactNormalize)
  return (
    <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}
