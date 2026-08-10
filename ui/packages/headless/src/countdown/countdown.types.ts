import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 拆开的四段。 */
export interface CountdownParts {
  /** 小时。不进位到天：99 小时就是 99。 */
  hours: number
  /** 分，0-59。 */
  minutes: number
  /** 秒，0-59。 */
  seconds: number
  /** 毫秒，0-999。 */
  milliseconds: number
}

/** 两段状态：在走 / 停着，同时是 data-state 的取值。 */
export type CountdownPhase = 'idle' | 'running'

/** 播报档位，落成根上的 aria-live。 */
export type CountdownLive = 'off' | 'polite' | 'assertive'

export interface CountdownFinishDetails {
  /** 归零那一刻的剩余毫秒，恒为 0。 */
  value: number
}

export interface CountdownSchema extends MachineSchema {
  props: {
    /** 剩余毫秒，缺省 0。改写它即把剩余量落到新值并从那里重新计时。 */
    value?: number
    /** 模板，缺省 `HH:mm:ss`。H 时、m 分、s 秒、S 毫秒，重复字母的个数即最少位数。 */
    format?: string
    /** 是否在走，缺省 true。翻假即停在当前剩余量，翻真从那里接着走。 */
    active?: boolean
    /** 取值粒度：0 到秒、1 到十分之一秒、2 到百分之一秒、3 到毫秒。缺省 0。 */
    precision?: number
    /** 读屏播报档位，缺省 off。 */
    live?: CountdownLive
    /** 走到 0 时通知一次。中途被停掉不通知。 */
    onFinish?: (details: CountdownFinishDetails) => void
  }
  context: {
    /** 当前剩余毫秒（未按精度量化）。 */
    remaining: number
  }
  computed: Record<string, never>
  refs: {
    /** 这一轮的起始剩余量：效应挂载那一刻的剩余毫秒，同时就是这一轮的时长。 */
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
    /** 剩余毫秒被改写，从新值重新计时。 */
    | { type: 'RUN.SYNC' }
    /** 到了一帧。 */
    | { type: 'FRAME' }
  tag: never
  guard: 'isSettled' | 'isActive'
  action: 'syncActive' | 'resetToValue' | 'advance' | 'invokeFinish'
  effect: 'trackFrames'
}

export interface CountdownApi<T extends PropTypes = PropTypes> {
  phase: CountdownPhase
  /** 按精度量化后的剩余毫秒，也是拆分与铺字的输入。 */
  value: number
  /** 按模板铺好的文本，也就是根里该显示的字。 */
  text: string
  /** 拆开的时、分、秒、毫秒，给要自己排版每一段的作者用。 */
  parts: CountdownParts
  /** 是否还在走。 */
  running: boolean
  /** 剩余量是否已经归零。 */
  finished: boolean
  getRootProps: () => T['element']
}
