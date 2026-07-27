import type { StepsApi, StepsSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectSteps, stepsMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface StepsContext {
  api: ComputedRef<StepsApi>
  /** 部件要上报 DOM 侧的事实（如条目卸载带走了焦点），得直接够到机器。 */
  service: Service<StepsSchema>
}

export function useSteps(
  props: StepsSchema['props'],
  onStepChange?: StepsSchema['props']['onStepChange'],
): StepsContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onStepChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(stepsMachine, () => ({ ...props, onStepChange }), scope)
  const api = computed(() => connectSteps(service, vueNormalize))
  return { api, service }
}
