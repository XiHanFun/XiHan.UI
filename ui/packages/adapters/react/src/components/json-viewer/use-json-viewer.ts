/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use json viewer 相关实现。

import type { Service } from '@xihan-ui/core'
import type { JsonViewerApi, JsonViewerSchema } from '@xihan-ui/headless'
import { connectJsonViewer, jsonViewerMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface JsonViewerContext {
  api: JsonViewerApi
  /** 机器实例，供调用方直接送事件（如从外部展开某一条路径）。 */
  service: Service<JsonViewerSchema>
}

// 不建 scope：connect 不派生任何 id
export function useJsonViewer(props: JsonViewerSchema['props']): JsonViewerContext {
  const service = useMachine(jsonViewerMachine, () => props)
  return { api: connectJsonViewer(service, reactNormalize), service }
}
