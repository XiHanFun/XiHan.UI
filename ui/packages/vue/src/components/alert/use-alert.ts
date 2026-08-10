import type { AlertApi, AlertSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { alertMachine, connectAlert } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface AlertContext {
  api: ComputedRef<AlertApi>
}

export function useAlert(
  props: AlertSchema['props'],
  onOpenChange?: AlertSchema['props']['onOpenChange'],
): AlertContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(alertMachine, () => ({ ...props, onOpenChange }), scope)
  const api = computed(() => connectAlert(service, vueNormalize))
  return { api }
}
