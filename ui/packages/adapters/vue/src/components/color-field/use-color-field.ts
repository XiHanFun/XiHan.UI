/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color field 相关实现。

import type { ColorFieldApi, ColorFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { colorFieldMachine, connectColorField } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ColorFieldContext {
  api: ComputedRef<ColorFieldApi>
}

export function useColorField(
  props: ColorFieldSchema['props'],
  onValueChange?: ColorFieldSchema['props']['onValueChange'],
): ColorFieldContext {
  const service = useMachine(colorFieldMachine, () => ({ ...props, onValueChange }))
  const api = computed(() => connectColorField(service, vueNormalize))
  return { api }
}
