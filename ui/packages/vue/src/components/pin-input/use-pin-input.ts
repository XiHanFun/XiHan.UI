import type { PinInputApi, PinInputSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectPinInput, pinInputMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface PinInputContext {
  api: ComputedRef<PinInputApi>
}

export function usePinInput(
  props: PinInputSchema['props'],
  handlers: Pick<PinInputSchema['props'], 'onValueChange' | 'onValueComplete'> = {},
): PinInputContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(pinInputMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectPinInput(service, vueNormalize))
  return { api }
}
