import type { Layer, RuntimeConfig } from '@xihan-ui/core'
import type { PopoverApi, PopoverSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectPopover, popoverMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, onBeforeUnmount, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface PopoverContext {
  service: Service<PopoverSchema>
  api: ComputedRef<PopoverApi>
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
}

export function usePopover(
  props: PopoverSchema['props'],
  onOpenChange?: PopoverSchema['props']['onOpenChange'],
): PopoverContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onOpenChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(popoverMachine, () => ({ ...props, onOpenChange }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
    const { layer, dispose: disposeLayer } = config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      // 否则同一次点击先被判为外部交互关一次、再被 click 打开一次，等于关不掉。
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => props.modal ?? false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎
    service.refs.set('config', config)
    service.refs.set('layer', layer as Layer)
    service.refs.set('position', createFloatingUiPositionEngine())
    service.refs.set('getAnchorEl', () => triggerRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)

    onBeforeUnmount(() => disposeLayer())
  }

  const api = computed(() => connectPopover(service, vueNormalize))
  return { service, api, triggerRef, positionerRef, contentRef }
}
