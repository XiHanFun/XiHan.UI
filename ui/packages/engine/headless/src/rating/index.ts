/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 rating 模块的公共接口。

export { ratingAnatomy } from './rating.anatomy'
export { connectRating, ratingIntentFromKey, ratingValueAtPointer } from './rating.connect'
export type { RatingKeyEventLike, RatingKeyIntent } from './rating.connect'
export { ratingKeyboard } from './rating.keyboard'
export { clampRating, RATING_COUNT, ratingMachine, ratingMax, ratingStep, stepRating } from './rating.machine'
export { ratingMeta } from './rating.meta'
export type { RatingApi, RatingHoverChangeDetails, RatingItemProps, RatingItemState, RatingSchema, RatingTranslations, RatingValueChangeDetails } from './rating.types'
