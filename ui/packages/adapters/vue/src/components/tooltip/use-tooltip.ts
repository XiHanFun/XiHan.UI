import type { TooltipApi, TooltipSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectTooltip, tooltipMachine } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
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
}

export function useTooltip(
  props: TooltipSchema['props'],
  onOpenChange?: TooltipSchema['props']['onOpenChange'],
): TooltipContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onOpenChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(tooltipMachine, () => ({ ...props, onOpenChange }), scope)

  // 定位引擎经 refs 注入，展开态由机器的 effect 驱动；无 DOM 环境（SSR）不建引擎
  if (typeof document !== 'undefined')
    service.refs.set('position', createPositionEngine())
  service.refs.set('getAnchorEl', () => triggerRef.value)
  service.refs.set('getFloatingEl', () => positionerRef.value)

  const api = computed(() => connectTooltip(service, vueNormalize))

  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走。
  // 本组件不挂消解层、没有别处要用的 config，这里就地建一份最小的（只用到 reducedMotion）
  const visible = useOverlayExit({
    config: typeof document === 'undefined' ? null : createRuntimeConfig(),
    isOpen: () => api.value.open,
    contentRef,
  })

  return { service, api, triggerRef, positionerRef, contentRef, visible }
}
