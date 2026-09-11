import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { MenubarApi, MenubarSchema, MenuTreeNode } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectMenubar, createMenuTreeNode, menubarMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useMemo, useRef } from 'react'
import { useXhConfig } from '../../config/config'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

/** 按 value 登记角色节点，浮层三件套据此取到当前展开那一项。 */
export type MenubarPartRegistry = (value: string, el: HTMLElement | null) => void

export interface MenubarContext {
  service: Service<MenubarSchema>
  api: MenubarApi
  rootRef: RefObject<HTMLElement | null>
  /** 对应菜单的真实触发器；Portal 在提交期读取这只逻辑锚点。 */
  getTrigger: (value: string) => HTMLElement | null
  registerTrigger: MenubarPartRegistry
  registerPositioner: MenubarPartRegistry
  registerContent: MenubarPartRegistry
  /** 子菜单经 Portal 分离后的逻辑父节点。 */
  tree: MenuTreeNode
  /** 运行时配置；服务端没有 DOM 时为 null。每张菜单的退场闸门从它拿 reduce 档。 */
  config: RuntimeConfig | null
  /** 浮层搬到哪儿：全局配置 > 运行时配置 > body。 */
  portalContainer: () => Element | null
}

export function useMenubar(props: MenubarSchema['props']): MenubarContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const xhConfig = useXhConfig()
  const rootRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<MenubarSchema> | null>(null)
  const latestProps = useRef(props)
  latestProps.current = props

  // 普通 Map 而非状态，这三份表只在事件与效应里被机器读
  const registry = useMemo(() => {
    const triggers = new Map<string, HTMLElement>()
    const positioners = new Map<string, HTMLElement>()
    const contents = new Map<string, HTMLElement>()
    const put = (table: Map<string, HTMLElement>): MenubarPartRegistry => (value, el) => {
      if (el)
        table.set(value, el)
      else
        table.delete(value)
    }
    return {
      triggers,
      positioners,
      contents,
      registerTrigger: put(triggers),
      registerPositioner: put(positioners),
      registerContent: put(contents),
    }
  }, [])

  // 服务端没有 DOM，也就没有定位与消解层；退场闸门在 config 为 null 时退化成「跟着展开态」
  const config = useMemo(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  const tree = useMemo(() => createMenuTreeNode({
    getPositioner: () => {
      const value = serviceRef.current?.context.get('value') ?? null
      return value == null ? null : registry.positioners.get(value) ?? null
    },
    isOpen: () => serviceRef.current?.state.get() === 'open',
    close: () => serviceRef.current?.send({ type: 'CLOSE' }),
    isRoot: () => true,
    onRootSelect: (details) => {
      const menu = serviceRef.current?.context.get('value') ?? null
      if (menu != null)
        latestProps.current.onSelect?.({ menu, value: details.value })
    },
  }), [registry])

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
  const onCreate = useCallback((service: Service<MenubarSchema>) => {
    const current = (table: Map<string, HTMLElement>) => (): HTMLElement | null => {
      const value = service.context.get('value') ?? null
      return value == null ? null : table.get(value) ?? null
    }
    service.refs.set('getAnchorEl', current(registry.triggers))
    service.refs.set('getFloatingEl', current(registry.positioners))
    service.refs.set('getContentEl', current(registry.contents))
    service.refs.set('getRootEl', () => rootRef.current)
    if (!config)
      return
    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按有无菜单展开驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: current(registry.contents),
      // 整条菜单栏记为本层分支，点 trigger 与掠过换菜单都算层内交互
      branches: () => [rootRef.current].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 菜单不带遮罩，没有可点关闭的表面
      surfaces: () => [],
    })
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    // 定位引擎由适配器注入，机器只经端口驱动
    service.refs.set('position', createPositionEngine())
  }, [config, registry])

  const service = useMachine(menubarMachine, () => props, { scope, onCreate })
  serviceRef.current = service

  const portalContainer = useCallback(
    () => xhConfig.portalContainer?.() ?? config?.portalContainer() ?? null,
    [xhConfig, config],
  )

  return {
    service,
    api: connectMenubar(service, reactNormalize),
    rootRef,
    getTrigger: value => registry.triggers.get(value) ?? null,
    registerTrigger: registry.registerTrigger,
    registerPositioner: registry.registerPositioner,
    registerContent: registry.registerContent,
    tree,
    config,
    portalContainer,
  }
}
