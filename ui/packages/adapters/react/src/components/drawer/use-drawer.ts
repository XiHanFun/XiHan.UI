import type { Layer, Service } from '@xihan-ui/core'
import type { DrawerApi, DrawerSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectDrawer, drawerMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface DrawerContext extends OverlayWiring {
  service: Service<DrawerSchema>
  api: DrawerApi
  contentRef: RefObject<HTMLElement | null>
  backdropRef: RefObject<HTMLElement | null>
}

export function useDrawer(
  props: DrawerSchema['props'],
  container?: () => Element | null,
): DrawerContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const contentRef = useRef<HTMLElement | null>(null)
  const backdropRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef(props.modal)
  modalRef.current = props.modal

  // 机器还没建出来，首帧的展开态先按 props 算：与 initialState 同一条判定
  const initialOpen = (props.open ?? props.defaultOpen) ?? false
  // 建好之后进出场跟着机器状态走；渲染期写进 ref，提交后的效应现读
  const serviceRef = useRef<Service<DrawerSchema> | null>(null)

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'modal',
    branches: () => [],
    isModal: () => modalRef.current ?? true,
  }), [])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    surfaces: () => [backdropRef.current].filter(Boolean) as Element[],
    additionalExitNodes: () => [backdropRef.current],
    container,
    refs: (service) => {
      service.refs.set('getContentEl', (() => contentRef.current) as never)
      service.refs.set('getTriggerEl', (() => null) as never)
      service.refs.set('branches', (() => []) as never)
    },
  })

  // 容器一处给定，两件事都从它派生：contained 交给机器（皮肤据此把遮罩与定位层
  // 从 fixed 换成 absolute），同一个值又是浮层的落点
  const service = useMachine(drawerMachine, () => ({
    ...props,
    contained: props.contained ?? container?.() != null,
  }), {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return { ...overlay, service, api: connectDrawer(service, reactNormalize), contentRef, backdropRef }
}
