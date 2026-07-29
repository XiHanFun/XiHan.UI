import type { StickToBottomHandle } from '@xihan-ui/behavior'
import type { PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 一轮对话此刻的运行态，宿主持有：
 * idle 没在跑；submitted 请求发出但一个字都还没回来；streaming 正在逐段吐字；error 这一轮失败了。
 * 组件只把它透出成 data 属性，自己的行为一概不看它。
 */
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

// 适配器在挂载前填入 DOM 环境与元素 getter；纯逻辑测试与 SSR 下保持缺省，
// 此时粘底副作用整个不挂——机器照常转移，只是没有句柄可用，滚动全归浏览器。
export interface ThreadRefs {
  config: RuntimeConfig | null
  /** 真正 overflow:auto 的那层：滚动位置、事件监听与归位都落在它身上。 */
  getViewportEl: () => HTMLElement | null
  /** 内容包裹层。消息一段段长出来就是它在变高，尺寸变化观察它。 */
  getContentEl: () => HTMLElement | null
  /** 粘底句柄，由 trackStickToBottom 效应装填；卸载时置空。 */
  stick: StickToBottomHandle | null
}

export interface ThreadSchema extends MachineSchema {
  props: {
    /** 这一轮的运行态，由宿主传入。 */
    status?: ThreadStatus
    /** 距底多少 px 视为在底。缺省走粘底原语自己的默认值。 */
    threshold?: number
    translations?: Partial<ThreadTranslations>
    /** 粘底状态跃迁时通知宿主（值真变才调）。 */
    onStickChange?: (details: ThreadStickChangeDetails) => void
  }
  context: {
    /** 几何事实：当前滚动位置落在底部阈值内。 */
    atBottom: boolean
    /** 粘附意图：内容增长时是否自动跟到底。用户一上滚就为 false。 */
    sticking: boolean
  }
  computed: Record<string, never>
  refs: ThreadRefs
  /**
   * 粘底是行为不是状态：两个布尔由句柄按真实几何算出来再回报，
   * 机器把它们收进 context 就够了，没有第二个状态可去。
   */
  state: 'idle'
  event:
    /** 句柄回报的粘底跃迁，是 context 里那两个布尔的唯一写入口。 */
    | { type: 'STICK.CHANGE', atBottom: boolean, sticking: boolean }
    /** 归位到底部并重新粘附。 */
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
  /** 派生：不在底部就露出"回到底部"。 */
  showScrollButton: boolean
  scrollToBottom: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  getScrollButtonProps: () => T['button']
  getLiveRegionProps: () => T['element']
}
