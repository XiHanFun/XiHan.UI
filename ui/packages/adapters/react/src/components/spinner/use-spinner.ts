/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use spinner 相关实现。

import type { SpinnerApi, SpinnerProps } from '@xihan-ui/headless'
import { connectSpinner, spinnerMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface SpinnerContext {
  api: SpinnerApi
}

// 状态机只管露面前的等待；不派生部件 id，用不着 scope
export function useSpinner(props: SpinnerProps): SpinnerContext {
  const service = useMachine(spinnerMachine, () => props)
  return { api: connectSpinner(service, reactNormalize) }
}
