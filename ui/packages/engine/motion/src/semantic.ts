/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 语义动效常量：与令牌 --xh-motion-duration-* / --xh-motion-ease-* 同名同值。
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
} as const

export type MotionEaseName = keyof typeof motionEasings
