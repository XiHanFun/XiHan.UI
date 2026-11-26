/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { ImageViewerItem } from '../image-viewer/image-viewer.types'
import type { ImageApi, ImageSchema } from './image.types'
import { dataAttr } from '@xihan-ui/core'
import { imageAnatomy } from './image.anatomy'
import { imageFallbackVisible, imagePlaceholderVisible, resolveImagePreviewSrc } from './image.machine'

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

  const lazy = prop('lazy') ?? false
  // 收起的图片浏览器永远不会去取：懒加载时等着取图的那一段不收，只有失败才收
  const imageHidden = lazy ? status === 'error' : !loaded

  const previewSrc = resolveImagePreviewSrc({ src: prop('src'), preview: prop('preview') })
  const previewable = previewSrc !== undefined
  const previewOpen = previewable && context.get('previewOpen')
  const alt = prop('alt')
  const previewItem: ImageViewerItem | null = previewable ? (alt === undefined ? { src: previewSrc } : { src: previewSrc, alt }) : null

  const setPreviewOpen = (open: boolean): void => {
    send({ type: open ? 'PREVIEW.OPEN' : 'PREVIEW.CLOSE' })
  }

  return {
    status,
    loaded,
    showFallback,
    showPlaceholder,
    previewable,
    previewOpen,
    previewItem,
    setPreviewOpen,
    // 开了预览，整张图就是一颗打开预览层的按钮：名字取自内容（图片的 alt，失败时是回退内容的文字）
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': previewable ? 'button' : undefined,
      'tabindex': previewable ? 0 : undefined,
      'aria-haspopup': previewable ? 'dialog' : undefined,
      'data-state': status,
      'data-interactive': dataAttr(previewable),
      'onClick': previewable ? () => setPreviewOpen(true) : undefined,
      'onKeyDown': previewable
        ? (event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ')
              return
            // div 不会被浏览器合成点击，空格还会滚动页面，两者都要自己接管
            event.preventDefault()
            setPreviewOpen(true)
          }
        : undefined,
    }),
    // 无障碍语义交给原生 img
    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      // 换图时机器按 id 找到它，在它后面放旧图的替身
      'id': scope.partId('image', 'image'),
      // 排在 src 之前：先说好延后取图，再给地址
      'loading': lazy ? 'lazy' : undefined,
      'src': prop('src'),
      'alt': alt,
      'data-state': status,
      'data-fit': prop('fit'),
      'hidden': imageHidden || undefined,
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
