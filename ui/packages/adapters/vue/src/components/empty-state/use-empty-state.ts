/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use empty state 相关实现。

import type { EmptyStateApi, EmptyStateProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectEmptyState } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface EmptyStateContext {
  api: ComputedRef<EmptyStateApi>
}

// EmptyState 无状态机也不派生 part id，props 变了由 computed 重算属性
export function useEmptyState(props: EmptyStateProps): EmptyStateContext {
  const api = computed(() => connectEmptyState(props, vueNormalize))
  return { api }
}
