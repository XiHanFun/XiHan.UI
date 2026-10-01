/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color swatch picker 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ColorSwatchPickerApi, ColorSwatchPickerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { colorSwatchPickerMachine, connectColorSwatchPicker } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ColorSwatchPickerContext {
  api: ComputedRef<ColorSwatchPickerApi>
  /** 状态机实例，供部件上报 DOM 侧的事实（如格子卸载带走了焦点）。 */
  service: Service<ColorSwatchPickerSchema>
  /**
   * 已挂载的 label 部件数量，由 XhColorSwatchPickerLabel 自行登记。
   * 根的 aria-labelledby 据此决定输不输出：只看 label 属性有没有值不够，手写格子时标题可能根本没渲染。
   */
  labelCount: Ref<number>
}

export function useColorSwatchPicker(
  props: ColorSwatchPickerSchema['props'],
  onValueChange?: ColorSwatchPickerSchema['props']['onValueChange'],
): ColorSwatchPickerContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const labelCount = ref(0)
  const service = useMachine(colorSwatchPickerMachine, () => ({ ...props, labelled: labelCount.value > 0, onValueChange }), scope)
  const api = computed(() => connectColorSwatchPicker(service, vueNormalize))
  return { api, service, labelCount }
}
