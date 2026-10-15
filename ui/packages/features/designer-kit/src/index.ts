/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 src 模块的公共接口。

export { alignRects, distributeRects } from './arrange'
export type { AlignMode, DistributeAxis, DistributeSpacing } from './arrange'
export { expandRect, rectCenter, rectContains, rectFromPoints, rectsIntersect, unionRects } from './geometry'
export type { Point, Rect, Size } from './geometry'
export { createHistory } from './history'
export type { ApplyOperation, ExecuteOptions, History, HistoryChange, HistoryChangeKind, HistoryOptions, OperationResult } from './history'
export { marqueeModeFromDrag, marqueeRect, selectInMarquee } from './marquee'
export type { MarqueeMode } from './marquee'
export { snapPointToGrid, snapRect, snapToGrid } from './snap'
export type { SnapGuide, SnapOptions, SnapResult } from './snap'
export {
  centerOn,
  clampZoom,
  constrainViewport,
  DEFAULT_VIEWPORT,
  DEFAULT_ZOOM_LIMITS,
  fitRect,
  panBy,
  revealRect,
  screenRectToWorld,
  screenToWorld,
  visibleWorldRect,
  wheelZoomFactor,
  worldRectToScreen,
  worldToScreen,
  zoomBy,
  zoomTo,
} from './viewport'
export type { FitOptions, Viewport, ZoomLimits } from './viewport'
