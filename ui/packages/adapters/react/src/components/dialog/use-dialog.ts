import type { Layer, Service } from '@xihan-ui/core'
import type { DialogApi, DialogSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectDialog, dialogMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface DialogContext extends OverlayWiring {
  service: Service<DialogSchema>
  api: DialogApi
  contentRef: RefObject<HTMLElement | null>
  backdropRef: RefObject<HTMLElement | null>
}

export function useDialog(props: DialogSchema['props']): DialogContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const contentRef = useRef<HTMLElement | null>(null)
  const backdropRef = useRef<HTMLElement | null>(null)

  // 机器还没建出来，首帧的展开态先按 props 算：与 initialState 同一条判定
  const initialOpen = (props.open ?? props.defaultOpen) ?? false
  // 建好之后进出场跟着机器状态走；渲染期写进 ref，提交后的效应现读
  const serviceRef = useRef<Service<DialogSchema> | null>(null)

  const layer = useCallback((): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
    kind: 'modal',
    branches: () => [],
    isModal: () => props.modal ?? true,
    setModal: () => {},
  }), [props.modal])

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    surfaces: () => [backdropRef.current].filter(Boolean) as Element[],
    additionalExitNodes: () => [backdropRef.current],
    refs: (service) => {
      service.refs.set('getContentEl', (() => contentRef.current) as never)
      service.refs.set('getTriggerEl', (() => null) as never)
      service.refs.set('branches', (() => []) as never)
    },
  })

  const service = useMachine(dialogMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return { ...overlay, service, api: connectDialog(service, reactNormalize), contentRef, backdropRef }
}
