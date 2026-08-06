import type { SpinnerApi, SpinnerProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectSpinner } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface SpinnerContext {
  api: ComputedRef<SpinnerApi>
}

// Spinner 无状态机也不派生 part id，props 变了由 computed 重算属性
export function useSpinner(props: SpinnerProps): SpinnerContext {
  const api = computed(() => connectSpinner(props, vueNormalize))
  return { api }
}
