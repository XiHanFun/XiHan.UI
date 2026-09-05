import type { FieldArrayApi, FieldArraySchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectFieldArray, fieldArrayMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FieldArrayContext {
  api: ComputedRef<FieldArrayApi>
  service: Service<FieldArraySchema>
}

export function useFieldArray(
  props: FieldArraySchema['props'],
  handlers: Pick<FieldArraySchema['props'], 'onValueChange'> = {},
): FieldArrayContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(fieldArrayMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectFieldArray(service, vueNormalize))
  return { api, service }
}
