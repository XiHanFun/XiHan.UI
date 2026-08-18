import type { TooltipApi, TooltipSchema } from '@xihan-ui/headless'
import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectTooltip, tooltipMachine } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TooltipContext {
  service: Service<TooltipSchema>
  api: ComputedRef<TooltipApi>
  /** 定位锚点。 */
  triggerRef: Ref<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: Ref<HTMLElement | null>
  /** 浮层本体，退场动画从它身上探测。 */
  contentRef: Ref<HTMLElement | null>
  /** 此刻该不该可见：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层搬到哪儿：全局配置的容器 > 运行时的浮层落点 > body。 */
  portalTarget: ComputedRef<string | Element>
}

export function useTooltip(
  props: TooltipSchema['props'],
  onOpenChange?: TooltipSchema['props']['onOpenChange'],
): TooltipContext {
  const xhConfig = useXhConfig()
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onOpenChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(tooltipMachine, () => ({ ...props, onOpenChange }), scope)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按可见态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      // 提示只参与 Escape 仲裁与栈顶判定：节点就在文档流里，不陷焦点、不锁滚动、没有遮罩
      kind: 'inline',
      node: () => contentRef.value,
      // trigger 记为本层分支，点它算层内交互
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎经 refs 注入，展开态由机器的 effect 驱动
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
  }
  service.refs.set('getAnchorEl', () => triggerRef.value)
  service.refs.set('getFloatingEl', () => positionerRef.value)

  const api = computed(() => connectTooltip(service, vueNormalize))

  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const visible = useOverlayExit({
    config,
    isOpen: () => api.value.open,
    contentRef,
  })
  // 全局配置写了容器就用它，否则落到运行时那个单一浮层落点；没有 DOM 时才回到 body
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { service, api, triggerRef, positionerRef, contentRef, visible, portalTarget }
}
