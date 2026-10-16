/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use color field 相关实现。

import type { ColorFieldApi, ColorFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { colorFieldMachine, connectColorField } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ColorFieldContext {
  /**
   * 已渲染的 label 部件数量，由 XhColorFieldLabel 在 setup 里同步登记、卸载时撤销。
   * 可聚焦部件的 aria-labelledby 据此决定指不指过去：label 排在输入之前时，首帧与服务端直出就带上名字。
   */
  labelCount: Ref<number>
  api: ComputedRef<ColorFieldApi>
}

export function useColorField(
  props: ColorFieldSchema['props'],
  onValueChange?: ColorFieldSchema['props']['onValueChange'],
): ColorFieldContext {
  const labelCount = ref(0)
  const service = useMachine(colorFieldMachine, () => ({ ...props, labelled: labelCount.value > 0, onValueChange }))
  const api = computed(() => connectColorField(service, vueNormalize))
  return { labelCount, api }
}
