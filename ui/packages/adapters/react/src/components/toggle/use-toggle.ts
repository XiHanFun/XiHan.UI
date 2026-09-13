/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use toggle 相关实现。

import type { Service } from '@xihan-ui/core'
import type { ToggleApi, ToggleSchema } from '@xihan-ui/headless'
import { connectToggle, toggleMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToggleContext {
  api: ToggleApi
  service: Service<ToggleSchema>
}

export function useToggle(props: ToggleSchema['props']): ToggleContext {
  const service = useMachine(toggleMachine, () => props)
  return { api: connectToggle(service, reactNormalize), service }
}
