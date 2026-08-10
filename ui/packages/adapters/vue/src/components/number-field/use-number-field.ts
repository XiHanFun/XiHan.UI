import type { NumberFieldApi, NumberFieldSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectNumberField, numberFieldMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface NumberFieldContext {
  api: ComputedRef<NumberFieldApi>
}

export function useNumberField(
  props: NumberFieldSchema['props'],
  onValueChange?: NumberFieldSchema['props']['onValueChange'],
): NumberFieldContext {
  const service = useMachine(numberFieldMachine, () => ({ ...props, onValueChange }))
  const api = computed(() => connectNumberField(service, vueNormalize))
  return { api }
}
