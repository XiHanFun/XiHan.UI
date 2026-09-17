/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 tour 模块的公共接口。

export { tourAnatomy } from './tour.anatomy'
export { connectTour } from './tour.connect'
export { tourKeyboard } from './tour.keyboard'
export {
  clampTourStep,
  currentTourStep,
  isTourLastStep,
  TOUR_DEFAULT_OFFSET,
  TOUR_DEFAULT_PLACEMENT,
  tourMachine,
  tourStepCount,
} from './tour.machine'
export { tourMeta } from './tour.meta'
export { sameTourSpotlight, TOUR_DEFAULT_SPOTLIGHT_PADDING, tourSpotlightBox } from './tour.spotlight'
export type {
  TourApi,
  TourCompleteDetails,
  TourOpenChangeDetails,
  TourPressedPart,
  TourProgressDotProps,
  TourRefs,
  TourSchema,
  TourSkipDetails,
  TourSpotlightRect,
  TourStep,
  TourTranslations,
  TourValueChangeDetails,
} from './tour.types'
