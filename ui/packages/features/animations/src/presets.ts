// 内置预设：进场一族把元素从"不在场"带到静息态，注意一族从静息态出发再回到静息态。
// 两族都不留值，播完元素回到皮肤定义的样子。

import type { BuiltinMotionName, MotionSpec } from './types'

/** 恒等函数，只做类型收窄。 */
export function defineMotionSpec(spec: MotionSpec): MotionSpec {
  return spec
}

/** 进场：从不在场到静息态。 */
const enter: Record<string, MotionSpec> = {
  'fade': {
    frames: [{ opacity: 0 }, { opacity: 1 }],
    duration: 240,
    easing: 'easeOut',
  },
  'fade-up': {
    frames: [{ opacity: 0, y: 12 }, { opacity: 1, y: 0 }],
    duration: 320,
    easing: 'easeOut',
  },
  'fade-down': {
    frames: [{ opacity: 0, y: -12 }, { opacity: 1, y: 0 }],
    duration: 320,
    easing: 'easeOut',
  },
  'fade-start': {
    frames: [{ opacity: 0, x: -12 }, { opacity: 1, x: 0 }],
    duration: 320,
    easing: 'easeOut',
    logical: true,
  },
  'fade-end': {
    frames: [{ opacity: 0, x: 12 }, { opacity: 1, x: 0 }],
    duration: 320,
    easing: 'easeOut',
    logical: true,
  },
  'zoom-in': {
    frames: [{ opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1 }],
    duration: 280,
    easing: 'easeOut',
  },
  'zoom-out': {
    frames: [{ opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1 }],
    duration: 280,
    easing: 'easeOut',
  },
  'blur-in': {
    frames: [{ opacity: 0, blur: 8 }, { opacity: 1, blur: 0 }],
    duration: 360,
    easing: 'easeOut',
  },
  'rise': {
    frames: [{ opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1 }],
    duration: 420,
    easing: 'emphasized',
  },
  'drop-in': {
    frames: [{ opacity: 0, y: -24, scale: 1.04 }, { opacity: 1, y: 0, scale: 1 }],
    duration: 420,
    easing: 'emphasized',
  },
  'spin-in': {
    frames: [{ opacity: 0, rotate: -12, scale: 0.96 }, { opacity: 1, rotate: 0, scale: 1 }],
    duration: 360,
    easing: 'emphasized',
  },
}

/** 注意：从静息态出发，回到静息态。 */
const attention: Record<string, MotionSpec> = {
  shake: {
    frames: [
      { x: 0 },
      { x: -8 },
      { x: 8 },
      { x: -6 },
      { x: 6 },
      { x: -3 },
      { x: 3 },
      { x: 0 },
    ],
    duration: 520,
    easing: 'linear',
  },
  pulse: {
    frames: [{ scale: 1 }, { scale: 1.06 }, { scale: 1 }],
    duration: 600,
    easing: 'easeInOut',
  },
  bounce: {
    frames: [
      { y: 0, easing: 'easeOut' },
      { y: -12, easing: 'easeIn' },
      { y: 0, easing: 'easeOut' },
      { y: -6, easing: 'easeIn' },
      { y: 0 },
    ],
    duration: 700,
  },
  wobble: {
    frames: [
      { rotate: 0 },
      { rotate: -4 },
      { rotate: 4 },
      { rotate: -3 },
      { rotate: 3 },
      { rotate: 0 },
    ],
    duration: 600,
    easing: 'easeInOut',
  },
  flash: {
    frames: [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
    duration: 700,
    easing: 'linear',
  },
  heartbeat: {
    frames: [{ scale: 1 }, { scale: 1.12 }, { scale: 1 }, { scale: 1.08 }, { scale: 1 }],
    duration: 900,
    easing: 'easeInOut',
  },
}

/** 全部内置预设。 */
export const motionPresets: Readonly<Record<BuiltinMotionName, MotionSpec>> = {
  ...enter,
  ...attention,
} as Record<BuiltinMotionName, MotionSpec>
