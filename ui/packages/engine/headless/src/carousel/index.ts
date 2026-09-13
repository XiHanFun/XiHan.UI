/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 carousel 模块的公共接口。

export { carouselAnatomy } from './carousel.anatomy'
export { connectCarousel } from './carousel.connect'
export { carouselKeyboard } from './carousel.keyboard'
export {
  CAROUSEL_AUTOPLAY_INTERVAL,
  CAROUSEL_DRAG_THRESHOLD,
  carouselMachine,
  resolveAutoplayInterval,
} from './carousel.machine'
export { carouselMeta } from './carousel.meta'
export {
  carouselDragDelta,
  carouselPageCount,
  carouselPageSnapPoints,
  carouselPageStart,
  carouselSlideRange,
  carouselTranslatePercent,
  clampCarouselPage,
  normalizeSlideCount,
  normalizeSlidesPerMove,
  normalizeSlidesPerPage,
} from './carousel.pages'
export type { CarouselSlideRange } from './carousel.pages'
export type {
  CarouselApi,
  CarouselIndicatorProps,
  CarouselItemProps,
  CarouselPageChangeDetails,
  CarouselPauseSource,
  CarouselSchema,
  CarouselTranslations,
} from './carousel.types'
