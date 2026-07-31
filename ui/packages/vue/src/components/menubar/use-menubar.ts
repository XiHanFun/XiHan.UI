import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { MenubarApi, MenubarSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectMenubar, menubarMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

/** 按 value 登记角色节点，浮层三件套据此取到当前展开那一项。 */
export type MenubarPartRegistry = (value: string, el: HTMLElement | null) => void

export interface MenubarContext {
  service: Service<MenubarSchema>
  api: ComputedRef<MenubarApi>
  rootRef: Ref<HTMLElement | null>
  registerTrigger: MenubarPartRegistry
  registerPositioner: MenubarPartRegistry
  registerContent: MenubarPartRegistry
}

export function useMenubar(
  props: MenubarSchema['props'],
  onValueChange?: MenubarSchema['props']['onValueChange'],
  onSelect?: MenubarSchema['props']['onSelect'],
): MenubarContext {
  const rootRef = ref<HTMLElement | null>(null)
  // 普通 Map 而非响应式，这三份表只在事件与效应里被机器读
  const triggers = new Map<string, HTMLElement>()
  const positioners = new Map<string, HTMLElement>()
  const contents = new Map<string, HTMLElement>()

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(menubarMachine, () => ({ ...props, onValueChange, onSelect }), scope)

  const put = (table: Map<string, HTMLElement>): MenubarPartRegistry => (value, el) => {
    if (el)
      table.set(value, el)
    else
      table.delete(value)
  }
  const current = (table: Map<string, HTMLElement>) => (): HTMLElement | null => {
    const value = service.context.get('value') ?? null
    return value == null ? null : table.get(value) ?? null
  }

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按有无菜单展开驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: current(contents),
      // 整条菜单栏记为本层分支，点 trigger 与掠过换菜单都算层内交互
      branches: () => [rootRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 菜单不带遮罩，没有可点关闭的表面
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getAnchorEl', current(triggers))
    service.refs.set('getFloatingEl', current(positioners))
    service.refs.set('getContentEl', current(contents))
    service.refs.set('getRootEl', () => rootRef.value)
  }

  const api = computed(() => connectMenubar(service, vueNormalize))
  return {
    service,
    api,
    rootRef,
    registerTrigger: put(triggers),
    registerPositioner: put(positioners),
    registerContent: put(contents),
  }
}
