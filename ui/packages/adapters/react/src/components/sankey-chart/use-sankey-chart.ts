/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use sankey chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type { SankeyChartApi, SankeyChartSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectSankeyChart, sankeyChartMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SankeyChartContext {
  api: SankeyChartApi
  service: Service<SankeyChartSchema>
  /** 根：机器在它上面读度量私有槽。 */
  rootRef: RefObject<HTMLElement | null>
  /** 视口：尺寸观测的宿主。 */
  viewportRef: RefObject<HTMLElement | null>
}

/** 量测、度量与文字度量器都在状态机的效应里做，DOM 取值口经 refs 交入。 */
export function useSankeyChart(props: SankeyChartSchema['props']): SankeyChartContext {
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLElement | null>(null)

  // 尺寸观测在机器的挂载效应里建，DOM 侧的取值口要赶在那之前交出去
  const onCreate = useCallback((service: Service<SankeyChartSchema>) => {
    service.refs.set('getRootEl', () => rootRef.current)
    service.refs.set('getViewportEl', () => viewportRef.current)
  }, [])

  const service = useMachine(sankeyChartMachine, () => props, { scope, onCreate })
  return { api: connectSankeyChart(service, reactNormalize), service, rootRef, viewportRef }
}
