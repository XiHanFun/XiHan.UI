import type { TabsApi, TabsSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTabs, tabsMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TabsContext {
  api: ComputedRef<TabsApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<TabsSchema>
}

export function useTabs(
  props: TabsSchema['props'],
  onValueChange?: TabsSchema['props']['onValueChange'],
): TabsContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(tabsMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectTabs(service, vueNormalize))
  return { api, service }
}
