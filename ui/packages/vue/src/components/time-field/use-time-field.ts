import type { TimeFieldApi, TimeFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTimeField, timeFieldMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TimeFieldContext {
  api: ComputedRef<TimeFieldApi>
}

export function useTimeField(
  props: TimeFieldSchema['props'],
  handlers: Pick<TimeFieldSchema['props'], 'onValueChange'> = {},
): TimeFieldContext {
  // scope id 走 Vue 的 useId：control 的 aria-labelledby 是 IDREF，
  // 同页多个实例若拿到同一份 id，读屏会把别人的标题念给这一份控件
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(timeFieldMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectTimeField(service, vueNormalize))
  return { api }
}
