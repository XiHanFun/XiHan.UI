/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use loading bar 相关实现。

import type { LoadingBarApi, LoadingBarSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectLoadingBar, loadingBarMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface LoadingBarContext {
  api: ComputedRef<LoadingBarApi>
}

export function useLoadingBar(
  props: LoadingBarSchema['props'],
  onValueChange?: LoadingBarSchema['props']['onValueChange'],
): LoadingBarContext {
  // 根部件带 id（机器按它等淡出过渡）：用 Vue 的 useId 派生的 scope，服务端与水合两侧同号
  const service = useMachine(loadingBarMachine, () => ({ ...props, onValueChange }), createScope(null, createVueIdGenerator()))
  const api = computed(() => connectLoadingBar(service, vueNormalize))
  return { api }
}
