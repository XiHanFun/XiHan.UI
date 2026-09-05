import type { Service } from '@xihan-ui/core'
import type { TabsApi, TabsSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTabs, tabsMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TabsContext {
  api: ComputedRef<TabsApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<TabsSchema>
  /** list 节点：标签集合的查询容器，同时是指示条量测的参照系。 */
  listRef: Ref<HTMLElement | null>
}

export function useTabs(
  props: TabsSchema['props'],
  onValueChange?: TabsSchema['props']['onValueChange'],
  onTabMove?: TabsSchema['props']['onTabMove'],
  onTabClose?: TabsSchema['props']['onTabClose'],
): TabsContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const listRef = ref<HTMLElement | null>(null)
  const service = useMachine(tabsMachine, () => ({ ...props, onValueChange, onTabMove, onTabClose }), scope)
  // 指示条量测在机器的 action 里跑，DOM 侧的取值口经 refs 交进去
  service.refs.set('getListEl', () => listRef.value)
  const api = computed(() => connectTabs(service, vueNormalize))
  return { api, service, listRef }
}
