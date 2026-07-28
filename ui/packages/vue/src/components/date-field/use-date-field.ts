import type { DateFieldApi, DateFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectDateField, dateFieldMachine } from '@xihan-ui/headless'
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
  // scope id 走 Vue 的 useId：control 的 aria-labelledby 是 IDREF，
  // 同页多个实例若拿到同一份 id，读屏会把别人的标题念成自己的
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(dateFieldMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectDateField(service, vueNormalize))
  return { api }
}
