/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use toolbar 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ToolbarApi, ToolbarSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectToolbar, toolbarMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToolbarContext {
  api: ComputedRef<ToolbarApi>
  /** 状态机实例，供条目上报 DOM 侧的事实（卸载带走了焦点），也喂「更多」菜单的机器 props。 */
  service: Service<ToolbarSchema>
  /** root 节点：条目与「更多」钮的查询容器，也是收纳量测的参照系。 */
  rootRef: Ref<HTMLElement | null>
}

// 不建 scope：connect 不派生任何 id
export function useToolbar(props: ToolbarSchema['props']): ToolbarContext {
  const rootRef = ref<HTMLElement | null>(null)
  const service = useMachine(toolbarMachine, () => ({ ...props }))
  // 收纳量测在机器的挂载效应里跑，取值口要赶在那之前交出去
  service.refs.set('getRootEl', () => rootRef.value)
  const api = computed(() => connectToolbar(service, vueNormalize))
  return { api, service, rootRef }
}
