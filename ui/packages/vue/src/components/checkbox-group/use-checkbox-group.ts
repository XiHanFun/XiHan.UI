import type { CheckboxGroupApi, CheckboxGroupSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { checkboxGroupMachine, connectCheckboxGroup } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CheckboxGroupContext {
  api: ComputedRef<CheckboxGroupApi>
  service: Service<CheckboxGroupSchema>
}

export function useCheckboxGroup(
  props: CheckboxGroupSchema['props'],
  onValueChange?: CheckboxGroupSchema['props']['onValueChange'],
): CheckboxGroupContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onValueChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(checkboxGroupMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectCheckboxGroup(service, vueNormalize))
  return { api, service }
}
