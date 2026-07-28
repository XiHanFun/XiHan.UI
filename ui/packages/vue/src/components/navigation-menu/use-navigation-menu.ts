import type { NavigationMenuApi, NavigationMenuSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectNavigationMenu, navigationMenuMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface NavigationMenuContext {
  api: ComputedRef<NavigationMenuApi>
  service: Service<NavigationMenuSchema>
  /** list 节点：trigger 集合的查询容器，同时是指示条量测的参照系。 */
  listRef: Ref<HTMLElement | null>
}

export function useNavigationMenu(
  props: NavigationMenuSchema['props'],
  onValueChange?: NavigationMenuSchema['props']['onValueChange'],
): NavigationMenuContext {
  const listRef = ref<HTMLElement | null>(null)
  const idGen = createVueIdGenerator()
  // trigger 与 content 要按 value 逐对互指（aria-controls / aria-labelledby），
  // 那些 id 由 scope 派生，因此这里必须自己建一个
  const scope = createScope(null, idGen)
  // onValueChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(navigationMenuMachine, () => ({ ...props, onValueChange }), scope)

  // 指示条的量测在机器的 action 里跑，参照系经 refs 交进去
  service.refs.set('getListEl', () => listRef.value)

  const api = computed(() => connectNavigationMenu(service, vueNormalize))
  return { api, service, listRef }
}
