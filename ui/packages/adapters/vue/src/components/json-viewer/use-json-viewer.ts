/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use json viewer 相关实现。

import type { Service } from '@xihan-ui/core'
import type { JsonViewerApi, JsonViewerSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectJsonViewer, jsonViewerMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface JsonViewerContext {
  api: ComputedRef<JsonViewerApi>
  /** 状态机实例，供调用方直接发送事件（如从外部展开某一条路径）。 */
  service: Service<JsonViewerSchema>
}

// 不建 scope：connect 不派生任何 id
export function useJsonViewer(
  props: JsonViewerSchema['props'],
  onExpandedValueChange?: JsonViewerSchema['props']['onExpandedValueChange'],
): JsonViewerContext {
  const service = useMachine(jsonViewerMachine, () => ({ ...props, onExpandedValueChange }))
  const api = computed(() => connectJsonViewer(service, vueNormalize))
  return { api, service }
}
