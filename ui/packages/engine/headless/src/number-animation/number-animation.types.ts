import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { TweenEasing } from '@xihan-ui/motion'

/** 缓动档位，取值与共用补间的档位一致。 */
export type NumberAnimationEasing = TweenEasing

/** 尺寸档位，只改字号。 */

/** 语气档位，决定数字用哪族颜色。 */

/** 两段状态：在跑 / 停着，同时是 data-state 的取值。 */
export type NumberAnimationPhase = 'idle' | 'running'

/** 播报档位，落成根上的 aria-live。 */
export type NumberAnimationLive = 'off' | 'polite' | 'assertive'

export interface NumberAnimationFinishDetails {
  /** 停下那一刻的数值，也就是终点。 */
  value: number
}

export interface NumberAnimationSchema extends MachineSchema {
  props: {
    /** 起点，缺省 0。改写它会把显示值当场落到新起点，并从那里重跑这一轮。 */
    from?: number
    /** 终点，缺省 0。改写它从当前显示值接着走向新终点，不跳回起点。 */
    to?: number
    /** 时长毫秒，缺省 1000；<=0 即一步到位。 */
    duration?: number
    /** 缓动：linear / ease-in / ease-out / ease-in-out，缺省 linear。 */
    easing?: NumberAnimationEasing
    /** 小数位，缺省 0。夹进 [0, 20]。 */
    precision?: number
    /** 千位分隔符，缺省不分隔。 */
    separator?: string
    /** 是否在跑，缺省 true。翻假即停在当前值，翻真从当前值继续走向终点。 */
    active?: boolean
    /** 尺寸：sm / md / lg，只落成 root 的 data-size。 */
    size?: Size
    /** 语气：brand / neutral / success / warning / danger / info，只落成 root 的 data-tone。 */
    tone?: Tone
    /** 读屏播报档位，缺省 off。 */
    live?: NumberAnimationLive
    /** 走到终点时通知一次。中途被停掉不通知。 */
    onFinish?: (details: NumberAnimationFinishDetails) => void
  }
  context: {
    /** 当前显示的数值（未格式化）。 */
    value: number
  }
  computed: Record<string, never>
  refs: {
    /** 这一轮的起点：效应挂载那一刻的显示值。 */
    origin: number
    /** 这一轮的起跑时刻。 */
    startedAt: number
  }
  state: 'idle' | 'running'
  event:
    /** active 翻真。 */
    | { type: 'RUN.START' }
    /** active 翻假。 */
    | { type: 'RUN.STOP' }
    /** 起点、终点、时长或缓动被改写，这一轮按新参数重来。 */
    | { type: 'RUN.SYNC' }
    /** 到了一帧。 */
    | { type: 'FRAME' }
  tag: never
  guard: 'isSettled' | 'isActive'
  action: 'syncActive' | 'resetToFrom' | 'syncRun' | 'advance' | 'invokeFinish'
  effect: 'trackFrames'
}

export interface NumberAnimationApi<T extends PropTypes = PropTypes> {
  phase: NumberAnimationPhase
  /** 当前数值（未格式化）。 */
  value: number
  /** 当前数值按 precision 与 separator 铺好的文本，也就是根里该显示的字。 */
  text: string
  /** 是否还在跑。 */
  running: boolean
  getRootProps: () => T['element']
}
