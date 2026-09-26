/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 语义动效常量：与令牌 --xh-motion-duration-* / --xh-motion-ease-* / --xh-motion-distance-* 及
// --xh-motion-stagger-step 同名同值。
// 真源是 tokens 的 semantic.base.json 与 semantic.reduce.json，由门禁逐条比对。
// 读得到计算样式时以样式为准（readMotion），这里是服务端与未加载样式时的取值。

import { durations } from './durations'
import { easing } from './easing'

/** 语义时长（毫秒），键对应 `--xh-motion-duration-<name>`。 */
export const motionDurations = {
  micro: durations.fast,
  enter: durations.normal,
  exit: durations.fast,
  move: durations.normal,
  expand: durations.normal,
  collapse: durations.fast,
  slide: durations.slow,
  nudge: durations.fast,
  press: durations.fast,
  release: durations.normal,
  attention: durations.slow * 2,
  glint: durations.slow * 2,
  reveal: durations.slow * 2,
  morph: durations.normal * 2,
} as const

export type MotionDurationName = keyof typeof motionDurations

/**
 * 减弱动效下的语义时长（毫秒），与令牌的减弱档同值。
 * 换色与出现的淡变不属于运动，保留为 fast 一档；几何类降到 1ms。
 */
export const reducedMotionDurations: Readonly<Record<MotionDurationName, number>> = {
  micro: durations.fast,
  enter: durations.fast,
  exit: durations.fast,
  move: 1,
  expand: 1,
  collapse: 1,
  slide: 1,
  nudge: 1,
  press: 1,
  release: 1,
  attention: 1,
  glint: 1,
  reveal: 1,
  morph: 1,
}

/** 语义缓动，键对应 `--xh-motion-ease-<name>`。 */
export const motionEasings = {
  'continuous': easing.standard,
  'loop': easing.linear,
  'enter': easing.easeOut,
  'enter-strong': easing.outStrong,
  'exit': easing.easeIn,
  'slide': easing.outFluid,
  'sweep': easing.easeInOut,
  'press': easing.standard,
  'release': easing.outStrong,
  'settle': easing.outBack,
  'breathe': easing.sineInOut,
  'emphasis': easing.emphasized,
} as const

export type MotionEaseName = keyof typeof motionEasings

/** 交错进场的相邻两项间隔（毫秒），对应 `--xh-motion-stagger-step`：进场时长的五分之一。 */
export const motionStaggerStep: number = durations.normal / 5

/** 语义位移（px），键对应 `--xh-motion-distance-<name>`。减弱动效下三档都归零。 */
export const motionDistances = {
  sm: 4,
  md: 8,
  lg: 16,
} as const

export type MotionDistanceName = keyof typeof motionDistances
