/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时长毫秒常量：与 tokens primitive 的 duration.fast / normal / slow 同值，由门禁比对。

/** 三档时长（毫秒）。 */
export const durations = {
  fast: 120,
  normal: 200,
  slow: 320,
} as const

export type DurationName = keyof typeof durations
