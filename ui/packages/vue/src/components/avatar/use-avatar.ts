import type { AvatarApi, AvatarSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { avatarMachine, connectAvatar } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface AvatarContext {
  api: ComputedRef<AvatarApi>
}

export function useAvatar(
  props: AvatarSchema['props'],
  onStatusChange?: AvatarSchema['props']['onStatusChange'],
): AvatarContext {
  // onStatusChange 由外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(avatarMachine, () => ({ ...props, onStatusChange }))
  const api = computed(() => connectAvatar(service, vueNormalize))
  return { api }
}
