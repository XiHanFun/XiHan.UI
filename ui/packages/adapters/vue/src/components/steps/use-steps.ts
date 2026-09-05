import type { StepsApi, StepsSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectSteps, stepsMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface StepsContext {
  api: ComputedRef<StepsApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<StepsSchema>
}

export function useSteps(
  props: StepsSchema['props'],
  onValueChange?: StepsSchema['props']['onValueChange'],
): StepsContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(stepsMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectSteps(service, vueNormalize))
  return { api, service }
}
