/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use skeleton 相关实现。

import type { SkeletonApi, SkeletonProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectSkeleton, skeletonMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SkeletonContext {
  api: ComputedRef<SkeletonApi>
}

// 机器只记容器还留不留着（刚加载完的骨架淡出播完才收起），其余属性随 props 由 computed 重算
export function useSkeleton(props: SkeletonProps): SkeletonContext {
  const scope = createScope(null, createVueIdGenerator())
  const service = useMachine(skeletonMachine, () => ({ ...props }), scope)
  const api = computed(() => connectSkeleton(service, vueNormalize))
  return { api }
}
