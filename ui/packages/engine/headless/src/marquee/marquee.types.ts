/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 marquee 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/**
 * 滚动方向：内容向该方向移动。
 * left / right 沿横轴，up / down 沿纵轴；轴另写为 data-orientation，皮肤据此排列轨道。
 */
export type MarqueeDirection = 'left' | 'right' | 'up' | 'down'

export interface MarqueePausedChangeDetails {
  /** 暂停开关或受控属性给出的暂停状态；悬停与聚焦的临时暂停不在其中。 */
  paused: boolean
}

/** 读屏文案，默认英文。 */
export interface MarqueeTranslations {
  /** 暂停开关在滚动中的名字（按下停住）。 */
  autoplayTriggerPause: string
  /** 暂停开关在停住时的名字（按下继续）。 */
  autoplayTriggerPlay: string
}

export interface MarqueeSchema extends MachineSchema {
  props: {
    /** 滚动方向，默认 left。 */
    direction?: MarqueeDirection
    /**
     * 名义上的每秒像素数。写为根上的内联变量，皮肤用一份内容的长度除以它换算为一圈的时长。
     * 该长度取自 `--xh-marquee-span`：CSS 无法读取布局尺寸，槽中存放的是一个默认值。
     * 把它修改为与内容真实长度一致时速度才逐字等于每秒该像素数，否则它是一个成比例的快慢档。
     * 只接受有限正数；其余值不写出，回退为皮肤默认值。
     */
    speed?: number
    /** 指针停在窗口上、或键盘焦点落进窗口时暂停，默认开启；写 false 关掉。 */
    pauseOnHover?: boolean
    /** 受控暂停：为真即停在当前位置，为假继续移动。给了它，暂停开关只报 onPausedChange，由作者写回。 */
    paused?: boolean
    /** 非受控暂停的初值，默认 false。 */
    defaultPaused?: boolean
    /** 内容不足时重复铺满：轨道中铺两份内容，走完一份正好接上第二份。 */
    autoFill?: boolean
    /** 暂停开关在两种状态下的可及名，默认英文。 */
    translations?: Partial<MarqueeTranslations>
    /** 暂停状态变化时回调：暂停开关、setPaused 与受控写回都经过它。 */
    onPausedChange?: (details: MarqueePausedChangeDetails) => void
  }
  context: {
    /** 暂停开关或受控属性给出的暂停状态，受控 / 非受控在 cell 收口。 */
    paused: boolean
    /** 暂停开关正被按住：Space / Enter 或触屏手指按下到松开之间，投影 data-pressed。指针按住由 :active 表出。 */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    /** 写入暂停状态（公开 API）。 */
    | { type: 'PAUSED.SET', paused: boolean }
    /** 暂停开关被按下：停住与继续之间切换。 */
    | { type: 'PAUSED.TOGGLE' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
  tag: never
  guard: never
  action: 'setPaused' | 'togglePaused' | 'startPress' | 'endPress'
  effect: never
}

/** 组件属性：与机器的 props 同一份。 */
export type MarqueeProps = MarqueeSchema['props']

export interface MarqueeApi<T extends PropTypes = PropTypes> {
  /** 轨道中铺设的内容份数：autoFill 开启为 2，关闭为 1。 */
  copies: number
  /** 是否被暂停开关或受控属性停住；悬停与聚焦的临时暂停不算。 */
  paused: boolean
  /** 程序化停住或继续，与按暂停开关走同一路径。 */
  setPaused: (paused: boolean) => void
  getRootProps: () => T['element']
  getContentProps: () => T['element']
  /** 暂停开关：可及名是下一步的动作，data-state 投影 running / paused。 */
  getAutoplayTriggerProps: () => T['button']
}
