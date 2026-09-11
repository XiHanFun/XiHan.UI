import type { Cleanup, Layer, Service } from '@xihan-ui/core'
import type { TourApi, TourSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectTour, tourMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useMemo, useRef } from 'react'
import { useXhConfig } from '../../config/config'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

export interface TourContext {
  service: Service<TourSchema>
  api: TourApi
  backdropRef: RefObject<HTMLElement | null>
  positionerRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  /** 此刻该不该可见：收起那一帧押后到退场动画播完；遮罩、高亮框与定位层跟它一起收。 */
  visible: boolean
  /** 作者是否要画遮罩。 */
  showBackdrop: boolean
  /** 浮层搬到哪儿：全局配置 > 运行时配置 > body。 */
  portalContainer: () => Element | null
}

export function useTour(props: TourSchema['props']): TourContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const xhConfig = useXhConfig()
  const backdropRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  // 服务端没有 DOM、也就没有落点：config 为 null 时浮层退回 body
  const config = useMemo(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
  const onCreate = useCallback((service: Service<TourSchema>) => {
    // 元素 getter 在无 DOM 环境下也要设：连接层与效应经它们取节点
    service.refs.set('getFloatingEl', () => positionerRef.current)
    service.refs.set('getContentEl', () => contentRef.current)
    if (!config)
      return
    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      // 引导是模态的：遮罩盖住整页，焦点陷在浮层里
      kind: 'modal',
      node: () => contentRef.current,
      branches: () => [],
      isModal: () => true,
      // 遮罩登记为可点关闭的表面，是否真关由 closeOnInteractOutside 决定
      surfaces: () => [backdropRef.current].filter(Boolean) as Element[],
    })
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    // 定位引擎由适配器注入，机器只经端口驱动；锚点由机器按每步 target 自行解析
    service.refs.set('position', createPositionEngine())
  }, [config])

  const service = useMachine(tourMachine, () => props, { scope, onCreate })
  const api = connectTour(service, reactNormalize)

  // 退场闸门：收起从跟着展开态走，改成跟着 presence 走。
  // 取值器每帧换、闸门只建一次：现读这一帧的 api
  const latest = useRef(api)
  latest.current = api
  const visible = useOverlayExit({ config, isOpen: () => latest.current.open, contentRef })

  const portalContainer = useCallback(
    () => xhConfig.portalContainer?.() ?? config?.portalContainer() ?? null,
    [xhConfig, config],
  )

  return {
    service,
    api,
    backdropRef,
    positionerRef,
    contentRef,
    visible,
    showBackdrop: props.showBackdrop ?? true,
    portalContainer,
  }
}
