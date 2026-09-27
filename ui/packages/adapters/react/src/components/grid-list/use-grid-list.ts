/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use grid list 相关实现。

import type { Service } from '@xihan-ui/core'
import type { GridListApi, GridListSchema } from '@xihan-ui/headless'
import { connectGridList, gridListMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface GridListContext {
  api: GridListApi
  service: Service<GridListSchema>
}

export function useGridList(props: GridListSchema['props']): GridListContext {
  const service = useMachine(gridListMachine, () => props)
  return { api: connectGridList(service, reactNormalize), service }
}
