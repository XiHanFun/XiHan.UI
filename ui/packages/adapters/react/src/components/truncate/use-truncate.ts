/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use truncate 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TruncateApi, TruncateSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectTruncate, truncateMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface TruncateContext {
  api: TruncateApi
  service: Service<TruncateSchema>
  /** 限制文字的盒子：溢出与文字都测量它。 */
  rootRef: RefObject<HTMLElement | null>
}

/** 测量与监听都在状态机的效应中运行，DOM 取值口经 refs 交入。 */
export function useTruncate(props: TruncateSchema['props']): TruncateContext {
  const rootRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应立刻读 refs 挂观察器，交在 onCreate 里才赶得上；传取值器而非节点，重渲时现取
  const onCreate = useCallback((service: Service<TruncateSchema>) => {
    service.refs.set('getRootEl', (() => rootRef.current) as never)
  }, [])

  const service = useMachine(truncateMachine, () => props, { onCreate })
  return { api: connectTruncate(service, reactNormalize), service, rootRef }
}
