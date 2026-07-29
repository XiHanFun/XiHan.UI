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
  const service = useMachine(checkboxMachine, () => ({ ...props, onCheckedChange }))
  const api = computed(() => connectCheckbox(service, vueNormalize))
  return { api }
}
