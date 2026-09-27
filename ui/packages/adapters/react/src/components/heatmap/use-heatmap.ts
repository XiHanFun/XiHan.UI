/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use heatmap 相关实现。

import type { Service } from '@xihan-ui/core'
import type { HeatmapApi, HeatmapSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectHeatmap, heatmapMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface HeatmapContext {
  api: HeatmapApi
  /** 状态机实例，供部件上报 DOM 侧的事实。 */
  service: Service<HeatmapSchema>
  /** 根：过渡的时长与减弱动效从它读。 */
  rootRef: RefObject<HTMLElement | null>
}

// 不建 scope：connect 不派生任何 id
export function useHeatmap(props: HeatmapSchema['props']): HeatmapContext {
  const rootRef = useRef<HTMLElement | null>(null)
  // 过渡在机器的挂载效应里核对，根的取值口要赶在那之前交出去
  const onCreate = useCallback((service: Service<HeatmapSchema>) => {
    service.refs.set('getRootEl', () => rootRef.current)
  }, [])
  const service = useMachine(heatmapMachine, () => props, { onCreate })
  return { api: connectHeatmap(service, reactNormalize), service, rootRef }
}
