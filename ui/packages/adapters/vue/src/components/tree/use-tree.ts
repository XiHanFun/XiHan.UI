import type { TreeApi, TreeSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectTree, treeMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TreeContext {
  api: ComputedRef<TreeApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如节点卸载带走了焦点）。 */
  service: Service<TreeSchema>
}

export function useTree(
  props: TreeSchema['props'],
  onExpandedChange?: TreeSchema['props']['onExpandedChange'],
  onSelectionChange?: TreeSchema['props']['onSelectionChange'],
): TreeContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  const service = useMachine(treeMachine, () => ({ ...props, onExpandedChange, onSelectionChange }), scope)
  const api = computed(() => connectTree(service, vueNormalize))
  return { api, service }
}
