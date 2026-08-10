import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 三段状态，同时是 data-state 的取值。 */
export type InfiniteScrollPhase = 'idle' | 'loading' | 'paused'

/** 适配器在挂载前填入的 DOM 取值口。 */
export interface InfiniteScrollRefs {
  /** 哨兵节点，观察器盯的就是它。 */
  getSentinelEl: () => HTMLElement | null
  /**
   * 裁剪出可视区的滚动容器，返回 null 即以窗口视口为准。
   * distance 是往可视区外扩的提前量，扩的正是这里给的那块区域：
   * 列表滚在某个 overflow 容器里却不给它，提前量就只对窗口视口生效，落到列表上等于没写。
   */
  getTargetEl: () => HTMLElement | null
}

export interface InfiniteScrollSchema extends MachineSchema {
  props: {
    /** 提前量（px）：哨兵离可视区还有这么远就算进入，默认 0（真正露头才算）。扩的是 getTargetEl 给出的那块可视区。 */
    distance?: number
    /** 关掉：不再观察，也不再触发。列表已经没有下一页时用它。 */
    disabled?: boolean
    /** 正在取数：其间不观察、不重复触发。取完由宿主写回 false。 */
    loading?: boolean
    /** 该取下一页了。 */
    onLoad?: () => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: InfiniteScrollRefs
  /** idle 观察着等触发；loading 正在取数；paused 被关掉了。 */
  state: InfiniteScrollPhase
  event:
    /** 哨兵进了可视区。 */
    | { type: 'SENTINEL.ENTER' }
    /** disabled / loading 被改写，重新落到对应的状态。 */
    | { type: 'MODE.SYNC' }
  tag: never
  guard: 'isPaused' | 'isLoading'
  action: 'syncMode' | 'invokeOnLoad'
  effect: 'observeSentinel'
}

export interface InfiniteScrollApi<T extends PropTypes = PropTypes> {
  phase: InfiniteScrollPhase
  /** 正在取数。 */
  loading: boolean
  /** 已关掉，不再观察。 */
  disabled: boolean
  getRootProps: () => T['element']
  getSentinelProps: () => T['element']
}
