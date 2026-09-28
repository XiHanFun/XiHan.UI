/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { ImageApi, ImageSchema } from './image.types'
import { imageAnatomy } from './image.anatomy'
import { imageFallbackVisible, imagePlaceholderVisible } from './image.machine'

const parts = imageAnatomy.build()

export function connectImage<T extends PropTypes>(
  service: Service<ImageSchema>,
  normalize: NormalizeProps<T>,
): ImageApi<T> {
  const { state, prop, send, context, scope } = service
  const status = state.get()
  const loaded = status === 'loaded'
  // 失败时回退内容恒露面；idle 与 loading 看延迟窗口是否已过
  const showFallback = imageFallbackVisible(status, context.get('fallbackVisible'))
  // 占位层铺满图位，图片落位或失败即让位
  const showPlaceholder = imagePlaceholderVisible(status)
  // 撤下时先淡出、与图片的淡入交叉，播完才藏起
  const placeholderExiting = !showPlaceholder && context.get('placeholderRendered')
  const fallbackExiting = !showFallback && context.get('fallbackRendered')

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
      'id': scope.partId('image', 'placeholder'),
      'aria-hidden': true,
      'data-state': status,
      'hidden': (!showPlaceholder && !placeholderExiting) || undefined,
    }),
    getFallbackProps: () => normalize.element({
      ...parts.fallback.attrs,
      'id': scope.partId('image', 'fallback'),
      'data-state': status,
      'hidden': (!showFallback && !fallbackExiting) || undefined,
    }),
  }
}
