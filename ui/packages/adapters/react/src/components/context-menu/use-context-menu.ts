import type { Layer, Service } from '@xihan-ui/core'
import type { ContextMenuApi, ContextMenuSchema, MenuTreeNode } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectContextMenu, contextMenuMachine, createMenuTreeNode } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface ContextMenuContext extends OverlayWiring {
  service: Service<ContextMenuSchema>
  api: ContextMenuApi
  /** 触发区：收起时焦点归还它，没有光标坐标时它的起始角就是锚点。 */
  triggerRef: RefObject<HTMLElement | null>
  /** 被定位的浮层壳。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 焦点域容器、消解层节点，也是条目集合的查询容器。 */
  contentRef: RefObject<HTMLElement | null>
  /** 子菜单经 Portal 分离后的逻辑父节点。 */
  tree: MenuTreeNode
}

export function useContextMenu(props: ContextMenuSchema['props']): ContextMenuContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<ContextMenuSchema> | null>(null)
  const latestProps = useRef(props)
  latestProps.current = props
  const tree = useMemo(() => createMenuTreeNode({
    getPositioner: () => positionerRef.current,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    close: () => serviceRef.current?.send({ type: 'CLOSE' }),
    isRoot: () => true,
    onRootSelect: details => latestProps.current.onSelect?.(details),
  }), [])

  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'popover',
    // 触发区记为本层分支，展开着再右键可就地换坐标；左键关闭由 connect 在 pointerdown 上收口。
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
      // 定位引擎由适配器注入，机器只经端口驱动；锚点是光标坐标，故无 getAnchorEl
      service.refs.set('position', createPositionEngine() as never)
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getTriggerEl', (() => triggerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
    },
  })

  const service = useMachine(contextMenuMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return {
    ...overlay,
    service,
    api: connectContextMenu(service, reactNormalize),
    triggerRef,
    positionerRef,
    contentRef,
    tree,
  }
}
