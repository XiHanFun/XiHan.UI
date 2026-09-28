/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use diff view 相关实现。

import type { Service } from '@xihan-ui/core'
import type { DiffViewApi, DiffViewSchema } from '@xihan-ui/headless'
import { connectDiffView, diffViewMachine } from '@xihan-ui/headless'
import { useCallback, useState } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

type Props = DiffViewSchema['props']

export interface DiffViewContext {
  service: Service<DiffViewSchema>
  api: DiffViewApi
  /**
   * XhDiffViewHeader 挂载时登记、卸载时撤销。
   * 表格的可访问名据此决定指向头部还是直接用路径：没渲头部时指过去就是一个不存在的 id。
   */
  registerHeader: () => () => void
}

export function useDiffView(props: Props): DiffViewContext {
  const scope = useReactScope()
  const [headerCount, setHeaderCount] = useState(0)
  const registerHeader = useCallback(() => {
    setHeaderCount(n => n + 1)
    return () => setHeaderCount(n => n - 1)
  }, [])
  const service = useMachine(diffViewMachine, () => ({ ...props, labelled: headerCount > 0 }), { scope })
  return { service, api: connectDiffView(service, reactNormalize), registerHeader }
}
