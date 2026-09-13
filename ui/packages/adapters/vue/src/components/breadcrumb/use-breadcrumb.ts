/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use breadcrumb 相关实现。

import type { BreadcrumbApi, BreadcrumbProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectBreadcrumb } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface BreadcrumbContext {
  api: ComputedRef<BreadcrumbApi>
}

// Breadcrumb 无状态机也不派生 part id，props 变了由 computed 重算属性
export function useBreadcrumb(props: BreadcrumbProps): BreadcrumbContext {
  const api = computed(() => connectBreadcrumb(props, vueNormalize))
  return { api }
}
