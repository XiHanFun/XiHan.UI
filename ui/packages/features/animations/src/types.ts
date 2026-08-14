// 动画层公共类型。一段动画是一份可序列化的配方（MotionSpec）：
// 若干视觉帧加一组时序参数。配方既是播放器的输入，也是预设库与调参界面共用的数据模型。

/** 一帧的视觉状态。省略的字段表示这一帧不参与该属性的插值。 */
export interface MotionFrame {
  /** 本帧在整段里的位置，0..1；整段省略则按帧序等分。 */
  offset?: number
  /** 不透明度，0..1。 */
  opacity?: number
  /** 横向位移，数字按 px，字符串原样透传（可写 '100%'）。 */
  x?: number | string
  /** 纵向位移，数字按 px，字符串原样透传。 */
  y?: number | string
  /** 缩放系数，1 为原始尺寸。 */
  scale?: number
  /** 旋转角度，单位度。 */
  rotate?: number
  /** 高斯模糊半径 px。 */
  blur?: number
  /** 本帧到下一帧的缓动，省略则用整段的缓动。 */
  easing?: string
}

/** 一段动画的完整配方。纯数据，可 JSON 序列化。 */
export interface MotionSpec {
  frames: MotionFrame[]
  /** 时长毫秒，省略为 320。 */
  duration?: number
  /** 整段缓动，缓动名或任意 CSS 缓动串，省略为 standard。 */
  easing?: string
  /** 起播延迟毫秒。 */
  delay?: number
  /** 播完后的留值方式，省略为 none。 */
  fill?: FillMode
  /** 播放次数，省略为 1。 */
  iterations?: number
  /** 播放方向。 */
  direction?: PlaybackDirection
  /** 横向位移是否跟随书写方向：为真时 RTL 下 x 取反。 */
  logical?: boolean
}

/** 内置预设名。 */
export const BUILTIN_MOTION_NAMES = [
  'fade',
  'fade-up',
  'fade-down',
  'fade-start',
  'fade-end',
  'zoom-in',
  'zoom-out',
  'blur-in',
  'rise',
  'drop-in',
  'spin-in',
  'shake',
  'pulse',
  'bounce',
  'wobble',
  'flash',
  'heartbeat',
] as const

export type BuiltinMotionName = (typeof BUILTIN_MOTION_NAMES)[number]

export interface PlayOptions {
  /** 覆盖配方时长（毫秒）。 */
  duration?: number
  /** 覆盖配方缓动。 */
  easing?: string
  /** 覆盖起播延迟（毫秒）。 */
  delay?: number
  /** 覆盖留值方式。 */
  fill?: FillMode
  /** 覆盖播放次数。 */
  iterations?: number
  /** 覆盖播放方向。 */
  direction?: PlaybackDirection
}

/** 起播顺序。 */
export type StaggerFrom = 'first' | 'last' | 'center'

export interface StaggerOptions extends PlayOptions {
  /** 相邻两个目标的起播间隔毫秒，省略为 60。 */
  stagger?: number
  /** 从哪一端开始铺开，省略为 first。 */
  from?: StaggerFrom
}

export interface MotionPlayerOptions {
  /** 预设表，省略用内置预设。允许增删键；播未收录的名字只产出一条诊断告警。 */
  presets?: Record<string, MotionSpec>
  /** 是否播放，默认 true。把它接到用户偏好上，别替最终用户决定。 */
  enabled?: boolean
  /** 全局时长系数，默认 1；越大越慢。 */
  speed?: number
}

/** 播放结束的方式。被打断也照常结算。 */
export type MotionStatus = 'finished' | 'cancelled'

export interface MotionPlayer {
  /** 在一个元素上播预设名或配方；同一元素上的上一段会被打断。 */
  play: (target: HTMLElement, effect: string | MotionSpec, options?: PlayOptions) => Promise<MotionStatus>
  /** 依次错开地播一组元素。 */
  playAll: (targets: Iterable<HTMLElement>, effect: string | MotionSpec, options?: StaggerOptions) => Promise<MotionStatus>
  /** 打断某个元素上的动画；不传则打断全部。 */
  cancel: (target?: HTMLElement) => void
  setEnabled: (enabled: boolean) => void
  isEnabled: () => boolean
  setPresets: (presets: Record<string, MotionSpec>) => void
}
