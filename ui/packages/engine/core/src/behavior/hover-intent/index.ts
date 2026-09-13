/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 hover intent 模块的公共接口。

export type { HoverPoint, HoverRect } from './safe-polygon'
export { pointInPolygon, safeTriangle } from './safe-polygon'
export type { HoverIntentOptions } from './track-hover-intent'
export { trackHoverIntent } from './track-hover-intent'
