import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { SideNavApi, SideNavSchema } from '@xihan-ui/headless'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectSideNav, sideNavMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useMemo } from 'react'
import { useXhConfig } from '../../config/config'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SideNavContext {
  api: SideNavApi
  service: Service<SideNavSchema>
  /** 运行时配置；服务端没有 DOM 时为 null。弹出面板的退场闸门从它拿 reduce 档。 */
  config: RuntimeConfig | null
  /** 弹出面板的定位层搬到哪儿：全局配置 > 运行时配置 > body。 */
  portalContainer: () => Element | null
}

export function useSideNav(props: SideNavSchema['props']): SideNavContext {
  const idGenerator = useReactIdGenerator()
  // 弹出面板的三件套按配对 id 现查，那些 id 由 scope 派生，故自建一个
  const scope = useReactScope()
  const xhConfig = useXhConfig()

  // 服务端没有 DOM、也就没有落点：config 为 null 时浮层退回 body
  const config = useMemo(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
  const onCreate = useCallback((service: Service<SideNavSchema>) => {
    if (!config)
      return
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
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getPopoutAnchorEl', () => popoutEl('trigger'))
    service.refs.set('getPopoutPositionerEl', () => popoutEl('positioner'))
    service.refs.set('getPopoutContentEl', () => popoutEl('content'))
  }, [config, scope])

  const service = useMachine(sideNavMachine, () => props, { scope, onCreate })

  const portalContainer = useCallback(
    () => xhConfig.portalContainer?.() ?? config?.portalContainer() ?? null,
    [xhConfig, config],
  )

  return { api: connectSideNav(service, reactNormalize), service, config, portalContainer }
}
