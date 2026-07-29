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
  // 失败时回退内容恒露面；idle 与 loading 看延迟窗口是否已过
  const showFallback = status === 'error' || (!loaded && context.get('fallbackVisible'))

  return {
    status,
    loaded,
    showFallback,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-status': status,
    }),
    // 无障碍语义交给原生 img
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
