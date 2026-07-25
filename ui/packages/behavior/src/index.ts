// @xihan-ui/behavior —— 交互行为原语（依赖 core）。

export { createDismissLayer } from './dismissable-layer'
export type { DismissLayerOptions, DismissReason } from './dismissable-layer'
export { isInside, shouldDismiss } from './dismissable-layer/layer-stack'
export type { InsideResult } from './dismissable-layer/layer-stack'

export { dispatchCancelable } from './dispatch'
export { easing } from './easing'
export type { EasingName } from './easing'
export { createFocusScope } from './focus-scope'
export type { FocusScopeOptions } from './focus-scope'

export { acquireFocusGuards } from './focus-scope/focus-guards'
export { focusFirst, focusSafely, getTabbables, removeLinks } from './focus-scope/tabbable'

export type { FocusOptions } from './focus-scope/tabbable'
export { onReducedMotionChange, prefersReducedMotion } from './reduced-motion'
export { acquireScrollLock } from './scroll-lock'
export type { ScrollLockHandle, ScrollLockOptions } from './scroll-lock'
