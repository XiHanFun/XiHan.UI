import type { Cleanup, Layer, Service } from '@xihan-ui/core'
import type { PaginationApi, PaginationSchema, SelectSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectPagination, paginationMachine, paginationPageSizeSelectProps, selectMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { useCallback, useMemo, useRef } from 'react'
import { useXhConfig } from '../../config/config'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

export interface PaginationContext {
  api: PaginationApi
  service: Service<PaginationSchema>
  /** 稳定的视觉来源：省略位尚未出现时，浮层壳仍从真实 Pagination 根继承局部轴。 */
  rootRef: RefObject<HTMLElement | null>
  /** 摊开的那个省略位，定位锚点。 */
  ellipsisRef: RefObject<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: RefObject<HTMLElement | null>
  /** 消解层节点。 */
  contentRef: RefObject<HTMLElement | null>
  /** 此刻该不该渲染：退场动画播完之前仍为真。 */
  visible: boolean
  /** 浮层搬到哪儿：全局配置 > 运行时配置 > body。 */
  portalContainer: () => Element | null
  /** 每页条数那个下拉的触发器，它是那一层的定位锚点。 */
  pageSizeTriggerRef: RefObject<HTMLElement | null>
  pageSizePositionerRef: RefObject<HTMLElement | null>
  pageSizeContentRef: RefObject<HTMLElement | null>
  /** 下拉那一层此刻该不该渲染；与省略位那层各走各的闸门。 */
  pageSizeVisible: boolean
}

export function usePagination(props: PaginationSchema['props']): PaginationContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const xhConfig = useXhConfig()
  const rootRef = useRef<HTMLElement | null>(null)
  const ellipsisRef = useRef<HTMLElement | null>(null)
  const positionerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const pageSizeTriggerRef = useRef<HTMLElement | null>(null)
  const pageSizePositionerRef = useRef<HTMLElement | null>(null)
  const pageSizeContentRef = useRef<HTMLElement | null>(null)

  // 服务端没有 DOM，也就没有定位与消解层；退场闸门在 config 为 null 时退化成「跟着展开态」
  const config = useMemo(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope, idGenerator })),
    [scope, idGenerator],
  )

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上
  const onCreate = useCallback((service: Service<PaginationSchema>) => {
    if (config) {
      // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按可见态驱动
      const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
        kind: 'popover',
        node: () => contentRef.current,
        // 省略位记为本层分支：指针按在它上面算层内交互，不该判成点了外面。
        // 浮层壳一并记上：页码列表之外还浮着自绘滚动条，按住它拖动不该把列表消解掉
        branches: () => [ellipsisRef.current, positionerRef.current].filter(Boolean) as Element[],
        // 摊开的页码是非模态的：不陷焦点、不锁滚动、无遮罩
        isModal: () => false,
        surfaces: () => [],
      })
      service.refs.set('config', config)
      service.refs.set('registerLayer', registerLayer)
      service.refs.set('position', createPositionEngine())
    }
    // 元素 getter 在无 DOM 环境下也要设：连接层与效应经它们取节点
    service.refs.set('getAnchorEl', () => ellipsisRef.current)
    service.refs.set('getFloatingEl', () => positionerRef.current)
    service.refs.set('getContentEl', () => contentRef.current)
  }, [config])

  // 下拉自己一层：触发器记为本层分支，点它算层内交互
  const onCreatePageSize = useCallback((service: Service<SelectSchema>) => {
    if (config) {
      const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
        kind: 'popover',
        node: () => pageSizeContentRef.current,
        branches: () => [pageSizeTriggerRef.current].filter(Boolean) as Element[],
        isModal: () => false,
        surfaces: () => [],
      })
      service.refs.set('config', config)
      service.refs.set('registerLayer', registerLayer)
      service.refs.set('position', createPositionEngine())
    }
    service.refs.set('getAnchorEl', () => pageSizeTriggerRef.current)
    service.refs.set('getFloatingEl', () => pageSizePositionerRef.current)
    service.refs.set('getContentEl', () => pageSizeContentRef.current)
  }, [config])

  const service = useMachine(paginationMachine, () => props, { scope, onCreate })
  // 内嵌下拉的 props 从翻页机现读，翻页机须先建立
  const pageSizeSelect = useMachine(
    selectMachine,
    () => paginationPageSizeSelectProps(service),
    { scope, onCreate: onCreatePageSize },
  )
  const api = connectPagination({ root: service, pageSizeSelect }, reactNormalize)

  // 退场闸门：收起从跟着展开态走，改成跟着 presence 走
  const visible = useOverlayExit({
    config,
    isOpen: () => api.openEllipsis != null,
    contentRef,
    onPresence: presence => service.refs.set('presence', presence),
  })
  const pageSizeVisible = useOverlayExit({
    config,
    isOpen: () => api.pageSizeSelect.open,
    contentRef: pageSizeContentRef,
  })

  const portalContainer = useCallback(
    () => xhConfig.portalContainer?.() ?? config?.portalContainer() ?? null,
    [xhConfig, config],
  )

  return {
    api,
    service,
    rootRef,
    ellipsisRef,
    positionerRef,
    contentRef,
    visible,
    portalContainer,
    pageSizeTriggerRef,
    pageSizePositionerRef,
    pageSizeContentRef,
    pageSizeVisible,
  }
}
