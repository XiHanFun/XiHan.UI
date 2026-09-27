/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use grid list 相关实现。

import type { Service } from '@xihan-ui/core'
import type { GridListApi, GridListSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectGridList, gridListMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface GridListContext {
  api: ComputedRef<GridListApi>
  service: Service<GridListSchema>
}

export function useGridList(
  props: GridListSchema['props'],
  onValueChange?: GridListSchema['props']['onValueChange'],
  onAction?: GridListSchema['props']['onAction'],
): GridListContext {
  const service = useMachine(gridListMachine, () => ({ ...props, onValueChange, onAction }))
  return { api: computed(() => connectGridList(service, vueNormalize)), service }
}
