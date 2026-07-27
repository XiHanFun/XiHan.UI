import type { PinInputApi, PinInputSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectPinInput, pinInputMachine } from '@xihan-ui/headless'
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
  // scope id 走 Vue 的 useId：label 的 for 与 root 的 aria-labelledby 都是 IDREF，
  // 同页多个实例若拿到同一份 id，点标题会跳到别人的格子上
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(pinInputMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectPinInput(service, vueNormalize))
  return { api }
}
