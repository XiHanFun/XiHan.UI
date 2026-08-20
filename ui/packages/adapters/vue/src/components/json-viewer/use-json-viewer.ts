import type { JsonViewerApi, JsonViewerSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectJsonViewer, jsonViewerMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface JsonViewerContext {
  api: ComputedRef<JsonViewerApi>
  /** 机器实例，供调用方直接送事件（如从外部展开某一条路径）。 */
  service: Service<JsonViewerSchema>
}

// 不建 scope：connect 不派生任何 id
export function useJsonViewer(
  props: JsonViewerSchema['props'],
  onExpandedChange?: JsonViewerSchema['props']['onExpandedChange'],
): JsonViewerContext {
  const service = useMachine(jsonViewerMachine, () => ({ ...props, onExpandedChange }))
  const api = computed(() => connectJsonViewer(service, vueNormalize))
  return { api, service }
}
