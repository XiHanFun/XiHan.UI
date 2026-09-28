/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/viz/canvas —— 画布绘制的原语：类型化数组上的折线与区域路径（写进 PathSink，Canvas 2D 上下文即是），
// 以及与 CSS 一致的颜色解析、color-mix 与色阶查找表。不碰 DOM：读计算样式、建画布由调用方做。

export { createColorRamp, formatCssColor, formatSrgbColor, mixCssColor, parseCssColor, srgbOf } from './color'
export type { CssColor, MixSpace } from './color'
export { traceBand, tracePolyline } from './trace'
export type { StepMode } from './trace'
