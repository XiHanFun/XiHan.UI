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
    // 无障碍语义交给原生 img（role/alt 都由浏览器兜着），这里只补来源、显隐与状态通道；
    // onLoad / onError 是挂在节点上的 DOM 监听，不读节点、不量尺寸
    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      'src': prop('src'),
      'alt': prop('alt'),
      'data-status': status,
      'hidden': !loaded || undefined,
      'onLoad': () => send({ type: 'IMAGE.LOAD' }),
      'onError': () => send({ type: 'IMAGE.ERROR' }),
    }),
    // loaded 之外一律可见：加载期间也留着回退内容，图片到位前不会闪一片白
    getFallbackProps: () => normalize.element({
      ...parts.fallback.attrs,
      'data-status': status,
      'hidden': loaded || undefined,
    }),
  }
}
