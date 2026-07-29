import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { AvatarApi, AvatarSchema } from './avatar.types'
import { avatarAnatomy } from './avatar.anatomy'

const parts = avatarAnatomy.build()

export function connectAvatar<T extends PropTypes>(
  service: Service<AvatarSchema>,
  normalize: NormalizeProps<T>,
): AvatarApi<T> {
  const { state, prop, send } = service
  const status = state.get()
  const loaded = status === 'loaded'

  return {
    status,
    loaded,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-status': status,
    }),
    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      'src': prop('src'),
      'alt': prop('alt'),
      'data-status': status,
      'hidden': !loaded || undefined,
      'onLoad': () => send({ type: 'IMAGE.LOAD' }),
      'onError': () => send({ type: 'IMAGE.ERROR' }),
    }),
    getFallbackProps: () => normalize.element({
      ...parts.fallback.attrs,
      'data-status': status,
      'hidden': loaded || undefined,
    }),
  }
}
