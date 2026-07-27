import type { TagsInputApi, TagsInputSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTagsInput, tagsInputMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TagsInputContext {
  api: ComputedRef<TagsInputApi>
  /** 部件要上报 DOM 侧的事实（如标签节点带着焦点离场），得直接够到机器。 */
  service: Service<TagsInputSchema>
}

export function useTagsInput(
  props: TagsInputSchema['props'],
  handlers: Pick<TagsInputSchema['props'], 'onValueChange' | 'onInputValueChange'> = {},
): TagsInputContext {
  // scope id 走 Vue 的 useId：label 的 for、control 的 aria-labelledby、
  // 以及就地编辑框的 id 都是 IDREF，同页多个实例若拿到同一份 id，
  // 点标题会跳到别人的输入框上，编辑焦点也会送错地方
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(tagsInputMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectTagsInput(service, vueNormalize))
  return { api, service }
}
