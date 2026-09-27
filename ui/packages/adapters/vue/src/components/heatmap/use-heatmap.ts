/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use heatmap 相关实现。

import type { Service } from '@xihan-ui/core'
import type { HeatmapApi, HeatmapSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectHeatmap, heatmapMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface HeatmapContext {
  api: ComputedRef<HeatmapApi>
  /** 状态机实例，供部件上报 DOM 侧的事实。 */
  service: Service<HeatmapSchema>
  /** 根：过渡的时长与减弱动效从它读。 */
  rootRef: Ref<HTMLElement | null>
}

// 不建 scope：connect 不派生任何 id
export function useHeatmap(
  props: HeatmapSchema['props'],
  onCellFocus?: HeatmapSchema['props']['onCellFocus'],
  onCellActive?: HeatmapSchema['props']['onCellActive'],
): HeatmapContext {
  const rootRef = ref<HTMLElement | null>(null)
  const service = useMachine(heatmapMachine, () => ({ ...props, onCellFocus, onCellActive }))
  service.refs.set('getRootEl', () => rootRef.value)
  const api = computed(() => connectHeatmap(service, vueNormalize))
  return { api, service, rootRef }
}
