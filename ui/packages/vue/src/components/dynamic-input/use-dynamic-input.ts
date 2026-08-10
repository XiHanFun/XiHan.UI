import type { DynamicInputApi, DynamicInputSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectDynamicInput, dynamicInputMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DynamicInputContext {
  api: ComputedRef<DynamicInputApi>
  service: Service<DynamicInputSchema>
}

export function useDynamicInput(
  props: DynamicInputSchema['props'],
  handlers: Pick<DynamicInputSchema['props'], 'onValueChange'> = {},
): DynamicInputContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(dynamicInputMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectDynamicInput(service, vueNormalize))
  return { api, service }
}
