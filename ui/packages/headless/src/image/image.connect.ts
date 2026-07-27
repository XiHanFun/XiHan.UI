import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ImageApi, ImageSchema } from './image.types'
import { imageAnatomy } from './image.anatomy'

const parts = imageAnatomy.build()

export function connectImage<T extends PropTypes>(
  service: Service<ImageSchema>,
  normalize: NormalizeProps<T>,
): ImageApi<T> {
  const { state, prop, send, context } = service
  const status = state.get()
  const loaded = status === 'loaded'
  // 失败时回退内容是唯一还看得见的东西，一律露面；加载途中才看延迟窗口过没过。
  // idle 与 loading 共用同一条判据：那一拍也属于"图还没来"，不该先闪一下回退内容
  const showFallback = status === 'error' || (!loaded && context.get('fallbackVisible'))

  return {
    status,
    loaded,
    showFallback,
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
    getFallbackProps: () => normalize.element({
      ...parts.fallback.attrs,
      'data-status': status,
      'hidden': !showFallback || undefined,
    }),
  }
}
