/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 number animation 类型契约。

import type { MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { EasingName } from '@xihan-ui/motion'

/** 缓动：曲线名，或一条 `cubic-bezier(...)` / `linear` 串。取值与 CSS 侧同源。 */
export type NumberAnimationEasing = EasingName | (string & {})

/** 尺寸档位，只影响字号。 */

/** 语气档位，决定数字使用哪族颜色。 */

/** 两段状态：运行中 / 已停止，同时是 data-state 的取值。 */
export type NumberAnimationPhase = 'idle' | 'running'

/** 播报档位，写为根上的 aria-live。 */
export type NumberAnimationLive = 'off' | 'polite' | 'assertive'

export interface NumberAnimationCompleteDetails {
  /** 停止时的数值，即终点。 */
  value: number
}

export interface NumberAnimationSchema extends MachineSchema {
  props: {
    /** 起点，默认 0。改写它会把显示值立即落到新起点，并从那里重新运行本轮。 */
    from?: number
    /** 终点，默认 0。改写它从当前显示值继续走向新终点，不跳回起点。 */
    to?: number
    /** 时长毫秒，默认 1000；<=0 即一步到位。 */
    duration?: number
    /** 缓动：曲线名（linear / standard / easeIn / easeOut / easeInOut …）或 cubic-bezier 串，默认线性。 */
    easing?: NumberAnimationEasing
    /** 小数位，默认 0。夹进 [0, 20]。 */
    precision?: number
    /** 千位分隔符，默认不分隔。 */
    separator?: string
    /** 是否运行，默认 true。变为假即停在当前值，变为真从当前值继续走向终点。 */
    active?: boolean
    /** 尺寸：sm / md / lg，只写为 root 的 data-size。 */
    size?: Size
    /** 语气：brand / neutral / success / warning / danger / info，只写为 root 的 data-tone。 */
    tone?: Tone
    /** 读屏播报档位，默认 off。 */
    live?: NumberAnimationLive
    /** 到达终点时通知一次。中途被停止不通知。 */
    onComplete?: (details: NumberAnimationCompleteDetails) => void
  }
  context: {
    /** 当前显示的数值（未格式化）。 */
    value: number
  }
  computed: Record<string, never>
  refs: {
    /** 本轮的起点：效应挂载时的显示值。 */
    origin: number
    /** 本轮的起始时刻。 */
    startedAt: number
  }
  state: 'idle' | 'running'
  event:
    /** active 变为真。 */
    | { type: 'RUN.START' }
    /** active 变为假。 */
    | { type: 'RUN.STOP' }
    /** 起点、终点、时长或缓动被改写，本轮按新参数重新开始。 */
    | { type: 'RUN.SYNC' }
    /** 新的一帧到达。 */
    | { type: 'FRAME' }
  tag: never
  guard: 'isSettled' | 'isActive'
  action: 'syncActive' | 'resetToFrom' | 'syncRun' | 'advance' | 'invokeComplete'
  effect: 'trackFrames'
}

export interface NumberAnimationApi<T extends PropTypes = PropTypes> {
  phase: NumberAnimationPhase
  /** 当前数值（未格式化）。 */
  value: number
  /** 当前数值按 precision 与 separator 格式化的文本，即根中应显示的文字。 */
  text: string
  /** 是否仍在运行。 */
  running: boolean
  getRootProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface NumberAnimationTranslations {}
