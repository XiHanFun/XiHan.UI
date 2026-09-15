/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 skeleton 相关实现。

import type { SkeletonAnimation, SkeletonProps, SkeletonShape } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { SkeletonProvider, useSkeletonContext } from './context'
import { useSkeleton } from './use-skeleton'

export interface XhSkeletonRootProps extends ComponentPropsWithRef<'div'> {
  /** 是否仍在加载，默认 true。 */
  loading?: boolean
  /** 容器内骨架条的默认形状。 */
  shape?: SkeletonShape
  /** 动效档；默认档不输出 data-animation。 */
  animation?: SkeletonAnimation
}

/** 骨架容器：加载期间报告 aria-busy，加载结束后整块收起。 */
export function XhSkeletonRoot({
  loading = true,
  shape,
  animation,
  children,
  ...rest
}: XhSkeletonRootProps): ReactNode {
  const ctx = useSkeleton({ loading, shape, animation } as SkeletonProps)
  return (
    <SkeletonProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </SkeletonProvider>
  )
}

/** 骨架条不承载内容，只占位；形状之外的属性照常透传。 */
export interface XhSkeletonItemProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 该根的形状，覆盖容器提供的默认值。 */
  shape?: SkeletonShape
}

/** 单根骨架条：纯装饰，不进入无障碍树；形状默认跟随容器，提供 shape 时按自己的形状。 */
export function XhSkeletonItem({ shape, ...rest }: XhSkeletonItemProps): ReactNode {
  const ctx = useSkeletonContext()
  return (
    <div {...mergeReactProps(ctx.api.getItemProps({ shape }) as Record<string, unknown>, rest as Record<string, unknown>)} />
  )
}
