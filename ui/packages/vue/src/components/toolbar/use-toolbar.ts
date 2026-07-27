import type { ToolbarApi, ToolbarSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectToolbar, toolbarMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToolbarContext {
  api: ComputedRef<ToolbarApi>
  /** 条目要上报 DOM 侧的事实（卸载带走了焦点），得直接够到机器。 */
  service: Service<ToolbarSchema>
}

// 不建 scope：这个组件的 connect 不派生任何 id（没有 label/panel 一类要互指的部件），
// 建了也只是白占一个 useId。
export function useToolbar(props: ToolbarSchema['props']): ToolbarContext {
  const service = useMachine(toolbarMachine, () => ({ ...props }))
  const api = computed(() => connectToolbar(service, vueNormalize))
  return { api, service }
}
