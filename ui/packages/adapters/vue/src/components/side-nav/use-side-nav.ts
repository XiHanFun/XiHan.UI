import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { SideNavApi, SideNavSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectSideNav, sideNavMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface SideNavContext {
  api: ComputedRef<SideNavApi>
  /** 运行时配置；服务端没有 DOM 时为 null。 */
  config: RuntimeConfig | null
  /** 弹出面板的定位层搬到哪儿：全局配置的容器 > 运行时的浮层落点 > body。 */
  portalTarget: ComputedRef<string | Element>
}

export function useSideNav(
  props: SideNavSchema['props'],
  handlers: Pick<SideNavSchema['props'], 'onValueChange' | 'onExpandedValueChange'> = {},
): SideNavContext {
  // scope id 走 Vue 的 useId，保证同页多实例的配对 id 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(sideNavMachine, () => ({ ...props, ...handlers }), scope)
  const xhConfig = useXhConfig()

  // 服务端没有 DOM、也就没有落点：config 为 null 时浮层退回 body
  let runtimeConfig: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
    runtimeConfig = config

    // 弹出面板与触发按钮按当前弹出分支现查：配对 id 由 connect 派生，同一 scope 算得出来
    const popoutEl = (kind: 'trigger' | 'content' | 'positioner'): HTMLElement | null => {
      const v = service.context.get('popoutValue')
      return v == null ? null : document.getElementById(scope.partId('side-nav', `${kind}-${v}`))
    }

    // 只提供注册函数，入栈出栈由机器的 trackPopoutLayer 效应按弹出态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => popoutEl('content'),
      // 触发按钮记为本层分支，点它算层内交互
      branches: () => [popoutEl('trigger')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getPopoutAnchorEl', () => popoutEl('trigger'))
    service.refs.set('getPopoutPositionerEl', () => popoutEl('positioner'))
    service.refs.set('getPopoutContentEl', () => popoutEl('content'))
  }

  const api = computed(() => connectSideNav(service, vueNormalize))
  // 全局配置写了容器就用它，否则落到运行时那个单一浮层落点；没有 DOM 时才回到 body
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? runtimeConfig?.portalContainer() ?? 'body')
  return { api, config: runtimeConfig, portalTarget }
}
