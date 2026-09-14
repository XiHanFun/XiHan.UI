/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color swatch picker 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ColorSwatchPickerApi, ColorSwatchPickerSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { colorSwatchPickerMachine, connectColorSwatchPicker } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ColorSwatchPickerContext {
  api: ComputedRef<ColorSwatchPickerApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如格子卸载带走了焦点）。 */
  service: Service<ColorSwatchPickerSchema>
}

export function useColorSwatchPicker(
  props: ColorSwatchPickerSchema['props'],
  onValueChange?: ColorSwatchPickerSchema['props']['onValueChange'],
): ColorSwatchPickerContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(colorSwatchPickerMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectColorSwatchPicker(service, vueNormalize))
  return { api, service }
}
