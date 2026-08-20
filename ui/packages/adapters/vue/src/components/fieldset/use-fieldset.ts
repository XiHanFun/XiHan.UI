import type { FieldsetApi, FieldsetProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectFieldset } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FieldsetContext {
  api: ComputedRef<FieldsetApi>
}

// Fieldset 无状态机，只用一份实例级 scope 派生 part id，props 变了由 computed 重算属性
export function useFieldset(props: FieldsetProps): FieldsetContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const api = computed(() => connectFieldset(props, scope, vueNormalize))
  return { api }
}
