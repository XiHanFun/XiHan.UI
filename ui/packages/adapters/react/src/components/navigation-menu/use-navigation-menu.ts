import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { NavigationMenuApi, NavigationMenuSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectNavigationMenu, navigationMenuMachine } from '@xihan-ui/headless'
import { useCallback, useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface NavigationMenuContext {
  api: NavigationMenuApi
  service: Service<NavigationMenuSchema>
  /** nav 根节点：消解层的层内判定以它为界。 */
  rootRef: RefObject<HTMLElement | null>
  /** list 节点：trigger 集合的查询容器，同时是指示条量测的参照系。 */
  listRef: RefObject<HTMLElement | null>
  /** 运行时配置；服务端没有 DOM 时为 null。面板的退场闸门从它拿 reduce 档。 */
  config: RuntimeConfig | null
}

export function useNavigationMenu(props: NavigationMenuSchema['props']): NavigationMenuContext {
  const idGenerator = useReactIdGenerator()
  // trigger 与 content 要按 value 逐对互指，那些 id 由 scope 派生，故自建一个
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLElement | null>(null)

  // 服务端没有 DOM，也就没有消解层；退场闸门在 config 为 null 时退化成「跟着展开态」
  const config = useMemo(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
  const onCreate = useCallback((service: Service<NavigationMenuSchema>) => {
    // 指示条的量测在机器的 action 里跑，参照系经 refs 交进去
    service.refs.set('getListEl', () => listRef.current)
    if (!config)
      return
    // 只提供注册函数，入栈出栈由机器的 syncLayer 按展开项驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      // 导航只参与 Escape 仲裁与栈顶判定：面板就在文档流里，不陷焦点、不锁滚动、没有遮罩
      kind: 'inline',
      // 整个 nav 都算层内：trigger 与面板都住在里面
      node: () => rootRef.current,
      branches: () => [],
      isModal: () => false,
      surfaces: () => [],
    })
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
  }, [config])

  const service = useMachine(navigationMenuMachine, () => props, { scope, onCreate })

  return {
    api: connectNavigationMenu(service, reactNormalize),
    service,
    rootRef,
    listRef,
    config,
  }
}
