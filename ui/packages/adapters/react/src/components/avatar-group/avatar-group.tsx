import type { Size } from '@xihan-ui/core'
import type { AvatarGroupProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectAvatarGroup } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { AvatarGroupProvider, useAvatarGroupContext } from './context'

export interface XhAvatarGroupRootProps extends ComponentPropsWithRef<'div'> {
  /** 展示上限：这一组打算摆出几枚，其余收进 overflow-item 那一枚。 */
  max?: number
  /** 尺寸，落到根上沿继承流下发给组内每一枚。 */
  size?: Size
}

export function XhAvatarGroupRoot({ max, size, children, ...rest }: XhAvatarGroupRootProps): ReactNode {
  const api = connectAvatarGroup(withXhConfig('avatar-group', { max, size }) as AvatarGroupProps, reactNormalize)
  return (
    <AvatarGroupProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </AvatarGroupProvider>
  )
}

export interface XhAvatarGroupOverflowItemProps extends ComponentPropsWithRef<'span'> {}

/** 溢出计数位：「+N」的文本由作者写进 children。 */
export function XhAvatarGroupOverflowItem({ children, ...rest }: XhAvatarGroupOverflowItemProps): ReactNode {
  const ctx = useAvatarGroupContext()
  return (
    <span {...mergeReactProps(ctx.api.getOverflowItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}
