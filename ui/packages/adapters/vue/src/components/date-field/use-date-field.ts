import type { DateFieldApi, DateFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectDateField, dateFieldMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DateFieldContext {
  api: ComputedRef<DateFieldApi>
}

export function useDateField(
  props: DateFieldSchema['props'],
  handlers: Pick<DateFieldSchema['props'], 'onValueChange'> = {},
): DateFieldContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(dateFieldMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectDateField(service, vueNormalize))
  return { api }
}
