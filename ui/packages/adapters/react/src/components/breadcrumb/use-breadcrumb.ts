/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use breadcrumb 相关实现。

import type { Service } from '@xihan-ui/core'
import type { BreadcrumbApi, BreadcrumbSchema } from '@xihan-ui/headless'
import { breadcrumbMachine, connectBreadcrumb } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface BreadcrumbContext {
  api: BreadcrumbApi
  service: Service<BreadcrumbSchema>
}

// Breadcrumb 不派生部件 id，故不另建 scope；机器只承载按压通道，属性仍随 props 整份重算
export function useBreadcrumb(props: BreadcrumbSchema['props']): BreadcrumbContext {
  const service = useMachine(breadcrumbMachine, () => props)
  return { api: connectBreadcrumb(service, reactNormalize), service }
}
