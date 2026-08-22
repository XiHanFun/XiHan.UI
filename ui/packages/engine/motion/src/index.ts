// @xihan-ui/motion —— 动效原语（依赖 kernel）。
//
// 缓动曲线与时长常量、不持有计时器的纯补间、逐帧循环、减弱动效偏好与应用级 override、
// 解析解弹簧，以及 Web Animations 的薄封装。零第三方依赖，import 无副作用。

// Web Animations
export { animate } from './animate'
export type { AnimateOptions, AnimationHandle, AnimationStatus } from './animate'
// 时长
export { durations } from './durations'
export type { DurationName } from './durations'
// 缓动
export { cubicBezier, easing, resolveEasing, toLinearEasing } from './easing'
export type { EasingFunction, EasingName } from './easing'
// 帧循环
export { frameLoop, frameNow } from './frame'
// 减弱动效
export {
  getMotionOverride,
  getMotionPreference,
  onMotionPreferenceChange,
  onReducedMotionChange,
  prefersReducedMotion,
  resolveMotionPreference,
  setMotionOverride,
} from './reduced-motion'
export type { MotionPreference } from './reduced-motion'
// 弹簧
export { createSpring, springFromPerceptual, springPresets, springToLinearEasing, supportsLinearEasing } from './spring'
export type { SpringPerceptual, SpringPhysical, SpringPresetName, SpringSolver, SpringSpec } from './spring'
// 补间
export { isTweenDone, resolveTweenEasing, tweenEasings, tweenProgress, tweenValueAt } from './tween'
export type { TweenEasing, TweenSpec } from './tween'
