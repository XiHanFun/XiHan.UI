import type { Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { FloatButtonApi, FloatButtonNotifiers, FloatButtonProps, FloatButtonSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectFloatButton, floatButtonMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FloatButtonContext {
  api: ComputedRef<FloatButtonApi>
  service: Service<FloatButtonSchema>
  rootRef: Ref<HTMLElement | null>
}

/**
 * 专用机器持有开合与逻辑层生命周期；Vue 只桥接所属 Document 的配置、登记函数与 root ref。
 */
export function useFloatButton(
  props: FloatButtonProps,
  notify?: FloatButtonNotifiers,
): FloatButtonContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const rootRef = ref<HTMLElement | null>(null)

  const service = useMachine(floatButtonMachine, (): FloatButtonSchema['props'] => ({
    open: props.open,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled,
    expandTrigger: props.expandTrigger,
    onOpenChange: notify?.onOpenChange,
  }), scope)

  let config: RuntimeConfig | null = null
  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })
    const registerLayer = (
      layer: Omit<Layer, 'id'>,
    ): ReturnType<RuntimeConfig['layerRegistry']['register']> => config!.layerRegistry.register(layer)
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
  }
  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectFloatButton(service, props, vueNormalize))
  return { api, service, rootRef }
}
