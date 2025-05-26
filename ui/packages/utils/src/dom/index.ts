/**
 * DOM 操作工具集
 */

export { BEM } from "./bem";

export { mediaQuery, container, responsive } from "./responsive";
export { type Breakpoint } from "./responsive";

export { hexToRgba, rgbaToHex } from "./color";

export { style, cssVar } from "./css";

export { createElement, find, element, attr, data, type ElementOptions } from "./element";

export {
  animation,
  transition,
  AnimationSequence,
  createAnimationSequence,
  animationUtils,
  type AnimationOptions,
  type TransitionOptions,
} from "./animation";
