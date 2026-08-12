import type { SideNavApi, SideNavSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectSideNav, sideNavMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SideNavContext {
  api: ComputedRef<SideNavApi>
}

export function useSideNav(
  props: SideNavSchema['props'],
  handlers: Pick<SideNavSchema['props'], 'onValueChange' | 'onExpandedChange'> = {},
): SideNavContext {
  // scope id 走 Vue 的 useId，保证同页多实例的配对 id 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(sideNavMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectSideNav(service, vueNormalize))
  return { api }
}
