/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use listbox 相关实现。

import type { PropTypes, Service } from '@xihan-ui/core'
import type { ListboxApi, ListboxSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectListbox, listboxMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ListboxContext {
  /**
   * 已渲染的 label 部件数量，由 XhListboxLabel 在 setup 里同步登记、卸载时撤销。
   * 可聚焦部件的 aria-labelledby 据此决定指不指过去：label 排在输入之前时，首帧与服务端直出就带上名字。
   */
  labelCount: Ref<number>
  /** 值按 unknown 交：根组件按作者的值类型推断 V，部件之间只是转手。 */
  api: ComputedRef<ListboxApi<PropTypes, unknown>>
  /** 状态机实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<ListboxSchema>
}

export function useListbox(
  props: ListboxSchema['props'],
  onValueChange?: ListboxSchema['props']['onValueChange'],
): ListboxContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  const labelCount = ref(0)
  const service = useMachine(listboxMachine, () => ({ ...props, labelled: labelCount.value > 0, onValueChange }), scope)
  const api = computed(() => connectListbox<PropTypes, unknown>(service, vueNormalize))
  return { labelCount, api, service }
}
