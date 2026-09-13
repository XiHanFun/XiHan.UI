/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 scroll position 模块的公共接口。

export { readViewportRect, resolveScrollBehavior, scrollBlockTo } from './scroll-source'
export type { ScrollMetrics, ScrollViewportRect } from './scroll-source'
export { createScrollTracker } from './scroll-tracker'
export type { ScrollTrackerHandle, ScrollTrackerOptions } from './scroll-tracker'
export { createViewportEntry } from './viewport-entry'
export type { ViewportEntryOptions } from './viewport-entry'
