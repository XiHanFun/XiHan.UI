import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
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
  // 占位层铺满图位，图片落位或失败即让位
  const showPlaceholder = status === 'idle' || status === 'loading'

  return {
    status,
    loaded,
    showFallback,
    showPlaceholder,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': status,
    }),
    // 无障碍语义交给原生 img
    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      'src': prop('src'),
      'alt': prop('alt'),
      'data-state': status,
      'hidden': !loaded || undefined,
      'onLoad': () => send({ type: 'IMAGE.LOAD' }),
      'onError': () => send({ type: 'IMAGE.ERROR' }),
    }),
    // 占位层不带信息，读屏跳过它
    getPlaceholderProps: () => normalize.element({
      ...parts.placeholder.attrs,
      'aria-hidden': true,
      'data-state': status,
      'hidden': !showPlaceholder || undefined,
    }),
    getFallbackProps: () => normalize.element({
      ...parts.fallback.attrs,
      'data-state': status,
      'hidden': !showFallback || undefined,
    }),
  }
}
