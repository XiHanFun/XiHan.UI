/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 loading bar 类型契约。

import type { MachineSchema, PropTypes, Tone } from '@xihan-ui/core'

/** 三段式：未加载 / 加载中 / 到达终点正在淡出，同时是 data-state 的取值。 */
export type LoadingBarPhase = 'idle' | 'loading' | 'finishing'

export interface LoadingBarValueChangeDetails {
  /** 已夹进 [0, 100] 的进度值；不确定进度时是组件自行爬升的模拟进度。 */
  value: number
}

export interface LoadingBarTranslations {
  /** 根节点的可及名。 */
  root: string
}

export interface LoadingBarSchema extends MachineSchema {
  props: {
    /** 受控进度值（0-100）。提供后即为确定进度：宽度按它显示，内部爬升停止。 */
    value?: number
    /** 非受控初值，默认 0。 */
    defaultValue?: number
    /** 加载开关：true 开始，false 结束（到达 100 后淡出归零）。只由宿主写入，无配套回调。 */
    loading?: boolean
    /** 进度条厚度：数字按像素，字符串按任意 CSS 长度。默认 2px。 */
    height?: string | number
    /** 语气：brand / neutral / success / warning / danger / info，决定进度段使用哪族颜色。需要其他颜色时修改皮肤槽 --xh-loading-bar-range。 */
    tone?: Tone
    /** 不确定进度时自行向前爬升，默认开启。关闭则停在起步值等待宿主收尾。 */
    trickle?: boolean
    /** 爬升节拍毫秒，默认 200；<=0 或非有限数等同于关闭爬升。 */
    trickleSpeed?: number
    /** 起步值，默认 8：开始加载时先跳到该值。 */
    minimum?: number
    /** 到达 100 之后留给淡出的窗口毫秒，默认 200。窗口结束才归零并收起。 */
    fadeDuration?: number
    translations?: Partial<LoadingBarTranslations>
    /** 进度值变化。不确定进度下每爬升一步、到达 100、归零各通知一次。 */
    onValueChange?: (details: LoadingBarValueChangeDetails) => void
  }
  context: {
    /** 进度值。受控时 cell 直读 prop，内部写入只发 onValueChange。 */
    value: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: LoadingBarPhase
  event:
    /** loading prop 变为 true，或淡出途中再次开始加载。 */
    | { type: 'LOADING.START' }
    /** loading prop 变为 false：到达 100 进入淡出。 */
    | { type: 'LOADING.END' }
    /** 爬升参数（trickle / trickleSpeed / value）被改写，计时器按新参数重新挂载。 */
    | { type: 'TRICKLE.SYNC' }
    /** 爬升节拍到期。 */
    | { type: 'after.trickleSpeed' }
    /** 淡出窗口结束，归零收起。 */
    | { type: 'after.fadeDuration' }
  tag: never
  guard: never
  action: 'syncLoading' | 'syncTrickle' | 'primeValue' | 'advanceValue' | 'completeValue' | 'resetValue'
  effect: 'trackTrickle' | 'waitForFade'
}

export interface LoadingBarApi<T extends PropTypes = PropTypes> {
  phase: LoadingBarPhase
  /** 当前显示的进度值（0-100，已夹取），也是 range 的宽度百分比。 */
  value: number
  /** 进度条是否显示：idle 之外都显示。 */
  visible: boolean
  /** 不确定进度：未提供 value，宽度自行爬升，不输出 aria-valuenow。 */
  indeterminate: boolean
  getRootProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
  /** 进度段末端的亮边。纯装饰，作者不渲染它时进度条照常成立。 */
  getPegProps: () => T['element']
}
