// @xihan-ui/animations —— 动画层：现成的进场与注意动效，框架无关。
//
// 一段动画是一份可序列化的配方（MotionSpec）：若干视觉帧加一组时序参数。
// 预设把 fade-up / shake / heartbeat 这样的名字映射到配方，播放器负责打断、
// 错开起播与开关。减弱动效的降级由 @xihan-ui/motion 统一兜住，本包不另开一条通道。

// 播放器
export { createMotionPlayer } from './player'
// 预设
export { defineMotionSpec, motionPresets } from './presets'
// 配方
export { clampSpec, DEFAULT_DURATION, MAX_DURATION, MAX_FRAMES, reverseSpec, toKeyframes } from './spec'
// 文字拆分
export { splitText } from './text'
export type { SplitBy, SplitTextOptions, SplitTextResult } from './text'
// 类型
export { BUILTIN_MOTION_NAMES } from './types'
export type {
  BuiltinMotionName,
  MotionFrame,
  MotionPlayer,
  MotionPlayerOptions,
  MotionSpec,
  MotionStatus,
  PlayOptions,
  StaggerFrom,
  StaggerOptions,
} from './types'
