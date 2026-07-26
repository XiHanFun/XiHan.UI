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
}

export function useRadioGroup(
  props: RadioGroupSchema['props'],
  onValueChange?: RadioGroupSchema['props']['onValueChange'],
): RadioGroupContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onValueChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(radioGroupMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectRadioGroup(service, vueNormalize))
  return { api }
}
