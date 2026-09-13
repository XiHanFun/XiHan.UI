/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 number animation 模块的公共接口。

export { numberAnimationAnatomy } from './number-animation.anatomy'
export { connectNumberAnimation } from './number-animation.connect'
export {
  formatNumberAnimation,
  NUMBER_ANIMATION_PRECISION,
  NUMBER_ANIMATION_PRECISION_MAX,
  resolveNumberAnimationPrecision,
} from './number-animation.format'
export { numberAnimationKeyboard } from './number-animation.keyboard'
export {
  NUMBER_ANIMATION_DURATION,
  numberAnimationMachine,
  resolveNumberAnimationBound,
  resolveNumberAnimationDuration,
} from './number-animation.machine'
export { numberAnimationMeta } from './number-animation.meta'
export type { NumberAnimationApi, NumberAnimationCompleteDetails, NumberAnimationEasing, NumberAnimationLive, NumberAnimationPhase, NumberAnimationSchema, NumberAnimationTranslations } from './number-animation.types'
