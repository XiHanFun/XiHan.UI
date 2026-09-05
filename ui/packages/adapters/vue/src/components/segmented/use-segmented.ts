import type { Service } from '@xihan-ui/core'
import type { SegmentedApi, SegmentedSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectSegmented, segmentedMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface SegmentedContext {
  api: ComputedRef<SegmentedApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<SegmentedSchema>
  /** root 节点：条目集合的查询容器，同时是指示器量测的参照系。 */
  rootRef: Ref<HTMLElement | null>
}

// 不建 scope：connect 不派生任何 id
export function useSegmented(
  props: SegmentedSchema['props'],
  onValueChange?: SegmentedSchema['props']['onValueChange'],
): SegmentedContext {
  const rootRef = ref<HTMLElement | null>(null)
  const service = useMachine(segmentedMachine, () => ({ ...props, onValueChange }))

  // 指示器的量测在机器里跑，DOM 侧的取值口经 refs 交进去
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectSegmented(service, vueNormalize))
  return { api, service, rootRef }
}
