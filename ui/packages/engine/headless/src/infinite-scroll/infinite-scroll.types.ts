/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 infinite scroll 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 三段状态，经 api.phase 暴露；DOM 上由 data-loading / data-disabled 布尔属性表达。 */
export type InfiniteScrollPhase = 'idle' | 'loading' | 'paused'

/** 取数的那一头：end 在列表末尾往后取，start 在列表开头往前取（聊天历史、时间线往回翻）。 */
export type InfiniteScrollEdge = 'end' | 'start'

/** 适配器在挂载前填入的 DOM 取值器。 */
export interface InfiniteScrollRefs {
  /** 哨兵节点，观察器观察的目标。 */
  getSentinelEl: () => HTMLElement | null
  /**
   * 裁剪出可视区的滚动容器，返回 null 即以窗口视口为准。
   * distance 是向可视区外扩展的提前量，扩展的正是这里给出的区域：
   * 列表在某个 overflow 容器中滚动却未提供它时，提前量只对窗口视口生效，对列表等于未设置。
   */
  getTargetEl: () => HTMLElement | null
}

export interface InfiniteScrollSchema extends MachineSchema {
  props: {
    /** 提前量（px）：哨兵距可视区该距离即视为进入，默认 0（实际出现才计）。扩展的是 getTargetEl 给出的可视区。 */
    distance?: number
    /** 关闭：不再观察，也不再触发。列表已没有下一页时使用。 */
    disabled?: boolean
    /** 正在取数：期间不观察、不重复触发。取完由宿主写回 false。 */
    loading?: boolean
    /** 应取下一页。 */
    onLoad?: () => void
    /**
     * 取数的那一头，缺省 end。start 时哨兵摆在列表开头，新的一页插在已有内容前面：
     * 取数期间（loading 为 true 起、写回 false 之后再守两帧）组件保持可视区离内容底部的距离不变，
     * 新内容插进来视口不跳。需要宿主如实写 loading。
     */
    edge?: InfiniteScrollEdge
  }
  context: {
    /**
     * 按压通道：取下一页的按钮被 Space / Enter 或触屏手指按住期间为 true，该按钮投影 data-pressed。
     * 抬起、失焦、指针取消，或按住途中进入取数 / 关闭两段时撤下。
     */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: InfiniteScrollRefs
  /** idle 观察中等待触发；loading 正在取数；paused 已关闭。 */
  state: InfiniteScrollPhase
  event:
    /** 哨兵进入可视区。 */
    | { type: 'SENTINEL.ENTER' }
    /** 按下了取下一页的按钮。与哨兵进入可视区走同一路径。 */
    | { type: 'LOAD' }
    /** disabled / loading 被改写，重新落到对应的状态。 */
    | { type: 'MODE.SYNC' }
    /** 按压通道（shared/press）：取下一页的按钮被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START' }
    /** 该按钮抬起、失焦或指针取消。 */
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isPaused' | 'isLoading' | 'canPress'
  action: 'syncMode' | 'invokeOnLoad' | 'startPress' | 'endPress' | 'releasePress'
  effect: 'observeSentinel' | 'keepScrollPosition'
}

export interface InfiniteScrollApi<T extends PropTypes = PropTypes> {
  phase: InfiniteScrollPhase
  /** 正在取数。 */
  loading: boolean
  /** 已关闭，不再观察。 */
  disabled: boolean
  getRootProps: () => T['element']
  getSentinelProps: () => T['element']
  /** 取下一页的按钮。文案由作者写在按钮中，组件不代填。 */
  getLoadMoreTriggerProps: () => T['button']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface InfiniteScrollTranslations {}
