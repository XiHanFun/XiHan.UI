/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use loading bar 相关实现。

import type { LoadingBarApi, LoadingBarSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectLoadingBar, loadingBarMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface LoadingBarContext {
  api: ComputedRef<LoadingBarApi>
}

export function useLoadingBar(
  props: LoadingBarSchema['props'],
  onValueChange?: LoadingBarSchema['props']['onValueChange'],
): LoadingBarContext {
  const service = useMachine(loadingBarMachine, () => ({ ...props, onValueChange }))
  const api = computed(() => connectLoadingBar(service, vueNormalize))
  return { api }
}
