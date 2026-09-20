/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 image viewer 模块的公共接口。

export { imageViewerAnatomy } from './image-viewer.anatomy'
export { connectImageViewer, imageViewerCounterText } from './image-viewer.connect'
export { imageViewerKeyboard } from './image-viewer.keyboard'
export {
  clampImageViewerIndex,
  IMAGE_VIEWER_IDENTITY,
  IMAGE_VIEWER_MAX_SCALE,
  IMAGE_VIEWER_MIN_SCALE,
  IMAGE_VIEWER_ZOOM_STEP,
  imageViewerCount,
  imageViewerMachine,
  stepImageViewerIndex,
} from './image-viewer.machine'
export { imageViewerMeta } from './image-viewer.meta'
export type {
  ImageViewerApi,
  ImageViewerImageStatus,
  ImageViewerIndexChangeDetails,
  ImageViewerItem,
  ImageViewerOpenChangeDetails,
  ImageViewerPressedPart,
  ImageViewerRefs,
  ImageViewerSchema,
  ImageViewerTransform,
  ImageViewerTranslations,
} from './image-viewer.types'
