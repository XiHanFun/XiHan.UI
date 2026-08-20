import type { TagApi, TagSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectTag, tagMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface TagContext {
  api: ComputedRef<TagApi>
}

// 不建 scope：connect 不派生任何 id
export function useTag(
  props: TagSchema['props'],
  onOpenChange?: TagSchema['props']['onOpenChange'],
): TagContext {
  const service = useMachine(tagMachine, () => ({ ...props, onOpenChange }))
  const api = computed(() => connectTag(service, vueNormalize))
  return { api }
}
