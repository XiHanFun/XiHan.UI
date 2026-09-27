/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use graph chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type { GraphChartApi, GraphChartSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectGraphChart, graphChartMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

/** 对外的回调：由外壳（emit）或组合式调用方提供，随 props 一并喂给机器。 */
export type GraphChartNotifiers = Pick<
  GraphChartSchema['props'],
  'onHiddenSeriesChange' | 'onActiveKeyChange' | 'onDatumActive' | 'onDatumPress'
>

export interface GraphChartContext {
  api: ComputedRef<GraphChartApi>
  service: Service<GraphChartSchema>
  /** 根：机器在它上面读度量私有槽。 */
  rootRef: Ref<HTMLElement | null>
  /** 视口：尺寸观测的宿主。 */
  viewportRef: Ref<HTMLElement | null>
}

/** 量测、度量与文字度量器都在状态机的效应里做，DOM 取值口经 refs 交入。 */
export function useGraphChart(
  props: GraphChartSchema['props'],
  notify?: GraphChartNotifiers,
): GraphChartContext {
  const rootRef = ref<HTMLElement | null>(null)
  const viewportRef = ref<HTMLElement | null>(null)
  // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
  const service = useMachine(graphChartMachine, () => ({ ...props, ...notify }))
  service.refs.set('getRootEl', () => rootRef.value)
  service.refs.set('getViewportEl', () => viewportRef.value)
  const api = computed(() => connectGraphChart(service, vueNormalize))
  return { api, service, rootRef, viewportRef }
}
