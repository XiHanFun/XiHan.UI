/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use number field 相关实现。

import type { NumberFieldApi, NumberFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectNumberField, numberFieldMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface NumberFieldContext {
  api: ComputedRef<NumberFieldApi>
}

export function useNumberField(
  props: NumberFieldSchema['props'],
  onValueChange?: NumberFieldSchema['props']['onValueChange'],
): NumberFieldContext {
  const service = useMachine(numberFieldMachine, () => ({ ...props, onValueChange }))
  const api = computed(() => connectNumberField(service, vueNormalize))
  return { api }
}
