/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use breadcrumb 相关实现。

import type { BreadcrumbApi, BreadcrumbProps } from '@xihan-ui/headless'
import { connectBreadcrumb } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'

export interface BreadcrumbContext {
  api: BreadcrumbApi
}

// Breadcrumb 没有状态机也不派生部件 id，props 变了就整份重算属性
export function useBreadcrumb(props: BreadcrumbProps): BreadcrumbContext {
  return { api: connectBreadcrumb(props, reactNormalize) }
}
