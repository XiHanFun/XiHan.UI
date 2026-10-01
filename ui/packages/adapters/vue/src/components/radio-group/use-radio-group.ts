/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use radio group 相关实现。

import type { Service } from '@xihan-ui/core'
import type { RadioGroupApi, RadioGroupSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectRadioGroup, radioGroupMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface RadioGroupContext {
  api: ComputedRef<RadioGroupApi>
  /** 状态机实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<RadioGroupSchema>
  /** root 节点：条目集合的查询容器，同时是 segmented 形态滑块测量的参照系。 */
  rootRef: Ref<HTMLElement | null>
  /**
   * 已挂载的 label 部件数量，由 XhRadioGroupLabel 自行登记。
   * 根的 aria-labelledby 据此决定输不输出：只看 label 属性有没有值不够，手写选项时标题可能根本没渲染。
   */
  labelCount: Ref<number>
}

export function useRadioGroup(
  props: RadioGroupSchema['props'],
  onValueChange?: RadioGroupSchema['props']['onValueChange'],
): RadioGroupContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const rootRef = ref<HTMLElement | null>(null)
  const labelCount = ref(0)
  const service = useMachine(radioGroupMachine, () => ({ ...props, labelled: labelCount.value > 0, onValueChange }), scope)

  // 滑块的量测在机器里跑，DOM 侧的取值口经 refs 交进去
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectRadioGroup(service, vueNormalize))
  return { api, service, rootRef, labelCount }
}
