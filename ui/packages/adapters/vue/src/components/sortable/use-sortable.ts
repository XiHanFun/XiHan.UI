import type { Service } from '@xihan-ui/core'
import type { SortableApi, SortableSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectSortable, sortableMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SortableContext {
  api: ComputedRef<SortableApi>
  service: Service<SortableSchema>
  /** 容器节点，机器在拾起时拿它找项、量矩形。 */
  rootRef: Ref<HTMLElement | null>
}

export function useSortable(
  props: SortableSchema['props'],
  onSort?: SortableSchema['props']['onSort'],
  onDragStart?: SortableSchema['props']['onDragStart'],
  onDragEnd?: SortableSchema['props']['onDragEnd'],
): SortableContext {
  const rootRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(sortableMachine, () => ({ ...props, onSort, onDragStart, onDragEnd }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectSortable(service, vueNormalize))
  return { api, service, rootRef }
}
