/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use empty state 相关实现。

import type { EmptyStateApi, EmptyStateProps } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectEmptyState, emptyStateMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useHydratedMount } from '../../runtime/hydration'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface EmptyStateContext {
  api: EmptyStateApi
  /** 根节点：开幕播不播按它出现与否判断。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useEmptyState(props: EmptyStateProps): EmptyStateContext {
  const rootRef = useRef<HTMLElement | null>(null)
  const adopted = useHydratedMount()
  // 出现追踪在机器的挂载效应里取根节点，取值口得赶在那之前交出去
  const service = useMachine(emptyStateMachine, () => props, {
    onCreate: (svc) => {
      svc.refs.set('getRootEl', () => rootRef.current)
      svc.refs.set('adopted', adopted)
    },
  })
  return { api: connectEmptyState(service, reactNormalize), rootRef }
}
