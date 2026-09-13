/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use icon 相关实现。

import type { IconApi, IconProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectIcon } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface IconContext {
  api: ComputedRef<IconApi>
}

// Icon 无状态机也不派生 part id，props 变了由 computed 重算属性
export function useIcon(props: IconProps): IconContext {
  const api = computed(() => connectIcon(props, vueNormalize))
  return { api }
}
