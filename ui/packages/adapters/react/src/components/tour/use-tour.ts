import type { Layer, Service } from '@xihan-ui/core'
import type { TourApi, TourSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import type { OverlayWiring } from '../../runtime/use-overlay'
import { connectTour, tourMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlay } from '../../runtime/use-overlay'

export interface TourContext extends OverlayWiring {
  service: Service<TourSchema>
  api: TourApi
  backdropRef: RefObject<HTMLElement | null>
  spotlightRef: RefObject<HTMLElement | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  /** 作者是否要画遮罩。 */
  showBackdrop: boolean
}

export function useTour(props: TourSchema['props'], container?: () => Element | null): TourContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const backdropRef = useRef<HTMLElement | null>(null)
  const spotlightRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  // 建好之后进出场跟着机器状态走；渲染期写进 ref，提交后的 effect 现读。
  const serviceRef = useRef<Service<TourSchema> | null>(null)
  const initialOpen = (props.open ?? props.defaultOpen) ?? false

  const overlay = useOverlay({
    scope,
    idGenerator,
    initialOpen,
    isOpen: () => serviceRef.current?.state.get() === 'open',
    layer: (): Omit<Layer, 'id' | 'node' | 'surfaces'> => ({
      // 引导是模态的：遮罩盖住整页，焦点陷在浮层里。
      kind: 'modal',
      branches: () => [],
      isModal: () => true,
    }),
    node: () => contentRef.current,
    // 遮罩登记为可点关闭的表面，是否真关由 closeOnInteractOutside 决定。
    surfaces: () => [backdropRef.current].filter(Boolean) as Element[],
    // 三张视觉表面都可能有独立的退场动画，任何一张未完成都不能归还行为资源。
    additionalExitNodes: () => [backdropRef.current, spotlightRef.current],
    container,
    refs: (service) => {
      service.refs.set('getFloatingEl', (() => positionerRef.current) as never)
      service.refs.set('getContentEl', (() => contentRef.current) as never)
      // 定位引擎由适配器注入，机器只经端口驱动；锚点由机器按每步 target 自行解析。
      service.refs.set('position', createPositionEngine() as never)
    },
  })

  const service = useMachine(tourMachine, () => props, { scope, onCreate: overlay.onCreate as never })
  serviceRef.current = service
  const api = connectTour(service, reactNormalize)

  return {
    ...overlay,
    service,
    api,
    backdropRef,
    spotlightRef,
    positionerRef,
    contentRef,
    showBackdrop: props.showBackdrop ?? true,
  }
}
