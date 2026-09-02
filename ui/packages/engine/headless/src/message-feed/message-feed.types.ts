import type { StickToBottomHandle } from '@xihan-ui/behavior'
import type { PropTypes, RuntimeConfig, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 一轮对话的运行态，由宿主持有，组件只把它透出成 data 属性。 */
export type MessageFeedStatus = 'idle' | 'submitted' | 'streaming' | 'error'

export interface MessageFeedStickChangeDetails {
  atBottom: boolean
  sticking: boolean
}

export interface MessageFeedItemFocusDetails {
  /** 焦点停在哪一条上；焦点离开消息流时为 null。 */
  id: string | null
}

/** 这条消息是谁说的。 */
export type MessageFeedItemRole = 'user' | 'assistant' | 'system'

/** 条目自报家门。connect 是纯函数，一行 DOM 都不查。 */
export interface MessageFeedItemProps {
  /** 这条消息的身份，落成 data-value；导航与锚点都以它为准。 */
  id: string
  /** 0 基下标，落成 aria-posinset = index + 1。 */
  index: number
  role?: MessageFeedItemRole
  /** 这条还在流式写入。 */
  streaming?: boolean
  /** 作者渲了 item-label 部件时声明；为真时可访问名指过去，否则用文案现场代入。 */
  labelled?: boolean
}

export interface MessageFeedTranslations {
  /** 消息流的可访问名。 */
  feed: string
  /** 回到底部按钮的可访问名。 */
  scrollToBottom: string
  /**
   * 单条消息的可访问名。给函数能把「第几条、共几条、谁说的」代进名字里；
   * 给字符串则是一句固定名字，连接层不做插值——每条消息会念到同一句。
   *
   * size 为 -1 表示宿主没声明总数（`count` 缺席），此时名字里不该出现总数。
   * 两种都收是为了不推翻已经传字符串的调用方——只支持函数会让它们在运行时炸。
   */
  item: string | ((position: number, size: number, role?: MessageFeedItemRole) => string)
}

// 由适配器在挂载前填入；缺省时对应能力短路。
export interface MessageFeedRefs {
  config: RuntimeConfig | null
  /** 条目集合的归属容器，也是命令式方法现取 DOM 的起点。 */
  getRootEl: () => HTMLElement | null
  /** overflow:auto 的滚动容器。 */
  getViewportEl: () => HTMLElement | null
  /** 内容包裹层，作为尺寸变化的观察目标。 */
  getContentEl: () => HTMLElement | null
  /** 粘底句柄，由 trackStickToBottom 效应装填，卸载时置空。 */
  stick: StickToBottomHandle | null
}

export interface MessageFeedSchema extends MachineSchema {
  props: {
    /** 消息总数，由宿主声明，不从 DOM 数；aria-setsize 取它。 */
    count?: number
    /** 这一轮的运行态，只落 data-status，机器不读它。 */
    status?: MessageFeedStatus
    /** 距底多少 px 视为在底，缺省用粘底原语的默认值。 */
    threshold?: number
    /** 走到首尾是否回绕，默认 false——会话是线性的。 */
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
    /** 内容增长时是否自动跟到底，用户上滚后为 false。 */
    sticking: boolean
    /** roving tabindex 的锚点，也是 PageUp/PageDown 的起点。 */
    focusedId: string | null
  }
  computed: Record<string, never>
  refs: MessageFeedRefs
  state: 'idle'
  event:
    /** 句柄回报的粘底状态变化，是 atBottom / sticking 的唯一写入口。 */
    | { type: 'STICK.CHANGE', atBottom: boolean, sticking: boolean }
    /** 滚到底部并恢复粘附。 */
    | { type: 'SCROLL_TO_BOTTOM' }
    /** 焦点停在某条消息上，记锚点。 */
    | { type: 'ITEM.FOCUS', id: string }
    /** 焦点离开整份消息流，清锚点。 */
    | { type: 'FEED.BLUR' }
  tag: never
  guard: never
  action: 'setStickState' | 'invokeScrollToBottom' | 'setFocusedId' | 'clearFocusedId'
  effect: 'trackStickToBottom'
}

export interface MessageFeedApi<T extends PropTypes = PropTypes> {
  status: MessageFeedStatus
  atBottom: boolean
  sticking: boolean
  /** roving tabindex 的锚点。 */
  focusedId: string | null
  /** 是否显示回到底部按钮：只看在不在底，不看粘附意图。 */
  showScrollButton: boolean
  scrollToBottom: () => void
  /** 把某条消息滚进可视区；那条不在活 DOM 里时什么都不做。 */
  scrollToItem: (id: string) => void
  /** 把焦点落到某条消息上；那条不在活 DOM 里时什么都不做。 */
  focusItem: (id: string) => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: (props: MessageFeedItemProps) => T['element']
  getItemLabelProps: (props: Pick<MessageFeedItemProps, 'id'>) => T['element']
  getScrollButtonProps: () => T['button']
  getLiveRegionProps: () => T['element']
}
