/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 内置预设：进场一族把元素从"不在场"带到静息态，注意一族从静息态出发再回到静息态。
// 两族都不留值，播完元素回到皮肤定义的样子。
//
// 时长、位移与曲线取 @xihan-ui/motion 的语义常量，与令牌同值：
//   淡入 enter / ease-enter；带位移的淡入、缩放、模糊 slide + distance-lg / ease-enter；
//   上浮、落入、旋入 slide + enter、distance-lg 的 1.5 倍 / ease-emphasis；注意一族 attention、distance-md。
// 缩放、旋转与模糊的幅度是各预设自身的形状，不对应令牌。

import type { BuiltinMotionName, MotionSpec } from './types'
import { easing, motionDistances, motionDurations, motionEasings } from '@xihan-ui/motion'

/** 恒等函数，只做类型收窄。 */
export function defineMotionSpec(spec: MotionSpec): MotionSpec {
  return spec
}

/** 带位移的淡入走的距离。 */
const SHIFT = motionDistances.lg
/** 上浮与落入走得更远一截。 */
const LIFT = motionDistances.lg * 1.5
/** 强调进场：一段整幅位移再加一段出现。 */
const EMPHASIS = motionDurations.slide + motionDurations.enter
/** 注意一族的摆幅。 */
const SWING = motionDistances.md

/** 进场：从不在场到静息态。 */
const enter: Record<string, MotionSpec> = {
  'fade': {
    frames: [{ opacity: 0 }, { opacity: 1 }],
    duration: motionDurations.enter,
    easing: motionEasings.enter,
  },
  'fade-up': {
    frames: [{ opacity: 0, y: SHIFT }, { opacity: 1, y: 0 }],
    duration: motionDurations.slide,
    easing: motionEasings.enter,
  },
  'fade-down': {
    frames: [{ opacity: 0, y: -SHIFT }, { opacity: 1, y: 0 }],
    duration: motionDurations.slide,
    easing: motionEasings.enter,
  },
  'fade-start': {
    frames: [{ opacity: 0, x: -SHIFT }, { opacity: 1, x: 0 }],
    duration: motionDurations.slide,
    easing: motionEasings.enter,
    logical: true,
  },
  'fade-end': {
    frames: [{ opacity: 0, x: SHIFT }, { opacity: 1, x: 0 }],
    duration: motionDurations.slide,
    easing: motionEasings.enter,
    logical: true,
  },
  'zoom-in': {
    frames: [{ opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1 }],
    duration: motionDurations.slide,
    easing: motionEasings.enter,
  },
  'zoom-out': {
    frames: [{ opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1 }],
    duration: motionDurations.slide,
    easing: motionEasings.enter,
  },
  'blur-in': {
    frames: [{ opacity: 0, blur: 8 }, { opacity: 1, blur: 0 }],
    duration: motionDurations.slide,
    easing: motionEasings.enter,
  },
  'rise': {
    frames: [{ opacity: 0, y: LIFT, scale: 0.98 }, { opacity: 1, y: 0, scale: 1 }],
    duration: EMPHASIS,
    easing: motionEasings.emphasis,
  },
  'drop-in': {
    frames: [{ opacity: 0, y: -LIFT, scale: 1.04 }, { opacity: 1, y: 0, scale: 1 }],
    duration: EMPHASIS,
    easing: motionEasings.emphasis,
  },
  'spin-in': {
    frames: [{ opacity: 0, rotate: -12, scale: 0.96 }, { opacity: 1, rotate: 0, scale: 1 }],
    duration: EMPHASIS,
    easing: motionEasings.emphasis,
  },
}

/** 注意：从静息态出发，回到静息态。 */
const attention: Record<string, MotionSpec> = {
  shake: {
    frames: [
      { x: 0 },
      { x: -SWING },
      { x: SWING },
      { x: -SWING * 0.75 },
      { x: SWING * 0.75 },
      { x: -SWING * 0.375 },
      { x: SWING * 0.375 },
      { x: 0 },
    ],
    duration: motionDurations.attention,
    easing: easing.linear,
  },
  pulse: {
    frames: [{ scale: 1 }, { scale: 1.06 }, { scale: 1 }],
    duration: motionDurations.attention,
    easing: easing.easeInOut,
  },
  bounce: {
    frames: [
      { y: 0, easing: easing.easeOut },
      { y: -SWING * 1.5, easing: easing.easeIn },
      { y: 0, easing: easing.easeOut },
      { y: -SWING * 0.75, easing: easing.easeIn },
      { y: 0 },
    ],
    duration: motionDurations.attention,
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
    duration: motionDurations.attention,
    easing: easing.easeInOut,
  },
  flash: {
    frames: [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
    duration: motionDurations.attention,
    easing: easing.linear,
  },
  heartbeat: {
    frames: [{ scale: 1 }, { scale: 1.12 }, { scale: 1 }, { scale: 1.08 }, { scale: 1 }],
    duration: motionDurations.attention,
    easing: easing.easeInOut,
  },
}

/** 全部内置预设。 */
export const motionPresets: Readonly<Record<BuiltinMotionName, MotionSpec>> = {
  ...enter,
  ...attention,
} as Record<BuiltinMotionName, MotionSpec>
