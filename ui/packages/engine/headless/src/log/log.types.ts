/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 log 类型契约。

import type { MachineSchema, PropTypes, RuntimeConfig, Size, StickToBottomHandle } from '@xihan-ui/core'

/** 一行日志的级别。 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** 逐行取属性时的声明。 */
export interface LogLineProps {
  /** 该行的级别；未提供时不写 data-level，行使用默认前景色。 */
  level?: LogLevel
}

export interface LogTranslations {
  /** 日志区的可访问名。 */
  log: string
  /** 回到底部按钮的可访问名。 */
  scrollToBottom: string
}

export interface LogStickChangeDetails {
  atBottom: boolean
  sticking: boolean
}

// 由适配器在挂载前填入；缺省时粘底副作用不挂载。
export interface LogRefs {
  config: RuntimeConfig | null
  /** overflow:auto 的滚动容器。 */
  getViewportEl: () => HTMLElement | null
  /** 内容包裹层，作为尺寸变化的观察目标。 */
  getContentEl: () => HTMLElement | null
  /** 贴底句柄，由 trackStickToBottom 效应装填，卸载时置空。 */
  stick: StickToBottomHandle | null
}

/** 状态机只负责贴底：行数、载入态与文案都是视图属性，经 connect 的第二个参数传入。 */
export interface LogSchema extends MachineSchema {
  props: {
    /** 距底部多少 px 视为在底部，默认使用贴底原语的默认值。 */
    threshold?: number
    /** 贴底状态变化时通知宿主。 */
    onStickChange?: (details: LogStickChangeDetails) => void
  }
  context: {
    /** 当前滚动位置是否落在底部阈值内。 */
    atBottom: boolean
    /** 内容增长时是否自动跟随到底部，用户上滚后为 false。 */
    sticking: boolean
  }
  computed: Record<string, never>
  refs: LogRefs
  state: 'idle'
  event:
    /** 句柄回报的贴底状态变化，是 context 中两个布尔的唯一写入口。 */
    | { type: 'STICK.CHANGE', atBottom: boolean, sticking: boolean }
    /** 滚动到底部并恢复贴附。 */
    | { type: 'SCROLL_TO_BOTTOM' }
  tag: never
  guard: never
  action: 'setStickState' | 'invokeScrollToBottom'
  effect: 'trackStickToBottom'
}

export interface LogProps {
  /** 视口按多少行定高；未提供时高度由皮肤决定。 */
  rows?: number
  /** 行仍在传输中：日志区报告 aria-busy，根写 data-loading。 */
  loading?: boolean
  /** 尺寸：sm / md / lg。影响行文字号与内衬，行高不随档位变化。 */
  size?: Size
  translations?: Partial<LogTranslations>
}

export interface LogApi<T extends PropTypes = PropTypes> {
  /** 取整后的行数；rows 缺席或不是正数时为 undefined。 */
  rows: number | undefined
  loading: boolean
  /** 当前滚动位置是否落在底部阈值内。 */
  atBottom: boolean
  /** 新行到达时是否自动跟随到底部。 */
  sticking: boolean
  /** 是否显示回到底部按钮，不在底部时为 true。 */
  showScrollToEndTrigger: boolean
  /** 滚动到底部并恢复贴附。 */
  scrollToBottom: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  getLineProps: (props?: LogLineProps) => T['element']
  getScrollToEndTriggerProps: () => T['button']
  getLiveRegionProps: () => T['element']
}
