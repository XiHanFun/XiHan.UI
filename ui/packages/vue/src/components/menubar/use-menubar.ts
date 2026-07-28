import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { MenubarApi, MenubarSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectMenubar, menubarMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

/** 按 value 登记角色节点：菜单栏有多张菜单，浮层三件套都要按"当前展开的那一项"取。 */
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
  // 普通 Map 就够：这三份表只被机器的 refs（惰性 getter）读，读的时机都在事件与效应里，
  // 不参与渲染依赖。做成响应式反而会让每次登记都排一轮无意义的重渲。
  const triggers = new Map<string, HTMLElement>()
  const positioners = new Map<string, HTMLElement>()
  const contents = new Map<string, HTMLElement>()

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 两个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
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

    // 只给注册函数、不在这里注册：层的入栈出栈跟着"有没有菜单展开"走（机器的 trackLayer 效应负责）。
    // 挂载期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: current(contents),
      // 整条菜单栏记为本层分支：点 trigger、在 trigger 之间走、掠过换菜单都是层内交互，
      // 开合归菜单栏自己切换。交给消解层判的话，一次点击会先被判成层外交互关一次、
      // 再被 click 打开一次，菜单等于关不掉。
      branches: () => [rootRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 菜单不带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createFloatingUiPositionEngine())
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
