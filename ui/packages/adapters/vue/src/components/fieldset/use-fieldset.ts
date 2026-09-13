/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use fieldset 相关实现。

import type { FieldsetApi, FieldsetProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectFieldset } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FieldsetContext {
  api: ComputedRef<FieldsetApi>
}

// Fieldset 无状态机，只用一份实例级 scope 派生 part id，props 变了由 computed 重算属性
export function useFieldset(props: FieldsetProps): FieldsetContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const api = computed(() => connectFieldset(props, scope, vueNormalize))
  return { api }
}
