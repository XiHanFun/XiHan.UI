import type { Service } from '@xihan-ui/core'
import type { ToggleGroupApi, ToggleGroupSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectToggleGroup, toggleGroupMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToggleGroupContext {
  api: ComputedRef<ToggleGroupApi>
  /** 机器实例，供条目上报 DOM 侧的事实（卸载带走了焦点）。 */
  service: Service<ToggleGroupSchema>
}

// 不建 scope：connect 不派生任何 id
export function useToggleGroup(
  props: ToggleGroupSchema['props'],
  onValueChange?: ToggleGroupSchema['props']['onValueChange'],
): ToggleGroupContext {
  // onValueChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(toggleGroupMachine, () => ({ ...props, onValueChange }))
  const api = computed(() => connectToggleGroup(service, vueNormalize))
  return { api, service }
}
