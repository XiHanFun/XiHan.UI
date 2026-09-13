/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use time field 相关实现。

import type { TimeFieldApi, TimeFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTimeField, timeFieldMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TimeFieldContext {
  api: ComputedRef<TimeFieldApi>
}

export function useTimeField(
  props: TimeFieldSchema['props'],
  handlers: Pick<TimeFieldSchema['props'], 'onValueChange'> = {},
): TimeFieldContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(timeFieldMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectTimeField(service, vueNormalize))
  return { api }
}
