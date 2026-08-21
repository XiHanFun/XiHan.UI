// 滚动量 ↔ 滑块几何的换算住在 shared/scroll-geometry：scroll-area 与 scrollbar 两个组件
// 算的是同一件事，同一份实现才保证两处的滑块长度、能走的行程与 RTL 换算逐像素一致。
// 这里按本组件的旧名再导出一遍，公开面不变。
export type {
  ScrollAxis as ScrollAreaAxis,
  ScrollAxisGeometry as ScrollAreaAxisGeometry,
  ScrollAxisMetrics as ScrollAreaAxisMetrics,
  ScrollRect as ScrollAreaRect,
} from '../shared/scroll-geometry'
export {
  isOverflowing,
  maxScrollOffset,
  pointerDelta,
  SCROLL_MIN_THUMB_SIZE as SCROLL_AREA_MIN_THUMB_SIZE,
  scrollbarGeometry,
  scrollFromThumbDrag,
  scrollFromTrackPoint,
  thumbOffsetRatio,
  thumbSizeRatio,
  toDomScroll,
  toLogicalScroll,
  trackOffset,
} from '../shared/scroll-geometry'
