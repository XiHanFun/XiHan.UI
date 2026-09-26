/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use empty state 相关实现。

import type { EmptyStateApi, EmptyStateProps } from '@xihan-ui/headless'
import type { ComputedRef, ShallowRef } from 'vue'
import { connectEmptyState, emptyStateMachine } from '@xihan-ui/headless'
import { computed, shallowRef } from 'vue'
import { isHydratingSetup } from '../../runtime/hydration'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface EmptyStateContext {
  api: ComputedRef<EmptyStateApi>
  /** 根节点：开幕播不播按它出现与否判断。 */
  rootRef: ShallowRef<HTMLElement | null>
}

export function useEmptyState(props: EmptyStateProps): EmptyStateContext {
  const rootRef = shallowRef<HTMLElement | null>(null)
  const service = useMachine(emptyStateMachine, () => props)
  // 机器在挂载时起跑，出现追踪那时才取根节点
  service.refs.set('getRootEl', () => rootRef.value)
  service.refs.set('adopted', isHydratingSetup())
  const api = computed(() => connectEmptyState(service, vueNormalize))
  return { api, rootRef }
}
