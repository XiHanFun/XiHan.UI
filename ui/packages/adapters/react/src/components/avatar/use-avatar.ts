import type { Service } from '@xihan-ui/core'
import type { AvatarApi, AvatarSchema } from '@xihan-ui/headless'
import { avatarMachine, connectAvatar } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface AvatarContext {
  service: Service<AvatarSchema>
  api: AvatarApi
}

export function useAvatar(props: AvatarSchema['props']): AvatarContext {
  const service = useMachine(avatarMachine, () => props)
  return { service, api: connectAvatar(service, reactNormalize) }
}
