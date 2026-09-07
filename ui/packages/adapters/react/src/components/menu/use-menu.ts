import type { Layer, Service } from '@xihan-ui/core'
import type { MenuApi, MenuSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectMenu, menuMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useRef } from 'react'
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
}

export function useMenu(props: MenuSchema['props']): MenuContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const triggerRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const serviceRef = useRef<Service<MenuSchema> | null>(null)

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
    },
  })

  const service = useMachine(menuMachine, () => props, {
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
  }
}
