// @xihan-ui/behavior —— 交互行为原语（依赖 core）。

export { cascadeState, cascadeToggle, collapseChecked } from './collection/cascade'
export type { CascadeNodeLike, CascadeState, CascadeStrategy } from './collection/cascade'
export { anchorItem, declaredItemDisabled, focusItem, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, queryItems } from './collection/items'
export type { ItemQuery, NavigateOptions } from './collection/items'
export { navIntentFromKey, stepIndex } from './collection/navigate'
export type { NavAxis, NavIntent, NavKeyOptions, StepOptions } from './collection/navigate'
export { createTypeahead, matchTypeahead } from './collection/typeahead'
export type { ItemTextFn, Typeahead, TypeaheadMatchOptions, TypeaheadOptions } from './collection/typeahead'
export { createDismissLayer } from './dismissable-layer'
export type { DismissLayerOptions, DismissReason } from './dismissable-layer'
export { isInside, shouldDismiss } from './dismissable-layer/layer-stack'
export type { InsideResult } from './dismissable-layer/layer-stack'
export { dispatchCancelable } from './dispatch'
export { createFocusScope } from './focus-scope'
export type { FocusScopeOptions } from './focus-scope'
export { canTakeFocus } from './focus-scope/can-take-focus'

export { acquireFocusGuards } from './focus-scope/focus-guards'
export { focusFirst, focusSafely, getTabbables, removeLinks } from './focus-scope/tabbable'
export type { FocusOptions } from './focus-scope/tabbable'
export { createFormResetBridge } from './form-reset'
export type { FormResetBridgeOptions } from './form-reset'

export { pointInPolygon, safeTriangle, trackHoverIntent } from './hover-intent'
export type { HoverIntentOptions, HoverPoint, HoverRect } from './hover-intent'
export { acquireScrollLock } from './scroll-lock'

export type { ScrollLockHandle, ScrollLockOptions } from './scroll-lock'
export { createScrollTracker, createViewportEntry, readViewportRect, scrollBlockTo } from './scroll-position'
export type {
  ScrollMetrics,
  ScrollTrackerHandle,
  ScrollTrackerOptions,
  ScrollViewportRect,
  ViewportEntryOptions,
} from './scroll-position'
export { createStickToBottom, STICK_TO_BOTTOM_THRESHOLD } from './stick-to-bottom'
export type { StickToBottomHandle, StickToBottomOptions, StickToBottomState } from './stick-to-bottom'
export { easing } from '@xihan-ui/motion'
export type { EasingName } from '@xihan-ui/motion'
export { onReducedMotionChange, prefersReducedMotion } from '@xihan-ui/motion'
