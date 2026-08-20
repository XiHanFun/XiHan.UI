import type { HeatmapApi, HeatmapSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectHeatmap, heatmapMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface HeatmapContext {
  api: ComputedRef<HeatmapApi>
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<HeatmapSchema>
}

// 不建 scope：connect 不派生任何 id
export function useHeatmap(
  props: HeatmapSchema['props'],
  onCellFocus?: HeatmapSchema['props']['onCellFocus'],
  onCellActive?: HeatmapSchema['props']['onCellActive'],
): HeatmapContext {
  const service = useMachine(heatmapMachine, () => ({ ...props, onCellFocus, onCellActive }))
  const api = computed(() => connectHeatmap(service, vueNormalize))
  return { api, service }
}
