/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use grid list 相关实现。

import type { Service } from '@xihan-ui/core'
import type { GridListApi, GridListSchema } from '@xihan-ui/headless'
import { connectGridList, gridListMachine } from '@xihan-ui/headless'
import { useCallback, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface GridListContext {
  /**
   * label 部件挂载时登记、卸载时注销。可聚焦部件的 aria-labelledby 据此决定输不输出；
   * 首帧（含服务端直出）还没登记，不写这条引用。
   */
  registerLabel: () => () => void
  api: GridListApi
  service: Service<GridListSchema>
}

export function useGridList(props: GridListSchema['props']): GridListContext {
  // 用状态而不是 ref：登记数要能把根重渲一次，connect 在渲染期求值
  const [labelCount, setLabelCount] = useState(0)
  const registerLabel = useCallback(() => {
    setLabelCount(n => n + 1)
    return () => setLabelCount(n => n - 1)
  }, [])
  const service = useMachine(gridListMachine, () => ({ ...props, labelled: labelCount > 0 }))
  return { registerLabel, api: connectGridList(service, reactNormalize), service }
}
