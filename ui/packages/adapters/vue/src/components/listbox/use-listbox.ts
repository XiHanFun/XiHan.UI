import type { Service } from '@xihan-ui/core'
import type { ListboxApi, ListboxSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectListbox, listboxMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ListboxContext {
  api: ComputedRef<ListboxApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<ListboxSchema>
}

export function useListbox(
  props: ListboxSchema['props'],
  onValueChange?: ListboxSchema['props']['onValueChange'],
): ListboxContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  const service = useMachine(listboxMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectListbox(service, vueNormalize))
  return { api, service }
}
