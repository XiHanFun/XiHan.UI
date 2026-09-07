import type { Service } from '@xihan-ui/core'
import type { HeatmapApi, HeatmapSchema } from '@xihan-ui/headless'
import { connectHeatmap, heatmapMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface HeatmapContext {
  api: HeatmapApi
  /** 机器实例，供部件上报 DOM 侧的事实。 */
  service: Service<HeatmapSchema>
}

// 不建 scope：connect 不派生任何 id
export function useHeatmap(props: HeatmapSchema['props']): HeatmapContext {
  const service = useMachine(heatmapMachine, () => props)
  return { api: connectHeatmap(service, reactNormalize), service }
}
