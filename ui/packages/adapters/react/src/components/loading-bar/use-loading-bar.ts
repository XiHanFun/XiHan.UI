/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use loading bar 相关实现。

import type { Service } from '@xihan-ui/core'
import type { LoadingBarApi, LoadingBarSchema } from '@xihan-ui/headless'
import { connectLoadingBar, loadingBarMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface LoadingBarContext {
  api: LoadingBarApi
  service: Service<LoadingBarSchema>
}

export function useLoadingBar(props: LoadingBarSchema['props']): LoadingBarContext {
  // 根部件带 id（机器按它等淡出过渡）：用 useId 派生的 scope，服务端与水合两侧同号
  const service = useMachine(loadingBarMachine, () => props, { scope: useReactScope() })
  return { api: connectLoadingBar(service, reactNormalize), service }
}
