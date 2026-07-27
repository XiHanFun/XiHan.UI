import type { FieldApi, FieldProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectField } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FieldContext {
  api: ComputedRef<FieldApi>
}

// Field 无状态机，只需要一份实例级 scope 来派生 part id；props 变了由 computed 重算属性。
export function useField(props: FieldProps): FieldContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const api = computed(() => connectField(props, scope, vueNormalize))
  return { api }
}
