import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
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
      // 相位走 data-state（值都在词汇表的 phase 族里）；data-status 再发一个大版本，
      // 下个大版本移除——它此后只属于 result 的「结果种类」那一轴
      'data-state': status,
      'data-status': status,
      // 缺省档不写属性：皮肤的基础规则就是缺省档
      'data-size': prop('size'),
    }),
    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      'src': prop('src'),
      'alt': prop('alt'),
      // 相位走 data-state（值都在词汇表的 phase 族里）；data-status 再发一个大版本，
      // 下个大版本移除——它此后只属于 result 的「结果种类」那一轴
      'data-state': status,
      'data-status': status,
      'hidden': !loaded || undefined,
      'onLoad': () => send({ type: 'IMAGE.LOAD' }),
      'onError': () => send({ type: 'IMAGE.ERROR' }),
    }),
    getFallbackProps: () => normalize.element({
      ...parts.fallback.attrs,
      // 相位走 data-state（值都在词汇表的 phase 族里）；data-status 再发一个大版本，
      // 下个大版本移除——它此后只属于 result 的「结果种类」那一轴
      'data-state': status,
      'data-status': status,
      'hidden': loaded || undefined,
    }),
  }
}
