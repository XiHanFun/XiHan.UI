/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 timer 模块的公共接口。

export { timerAnatomy } from './timer.anatomy'
export { connectTimer } from './timer.connect'
export {
  formatTimerText,
  isTimerControlled,
  isTimerUnit,
  quantizeTimer,
  resolveTimerInterval,
  resolveTimerPrecision,
  resolveTimerStart,
  resolveTimerTarget,
  splitTimer,
  TIMER_FORMAT,
  TIMER_INTERVAL,
  TIMER_INTERVAL_MIN,
  TIMER_PRECISION_MAX,
  TIMER_UNITS,
  timerElapsedAt,
  timerRunOf,
  timerRunsOnMount,
  timerSegmentText,
  timerTotalMs,
  timerValueAt,
} from './timer.format'
export type { TimerRun } from './timer.format'
export { timerKeyboard } from './timer.keyboard'
export { timerMachine } from './timer.machine'
export { timerMeta } from './timer.meta'
export type {
  TimerApi,
  TimerCompleteDetails,
  TimerControlAction,
  TimerItemProps,
  TimerLive,
  TimerPhase,
  TimerSchema,
  TimerSegments,
  TimerTickDetails,
  TimerTranslations,
  TimerUnit,
} from './timer.types'
