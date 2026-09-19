/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use breadcrumb 相关实现。

import type { Service } from '@xihan-ui/core'
import type { BreadcrumbApi, BreadcrumbSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { breadcrumbMachine, connectBreadcrumb } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface BreadcrumbContext {
  api: ComputedRef<BreadcrumbApi>
  service: Service<BreadcrumbSchema>
}

// Breadcrumb 不派生 part id，故不另建 scope；机器只承载按压通道，属性仍随 props 由 computed 重算
export function useBreadcrumb(props: BreadcrumbSchema['props']): BreadcrumbContext {
  const service = useMachine(breadcrumbMachine, () => ({ ...props }))
  const api = computed(() => connectBreadcrumb(service, vueNormalize))
  return { api, service }
}
