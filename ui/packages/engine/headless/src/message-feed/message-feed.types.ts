/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 message feed 类型契约。

import type { MachineSchema, PropTypes, RuntimeConfig, Size, StickToBottomHandle } from '@xihan-ui/core'

/** 一轮对话的运行态，由宿主持有，组件只把它透出为 data 属性。 */
export type MessageFeedStatus = 'idle' | 'submitted' | 'streaming' | 'error'

export interface MessageFeedStickChangeDetails {
  atBottom: boolean
  sticking: boolean
}

export interface MessageFeedItemFocusDetails {
  /** 焦点所在的条目；焦点离开消息流时为 null。 */
  id: string | null
}

/** 该条消息的发送者。 */
export type MessageFeedItemRole = 'user' | 'assistant' | 'system'

/** 条目的声明。connect 是纯函数，不查询任何 DOM。 */
export interface MessageFeedItemProps {
  /** 该条消息的身份，写为 data-value；导航与锚点都以它为准。 */
  id: string
  /** 0 基下标，写为 aria-posinset = index + 1。 */
  index: number
  role?: MessageFeedItemRole
  /** 该条仍在流式写入。 */
  streaming?: boolean
  /** 作者渲染了 item-label 部件时声明；为真时可访问名指向它，否则用文案现场代入。 */
  labelled?: boolean
}

export interface MessageFeedTranslations {
  /** 消息流的可访问名。 */
  feed: string
  /** 回到底部按钮的可访问名。 */
  scrollToBottom: string
  /**
   * 单条消息的可访问名，入参为第几条、共几条、发送者。
   *
   * size 为 -1 表示宿主未声明总数（`count` 缺席），此时名字中不应出现总数。
   */
  item: (position: number, size: number, role?: MessageFeedItemRole) => string
}

// 由适配器在挂载前填入；缺省时对应能力短路。
export interface MessageFeedRefs {
  config: RuntimeConfig | null
  /** 条目集合的归属容器，也是命令式方法查询 DOM 的起点。 */
  getRootEl: () => HTMLElement | null
  /** overflow:auto 的滚动容器。 */
  getViewportEl: () => HTMLElement | null
  /** 内容包裹层，作为尺寸变化的观察目标。 */
  getContentEl: () => HTMLElement | null
  /** 贴底句柄，由 trackStickToBottom 效应装填，卸载时置空。 */
  stick: StickToBottomHandle | null
}

export interface MessageFeedSchema extends MachineSchema {
  props: {
    /** 消息总数，由宿主声明，不从 DOM 统计；aria-setsize 取它。 */
    count?: number
    /** 本轮的运行态，只写 data-state，状态机不读取它。 */
    status?: MessageFeedStatus
    /** 距底部多少 px 视为在底部，默认使用贴底原语的默认值。 */
    threshold?: number
    /** 到达首尾是否回绕，默认 false：会话是线性的。 */
    loop?: boolean
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<MessageFeedTranslations>
    onStickChange?: (details: MessageFeedStickChangeDetails) => void
    onItemFocus?: (details: MessageFeedItemFocusDetails) => void
  }
  context: {
    /** 当前滚动位置是否落在底部阈值内。 */
    atBottom: boolean
    /** 内容增长时是否自动跟随到底部，用户上滚后为 false。 */
    sticking: boolean
    /** roving tabindex 的锚点，也是 PageUp/PageDown 的起点。 */
    focusedId: string | null
    /**
     * 按压通道：回到底部按钮被 Space / Enter 或触屏手指按住期间为 true，该部件投影 data-pressed。
     * 抬起、失焦、指针取消，或按住途中视口回到底部（按钮随之收起）时撤下。
     */
    pressed: boolean
    /**
     * 条目到达的追踪是否已经接上。接上之前 list 投影 data-instant，首帧（含服务端渲染）的历史消息不播进场；
     * 接上时已在的条目各自带上 data-instant，之后新到的一批按到达顺序错开进场。
     */
    arrivalsTracked: boolean
    /**
     * 回到底部按钮是否还留着（没有 hidden）。离底时立即为真；回到底部后等它的退场动画播完才为假，
     * 期间 data-state 已经是 hidden、退场动画在播。
     */
    triggerRendered: boolean
  }
  computed: Record<string, never>
  refs: MessageFeedRefs
  state: 'idle'
  event:
    /** 句柄回报的贴底状态变化，是 atBottom / sticking 的唯一写入口。 */
    | { type: 'STICK.CHANGE', atBottom: boolean, sticking: boolean }
    /** 滚动到底部并恢复贴附。 */
    | { type: 'SCROLL_TO_BOTTOM' }
    /** 焦点停在某条消息上，记录锚点。 */
    | { type: 'ITEM.FOCUS', id: string }
    /** 焦点离开整份消息流，清除锚点。 */
    | { type: 'FEED.BLUR' }
    /** 按压通道（shared/press）：回到底部按钮被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START' }
    /** 回到底部按钮抬起、失焦或指针取消。 */
    | { type: 'PRESS.END' }
    /** 条目到达的追踪已接上：首帧已在的条目都带上了 data-instant。 */
    | { type: 'ARRIVALS.TRACKED' }
    /** 回到底部按钮的进退场报来「该不该留着」。 */
    | { type: 'TRIGGER.RENDERED', rendered: boolean }
  tag: never
  guard: 'canPress'
  action: 'setStickState' | 'invokeScrollToBottom' | 'setFocusedId' | 'clearFocusedId' | 'startPress' | 'endPress' | 'markArrivalsTracked' | 'setTriggerRendered'
  effect: 'trackStickToBottom' | 'trackArrivals' | 'trackTriggerPresence'
}

export interface MessageFeedApi<T extends PropTypes = PropTypes> {
  status: MessageFeedStatus
  atBottom: boolean
  sticking: boolean
  /** roving tabindex 的锚点。 */
  focusedId: string | null
  /** 是否显示回到底部按钮：只判断是否在底部，不判断贴附意图。 */
  showScrollToEndTrigger: boolean
  scrollToBottom: () => void
  /** 把某条消息滚进可视区；该条不在 DOM 中时不做任何事。 */
  scrollToItem: (id: string) => void
  /** 把焦点落到某条消息上；该条不在 DOM 中时不做任何事。 */
  focusItem: (id: string) => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: (props: MessageFeedItemProps) => T['element']
  getItemLabelProps: (props: Pick<MessageFeedItemProps, 'id'>) => T['element']
  getScrollToEndTriggerProps: () => T['button']
  getLiveRegionProps: () => T['element']
}
