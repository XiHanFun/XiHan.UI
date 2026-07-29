import type { StickToBottomHandle } from '@xihan-ui/behavior'
import type { PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 一轮对话的运行态，由宿主持有，组件只把它透出成 data 属性。 */
export type ThreadStatus = 'idle' | 'submitted' | 'streaming' | 'error'

export interface ThreadTranslations {
  /** 回到底部按钮的可访问名。 */
  scrollToBottom: string
  /** 消息区的可访问名。 */
  log: string
}

export interface ThreadStickChangeDetails {
  atBottom: boolean
  sticking: boolean
}

// 由适配器在挂载前填入；缺省时粘底副作用不挂载。
export interface ThreadRefs {
  config: RuntimeConfig | null
  /** overflow:auto 的滚动容器。 */
  getViewportEl: () => HTMLElement | null
  /** 内容包裹层，作为尺寸变化的观察目标。 */
  getContentEl: () => HTMLElement | null
  /** 粘底句柄，由 trackStickToBottom 效应装填，卸载时置空。 */
  stick: StickToBottomHandle | null
}

export interface ThreadSchema extends MachineSchema {
  props: {
    /** 这一轮的运行态，由宿主传入。 */
    status?: ThreadStatus
    /** 距底多少 px 视为在底，缺省用粘底原语的默认值。 */
    threshold?: number
    translations?: Partial<ThreadTranslations>
    /** 粘底状态变化时通知宿主。 */
    onStickChange?: (details: ThreadStickChangeDetails) => void
  }
  context: {
    /** 当前滚动位置是否落在底部阈值内。 */
    atBottom: boolean
    /** 内容增长时是否自动跟到底，用户上滚后为 false。 */
    sticking: boolean
  }
  computed: Record<string, never>
  refs: ThreadRefs
  state: 'idle'
  event:
    /** 句柄回报的粘底状态变化，是 context 中两个布尔的唯一写入口。 */
    | { type: 'STICK.CHANGE', atBottom: boolean, sticking: boolean }
    /** 滚到底部并恢复粘附。 */
    | { type: 'SCROLL_TO_BOTTOM' }
  tag: never
  guard: never
  action: 'setStickState' | 'invokeScrollToBottom'
  effect: 'trackStickToBottom'
}

export interface ThreadApi<T extends PropTypes = PropTypes> {
  status: ThreadStatus
  atBottom: boolean
  sticking: boolean
  /** 是否显示回到底部按钮，不在底部时为 true。 */
  showScrollButton: boolean
  scrollToBottom: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  getScrollButtonProps: () => T['button']
  getLiveRegionProps: () => T['element']
}
