import type { AccordionApi, AccordionSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { accordionMachine, connectAccordion } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface AccordionContext {
  api: ComputedRef<AccordionApi>
}

export function useAccordion(
  props: AccordionSchema['props'],
  onValueChange?: AccordionSchema['props']['onValueChange'],
): AccordionContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(accordionMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectAccordion(service, vueNormalize))
  return { api }
}
