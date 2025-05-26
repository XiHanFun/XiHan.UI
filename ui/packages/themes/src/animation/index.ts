export { Easing, BezierPresets, composeEasing, sequenceEasing, mirrorEasing } from "./easing";
export type { EasingFunction } from "./easing";

export { createScrollTrigger, createScrollAnimation, scrollToTop, scrollToBottom, scrollToElement } from "./scroll";
export type { ScrollTrigger, ScrollListenerOptions, ScrollAnimationTarget } from "./scroll";

export {
  createSpringAnimation,
  springTransition,
  springTransform,
  springIn,
  springOut,
  calculateCriticalDamping,
  isUnderdamped,
  isOverdamped,
  estimateSpringDuration,
  createSpringSystem,
} from "./spring";
export type { SpringAnimationOptions, SpringState, SpringConfig } from "./spring";

export { animatePath, drawSVGPath, morphSVG, animateSVGColor, animateStroke } from "./svg";
export type { PathAnimationOptions, PathData } from "./svg";

export {
  createTransition,
  createCSSTransition,
  fadeElement,
  fadeIn,
  fadeOut,
  slideElement,
  slideIn,
  slideOut,
  scaleElement,
  colorTransition,
  sequenceTransitions,
} from "./transition";
export type { TransitionOptions, TransitionController, CSSTransitionProperty } from "./transition";
