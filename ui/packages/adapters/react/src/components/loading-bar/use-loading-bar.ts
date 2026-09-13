/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use loading bar 相关实现。

import type { Service } from '@xihan-ui/core'
import type { LoadingBarApi, LoadingBarSchema } from '@xihan-ui/headless'
import { connectLoadingBar, loadingBarMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface LoadingBarContext {
  api: LoadingBarApi
  service: Service<LoadingBarSchema>
}

export function useLoadingBar(props: LoadingBarSchema['props']): LoadingBarContext {
  const service = useMachine(loadingBarMachine, () => props)
  return { api: connectLoadingBar(service, reactNormalize), service }
}
