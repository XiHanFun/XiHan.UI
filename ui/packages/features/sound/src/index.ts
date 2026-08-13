// @xihan-ui/sound —— 声音层：纯 Web Audio 程序化 UI 音效，框架无关，零音频文件。
//
// 一段声音是一份可序列化的声明式配方（SoundSpec）：振荡器与噪声分层、
// 包络驱动、可选滤波与混响。主题把语义名（success / error / click …）映射到
// 配方，createSoundPlayer 负责播放：惰性建上下文、尊重自动播放策略、同名节流。
//
// 本包不依赖任何框架，不引第三方，也不含任何音频资源文件。

// 引擎
export { isAudioSupported } from './engine/context'
// 播放器
export { createSoundPlayer } from './player'
// 配方
export { clampSpec, FREQ_MAX, FREQ_MIN, MAX_ENVELOPE_POINTS, MAX_LAYERS, MAX_TIME, specDuration } from './spec'
// 主题
export { defaultSoundTheme } from './themes/default'
export { defineSoundSpec, defineSoundTheme, flat, glide, strike } from './themes/define'
export { minimalSoundTheme } from './themes/minimal'
export { softSoundTheme } from './themes/soft'
// 类型
export { BUILTIN_SOUND_NAMES } from './types'
export type {
  BuiltinSoundName,
  EnvelopePoint,
  FilterSpec,
  NoiseLayer,
  OscillatorLayer,
  PlayOptions,
  SoundLayer,
  SoundPlayer,
  SoundPlayerOptions,
  SoundSpec,
  SoundTheme,
} from './types'
