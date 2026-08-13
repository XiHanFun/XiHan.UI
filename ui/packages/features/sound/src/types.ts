// 声音层公共类型。一段声音是一份可序列化的声明式配方（SoundSpec）：
// 若干并行发声层，每层一条增益包络，可带音高包络、滤波与混响送出。
// 配方既是播放引擎的输入，也是主题系统与调音界面共用的数据模型。

/** 包络控制点：time 为相对发声起点的秒数，value 为该时刻要到达的值。 */
export interface EnvelopePoint {
  time: number
  value: number
  /** 从上一点到本点的过渡曲线，省略为 linear。 */
  curve?: 'linear' | 'exp'
}

/** 双二阶滤波器。frequency 给包络即扫频。 */
export interface FilterSpec {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'peaking'
  frequency: number | EnvelopePoint[]
  /** 品质因数，省略用浏览器默认。 */
  q?: number
  /** peaking 型的增益（dB）。 */
  gain?: number
}

/** 振荡器层：一条音高包络驱动的周期波形。 */
export interface OscillatorLayer {
  kind: 'oscillator'
  wave: 'sine' | 'square' | 'sawtooth' | 'triangle'
  /** 音高包络（Hz），单点即恒定音高。 */
  frequency: EnvelopePoint[]
  /** 增益包络（0..1）。 */
  gain: EnvelopePoint[]
  /** 相对整段声音起点的启动偏移（秒）。 */
  delay?: number
  filter?: FilterSpec
}

/** 噪声层：循环播放的噪声缓冲。 */
export interface NoiseLayer {
  kind: 'noise'
  /** 噪色，省略为 white。 */
  color?: 'white' | 'pink'
  /** 增益包络（0..1）。 */
  gain: EnvelopePoint[]
  /** 相对整段声音起点的启动偏移（秒）。 */
  delay?: number
  filter?: FilterSpec
}

export type SoundLayer = OscillatorLayer | NoiseLayer

/** 一段声音的完整配方。纯数据，可 JSON 序列化。 */
export interface SoundSpec {
  layers: SoundLayer[]
  /** 混响送出量（0..1），省略为纯干声。 */
  space?: number
  /** 整段声音的增益系数（0..1），省略为 1。 */
  gain?: number
}

/** 内置语义名。内置主题对每个名字都给出配方。 */
export const BUILTIN_SOUND_NAMES = [
  'click',
  'tap',
  'toggle-on',
  'toggle-off',
  'open',
  'close',
  'success',
  'error',
  'warning',
  'info',
  'notification',
  'send',
  'receive',
  'complete',
] as const

export type BuiltinSoundName = (typeof BUILTIN_SOUND_NAMES)[number]

/** 语义名 → 配方。自定义主题允许增删键；播放未收录的名字只产出一条诊断告警。 */
export type SoundTheme = Record<string, SoundSpec>

export interface SoundPlayerOptions {
  /** 主题，省略用内置默认主题。 */
  theme?: SoundTheme
  /** 主音量（0..1），默认 0.5。 */
  volume?: number
  /** 是否发声，默认 true。把它接到用户偏好上，别替最终用户决定。 */
  enabled?: boolean
  /** 同名声音的最小重触发间隔（毫秒），默认 50。 */
  throttle?: number
}

export interface PlayOptions {
  /** 本次播放的音量系数（0..1），叠乘在配方增益与主音量之上。 */
  volume?: number
}

export interface SoundPlayer {
  /** 播放主题里的语义名，或直接播放一份配方。 */
  play: (sound: string | SoundSpec, options?: PlayOptions) => void
  /** 在用户手势里调用，提前解锁音频上下文，让之后的非手势播放（如通知）能出声。 */
  unlock: () => void
  setEnabled: (enabled: boolean) => void
  isEnabled: () => boolean
  /** 主音量（0..1），越界钳制。 */
  setVolume: (volume: number) => void
  setTheme: (theme: SoundTheme) => void
  /** 关闭音频上下文并释放全部节点；之后再 play 会重新建立。 */
  dispose: () => void
}
