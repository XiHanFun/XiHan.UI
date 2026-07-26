import type { CheckboxApi, CheckboxSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { checkboxMachine, connectCheckbox } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface CheckboxContext {
  api: ComputedRef<CheckboxApi>
}

export function useCheckbox(
  props: CheckboxSchema['props'],
  onCheckedChange?: CheckboxSchema['props']['onCheckedChange'],
): CheckboxContext {
  // onCheckedChange 由外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(checkboxMachine, () => ({ ...props, onCheckedChange }))
  const api = computed(() => connectCheckbox(service, vueNormalize))
  return { api }
}
