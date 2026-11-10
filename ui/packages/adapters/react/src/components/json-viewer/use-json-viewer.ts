/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use json viewer 相关实现。

import type { Service } from '@xihan-ui/core'
import type { JsonViewerApi, JsonViewerSchema } from '@xihan-ui/headless'
import { connectJsonViewer, jsonViewerMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface JsonViewerContext {
  api: JsonViewerApi
  /** 状态机实例，供调用方直接发送事件（如从外部展开某一条路径）。 */
  service: Service<JsonViewerSchema>
}

// 根与树的 id 由 scope 派生：子层的高度补间与按键导航按 id 找到它们，服务端与客户端得出同一个号
export function useJsonViewer(props: JsonViewerSchema['props']): JsonViewerContext {
  const scope = useReactScope()
  const service = useMachine(jsonViewerMachine, () => props, { scope })
  return { api: connectJsonViewer(service, reactNormalize), service }
}
