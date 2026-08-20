import type { PasswordInputApi, PasswordInputSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectPasswordInput, passwordInputMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface PasswordInputContext {
  api: ComputedRef<PasswordInputApi>
}

export function usePasswordInput(
  props: PasswordInputSchema['props'],
  handlers: Pick<PasswordInputSchema['props'], 'onValueChange' | 'onVisibilityChange'> = {},
): PasswordInputContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(passwordInputMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectPasswordInput(service, vueNormalize))
  return { api }
}
