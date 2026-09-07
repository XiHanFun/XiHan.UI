import type { Layer, Service } from '@xihan-ui/core'
import type { ImageViewerApi, ImageViewerSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectImageViewer, imageViewerMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface ImageViewerContext extends OverlayWiring {
  service: Service<ImageViewerSchema>
  api: ImageViewerApi
  contentRef: RefObject<HTMLElement | null>
  backdropRef: RefObject<HTMLElement | null>
}

/** 看片浮层恒是模态的：遮罩盖住整页，焦点陷在浮层里。 */
function layer(): Omit<Layer, 'id' | 'node' | 'surfaces'> {
  return {
    kind: 'modal',
    branches: () => [],
    isModal: () => true,
    setModal: () => {},
  }
}

export function useImageViewer(props: ImageViewerSchema['props']): ImageViewerContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const contentRef = useRef<HTMLElement | null>(null)
  const backdropRef = useRef<HTMLElement | null>(null)

  // 机器还没建出来，首帧的展开态先按 props 算：与 initialState 同一条判定
  const initialOpen = (props.open ?? props.defaultOpen) ?? false
  // 建好之后进出场跟着机器状态走；渲染期写进 ref，提交后的效应现读
  const serviceRef = useRef<Service<ImageViewerSchema> | null>(null)

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer,
    node: () => contentRef.current,
    // 遮罩登记为可点关闭的表面，是否真关由 closeOnInteractOutside 决定
    surfaces: () => [backdropRef.current].filter(Boolean) as Element[],
    refs: (service) => {
      service.refs.set('getContentEl', (() => contentRef.current) as never)
    },
  })

  const service = useMachine(imageViewerMachine, () => props, {
    scope,
    onCreate: overlay.onCreate as never,
  })
  serviceRef.current = service

  return { ...overlay, service, api: connectImageViewer(service, reactNormalize), contentRef, backdropRef }
}
