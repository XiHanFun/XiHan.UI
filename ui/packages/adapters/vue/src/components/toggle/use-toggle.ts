import type { ToggleApi, ToggleSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectToggle, toggleMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToggleContext {
  api: ComputedRef<ToggleApi>
}

export function useToggle(
  props: ToggleSchema['props'],
  onPressedChange?: ToggleSchema['props']['onPressedChange'],
): ToggleContext {
  // onPressedChange 由外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(toggleMachine, () => ({ ...props, onPressedChange }))
  const api = computed(() => connectToggle(service, vueNormalize))
  return { api }
}
