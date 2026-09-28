/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 arrival 模块的公共接口。

export { trackListMotion, trackReorder } from './list-motion'
export type { TrackListMotionOptions, TrackReorderOptions } from './list-motion'
export { trackAppearance } from './track-appearance'
export type { TrackAppearanceOptions } from './track-appearance'
export { INSTANT_ATTR, STAGGER_CAP, STAGGER_INDEX_PROPERTY, trackArrivals } from './track-arrivals'
export type { TrackArrivalsOptions } from './track-arrivals'
