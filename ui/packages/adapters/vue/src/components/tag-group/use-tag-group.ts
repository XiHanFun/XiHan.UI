import type { Service } from '@xihan-ui/core'
import type { TagGroupApi, TagGroupSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTagGroup, tagGroupMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TagGroupContext {
  api: ComputedRef<TagGroupApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如标签卸载带走了焦点）。 */
  service: Service<TagGroupSchema>
}

export function useTagGroup(
  props: TagGroupSchema['props'],
  onValueChange?: TagGroupSchema['props']['onValueChange'],
  onItemDelete?: TagGroupSchema['props']['onItemDelete'],
): TagGroupContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  const service = useMachine(tagGroupMachine, () => ({ ...props, onValueChange, onItemDelete }), scope)
  const api = computed(() => connectTagGroup(service, vueNormalize))
  return { api, service }
}
