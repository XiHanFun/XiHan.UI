/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use skeleton 相关实现。

import type { SkeletonApi, SkeletonProps } from '@xihan-ui/headless'
import { connectSkeleton, skeletonMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SkeletonContext {
  api: SkeletonApi
}

// 机器只记容器还留不留着（刚加载完的骨架淡出播完才收起），其余属性随 props 整份重算
export function useSkeleton(props: SkeletonProps): SkeletonContext {
  const scope = useReactScope()
  const service = useMachine(skeletonMachine, () => props, { scope })
  return { api: connectSkeleton(service, reactNormalize) }
}
