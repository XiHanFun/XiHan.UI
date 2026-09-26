/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use sparkline 相关实现。

import type { Service } from '@xihan-ui/core'
import type { SparklineApi, SparklineSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectSparkline, sparklineMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SparklineContext {
  api: SparklineApi
  service: Service<SparklineSchema>
  /** 根 `<svg>`：尺寸观测的宿主，机器也在它上面读度量私有槽与动效令牌。 */
  rootRef: RefObject<SVGSVGElement | null>
}

/** 量测与度量都在状态机的效应里做，DOM 取值口经 refs 交入。 */
export function useSparkline(props: SparklineSchema['props']): SparklineContext {
  const scope = useReactScope()
  const rootRef = useRef<SVGSVGElement | null>(null)

  // 尺寸观测在机器的挂载效应里建，DOM 侧的取值口要赶在那之前交出去
  const onCreate = useCallback((service: Service<SparklineSchema>) => {
    service.refs.set('getRootEl', () => rootRef.current)
    service.refs.set('getViewportEl', () => rootRef.current)
  }, [])

  const service = useMachine(sparklineMachine, () => props, { scope, onCreate })
  return { api: connectSparkline(service, reactNormalize), service, rootRef }
}
