import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { NavigationMenuApi, NavigationMenuSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectNavigationMenu, navigationMenuMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface NavigationMenuContext {
  api: ComputedRef<NavigationMenuApi>
  service: Service<NavigationMenuSchema>
  /** nav 根节点：消解层的层内判定以它为界。 */
  rootRef: Ref<HTMLElement | null>
  /** list 节点：trigger 集合的查询容器，同时是指示条量测的参照系。 */
  listRef: Ref<HTMLElement | null>
}

export function useNavigationMenu(
  props: NavigationMenuSchema['props'],
  onValueChange?: NavigationMenuSchema['props']['onValueChange'],
): NavigationMenuContext {
  const rootRef = ref<HTMLElement | null>(null)
  const listRef = ref<HTMLElement | null>(null)
  const idGen = createVueIdGenerator()
  // trigger 与 content 要按 value 逐对互指，那些 id 由 scope 派生，故自建一个
  const scope = createScope(null, idGen)
  const service = useMachine(navigationMenuMachine, () => ({ ...props, onValueChange }), scope)

  // 指示条的量测在机器的 action 里跑，参照系经 refs 交进去
  service.refs.set('getListEl', () => listRef.value)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 syncLayer 按展开项驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      // 导航只参与 Escape 仲裁与栈顶判定：面板就在文档流里，不陷焦点、不锁滚动、没有遮罩
      kind: 'inline',
      // 整个 nav 都算层内：trigger 与面板都住在里面
      node: () => rootRef.value,
      branches: () => [],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
  }

  const api = computed(() => connectNavigationMenu(service, vueNormalize))
  return { api, service, rootRef, listRef }
}
