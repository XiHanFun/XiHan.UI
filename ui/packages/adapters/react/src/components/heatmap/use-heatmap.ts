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
    // React 的 concurrent root 可能先把首次 DOM 提交给浏览器，再消费挂载效应里由外部 store
    // 触发的入场状态。先只预置「可能入场」这一事实，让首帧格子直接落在填色起点；
    // 挂载效应拿到真实 root 后仍由 Headless 按数据、动效偏好与令牌决定是否保留及何时结束。
    // 没有可画数据时 level 全是 0，不会产生 data-drawing；animated=false 则完全不预置。
    if (service.prop('animated') !== false)
      service.context.set('transition', 'entry')
  }, [])
  const service = useMachine(heatmapMachine, () => props, { onCreate })
  return { api: connectHeatmap(service, reactNormalize), service, rootRef }
}
