/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use checkbox group 相关实现。

import type { PropTypes, Service } from '@xihan-ui/core'
import type { CheckboxGroupApi, CheckboxGroupSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { checkboxGroupMachine, connectCheckboxGroup } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CheckboxGroupContext {
  /** 值按 unknown 交：根组件按作者的值类型推断 V，部件之间只是转手。 */
  api: ComputedRef<CheckboxGroupApi<PropTypes, unknown>>
  service: Service<CheckboxGroupSchema>
  /**
   * 已挂载的 label 部件数量，由 XhCheckboxGroupLabel 自行登记。
   * 根的 aria-labelledby 据此决定输不输出：只看 label 属性有没有值不够，手写选项时标题可能根本没渲染。
   */
  labelCount: Ref<number>
}

export function useCheckboxGroup(
  props: CheckboxGroupSchema['props'],
  onValueChange?: CheckboxGroupSchema['props']['onValueChange'],
): CheckboxGroupContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onValueChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const labelCount = ref(0)
  const service = useMachine(checkboxGroupMachine, () => ({ ...props, labelled: labelCount.value > 0, onValueChange }), scope)
  const api = computed(() => connectCheckboxGroup<PropTypes, unknown>(service, vueNormalize))
  return { api, service, labelCount }
}
