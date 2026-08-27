export { DEFAULT_EDGE_SPEED, DEFAULT_EDGE_THRESHOLD, edgeScrollDelta } from './dnd/autoscroll'
export type { EdgeScrollInput } from './dnd/autoscroll'
export { moveItem } from './dnd/move-item'
export { projectSortable, sortableOffsets } from './dnd/sortable'
export type { DndDelta, DndRect, SortableAxis, SortableOffsetsInput, SortableProjection, SortableProjectionInput } from './dnd/types'
export { createMultiPointerSession } from './gesture/multi-session'
export type { MultiPointerSession, MultiPointerSessionOptions, TrackedPoint } from './gesture/multi-session'
export { pinchChange, pinchSnapshot } from './gesture/pinch'
// @xihan-ui/pointer —— 指针交互原语。

export type { PinchChange, PinchPoint, PinchSnapshot } from './gesture/pinch'
export { applyAspectRatio, clampSize, snapSize } from './resize/constraints'
export type { Size } from './resize/constraints'
export { resizeRect } from './resize/resize-rect'
export type { ResizeConstraints, ResizeEdge, ResizeRectInput } from './resize/types'
export type { ActivationConstraint } from './session/activation'
export { DEFAULT_ACTIVATION_DISTANCE, shouldActivate } from './session/activation'
export { createPointerSession } from './session/create-session'
export { resolveSessionDoc } from './session/resolve-doc'
export type {
  PointerEndDetails,
  PointerEndReason,
  PointerPoint,
  PointerSession,
  PointerSessionDetails,
  PointerSessionOptions,
} from './session/types'
