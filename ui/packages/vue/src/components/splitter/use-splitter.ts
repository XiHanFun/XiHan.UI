import type { SplitterApi, SplitterSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectSplitter, splitterMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SplitterContext {
  api: ComputedRef<SplitterApi>
  service: Service<SplitterSchema>
  /** 容器节点，机器在拖拽开始时拿它量矩形。 */
  rootRef: Ref<HTMLElement | null>
}

export function useSplitter(
  props: SplitterSchema['props'],
  onSizeChange?: SplitterSchema['props']['onSizeChange'],
  onSizeChangeEnd?: SplitterSchema['props']['onSizeChangeEnd'],
): SplitterContext {
  const rootRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(splitterMachine, () => ({ ...props, onSizeChange, onSizeChangeEnd }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectSplitter(service, vueNormalize))
  return { api, service, rootRef }
}
