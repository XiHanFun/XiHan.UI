import type { TagsInputApi, TagsInputSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectTagsInput, tagsInputMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TagsInputContext {
  api: ComputedRef<TagsInputApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如标签节点带着焦点离场）。 */
  service: Service<TagsInputSchema>
}

export function useTagsInput(
  props: TagsInputSchema['props'],
  handlers: Pick<TagsInputSchema['props'], 'onValueChange' | 'onInputValueChange'> = {},
): TagsInputContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(tagsInputMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectTagsInput(service, vueNormalize))
  return { api, service }
}
