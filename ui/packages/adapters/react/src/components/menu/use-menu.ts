import type { Layer, Service } from '@xihan-ui/core'
import type { MenuApi, MenuSchema, MenuTreeNode } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectMenu, createMenuTreeNode, menuMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useMemo, useRef } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface MenuContext extends OverlayWiring {
  service: Service<MenuSchema>
  api: MenuApi
  /** 定位锚点，普通菜单是 trigger、子菜单是那条触发条目。 */
  triggerRef: RefObject<HTMLElement | null>
  /** 被定位的浮层壳。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 焦点域容器、消解层节点，也是条目集合的查询容器。 */
  contentRef: RefObject<HTMLElement | null>
  /** Portal 之外的逻辑父子、悬停区域与选择收链由 headless 节点统一维护。 */
  tree: MenuTreeNode
}

function useMenuImpl(props: MenuSchema['props'], treeParent?: MenuTreeNode): MenuContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<MenuSchema> | null>(null)
  const latestProps = useRef(props)
  latestProps.current = props
  const tree = useMemo(() => createMenuTreeNode({
    getPositioner: () => positionerRef.current,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    close: () => serviceRef.current?.send({ type: 'CLOSE' }),
    isRoot: () => !(serviceRef.current?.prop('submenu') ?? latestProps.current.submenu),
    onRootSelect: details => latestProps.current.onSelect?.(details),
  }), [])

  useIsomorphicLayoutEffect(
    () => treeParent?.registerChild(tree),
    [treeParent, tree],
  )

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // trigger 记为本层分支，点它算层内交互；
    // 浮层壳一并记上：条目列表之外还浮着自绘滚动条，按住它拖动不该把菜单消解掉
    branches: () => [triggerRef.current, positionerRef.current].filter(Boolean) as Element[],
    isModal: () => false,
    setModal: () => {},
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    refs: (service) => {
      // 定位引擎由适配器注入，机器只经端口驱动
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getAnchorEl', (() => triggerRef.current) as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
      service.refs.set('getHoverBranches', tree.getHoverBranches as never)
    },
  })

  const service = useMachine(menuMachine, () => treeParent ? { ...props, onSelect: tree.select } : props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return {
    ...overlay,
    service,
    api: connectMenu(service, reactNormalize),
    triggerRef,
    positionerRef,
    contentRef,
    tree,
  }
}

/** 公开 hook：建立一棵独立菜单树。 */
export function useMenu(props: MenuSchema['props']): MenuContext {
  return useMenuImpl(props)
}

/** 组合部件内部入口：把子菜单连接到 headless 逻辑树。 */
export function useMenuWithParent(
  props: MenuSchema['props'],
  treeParent: MenuTreeNode,
): MenuContext {
  return useMenuImpl(props, treeParent)
}
