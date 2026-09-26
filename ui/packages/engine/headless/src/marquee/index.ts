/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 marquee 模块的公共接口。

export { marqueeAnatomy } from './marquee.anatomy'
export { connectMarquee } from './marquee.connect'
export { marqueeKeyboard } from './marquee.keyboard'
export { marqueeMachine } from './marquee.machine'
export { marqueeMeta } from './marquee.meta'
export type {
  MarqueeApi,
  MarqueeDirection,
  MarqueePausedChangeDetails,
  MarqueeProps,
  MarqueeSchema,
  MarqueeTranslations,
} from './marquee.types'
