/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 timer 类型契约。

import type { MachineSchema, PropTypes, Size } from '@xihan-ui/core'

/** 一段数字的单位，也是条目上 data-unit 的取值。 */
export type TimerUnit = 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'

/** 四段状态：未开始 / 运行中 / 已暂停 / 已到终点，同时是 data-state 的取值。 */
export type TimerPhase = 'idle' | 'running' | 'paused' | 'completed'

/** 播报档位，写为时间区上的 aria-live。 */
export type TimerLive = 'off' | 'polite' | 'assertive'

/** 起停按钮本次的动作，写为 control 上的 data-action。 */
export type TimerControlAction = 'start' | 'pause' | 'resume' | 'reset'

/** 拆开的五段。 */
export interface TimerSegments {
  /** 天。它是最大的一段，不再向上进位。 */
  days: number
  /** 时，0-23。天单独成段，因此这里满 24 即进位。 */
  hours: number
  /** 分，0-59。 */
  minutes: number
  /** 秒，0-59。 */
  seconds: number
  /** 毫秒，0-999。 */
  milliseconds: number
}

export interface TimerTickDetails {
  /** 本拍应显示的毫秒。 */
  value: number
  /** 从起始到本拍累计经过的毫秒，与方向和起始值无关。 */
  elapsed: number
}

export interface TimerCompleteDetails {
  /** 到期时的显示值，恒等于终点值。 */
  value: number
  /** 本轮总共经过的毫秒。 */
  elapsed: number
}

/** 条目的声明：所属的段。 */
export interface TimerItemProps {
  unit: TimerUnit
}

/** 读屏文案，默认英文。 */
export interface TimerTranslations {
  /** 时间区的名字：屏幕上只有几组数字与分隔符，读屏无法区分哪一段是分、哪一段是秒。 */
  time: (segments: TimerSegments) => string
  /** 起停按钮在未开始时的名字：按钮内常常只有一个图标，读屏无法朗读该动作。 */
  start: string
  /** 起停按钮在运行中时的名字。 */
  pause: string
  /** 起停按钮在已暂停时的名字。 */
  resume: string
  /** 起停按钮在已到终点时的名字。 */
  reset: string
}

export interface TimerSchema extends MachineSchema {
  props: {
    /** 起始值毫秒，默认 0。正计时从它向上走，倒计时从它向下走。 */
    startMs?: number
    /**
     * 终点值毫秒。倒计时默认 0；正计时未提供时持续运行，没有终点也不会通知完成。
     * 终点落在起点的反方向（倒计时提供了比起点更大的终点）时本轮长度为 0：
     * 显示值停在起点上，一开始运行即到期。
     */
    targetMs?: number
    /** 倒计时，默认假。 */
    countdown?: boolean
    /**
     * 受控剩余毫秒。提供后即进入受控通道：它就是起点，方向锁定为倒计时、终点锁定为 0，
     * startMs / targetMs / countdown 三者不再参与；改写它即把累计清零并从新值重新计时。
     */
    value?: number
    /**
     * 受控开关，默认真。提供后即进入受控通道：变为假时停在当前累计值，变为真时从该处继续。
     * 受控时起停按钮不再改变状态：状态由该 prop 决定。
     */
    active?: boolean
    /** 挂载即开始运行，默认假。它只在挂载时读取一次，之后修改不再生效。 */
    autoStart?: boolean
    /**
     * 刷新间隔毫秒，默认 1000，下限一帧。
     * 它只决定数字的跳动间隔；到期由另一个精确落在终点上的定时器判定，不受它影响。
     */
    interval?: number
    /** 文本模板，默认 `HH:mm:ss`。D 天、H 时、m 分、s 秒、S 毫秒，重复字母的个数即最少位数。 */
    format?: string
    /** 取值粒度：0 到秒、1 到十分之一秒、2 到百分之一秒、3 到毫秒。默认 3，即不量化。 */
    precision?: number
    /** 读屏播报档位，默认 off。 */
    live?: TimerLive
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<TimerTranslations>
    /** 每一拍通知一次。到期的一拍只发 onComplete。 */
    onTick?: (details: TimerTickDetails) => void
    /** 到达终点时通知一次；中途被暂停或归零不通知。 */
    onComplete?: (details: TimerCompleteDetails) => void
  }
  context: {
    /**
     * 累计已经过的毫秒。暂停、到期与每一拍都把当前段结算进来，
     * 继续时从它接续计算，因此反复暂停继续也不会把中间的时间算丢或算重。
     */
    elapsed: number
    /**
     * 按压通道：control 被 Space / Enter 或触屏手指按住期间为 true，该部件投影 data-pressed。
     * 抬起、失焦或指针取消时撤下；与四段状态互相独立：同一个按钮在 running / paused 下语义不同，
     * 按住途中起停翻转，按压面不随之丢。按钮没有禁用态，按住一律进。
     */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: {
    /** 本段连续运行开始时的累计值。 */
    baseElapsed: number
    /** 本段连续运行的起始时刻，取自单调时钟。 */
    startedAt: number
  }
  state: 'idle' | 'running' | 'paused' | 'completed'
  event:
    /** 从头开始运行：累计清零。 */
    | { type: 'RUN.START' }
    /** 停在当前的累计值上。 */
    | { type: 'RUN.PAUSE' }
    /** 从累计值继续运行。 */
    | { type: 'RUN.RESUME' }
    /** 归零并停止。 */
    | { type: 'RUN.RESET' }
    /** 新的一拍到达。 */
    | { type: 'CLOCK.TICK' }
    /** 到达终点。 */
    | { type: 'CLOCK.SETTLE' }
    /** 起止值或间隔被改写，时钟按新的一轮重新挂载。 */
    | { type: 'CLOCK.SYNC' }
    /** 按压通道（shared/press）：control 被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START' }
    /** control 抬起、失焦或指针取消。 */
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isSettled'
  action: 'clearElapsed' | 'endPress' | 'invokeComplete' | 'invokeTick' | 'restartFromValue' | 'settleElapsed' | 'startPress' | 'syncActive' | 'syncClock'
  effect: 'runClock'
}

export interface TimerApi<T extends PropTypes = PropTypes> {
  phase: TimerPhase
  /** 当前应显示的毫秒，已夹在起点与终点之间并按 precision 量化。 */
  value: number
  /** 按模板格式化的文本，即不自行排列各段时应显示的文字。 */
  text: string
  /** 是否使用受控通道：提供了 value 或 active 即是，此时起停按钮不改变状态。 */
  controlled: boolean
  /** 累计经过的毫秒，与方向和起始值无关。 */
  elapsed: number
  running: boolean
  paused: boolean
  completed: boolean
  countdown: boolean
  /** 显示值拆开的五段。 */
  segments: TimerSegments
  /** 某一段补零后的字面：天不补零，时分秒两位，毫秒三位。 */
  segmentText: (unit: TimerUnit) => string
  /** 起停按钮本次的动作。 */
  controlAction: TimerControlAction
  /** 起停按钮的读屏名字，也是按钮内未写内容时应显示的文字。 */
  controlLabel: string
  /** 从头开始运行。 */
  start: () => void
  pause: () => void
  resume: () => void
  /** 归零并停止。 */
  reset: () => void
  getRootProps: () => T['element']
  getDisplayProps: () => T['element']
  getItemProps: (props: TimerItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getControlProps: () => T['button']
}
