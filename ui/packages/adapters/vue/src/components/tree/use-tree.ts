/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use tree 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TreeApi, TreeSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTree, treeMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TreeContext {
  /**
   * 已渲染的 label 部件数量，由 XhTreeLabel 在 setup 里同步登记、卸载时撤销。
   * 可聚焦部件的 aria-labelledby 据此决定指不指过去：label 排在输入之前时，首帧与服务端直出就带上名字。
   */
  labelCount: Ref<number>
  api: ComputedRef<TreeApi>
  /** 状态机实例，供部件上报 DOM 侧的事实（如节点卸载带走了焦点）。 */
  service: Service<TreeSchema>
}

export function useTree(
  props: TreeSchema['props'],
  onExpandedValueChange?: TreeSchema['props']['onExpandedValueChange'],
  onSelectionChange?: TreeSchema['props']['onSelectionChange'],
  onNodeMove?: TreeSchema['props']['onNodeMove'],
): TreeContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const labelCount = ref(0)
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  const service = useMachine(
    treeMachine,
    () => ({ ...props, labelled: labelCount.value > 0, onExpandedValueChange, onSelectionChange, onNodeMove }),
    scope,
  )
  const api = computed(() => connectTree(service, vueNormalize))
  return { labelCount, api, service }
}
