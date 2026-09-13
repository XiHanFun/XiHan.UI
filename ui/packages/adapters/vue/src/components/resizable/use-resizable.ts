/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use resizable 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ResizableApi, ResizableSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectResizable, resizableMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ResizableContext {
  api: ComputedRef<ResizableApi>
  service: Service<ResizableSchema>
  /** 容器节点，机器在按下时拿它量矩形。 */
  rootRef: Ref<HTMLElement | null>
}

export function useResizable(
  props: ResizableSchema['props'],
  onDimensionsChange?: ResizableSchema['props']['onDimensionsChange'],
  onDimensionsChangeEnd?: ResizableSchema['props']['onDimensionsChangeEnd'],
): ResizableContext {
  const rootRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(resizableMachine, () => ({ ...props, onDimensionsChange, onDimensionsChangeEnd }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectResizable(service, vueNormalize))
  return { api, service, rootRef }
}
