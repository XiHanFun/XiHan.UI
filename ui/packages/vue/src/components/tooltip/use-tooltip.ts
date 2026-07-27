import type { TooltipApi, TooltipSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTooltip, tooltipMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TooltipContext {
  service: Service<TooltipSchema>
  api: ComputedRef<TooltipApi>
  /** 定位锚点。 */
  triggerRef: Ref<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: Ref<HTMLElement | null>
}

export function useTooltip(
  props: TooltipSchema['props'],
  onOpenChange?: TooltipSchema['props']['onOpenChange'],
): TooltipContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onOpenChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(tooltipMachine, () => ({ ...props, onOpenChange }), scope)

  // 定位引擎经 refs 注入，展开态由机器的 effect 驱动。无 DOM 环境（SSR）不建引擎：
  // 机器照常转移，只是不产出坐标。
  if (typeof document !== 'undefined')
    service.refs.set('position', createFloatingUiPositionEngine())
  service.refs.set('getAnchorEl', () => triggerRef.value)
  service.refs.set('getFloatingEl', () => positionerRef.value)

  const api = computed(() => connectTooltip(service, vueNormalize))
  return { service, api, triggerRef, positionerRef }
}
