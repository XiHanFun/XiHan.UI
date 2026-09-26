/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use sparkline 相关实现。

import type { Service } from '@xihan-ui/core'
import type { SparklineApi, SparklineSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectSparkline, sparklineMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface SparklineContext {
  api: ComputedRef<SparklineApi>
  service: Service<SparklineSchema>
  /** 根 `<svg>`：尺寸观测的宿主，机器也在它上面读度量私有槽与动效令牌。 */
  rootRef: Ref<SVGSVGElement | null>
}

/** 量测与度量都在状态机的效应里做，DOM 取值口经 refs 交入。 */
export function useSparkline(props: SparklineSchema['props']): SparklineContext {
  const rootRef = ref<SVGSVGElement | null>(null)
  // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
  const service = useMachine(sparklineMachine, () => ({ ...props }))
  service.refs.set('getRootEl', () => rootRef.value)
  service.refs.set('getViewportEl', () => rootRef.value)
  const api = computed(() => connectSparkline(service, vueNormalize))
  return { api, service, rootRef }
}
