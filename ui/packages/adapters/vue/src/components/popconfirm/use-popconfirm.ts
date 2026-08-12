import type { PopconfirmApi, PopconfirmIntents, PopconfirmNotifiers, PopconfirmOverlayProps, PopoverSchema } from '@xihan-ui/headless'
import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectPopconfirm, popoverMachine } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface PopconfirmContext {
  service: Service<PopoverSchema>
  api: ComputedRef<PopconfirmApi>
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
}

export function usePopconfirm(
  props: PopconfirmOverlayProps,
  notify?: PopconfirmNotifiers,
): PopconfirmContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)

  // 开合、定位、消解层与焦点域全交给 popover 机器；气泡确认只多出确认/取消两个意图，
  // 它们不改开合以外的状态，走 connect 不进机器。
  // modal 与 translations 不往下传：不陷焦点，按钮文案由作者写在节点里。
  const service = useMachine(popoverMachine, (): PopoverSchema['props'] => ({
    open: props.open,
    defaultOpen: props.defaultOpen,
    placement: props.placement,
    offset: props.offset,
    closeOnEscape: props.closeOnEscape,
    closeOnInteractOutside: props.closeOnInteractOutside,
    size: props.size,
    onOpenChange: notify?.onOpenChange,
  }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支，点它算层内交互
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getAnchorEl', () => triggerRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
  }

  // 异步确认的挂起布尔住在这儿，connect 只发变化意图
  const pending = ref(false)

  // 每次点击现读 notify，宿主换回调也立刻生效；onConfirm 的返回值原样透传，异步门靠它
  const intents: PopconfirmIntents = {
    onConfirm: () => notify?.onConfirm?.(),
    onCancel: () => { notify?.onCancel?.() },
    get pending() {
      return pending.value
    },
    onPendingChange: (next) => {
      pending.value = next
    },
  }

  const api = computed(() => connectPopconfirm(service, intents, vueNormalize))
  return { service, api, triggerRef, positionerRef, contentRef }
}
