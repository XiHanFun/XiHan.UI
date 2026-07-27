import type { ToggleGroupApi, ToggleGroupSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectToggleGroup, toggleGroupMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToggleGroupContext {
  api: ComputedRef<ToggleGroupApi>
  /** 条目要上报 DOM 侧的事实（卸载带走了焦点），得直接够到机器。 */
  service: Service<ToggleGroupSchema>
}

// 不建 scope：这个组件的 connect 不派生任何 id（没有 label/panel 一类要互指的部件），
// 建了也只是白占一个 useId。
export function useToggleGroup(
  props: ToggleGroupSchema['props'],
  onValueChange?: ToggleGroupSchema['props']['onValueChange'],
): ToggleGroupContext {
  // onValueChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(toggleGroupMachine, () => ({ ...props, onValueChange }))
  const api = computed(() => connectToggleGroup(service, vueNormalize))
  return { api, service }
}
