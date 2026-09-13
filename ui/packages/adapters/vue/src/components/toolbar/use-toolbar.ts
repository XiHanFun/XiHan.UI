/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use toolbar 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ToolbarApi, ToolbarSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectToolbar, toolbarMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToolbarContext {
  api: ComputedRef<ToolbarApi>
  /** 机器实例，供条目上报 DOM 侧的事实（卸载带走了焦点）。 */
  service: Service<ToolbarSchema>
}

// 不建 scope：connect 不派生任何 id
export function useToolbar(props: ToolbarSchema['props']): ToolbarContext {
  const service = useMachine(toolbarMachine, () => ({ ...props }))
  const api = computed(() => connectToolbar(service, vueNormalize))
  return { api, service }
}
