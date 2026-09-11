import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { PaginationApi, PaginationSchema, PaginationServices, SelectSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectPagination, paginationMachine, paginationPageSizeSelectProps, selectMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface PaginationContext {
  api: ComputedRef<PaginationApi>
  /** 摊开的那个省略位，定位锚点。 */
  ellipsisRef: Ref<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: Ref<HTMLElement | null>
  /** 消解层节点。 */
  contentRef: Ref<HTMLElement | null>
  /** 此刻该不该渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层搬到哪儿：全局配置的 portalContainer > body。 */
  portalTarget: ComputedRef<string | Element>
  /** 每页条数那个下拉的触发器，它是那一层的定位锚点。 */
  pageSizeTriggerRef: Ref<HTMLElement | null>
  pageSizePositionerRef: Ref<HTMLElement | null>
  pageSizeContentRef: Ref<HTMLElement | null>
  /** 下拉那一层此刻该不该渲染；与省略位那层各走各的闸门。 */
  pageSizeVisible: Ref<boolean>
}

export function usePagination(
  props: PaginationSchema['props'],
  onPageChange?: PaginationSchema['props']['onPageChange'],
  onPageSizeChange?: PaginationSchema['props']['onPageSizeChange'],
): PaginationContext {
  const xhConfig = useXhConfig()
  const ellipsisRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const pageSizeTriggerRef = ref<HTMLElement | null>(null)
  const pageSizePositionerRef = ref<HTMLElement | null>(null)
  const pageSizeContentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(
    paginationMachine,
    () => ({ ...props, onPageChange, onPageSizeChange }),
    scope,
  )
  // 内嵌下拉的 props 从翻页机现读，翻页机须先建立；两台共用一份 scope，
  // part id 里带组件名区分，不会撞
  const pageSizeSelect = useMachine<SelectSchema>(
    selectMachine,
    () => paginationPageSizeSelectProps(service),
    scope,
  )
  const services: PaginationServices = { root: service, pageSizeSelect }

  // 服务端没有 DOM，也就没有定位与消解层；退场闸门在 config 为 null 时退化成「跟着展开态」
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按可见态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 省略位记为本层分支：指针按在它上面算层内交互，不该判成点了外面。
      // 浮层壳一并记上：页码列表之外还浮着自绘滚动条，按住它拖动不该把列表消解掉
      branches: () => [ellipsisRef.value, positionerRef.value].filter(Boolean) as Element[],
      // 摊开的页码是非模态的：不陷焦点、不锁滚动、无遮罩
      isModal: () => false,
      surfaces: () => [],
    })

    // 下拉自己一层：触发器记为本层分支，点它算层内交互
    const registerPageSizeLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => pageSizeContentRef.value,
      branches: () => [pageSizeTriggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      surfaces: () => [],
    })

    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())

    pageSizeSelect.refs.set('config', config)
    pageSizeSelect.refs.set('registerLayer', registerPageSizeLayer)
    pageSizeSelect.refs.set('position', createPositionEngine())
  }

  pageSizeSelect.refs.set('getAnchorEl', () => pageSizeTriggerRef.value)
  pageSizeSelect.refs.set('getFloatingEl', () => pageSizePositionerRef.value)
  pageSizeSelect.refs.set('getContentEl', () => pageSizeContentRef.value)

  // 元素 getter 在无 DOM 环境下也要设：连接层与效应经它们取节点
  service.refs.set('getAnchorEl', () => ellipsisRef.value)
  service.refs.set('getFloatingEl', () => positionerRef.value)
  service.refs.set('getContentEl', () => contentRef.value)

  const api = computed(() => connectPagination(services, vueNormalize))
  // 退场闸门：收起从跟着展开态走，改成跟着 presence 走
  const visible = useOverlayExit({
    config,
    isOpen: () => api.value.openEllipsis != null,
    contentRef,
  })
  const pageSizeVisible = useOverlayExit({
    config,
    isOpen: () => api.value.pageSizeSelect.open,
    contentRef: pageSizeContentRef,
  })
  const portalTarget = computed<string | Element>(
    () => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body',
  )

  return {
    api,
    ellipsisRef,
    positionerRef,
    contentRef,
    visible,
    portalTarget,
    pageSizeTriggerRef,
    pageSizePositionerRef,
    pageSizeContentRef,
    pageSizeVisible,
  }
}
