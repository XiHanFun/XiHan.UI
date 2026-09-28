/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use spinner 相关实现。

import type { SpinnerApi, SpinnerProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectSpinner, spinnerMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface SpinnerContext {
  api: ComputedRef<SpinnerApi>
}

// 状态机只管露面前的等待；props 每帧现展开，改了文案与轴 computed 照常重算
export function useSpinner(props: SpinnerProps): SpinnerContext {
  const service = useMachine(spinnerMachine, () => ({ ...props }))
  const api = computed(() => connectSpinner(service, vueNormalize))
  return { api }
}
