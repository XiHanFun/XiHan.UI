import type { LoadingBarApi, LoadingBarSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectLoadingBar, loadingBarMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface LoadingBarContext {
  api: ComputedRef<LoadingBarApi>
}

export function useLoadingBar(
  props: LoadingBarSchema['props'],
  onValueChange?: LoadingBarSchema['props']['onValueChange'],
): LoadingBarContext {
  // 回调由外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(loadingBarMachine, () => ({ ...props, onValueChange }))
  const api = computed(() => connectLoadingBar(service, vueNormalize))
  return { api }
}
