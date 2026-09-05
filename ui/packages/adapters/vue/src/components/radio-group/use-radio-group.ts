import type { Service } from '@xihan-ui/core'
import type { RadioGroupApi, RadioGroupSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectRadioGroup, radioGroupMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface RadioGroupContext {
  api: ComputedRef<RadioGroupApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<RadioGroupSchema>
}

export function useRadioGroup(
  props: RadioGroupSchema['props'],
  onValueChange?: RadioGroupSchema['props']['onValueChange'],
): RadioGroupContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(radioGroupMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectRadioGroup(service, vueNormalize))
  return { api, service }
}
